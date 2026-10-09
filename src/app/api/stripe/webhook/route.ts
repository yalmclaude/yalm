import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { sendOrderEmails } from "@/lib/email";
import { sendBalancePaidEmails } from "@/lib/billing-emails";
import { bookingDataFromQuote } from "@/lib/quote-booking";

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

  // Card, Apple Pay, Google Pay, PayPal, Klarna… are paid when the checkout completes. Delayed methods
  // (SEPA debit, bank transfer…) complete as "unpaid" and are confirmed later by async_payment_succeeded:
  // nothing is confirmed or emailed until the money is actually received.
  const isPaidCheckout =
    (event.type === "checkout.session.completed" &&
      (event.data.object as Stripe.Checkout.Session).payment_status !== "unpaid") ||
    event.type === "checkout.session.async_payment_succeeded";

  if (isPaidCheckout) {
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

  const payFull = session.metadata?.payFull === "1";
  const cautionNow = session.metadata?.cautionPaid === "1";
  const data = bookingDataFromQuote(quote, { payFull, cautionNow });

  const booking = await prisma.$transaction(async (tx) => {
    const { count } = await tx.quote.updateMany({ where: { id: quoteId, status: { not: "ACCEPTED" } }, data: { status: "ACCEPTED" } });
    if (count === 0) return null;
    const created = await tx.booking.create({
      data: {
        ...data,
        status: "CONFIRMED",
        cautionPaidAt: quote.cautionCents > 0 && cautionNow ? new Date() : null,
        stripeSessionId: session.id,
        stripePaymentIntentId: paymentIntent,
        // Paid in full when accepting (client's choice, or no deposit): nothing left but a possible caution.
        balancePaidAt: data.depositAmountCents >= data.totalCents ? new Date() : null,
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
