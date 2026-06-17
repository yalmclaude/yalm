import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getRemainingStock, getRemainingStockForPack } from "@/lib/availability";
import { depositAmountCents } from "@/lib/format";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { productId, packId, customerName, email, phone, eventDate, quantity } = body as {
    productId?: string;
    packId?: string;
    customerName?: string;
    email?: string;
    phone?: string;
    eventDate?: string;
    quantity?: number;
  };

  if ((!productId && !packId) || !customerName || !email || !phone || !eventDate) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const qty = Math.max(1, Number(quantity) || 1);
  const parsedDate = new Date(eventDate);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate < new Date(new Date().toDateString())) {
    return NextResponse.json({ error: "Date invalide" }, { status: 400 });
  }

  const item = packId
    ? await prisma.pack.findMany({ where: { id: packId }, take: 1 }).then((r) => r[0] ?? null)
    : await prisma.product.findMany({ where: { id: productId! }, take: 1 }).then((r) => r[0] ?? null);

  if (!item || !item.isAvailable) {
    return NextResponse.json({ error: "Cette offre est indisponible" }, { status: 400 });
  }

  const remaining = packId
    ? await getRemainingStockForPack(packId, parsedDate)
    : await getRemainingStock(productId!, parsedDate);

  if (remaining < qty) {
    return NextResponse.json({ error: "Stock insuffisant pour cette date" }, { status: 409 });
  }

  const deposit = depositAmountCents(item.priceCents, item.depositType, item.depositValue) * qty;

  const booking = await prisma.booking.create({
    data: {
      productId: packId ? null : productId,
      packId: packId ?? null,
      customerName,
      email,
      phone,
      eventDate: parsedDate,
      quantity: qty,
      depositAmountCents: deposit,
      status: "PENDING_DEPOSIT",
    },
  });

  const origin = request.nextUrl.origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: deposit,
            product_data: {
              name: `Acompte — ${item.name}`,
              description: `Réservation du ${parsedDate.toLocaleDateString("fr-FR")}`,
            },
          },
          quantity: 1,
        },
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
