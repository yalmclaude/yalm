import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/Brand";
import { QuoteContact } from "@/components/QuoteContact";
import { BookingForm } from "@/components/BookingForm";
import { ProductGallery } from "@/components/ProductGallery";
import { SplitWords } from "@/components/motion/SplitWords";
import { formatPrice, formatHours, depositLabel, hasDeposit, parseDurationOptions } from "@/lib/format";
import { canBuy, canRent } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product] = await prisma.product.findMany({
    where: { slug: decodeURIComponent(slug) },
    include: { category: true, images: { orderBy: { order: "asc" } } },
    take: 1,
  });

  if (!product || !product.isAvailable) {
    notFound();
  }
  const durations = parseDurationOptions(product.durationOptions);

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-background">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 sm:px-8 md:grid-cols-2 lg:gap-16 lg:py-20">
          <div>
            <div data-fade-up>
              <ProductGallery images={product.images} alt={product.name} />
            </div>
            <p data-fade-up className="label-caps text-bordeaux/60">
              {product.category.name}
            </p>
            <h1 data-split className="mt-3 font-serif text-5xl leading-[0.95] tracking-[-0.02em] text-bordeaux sm:text-6xl">
              <SplitWords text={product.name} />
            </h1>
            <p data-fade-up className="mt-5 leading-relaxed text-bordeaux/70">{product.description}</p>
            {product.quoteOnly ? (
              <p className="mt-6 text-sm text-bordeaux/75">
                Tarif : <span className="font-semibold text-bordeaux">sur devis</span>
              </p>
            ) : (
            <div className="mt-6 space-y-1.5 text-sm text-bordeaux/75">
              {!canRent(product) ? null : durations.length > 0 ? (
                <div>
                  <p>{canBuy(product) ? "Location selon la durée :" : "Tarifs selon la durée :"}</p>
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
                  {canBuy(product) ? "Location" : "Prix"} :{" "}
                  <span className="font-semibold text-bordeaux">{formatPrice(product.priceCents)}</span>
                </p>
              )}
              {canBuy(product) && (
                <p>
                  {canRent(product) ? "Achat, pour le garder" : "Prix"} :{" "}
                  <span className="font-semibold text-bordeaux">{formatPrice(product.purchasePriceCents)}</span>
                </p>
              )}
              <p>
                {hasDeposit(product.depositType, product.depositValue)
                  ? `Acompte requis : ${depositLabel(product.depositType, product.depositValue)}`
                  : "Paiement intégral à la réservation"}
              </p>
              {product.cautionCents > 0 && canRent(product) && (
                <p>
                  Caution (remboursable{canBuy(product) ? ", en location" : ""}) : {formatPrice(product.cautionCents)}
                </p>
              )}
              {product.totalQuantity > 1 && <p>{product.totalQuantity} unités disponibles dans notre flotte</p>}
            </div>
            )}
          </div>

          <div data-fade-up data-delay="0.15" className="md:sticky md:top-24 md:self-start">
          {product.quoteOnly ? (
            <QuoteContact />
          ) : (
          <BookingForm
            productId={product.id}
            priceCents={product.priceCents}
            depositType={product.depositType}
            depositValue={product.depositValue}
            totalQuantity={product.totalQuantity}
            allowFullPayment={product.allowFullPayment}
            cautionCents={product.cautionCents}
            durationOptions={durations}
            saleMode={product.saleMode}
            purchasePriceCents={product.purchasePriceCents}
            askCustomText={product.askCustomText}
          />
          )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
