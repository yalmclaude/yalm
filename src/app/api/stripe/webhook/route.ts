import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { sendOrderEmails } from "@/lib/email";
import { sendBalancePaidEmails } from "@/lib/billing-emails";
import { parseQuoteLines, quoteTotals } from "@/lib/billing";
import type { CustomLine } from "@/lib/pricing";

const withNames = { product: { select: { name: true } }, pack: { select: { name: true } } };

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook non configuré" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature ?? "", webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: `Signature invalide: ${err}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : undefined;
    const kind = session.metadata?.kind;

    if (kind === "balance") await onBalancePaid(session);
    else if (kind === "quote") await onQuoteAccepted(session, paymentIntent);
    else await onBookingPaid(session, paymentIntent);
  }

  return NextResponse.json({ received: true });
}

// Online booking: the deposit (or full price) is paid. Stripe may deliver an event more than once:
// only the first delivery confirms and sends emails.
async function onBookingPaid(session: Stripe.Checkout.Session, paymentIntent?: string) {
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) return;
  const { count } = await prisma.booking.updateMany({
    where: { id: bookingId, status: { not: "CONFIRMED" } },
    data: { status: "CONFIRMED", stripePaymentIntentId: paymentIntent },
  });
  if (count === 0) return;
  const booking = await prisma.booking.findFirst({ where: { id: bookingId }, include: withNames });
  if (booking) await sendOrderEmails(booking).catch((err) => console.error("Erreur envoi emails:", err));
}

// Devis accepted: the deposit is paid, the devis becomes a confirmed booking.
async function onQuoteAccepted(session: Stripe.Checkout.Session, paymentIntent?: string) {
  const quoteId = session.metadata?.quoteId;
  if (!quoteId) return;
  const quote = await prisma.quote.findFirst({ where: { id: quoteId } });
  if (!quote || quote.status === "ACCEPTED") return;

  const lines = parseQuoteLines(quote.lines);
  const totals = quoteTotals(lines, quote.depositPercent);
  const items: CustomLine[] = lines.map((l) => ({
    productId: "",
    name: l.label,
    mode: "RENT",
    durationHours: null,
    priceCents: l.priceCents,
    discountedCents: l.priceCents,
    customText: l.description,
  }));

  const booking = await prisma.$transaction(async (tx) => {
    const { count } = await tx.quote.updateMany({ where: { id: quoteId, status: { not: "ACCEPTED" } }, data: { status: "ACCEPTED" } });
    if (count === 0) return null;
    const created = await tx.booking.create({
      data: {
        customerName: quote.customerName,
        email: quote.email,
        phone: quote.phone,
        eventDate: quote.eventDate,
        status: "CONFIRMED",
        depositAmountCents: session.amount_total ?? totals.depositCents,
        totalCents: totals.totalCents,
        cautionCents: quote.cautionCents,
        cautionLater: quote.cautionCents > 0,
        items,
        label: `Devis ${quote.number}`,
        quoteId: quote.id,
        stripeSessionId: session.id,
        stripePaymentIntentId: paymentIntent,
        // Paid in full when accepting: nothing left but a possible caution.
        balancePaidAt: totals.depositCents >= totals.totalCents ? new Date() : null,
      },
      include: withNames,
    });
    await tx.quote.update({ where: { id: quoteId }, data: { bookingId: created.id } });
    return created;
  });

  if (booking) await sendOrderEmails(booking).catch((err) => console.error("Erreur envoi emails:", err));
}

// Balance (and/or caution kept for later) paid from the /paiement link.
async function onBalancePaid(session: Stripe.Checkout.Session) {
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) return;
  const restCents = Number(session.metadata?.restCents) || 0;
  const cautionCents = Number(session.metadata?.cautionCents) || 0;
  const now = new Date();

  const updates: { balancePaidAt?: Date; cautionPaidAt?: Date } = {};
  const booking = await prisma.booking.findFirst({ where: { id: bookingId } });
  if (!booking) return;
  if (restCents > 0 && !booking.balancePaidAt) updates.balancePaidAt = now;
  if (cautionCents > 0 && !booking.cautionPaidAt) updates.cautionPaidAt = now;
  if (Object.keys(updates).length === 0) return; // already recorded (duplicate delivery)

  const updated = await prisma.booking.update({ where: { id: bookingId }, data: updates, include: withNames });
  const errors = await sendBalancePaidEmails(updated, restCents + cautionCents, cautionCents);
  for (const e of errors) console.error("Erreur envoi emails solde:", e);
}
