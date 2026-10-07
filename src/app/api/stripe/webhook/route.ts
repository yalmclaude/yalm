import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { sendOrderEmails } from "@/lib/email";

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
    const bookingId = session.metadata?.bookingId;
    if (bookingId) {
      // Stripe may deliver the same event more than once: only the first one confirms and sends emails.
      const { count } = await prisma.booking.updateMany({
        where: { id: bookingId, status: { not: "CONFIRMED" } },
        data: {
          status: "CONFIRMED",
          stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : undefined,
        },
      });

      if (count > 0) {
        const booking = await prisma.booking.findFirst({
          where: { id: bookingId },
          include: { product: { select: { name: true } }, pack: { select: { name: true } } },
        });
        if (booking) {
          await sendOrderEmails(booking).catch((err) => console.error("Erreur envoi emails:", err));
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
