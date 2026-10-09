import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { balanceDue } from "@/lib/billing";
import { sendBalancePaidEmails } from "@/lib/billing-emails";

// The balance (and/or the caution kept for later) was paid outside the site: bank transfer or cash.
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await params;
  const booking = await prisma.booking.findFirst({ where: { id } });
  if (!booking || booking.status !== "CONFIRMED") {
    return NextResponse.json({ error: "Réservation introuvable ou non confirmée" }, { status: 400 });
  }
  const due = balanceDue(booking);
  if (due.totalDueCents <= 0) return NextResponse.json({ error: "Il n'y a plus rien à régler" }, { status: 400 });

  const now = new Date();
  const updated = await prisma.booking.update({
    where: { id },
    data: {
      ...(due.restCents > 0 ? { balancePaidAt: now } : {}),
      ...(due.cautionCents > 0 ? { cautionPaidAt: now } : {}),
    },
    include: { product: { select: { name: true } }, pack: { select: { name: true } } },
  });
  const emailErrors = await sendBalancePaidEmails(updated, due.totalDueCents, due.cautionCents);
  return NextResponse.json({ ok: true, emailErrors });
}
