import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getRemainingStock, getRemainingStockForPack } from "@/lib/availability";
import { depositLabel, formatHours, formatPrice } from "@/lib/format";
import { getCustomFormulaSettings } from "@/lib/settings";
import { depositFor, discounted, resolvePrice, type CustomLine, type Mode } from "@/lib/pricing";

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
  cautionLater?: boolean;
  durationHours?: number;
  mode?: Mode;
};

// One thing the client pays for, shown as its own line (name + detail) in the Stripe checkout.
type PaymentLine = {
  name: string;
  detail: string;
  quantity: number;
  unitFullCents: number;
  unitDepositCents: number;
  unitCautionCents: number;
};

// What a booking costs, worked out by one of the three paths below.
type Quote = {
  lines: PaymentLine[];
  allowFullPayment: boolean;
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

const sum = (lines: PaymentLine[], pick: (l: PaymentLine) => number) =>
  lines.reduce((total, l) => total + pick(l) * l.quantity, 0);

// "Location · 3 h · prix 300,00 € · acompte 35 % du prix"
function describe(mode: Mode, durationHours: number | null, priceCents: number, deposit: string) {
  return [
    mode === "BUY" ? "Achat (à garder)" : "Location",
    durationHours ? formatHours(durationHours) : null,
    `prix ${formatPrice(priceCents)}`,
    `acompte ${deposit}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Body;
  const { productId, packId, customItems, customerName, email, phone, eventDate, paymentType, cautionLater } = body;

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
  const unitCharge = (l: PaymentLine) => (wantsFullPayment ? l.unitFullCents : l.unitDepositCents);
  const amountToCharge = sum(quote.lines, unitCharge);
  const cautionCents = sum(quote.lines, (l) => l.unitCautionCents);
  // The client may pay the caution later (by the event day) and secure the date with the deposit alone.
  const deferCaution = cautionCents > 0 && cautionLater === true;

  const booking = await prisma.booking.create({
    data: {
      ...quote.data,
      items: quote.data.items ?? undefined,
      customerName,
      email,
      phone,
      eventDate: parsedDate,
      depositAmountCents: amountToCharge,
      cautionCents,
      cautionLater: deferCaution,
      status: "PENDING_DEPOSIT",
    },
  });

  const origin = request.nextUrl.origin;
  const dateLabel = parsedDate.toLocaleDateString("fr-FR");
  const lineItem = (name: string, description: string, unitAmount: number, quantity: number) => ({
    price_data: { currency: "eur", unit_amount: unitAmount, product_data: { name, description } },
    quantity,
  });

  // Stripe refuses zero-amount lines, so free items (and items without caution) are skipped.
  const lineItems = [
    ...quote.lines
      .filter((l) => unitCharge(l) > 0)
      .map((l) =>
        lineItem(
          wantsFullPayment ? l.name : `Acompte — ${l.name}`,
          `${l.detail} · événement du ${dateLabel}`,
          unitCharge(l),
          l.quantity
        )
      ),
    ...quote.lines
      .filter((l) => !deferCaution && l.unitCautionCents > 0)
      .map((l) =>
        lineItem(
          `Caution remboursable — ${l.name}`,
          "Restituée après l'événement si le matériel est rendu en bon état",
          l.unitCautionCents,
          l.quantity
        )
      ),
  ];

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: lineItems,
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

  return {
    lines: [
      {
        name: product.name,
        detail: describe(price.mode, price.durationHours, price.priceCents, depositLabel(product.depositType, product.depositValue)),
        quantity: qty,
        unitFullCents: price.priceCents,
        unitDepositCents: depositFor(product, price.priceCents),
        unitCautionCents: price.mode === "RENT" ? product.cautionCents : 0,
      },
    ],
    allowFullPayment: product.allowFullPayment,
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
  const pack = await prisma.pack.findMany({ where: { id: packId }, include: { items: { include: { product: true } } }, take: 1 }).then((r) => r[0] ?? null);
  if (!pack || !pack.isAvailable) throw new BookingError("Cette offre est indisponible");
  if (pack.quoteOnly) throw new BookingError("Cette offre est sur devis : contactez-nous par téléphone");

  const qty = Math.max(1, Number(body.quantity) || 1);
  const price = resolvePrice({ ...pack, saleMode: "RENT", purchasePriceCents: 0 }, { durationHours: body.durationHours });
  if (!price.ok) throw new BookingError(price.error);
  if ((await getRemainingStockForPack(packId, date)) < qty) throw new BookingError("Stock insuffisant pour cette date", 409);

  const contents = pack.items
    .map((i) => `${i.quantity > 1 ? `${i.quantity}× ` : ""}${i.product.name}`)
    .filter((n) => n.trim())
    .join(", ");
  return {
    lines: [
      {
        name: pack.name,
        detail: [
          describe("RENT", price.durationHours, price.priceCents, depositLabel(pack.depositType, pack.depositValue)),
          contents ? `comprend : ${contents}` : null,
        ]
          .filter(Boolean)
          .join(" · "),
        quantity: qty,
        unitFullCents: price.priceCents,
        unitDepositCents: depositFor(pack, price.priceCents),
        unitCautionCents: pack.cautionCents,
      },
    ],
    allowFullPayment: pack.allowFullPayment,
    data: { productId: null, packId, quantity: qty, durationHours: price.durationHours, purchase: false },
  };
}

// "Formule personnalisée": at least minItems distinct products, each discounted by discountPercent (admin settings).
// The discount is never named to the client: lines simply carry the discounted prices.
async function quoteCustomFormula(items: CustomItemInput[], date: Date): Promise<Quote> {
  const { enabled, minItems, discountPercent } = await getCustomFormulaSettings();
  if (!enabled) throw new BookingError("La formule personnalisée n'est pas disponible pour le moment");
  const ids = [...new Set(items.map((i) => i.productId).filter((id): id is string => Boolean(id)))];
  if (ids.length < minItems || ids.length !== items.length) {
    throw new BookingError(`Choisissez au moins ${minItems} prestations différentes`);
  }

  const products = await prisma.product.findMany({ where: { id: { in: ids } } });
  const stored: CustomLine[] = [];
  const lines: PaymentLine[] = [];

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
    stored.push({
      productId: product.id,
      name: product.name,
      mode: price.mode,
      durationHours: price.durationHours,
      priceCents: price.priceCents,
      discountedCents,
    });
    lines.push({
      name: `${product.name} (formule personnalisée)`,
      detail: describe(price.mode, price.durationHours, discountedCents, depositLabel(product.depositType, product.depositValue)),
      quantity: 1,
      unitFullCents: discountedCents,
      unitDepositCents: depositFor(product, discountedCents),
      unitCautionCents: price.mode === "RENT" ? product.cautionCents : 0,
    });
  }

  return {
    lines,
    allowFullPayment: true,
    data: { productId: null, packId: null, quantity: 1, durationHours: null, purchase: false, items: stored },
  };
}
