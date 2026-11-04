import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/Brand";
import { QuoteContact } from "@/components/QuoteContact";
import { BookingForm } from "@/components/BookingForm";
import { formatPrice, formatHours, depositLabel, hasDeposit, parseDurationOptions } from "@/lib/format";
import { SplitWords } from "@/components/motion/SplitWords";

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

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-background">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 sm:px-8 md:grid-cols-2 lg:gap-16 lg:py-20">
          <div>
            {pack.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pack.imageUrl}
                alt={pack.name}
                data-fade-up
                className="mb-6 aspect-[4/3] w-full rounded-t-full rounded-b-2xl object-cover shadow-[0_30px_60px_-30px_rgba(78,13,21,0.45)]"
              />
            )}
            <p data-fade-up className="label-caps text-bordeaux/60">Formule</p>
            <h1 data-split className="mt-3 font-serif text-5xl leading-[0.95] tracking-[-0.02em] text-bordeaux sm:text-6xl">
              <SplitWords text={pack.name} />
            </h1>
            <p data-fade-up className="mt-5 leading-relaxed text-bordeaux/70">{pack.description}</p>

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
