import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { parseQuoteLines, siteOrigin } from "@/lib/billing";
import { sendQuoteEmail } from "@/lib/billing-emails";

// Re-sends a devis to the client.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await params;
  const quote = await prisma.quote.findFirst({ where: { id } });
  if (!quote) return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
  if (quote.status !== "SENT") return NextResponse.json({ error: "Ce devis n'est plus en attente" }, { status: 400 });

  const url = `${siteOrigin(request.nextUrl.origin)}/devis/${quote.token}`;
  try {
    await sendQuoteEmail({ ...quote, lines: parseQuoteLines(quote.lines) }, url);
  } catch (err) {
    return NextResponse.json({ ok: false, url, error: (err as Error).message }, { status: 502 });
  }
  return NextResponse.json({ ok: true, url });
}

// Cancels a devis that hasn't been accepted: its link stops accepting payments.
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await params;
  const { count } = await prisma.quote.updateMany({ where: { id, status: "SENT" }, data: { status: "CANCELLED" } });
  if (count === 0) return NextResponse.json({ error: "Seul un devis en attente peut être annulé" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
