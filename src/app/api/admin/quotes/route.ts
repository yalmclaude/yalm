import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { newToken, nextQuoteNumber, parseQuoteLines, siteOrigin } from "@/lib/billing";
import { sendQuoteEmail } from "@/lib/billing-emails";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const quotes = await prisma.quote.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ quotes });
}

// Creates a devis and emails it to the client.
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const data = await request.json().catch(() => ({}));
  const customerName = String(data.customerName ?? "").trim();
  const email = String(data.email ?? "").trim();
  const eventDate = new Date(data.eventDate);
  const lines = parseQuoteLines(data.lines);

  if (!customerName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Nom et email du client requis" }, { status: 400 });
  }
  if (Number.isNaN(eventDate.getTime())) return NextResponse.json({ error: "Date de l'événement invalide" }, { status: 400 });
  if (lines.length === 0 || lines.every((l) => l.priceCents === 0)) {
    return NextResponse.json({ error: "Ajoutez au moins une ligne avec un prix" }, { status: 400 });
  }

  const validDays = Math.min(180, Math.max(1, Math.round(Number(data.validDays) || 30)));
  const quote = await prisma.quote.create({
    data: {
      number: await nextQuoteNumber(),
      token: newToken(),
      customerName,
      email,
      phone: String(data.phone ?? "").trim(),
      eventDate,
      lines,
      depositPercent: Math.min(100, Math.max(0, Math.round(Number(data.depositPercent) || 0))),
      cautionCents: Math.max(0, Math.round(Number(data.cautionCents) || 0)),
      note: String(data.note ?? "").trim().slice(0, 2000),
      validUntil: new Date(Date.now() + validDays * 24 * 3600 * 1000),
    },
  });

  const url = `${siteOrigin(request.nextUrl.origin)}/devis/${quote.token}`;
  try {
    await sendQuoteEmail({ ...quote, lines }, url);
  } catch (err) {
    return NextResponse.json(
      { quote, url, error: `Devis créé mais l'email n'est pas parti : ${(err as Error).message}` },
      { status: 502 }
    );
  }
  return NextResponse.json({ quote, url });
}
