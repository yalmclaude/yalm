import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { parseQuoteLines, quoteTotals, siteOrigin } from "@/lib/billing";

// The client accepts a devis: opens a Stripe checkout for its deposit. The booking is created by the
// Stripe webhook once the payment succeeds.
export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const origin = siteOrigin(request.nextUrl.origin);
  const quote = await prisma.quote.findFirst({ where: { token } });
  if (!quote || quote.status !== "SENT" || quote.validUntil < new Date()) {
    return NextResponse.redirect(`${origin}/devis/${token}`, 303);
  }

  const lines = parseQuoteLines(quote.lines);
  const t = quoteTotals(lines, quote.depositPercent);
  // The client chooses on the devis page: the deposit only, or everything at once.
  const form = await request.formData().catch(() => null);
  // The CGV must be accepted (checkbox on the devis page).
  if (!form?.get("acceptTerms")) return NextResponse.redirect(`${origin}/devis/${token}`, 303);
  const payFull = t.depositCents >= t.totalCents || form?.get("pay") === "full";
  const amount = payFull ? t.totalCents : t.depositCents;
  const payCaution = quote.cautionCents > 0 && form?.get("caution") === "1";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: quote.email,
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: amount,
          product_data: {
            name: `${payFull ? "Paiement intégral" : `Acompte (${quote.depositPercent} %)`} — devis ${quote.number}`,
            description: `${lines.map((l) => l.label).join(", ").slice(0, 400)} · événement du ${quote.eventDate.toLocaleDateString("fr-FR")} · total TTC ${(t.totalCents / 100).toFixed(2).replace(".", ",")} €`,
          },
        },
        quantity: 1,
      },
      ...(payCaution
        ? [
            {
              price_data: {
                currency: "eur",
                unit_amount: quote.cautionCents,
                product_data: {
                  name: `Caution remboursable — devis ${quote.number}`,
                  description: "Restituée après l'événement si le matériel est rendu en bon état",
                },
              },
              quantity: 1,
            },
          ]
        : []),
    ],
    success_url: `${origin}/devis/${token}?paye=1`,
    cancel_url: `${origin}/devis/${token}`,
    metadata: { kind: "quote", quoteId: quote.id, payFull: payFull ? "1" : "0", cautionPaid: payCaution ? "1" : "0" },
  });

  await prisma.quote.update({ where: { id: quote.id }, data: { stripeSessionId: session.id } });
  return NextResponse.redirect(session.url!, 303);
}
