import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { SectionTitle, SiteFooter } from "@/components/Brand";
import { CopyField } from "@/components/CopyField";
import { formatPrice } from "@/lib/format";
import { orderTitle } from "@/lib/email";
import { getBankTransferSettings, transferAmountCents } from "@/lib/bank";
import { CONTACT_PHONE } from "@/lib/contact";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Paiement par virement — YALM Events", robots: { index: false } };

// Instructions page for a booking paid by bank transfer (link shown after booking and in the email).
export default async function TransferPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const booking = await prisma.booking.findFirst({
    where: { transferRef: ref },
    include: { product: { select: { name: true } }, pack: { select: { name: true } } },
  });
  if (!booking) notFound();

  const settings = await getBankTransferSettings();
  const amount = transferAmountCents(booking);
  const confirmed = booking.status === "CONFIRMED";
  const expired = !confirmed && booking.transferDueAt !== null && booking.transferDueAt < new Date();

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-xl px-6 py-14">
          <SectionTitle eyebrow="Votre réservation" title="Paiement par virement" />
          <div className="mt-10 rounded-lg border border-bordeaux/15 bg-cream-light p-7 text-sm text-bordeaux/85 shadow-[0_12px_30px_rgba(74,16,21,0.1)]">
            <p className="font-serif text-xl text-bordeaux">{orderTitle(booking)}</p>
            <p className="mt-1 text-bordeaux/60">
              {booking.customerName} — événement du {booking.eventDate.toLocaleDateString("fr-FR")}
            </p>

            {confirmed ? (
              <p className="mt-6 rounded-lg bg-beige-dark/40 p-4 text-center">
                Merci ! Votre virement est bien reçu et votre réservation est confirmée.
              </p>
            ) : booking.status !== "PENDING_DEPOSIT" ? (
              <p className="mt-6 rounded-lg bg-beige-dark/40 p-4 text-center">Cette réservation a été annulée.</p>
            ) : (
              <>
                <p className="mt-5">
                  {expired ? (
                    <>
                      Le délai de réservation est dépassé : la date n&apos;est plus garantie. Appelez-nous au {CONTACT_PHONE}{" "}
                      avant d&apos;effectuer votre virement.
                    </>
                  ) : (
                    <>
                      Votre date est réservée jusqu&apos;au{" "}
                      <strong>{booking.transferDueAt?.toLocaleDateString("fr-FR")}</strong>, le temps que votre virement nous
                      parvienne. Effectuez-le avec les informations ci-dessous :
                    </>
                  )}
                </p>
                <div className="mt-4 rounded-lg bg-beige-dark/30 px-4 py-1">
                  <CopyField label="Montant" value={formatPrice(amount)} />
                  <CopyField label="Bénéficiaire" value={settings.holder} />
                  <CopyField label="IBAN" value={settings.iban} />
                  {settings.bic && <CopyField label="BIC" value={settings.bic} />}
                  <CopyField label="Référence" value={ref} />
                </div>
                <p className="mt-4 text-xs leading-relaxed text-bordeaux/60">
                  Indiquez bien la référence <strong>{ref}</strong> dans le libellé du virement. Un virement instantané
                  arrive en quelques secondes, un virement classique en 1 à 2 jours ouvrés. Vous recevrez la confirmation
                  de votre réservation par email dès réception. Ces informations vous ont aussi été envoyées par email.
                </p>
              </>
            )}
            <p className="mt-5 text-center text-xs text-bordeaux/55">Une question ? Appelez-nous au {CONTACT_PHONE}.</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
