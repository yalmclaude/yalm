import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { balanceDue, newToken, siteOrigin } from "@/lib/billing";
import { sendBalanceRequestEmail } from "@/lib/billing-emails";

// Emails the client a link to pay what's left on a confirmed booking (balance and/or caution).
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await params;
  const booking = await prisma.booking.findFirst({
    where: { id },
    include: { product: { select: { name: true } }, pack: { select: { name: true } } },
  });
  if (!booking) return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
  if (booking.status !== "CONFIRMED") {
    return NextResponse.json({ error: "La réservation doit être confirmée (acompte payé)" }, { status: 400 });
  }

  const due = balanceDue(booking);
  if (due.totalDueCents <= 0) {
    return NextResponse.json({ error: "Il n'y a plus rien à régler sur cette réservation" }, { status: 400 });
  }

  const payToken = booking.payToken ?? newToken();
  const updated = await prisma.booking.update({
    where: { id },
    data: { payToken, balanceRequestedAt: new Date() },
    include: { product: { select: { name: true } }, pack: { select: { name: true } } },
  });
  const url = `${siteOrigin(request.nextUrl.origin)}/paiement/${payToken}`;

  try {
    await sendBalanceRequestEmail(updated, url, due.restCents, due.cautionCents);
  } catch (err) {
    return NextResponse.json(
      { ok: false, url, error: `Le lien est prêt mais l'email n'est pas parti : ${(err as Error).message}` },
      { status: 502 }
    );
  }
  return NextResponse.json({ ok: true, url });
}
