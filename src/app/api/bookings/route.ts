import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getRemainingStock, getRemainingStockForPack } from "@/lib/availability";
import { formatHours } from "@/lib/format";
import { getCustomFormulaSettings } from "@/lib/settings";
import {
  depositFor,
  discounted,
  resolvePrice,
  type CustomLine,
  type Mode,
} from "@/lib/pricing";

type CustomItemInput = { productId?: string; mode?: Mode; durationHours?: number | null };

type Body = {
  productId?: string;
  packId?: string;
  customItems?: CustomItemInput[];
  customerName?: string;
  email?: string;
  phone?: string;
  eventDate?: string;
  quantity?: number;
  paymentType?: "DEPOSIT" | "FULL";
  durationHours?: number;
  mode?: Mode;
};

// What a booking costs, worked out by one of the three paths below.
type Quote = {
  label: string;
  fullCents: number;
  depositCents: number;
  allowFullPayment: boolean;
  cautionCents: number;
  data: {
    productId: string | null;
    packId: string | null;
    quantity: number;
    durationHours: number | null;
    purchase: boolean;
    items?: CustomLine[];
  };
};

class BookingError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Body;
  const { productId, packId, customItems, customerName, email, phone, eventDate, paymentType } = body;

  if ((!productId && !packId && !customItems) || !customerName || !email || !phone || !eventDate) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const parsedDate = new Date(eventDate);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate < new Date(new Date().toDateString())) {
    return NextResponse.json({ error: "Date invalide" }, { status: 400 });
  }

  let quote: Quote;
  try {
    quote = customItems
      ? await quoteCustomFormula(customItems, parsedDate)
      : packId
        ? await quotePack(packId, body, parsedDate)
        : await quoteProduct(productId!, body, parsedDate);
  } catch (err) {
    if (err instanceof BookingError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }

  const wantsFullPayment = paymentType === "FULL" && quote.allowFullPayment;
  const amountToCharge = wantsFullPayment ? quote.fullCents : quote.depositCents;

  const booking = await prisma.booking.create({
    data: {
      ...quote.data,
      items: quote.data.items ?? undefined,
      customerName,
      email,
      phone,
      eventDate: parsedDate,
      depositAmountCents: amountToCharge,
      cautionCents: quote.cautionCents,
      status: "PENDING_DEPOSIT",
    },
  });

  const origin = request.nextUrl.origin;
  const label = wantsFullPayment ? `Paiement intégral — ${quote.label}` : `Acompte — ${quote.label}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: amountToCharge,
            product_data: {
              name: label,
              description: `Réservation du ${parsedDate.toLocaleDateString("fr-FR")}`,
            },
          },
          quantity: 1,
        },
        ...(quote.cautionCents > 0
          ? [
              {
                price_data: {
                  currency: "eur",
                  unit_amount: quote.cautionCents,
                  product_data: {
                    name: `Caution (remboursable) — ${quote.label}`,
                    description: "Restituée après l'événement si le matériel est rendu en bon état",
                  },
                },
                quantity: 1,
              },
            ]
          : []),
      ],
      success_url: `${origin}/reservation/succes?booking=${booking.id}`,
      cancel_url: `${origin}/reservation/annulee?booking=${booking.id}`,
      metadata: { bookingId: booking.id },
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    await prisma.booking.delete({ where: { id: booking.id } });
    return NextResponse.json({ error: `Erreur de paiement : ${err}` }, { status: 502 });
  }
}

async function quoteProduct(productId: string, body: Body, date: Date): Promise<Quote> {
  const product = await prisma.product.findMany({ where: { id: productId }, take: 1 }).then((r) => r[0] ?? null);
  if (!product || !product.isAvailable) throw new BookingError("Cette offre est indisponible");
  if (product.quoteOnly) throw new BookingError("Cette offre est sur devis : contactez-nous par téléphone");

  const qty = Math.max(1, Number(body.quantity) || 1);
  const price = resolvePrice(product, { mode: body.mode, durationHours: body.durationHours });
  if (!price.ok) throw new BookingError(price.error);

  // Bought items are not taken from the rental fleet.
  if (price.mode === "RENT" && (await getRemainingStock(productId, date)) < qty) {
    throw new BookingError("Stock insuffisant pour cette date", 409);
  }

  const details = [price.mode === "BUY" ? "achat" : null, price.durationHours ? formatHours(price.durationHours) : null]
    .filter(Boolean)
    .join(", ");
  return {
    label: details ? `${product.name} (${details})` : product.name,
    fullCents: price.priceCents * qty,
    depositCents: depositFor(product, price.priceCents) * qty,
    allowFullPayment: product.allowFullPayment,
    cautionCents: price.mode === "RENT" ? product.cautionCents * qty : 0,
    data: {
      productId,
      packId: null,
      quantity: qty,
      durationHours: price.durationHours,
      purchase: price.mode === "BUY",
    },
  };
}

async function quotePack(packId: string, body: Body, date: Date): Promise<Quote> {
  const pack = await prisma.pack.findMany({ where: { id: packId }, take: 1 }).then((r) => r[0] ?? null);
  if (!pack || !pack.isAvailable) throw new BookingError("Cette offre est indisponible");
  if (pack.quoteOnly) throw new BookingError("Cette offre est sur devis : contactez-nous par téléphone");

  const qty = Math.max(1, Number(body.quantity) || 1);
  const price = resolvePrice({ ...pack, saleMode: "RENT", purchasePriceCents: 0 }, { durationHours: body.durationHours });
  if (!price.ok) throw new BookingError(price.error);
  if ((await getRemainingStockForPack(packId, date)) < qty) throw new BookingError("Stock insuffisant pour cette date", 409);

  return {
    label: price.durationHours ? `${pack.name} (${formatHours(price.durationHours)})` : pack.name,
    fullCents: price.priceCents * qty,
    depositCents: depositFor(pack, price.priceCents) * qty,
    allowFullPayment: pack.allowFullPayment,
    cautionCents: pack.cautionCents * qty,
    data: { productId: null, packId, quantity: qty, durationHours: price.durationHours, purchase: false },
  };
}

// "Formule personnalisée": at least minItems distinct products, each discounted by discountPercent (admin settings).
async function quoteCustomFormula(items: CustomItemInput[], date: Date): Promise<Quote> {
  const { enabled, minItems, discountPercent } = await getCustomFormulaSettings();
  if (!enabled) throw new BookingError("La formule personnalisée n'est pas disponible pour le moment");
  const ids = [...new Set(items.map((i) => i.productId).filter((id): id is string => Boolean(id)))];
  if (ids.length < minItems || ids.length !== items.length) {
    throw new BookingError(`Choisissez au moins ${minItems} prestations différentes`);
  }

  const products = await prisma.product.findMany({ where: { id: { in: ids } } });
  const lines: CustomLine[] = [];
  let depositCents = 0;
  let cautionCents = 0;

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product || !product.isAvailable || product.quoteOnly) {
      throw new BookingError(`${product?.name ?? "Une prestation"} n'est pas disponible dans une formule personnalisée`);
    }
    const price = resolvePrice(product, { mode: item.mode, durationHours: item.durationHours });
    if (!price.ok) throw new BookingError(`${product.name} : ${price.error}`);
    if (price.mode === "RENT" && (await getRemainingStock(product.id, date)) < 1) {
      throw new BookingError(`${product.name} n'est plus disponible à cette date`, 409);
    }

    const discountedCents = discounted(price.priceCents, discountPercent);
    lines.push({
      productId: product.id,
      name: product.name,
      mode: price.mode,
      durationHours: price.durationHours,
      priceCents: price.priceCents,
      discountedCents,
    });
    depositCents += depositFor(product, discountedCents);
    if (price.mode === "RENT") cautionCents += product.cautionCents;
  }

  return {
    label: `Formule personnalisée — ${lines.length} prestations`,
    fullCents: lines.reduce((sum, l) => sum + l.discountedCents, 0),
    depositCents,
    allowFullPayment: true,
    cautionCents,
    data: { productId: null, packId: null, quantity: 1, durationHours: null, purchase: false, items: lines },
  };
}
