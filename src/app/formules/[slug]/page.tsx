import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/Brand";
import { QuoteContact } from "@/components/QuoteContact";
import { BookingForm } from "@/components/BookingForm";
import { getBankTransferSettings, transferAvailable } from "@/lib/bank";
import { formatPrice, formatHours, depositLabel, hasDeposit, parseDurationOptions } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PackPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [pack] = await prisma.pack.findMany({
    where: { slug: decodeURIComponent(slug) },
    include: { items: { include: { product: true } } },
    take: 1,
  });

  if (!pack || !pack.isAvailable) {
    notFound();
  }
  const durations = parseDurationOptions(pack.durationOptions);

  const bank = await getBankTransferSettings();
  const transferHoldDays = transferAvailable(bank) ? bank.holdDays : null;

  return (    <>
      <SiteHeader />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-5xl px-6 py-14 grid gap-10 md:grid-cols-2">
          <div>
            {pack.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pack.imageUrl}
                alt={pack.name}
                className="mb-5 h-64 w-full rounded-2xl object-cover shadow-[0_12px_30px_rgba(0,0,0,0.08)]"
              />
            )}
            <p className="label-caps text-bordeaux/60">Formule</p>
            <h1 className="mt-2 font-serif text-3xl text-bordeaux">{pack.name}</h1>
            <p className="mt-4 text-bordeaux/70">{pack.description}</p>

            <div className="mt-6">
              <p className="text-sm font-medium text-bordeaux">Cette formule inclut :</p>
              <ul className="mt-2 space-y-1 text-sm text-bordeaux/75">
                {pack.items.map((item) => (
                  <li key={item.id}>
                    • {item.quantity > 1 ? `${item.quantity}× ` : ""}
                    {item.product.name}
                  </li>
                ))}
              </ul>
            </div>

            {pack.quoteOnly ? (
              <p className="mt-6 text-sm text-bordeaux/75">
                Tarif : <span className="font-semibold text-bordeaux">sur devis</span>
              </p>
            ) : (
            <div className="mt-6 space-y-1.5 text-sm text-bordeaux/75">
              {durations.length > 0 ? (
                <div>
                  <p>Tarifs selon la durée :</p>
                  <ul className="mt-1 space-y-0.5">
                    {durations.map((d) => (
                      <li key={d.hours}>
                        {formatHours(d.hours)} — <span className="font-semibold text-bordeaux">{formatPrice(d.priceCents)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>
                  Prix : <span className="font-semibold text-bordeaux">{formatPrice(pack.priceCents)}</span>
                </p>
              )}
              <p>
                {hasDeposit(pack.depositType, pack.depositValue)
                  ? `Acompte requis : ${depositLabel(pack.depositType, pack.depositValue)}`
                  : "Paiement intégral à la réservation"}
              </p>
              {pack.cautionCents > 0 && <p>Caution (remboursable) : {formatPrice(pack.cautionCents)}</p>}
            </div>
            )}
          </div>

          {pack.quoteOnly ? (
            <QuoteContact title="Cette formule est sur devis" />
          ) : (
          <BookingForm
            transferHoldDays={transferHoldDays}
            packId={pack.id}
            priceCents={pack.priceCents}
            depositType={pack.depositType}
            depositValue={pack.depositValue}
            allowFullPayment={pack.allowFullPayment}
            cautionCents={pack.cautionCents}
            durationOptions={durations}
            title="Réserver cette formule"
          />
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
