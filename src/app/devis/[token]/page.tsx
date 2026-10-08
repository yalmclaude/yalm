import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { SectionTitle, SiteFooter } from "@/components/Brand";
import { formatPrice } from "@/lib/format";
import { parseQuoteLines, quoteTotals, VAT_RATE } from "@/lib/billing";
import { CONTACT_PHONE } from "@/lib/contact";
import { LEGAL } from "@/lib/legal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Votre devis — YALM Events", robots: { index: false } };

// Page the client reaches from the devis email: read the devis, accept it by paying the deposit.
export default async function QuotePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ paye?: string }>;
}) {
  const { token } = await params;
  const { paye } = await searchParams;
  const quote = await prisma.quote.findFirst({ where: { token } });
  if (!quote) notFound();

  const lines = parseQuoteLines(quote.lines);
  const t = quoteTotals(lines, quote.depositPercent);
  const expired = quote.status === "SENT" && quote.validUntil < new Date();
  const partial = t.depositCents < t.totalCents;

  const total = (label: string, value: string, strong = false) => (
    <p className="flex justify-between gap-4 py-1.5">
      <span className="text-bordeaux/65">{label}</span>
      <span className={strong ? "font-semibold text-bordeaux" : ""}>{value}</span>
    </p>
  );

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-2xl px-6 py-14">
          <SectionTitle eyebrow={`Devis ${quote.number}`} title="Votre devis" />
          <div className="mt-10 rounded-lg border border-bordeaux/15 bg-cream-light p-7 text-sm text-bordeaux/85 shadow-[0_12px_30px_rgba(74,16,21,0.1)]">
            <div className="flex flex-wrap justify-between gap-4 text-xs text-bordeaux/60">
              <div>
                <p className="font-semibold text-bordeaux">{LEGAL.companyName}</p>
                <p>{LEGAL.address}</p>
                <p>SIRET {LEGAL.siret} · TVA {LEGAL.vatNumber}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-bordeaux">{quote.customerName}</p>
                <p>Émis le {quote.createdAt.toLocaleDateString("fr-FR")}</p>
                <p>Valable jusqu&apos;au {quote.validUntil.toLocaleDateString("fr-FR")}</p>
              </div>
            </div>

            <p className="mt-6">
              Événement du <strong>{quote.eventDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</strong>
            </p>

            <ul className="mt-4 divide-y divide-bordeaux/10 border-y border-bordeaux/10">
              {lines.map((l, i) => (
                <li key={i} className="flex justify-between gap-4 py-3">
                  <span>
                    <span className="font-medium text-bordeaux">{l.label}</span>
                    {l.description && <span className="mt-0.5 block whitespace-pre-line text-xs text-bordeaux/60">{l.description}</span>}
                  </span>
                  <span className="shrink-0">{formatPrice(l.priceCents)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-3">
              {total("Total HT", formatPrice(t.htCents))}
              {total(`TVA (${VAT_RATE} %)`, formatPrice(t.vatCents))}
              {total("Total TTC", formatPrice(t.totalCents), true)}
              {partial && total(`Acompte à la signature (${quote.depositPercent} %)`, formatPrice(t.depositCents), true)}
              {quote.cautionCents > 0 && total("Caution remboursable (réglée avec le solde)", formatPrice(quote.cautionCents))}
            </div>

            {quote.note && <p className="mt-5 whitespace-pre-line rounded-lg bg-beige-dark/40 p-4">{quote.note}</p>}

            {quote.status === "ACCEPTED" || paye === "1" ? (
              <p className="mt-6 rounded-lg bg-beige-dark/40 p-4 text-center">
                Merci ! Votre devis est accepté{quote.status !== "ACCEPTED" ? " (paiement en cours de validation)" : ""}. Vous recevez
                la confirmation de votre réservation par email.
              </p>
            ) : quote.status === "CANCELLED" ? (
              <p className="mt-6 rounded-lg bg-beige-dark/40 p-4 text-center">Ce devis a été annulé. Contactez-nous pour une nouvelle proposition.</p>
            ) : expired ? (
              <p className="mt-6 rounded-lg bg-beige-dark/40 p-4 text-center">
                Ce devis a expiré. Appelez-nous au {CONTACT_PHONE} pour le renouveler.
              </p>
            ) : (
              <form action={`/api/devis/${token}`} method="post" className="mt-6">
                <button
                  type="submit"
                  className="label-caps w-full rounded-md bg-bordeaux px-4 py-3.5 text-cream transition-all hover:-translate-y-0.5 hover:bg-bordeaux-light"
                >
                  {partial ? `Accepter et payer l'acompte — ${formatPrice(t.depositCents)}` : `Accepter et payer — ${formatPrice(t.totalCents)}`}
                </button>
                <p className="mt-3 text-center text-xs text-bordeaux/55">
                  En payant, vous acceptez ce devis. Paiement sécurisé par carte avec Stripe.
                </p>
              </form>
            )}
            <p className="mt-5 text-center text-xs text-bordeaux/55">Une question ? Appelez-nous au {CONTACT_PHONE}.</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
