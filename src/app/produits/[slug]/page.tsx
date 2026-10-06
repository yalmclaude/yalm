import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/Brand";
import { QuoteContact } from "@/components/QuoteContact";
import { BookingForm } from "@/components/BookingForm";
import { ProductGallery } from "@/components/ProductGallery";
import { formatPrice, formatHours, depositLabel, parseDurationOptions } from "@/lib/format";
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
        <div className="mx-auto max-w-5xl px-6 py-14 grid gap-10 md:grid-cols-2">
          <div>
            <ProductGallery images={product.images} alt={product.name} />
            <p className="label-caps text-bordeaux/60">
              {product.category.name}
            </p>
            <h1 className="mt-2 font-serif text-3xl text-bordeaux">{product.name}</h1>
            <p className="mt-4 text-bordeaux/70">{product.description}</p>
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
              <p>Acompte requis : {depositLabel(product.depositType, product.depositValue)}</p>
              {product.cautionCents > 0 && canRent(product) && (
                <p>
                  Caution (remboursable{canBuy(product) ? ", en location" : ""}) : {formatPrice(product.cautionCents)}
                </p>
              )}
              {product.totalQuantity > 1 && <p>{product.totalQuantity} unités disponibles dans notre flotte</p>}
            </div>
            )}
          </div>

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
          />
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
