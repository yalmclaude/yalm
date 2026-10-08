import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { balanceDue, siteOrigin } from "@/lib/billing";
import { orderTitle } from "@/lib/email";

// Opens a Stripe checkout for what's left on a booking. A fresh session is created on every click,
// so the emailed link never expires.
export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const origin = siteOrigin(request.nextUrl.origin);
  const booking = await prisma.booking.findFirst({
    where: { payToken: token },
    include: { product: { select: { name: true } }, pack: { select: { name: true } } },
  });
  if (!booking || booking.status !== "CONFIRMED") {
    return NextResponse.redirect(`${origin}/paiement/${token}`, 303);
  }

  const due = balanceDue(booking);
  if (due.totalDueCents <= 0) return NextResponse.redirect(`${origin}/paiement/${token}`, 303);

  const title = orderTitle(booking);
  const date = booking.eventDate.toLocaleDateString("fr-FR");
  const line = (name: string, description: string, amount: number) => ({
    price_data: { currency: "eur", unit_amount: amount, product_data: { name, description } },
    quantity: 1,
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: booking.email,
    line_items: [
      ...(due.restCents > 0 ? [line(`Solde — ${title}`, `Événement du ${date} · prix TTC`, due.restCents)] : []),
      ...(due.cautionCents > 0
        ? [line(`Caution remboursable — ${title}`, "Restituée après l'événement si le matériel est rendu en bon état", due.cautionCents)]
        : []),
    ],
    success_url: `${origin}/paiement/${token}?paye=1`,
    cancel_url: `${origin}/paiement/${token}`,
    metadata: {
      kind: "balance",
      bookingId: booking.id,
      restCents: String(due.restCents),
      cautionCents: String(due.cautionCents),
    },
  });

  return NextResponse.redirect(session.url!, 303);
}
