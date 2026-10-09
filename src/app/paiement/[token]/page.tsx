import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { SectionTitle, SiteFooter } from "@/components/Brand";
import { formatPrice } from "@/lib/format";
import { balanceDue } from "@/lib/billing";
import { orderTitle } from "@/lib/email";
import { CONTACT_PHONE } from "@/lib/contact";
import { getBankTransferSettings, transferAvailable } from "@/lib/bank";
import { CopyField } from "@/components/CopyField";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Régler le solde — YALM Events", robots: { index: false } };

// Page the client reaches from the "solde" email.
export default async function BalancePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ paye?: string }>;
}) {
  const { token } = await params;
  const { paye } = await searchParams;
  const booking = await prisma.booking.findFirst({
    where: { payToken: token },
    include: { product: { select: { name: true } }, pack: { select: { name: true } } },
  });
  if (!booking) notFound();

  const due = balanceDue(booking);
  const bank = await getBankTransferSettings();
  // Reference for a balance paid by transfer: YALM matches it by hand and marks the balance as paid.
  const balanceRef = `SOLDE ${(booking.transferRef ?? token.slice(0, 6)).replace("YALM-", "").toUpperCase()}`;
  const row = (label: string, value: string, strong = false) => (
    <p className="flex justify-between gap-4 border-b border-bordeaux/10 py-2.5">
      <span className="text-bordeaux/65">{label}</span>
      <span className={strong ? "font-semibold text-bordeaux" : ""}>{value}</span>
    </p>
  );

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-xl px-6 py-14">
          <SectionTitle eyebrow="Votre réservation" title="Régler le solde" />
          <div className="mt-10 rounded-lg border border-bordeaux/15 bg-cream-light p-7 text-sm text-bordeaux/85 shadow-[0_12px_30px_rgba(74,16,21,0.1)]">
            <p className="font-serif text-xl text-bordeaux">{orderTitle(booking)}</p>
            <p className="mt-1 text-bordeaux/60">
              {booking.customerName} — événement du {booking.eventDate.toLocaleDateString("fr-FR")}
            </p>
            <div className="mt-5">
              {row("Total de la commande (TTC)", formatPrice(booking.totalCents))}
              {row("Déjà réglé", formatPrice(booking.depositAmountCents))}
              {due.restCents > 0 && row("Solde", formatPrice(due.restCents), true)}
              {due.cautionCents > 0 && row("Caution remboursable", formatPrice(due.cautionCents), true)}
            </div>

            {due.totalDueCents > 0 && paye !== "1" ? (
              <form action={`/api/paiement/${token}`} method="post" className="mt-6">
                <button
                  type="submit"
                  className="label-caps w-full rounded-md bg-bordeaux px-4 py-3.5 text-cream transition-all hover:-translate-y-0.5 hover:bg-bordeaux-light"
                >
                  Payer {formatPrice(due.totalDueCents)}
                </button>
                <p className="mt-3 text-center text-xs text-bordeaux/55">Paiement sécurisé avec Stripe : carte, PayPal, Klarna…</p>
                {transferAvailable(bank) && (
                  <div className="mt-6 border-t border-dashed border-bordeaux/15 pt-5">
                    <p className="font-medium text-bordeaux">Ou par virement bancaire, sans frais</p>
                    <div className="mt-2 rounded-lg bg-beige-dark/30 px-4 py-1">
                      <CopyField label="Montant" value={formatPrice(due.totalDueCents)} />
                      <CopyField label="Bénéficiaire" value={bank.holder} />
                      <CopyField label="IBAN" value={bank.iban} />
                      {bank.bic && <CopyField label="BIC" value={bank.bic} />}
                      <CopyField label="Référence" value={balanceRef} />
                    </div>
                    <p className="mt-2 text-xs text-bordeaux/55">
                      Indiquez la référence dans le libellé. Nous vous confirmons la réception par email.
                    </p>
                  </div>
                )}
              </form>
            ) : (
              <p className="mt-6 rounded-lg bg-beige-dark/40 p-4 text-center">
                {paye === "1" && due.totalDueCents > 0
                  ? "Merci ! Votre paiement est en cours de validation, vous recevrez une confirmation par email."
                  : "Merci, votre réservation est entièrement réglée. Il n'y a plus rien à payer."}
              </p>
            )}
            <p className="mt-5 text-center text-xs text-bordeaux/55">Une question ? Appelez-nous au {CONTACT_PHONE}.</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
