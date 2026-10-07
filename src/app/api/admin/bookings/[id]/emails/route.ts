import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { sendOrderEmails } from "@/lib/email";

// Re-sends the confirmation (client) and order (YALM) emails of a booking.
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await params;
  const booking = await prisma.booking.findFirst({
    where: { id },
    include: { product: { select: { name: true } }, pack: { select: { name: true } } },
  });
  if (!booking) return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
  const errors = await sendOrderEmails(booking);
  return errors.length
    ? NextResponse.json({ ok: false, error: errors.join("\n") }, { status: 502 })
    : NextResponse.json({ ok: true });
}
