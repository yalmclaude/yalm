import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

async function sendConfirmationEmail(bookingId: string) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return;

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId },
    include: {
      product: { select: { name: true } },
      pack: { select: { name: true } },
    },
  });

  if (!booking) return;

  const prestationName = booking.product?.name ?? booking.pack?.name ?? "Prestation";
  const eventDate = booking.eventDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const depositEuros = (booking.depositAmountCents / 100).toFixed(2).replace(".", ",");

  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "YALM Événements", email: "yalm.events@gmail.com" },
      to: [{ email: "yalm.events@gmail.com" }],
      subject: `✅ Nouvelle réservation — ${prestationName}`,
      htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#2b2b2b">
          <h2 style="color:#4a1015">Nouvelle réservation confirmée</h2>
          <table style="width:100%;border-collapse:collapse;margin-top:16px">
            <tr><td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:bold;width:40%">Prestation</td><td style="padding:8px 0;border-bottom:1px solid #eee">${prestationName}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:bold">Client</td><td style="padding:8px 0;border-bottom:1px solid #eee">${booking.customerName}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:bold">Email</td><td style="padding:8px 0;border-bottom:1px solid #eee">${booking.email}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:bold">Téléphone</td><td style="padding:8px 0;border-bottom:1px solid #eee">${booking.phone}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:bold">Date de l'événement</td><td style="padding:8px 0;border-bottom:1px solid #eee">${eventDate}</td></tr>
            <tr><td style="padding:8px 0;font-weight:bold">Acompte reçu</td><td style="padding:8px 0">${depositEuros} €</td></tr>
          </table>
          <p style="margin-top:24px;color:#666;font-size:13px">Réservation #${booking.id}</p>
        </div>
      `,
    }),
  });
}

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
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "CONFIRMED",
          stripePaymentIntentId:
            typeof session.payment_intent === "string" ? session.payment_intent : undefined,
        },
      });

      await sendConfirmationEmail(bookingId).catch((err) =>
        console.error("Erreur envoi email:", err)
      );
    }
  }

  return NextResponse.json({ received: true });
}
