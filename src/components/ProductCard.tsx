import Link from "next/link";
import { formatPrice, parseDurationOptions, paymentTermsLabel } from "@/lib/format";
import { canBuy, canRent, startingPrice } from "@/lib/pricing";
import type { Product } from "@prisma/client";
import { Reveal } from "@/components/Reveal";

type ProductWithImages = Product & { images: { url: string }[] };

// Every photo fills the same arch-topped 4:5 frame (cropped to fit), so all cards line
// up; the inner layer drifts with scroll (data-img-parallax) and zooms on hover.
function ArchPhoto({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-full bg-beige-dark">
      <div data-img-parallax className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" className={`h-full w-full object-cover ${className}`} />
      </div>
    </div>
  );
}

function priceLine(product: ProductWithImages) {
  if (product.quoteOnly) return { price: "Sur devis", terms: "Appelez-nous" };
  const start = startingPrice(product);
  const hasFrom = start.hasRange || parseDurationOptions(product.durationOptions).length > 1;
  return {
    price: `${hasFrom ? "Dès " : ""}${formatPrice(start.priceCents)}`,
    terms:
      canBuy(product) && canRent(product)
        ? "À louer ou à garder"
        : canBuy(product)
          ? "À garder"
          : paymentTermsLabel(product.depositType, product.depositValue),
  };
}

export function ProductCard({ product, index = 0 }: { product: ProductWithImages; index?: number }) {
  const coverUrl = product.images[0]?.url;
  const delay = (index % 3) * 110;

  if (!product.isAvailable) {
    return (
      <Reveal delay={delay}>
        <div className="opacity-60">
          {coverUrl ? (
            <ArchPhoto src={coverUrl} alt={product.name} className="grayscale" />
          ) : (
            <div className="flex aspect-[4/5] w-full items-center justify-center rounded-t-full bg-beige-dark text-3xl text-bordeaux/40">
              ✦
            </div>
          )}
          <div className="pt-5">
            <h4 className="font-serif text-2xl text-bordeaux/60">{product.name}</h4>
            <span className="mt-3 inline-block rounded-full bg-beige-dark px-3 py-1.5 text-[0.7rem] uppercase tracking-wide text-bordeaux/60">
              Bientôt de retour
            </span>
          </div>
        </div>
      </Reveal>
    );
  }

  const { price, terms } = priceLine(product);

  return (
    <Reveal delay={delay}>
      <Link href={`/produits/${product.slug}`} className="group block">
        <div className="relative">
          {coverUrl ? (
            <div className="transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[0.97]">
              <div className="[&_img]:transition-transform [&_img]:duration-[1.2s] [&_img]:ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:[&_img]:scale-110">
                <ArchPhoto src={coverUrl} alt={product.name} />
              </div>
            </div>
          ) : (
            <div className="flex aspect-[4/5] w-full items-center justify-center rounded-t-full bg-gradient-to-br from-bordeaux to-bordeaux-light text-4xl text-beige transition-transform duration-700 group-hover:scale-[0.97]">
              ✦
            </div>
          )}
          {/* "Découvrir" pill rising on hover */}
          <span className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 translate-y-4 rounded-full bg-cream px-5 py-2.5 label-caps text-bordeaux opacity-0 shadow-lg transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100">
            Découvrir →
          </span>
        </div>
        <div className="pt-5">
          <div className="flex items-baseline justify-between gap-4">
            <h4 className="font-serif text-2xl leading-tight text-bordeaux">{product.name}</h4>
            <span className="shrink-0 font-semibold text-bordeaux">{price}</span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="h-px flex-1 origin-left bg-bordeaux/20 transition-transform duration-700 group-hover:scale-x-110 group-hover:bg-bordeaux/50" />
            <span className="text-right text-xs text-bordeaux/55">{terms}</span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}
