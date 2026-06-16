import Link from "next/link";
import { formatPrice, depositLabel } from "@/lib/format";
import type { Product } from "@/generated/prisma/client";
import { Reveal } from "@/components/Reveal";

type ProductWithImages = Product & { images: { url: string }[] };

export function ProductCard({ product }: { product: ProductWithImages }) {
  const coverUrl = product.images[0]?.url;

  if (!product.isAvailable) {
    return (
      <Reveal>
        <div className="rounded-2xl border border-bordeaux/5 bg-[#f1efec] p-6 opacity-85">
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt={product.name}
              className="mb-4 h-36 w-full rounded-lg object-cover grayscale"
            />
          ) : (
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#d8d4cd] text-white">
              ✦
            </div>
          )}
          <h4 className="font-serif text-lg text-anthracite">{product.name}</h4>
          <p className="mt-2 text-sm text-gray-500 min-h-11">{product.description}</p>
          <span className="mt-3 inline-block rounded-full bg-[#e4e1db] px-3 py-1.5 text-[0.7rem] uppercase tracking-wide text-gray-500">
            Bientôt de retour
          </span>
        </div>
      </Reveal>
    );
  }

  return (
    <Reveal>
      <Link
        href={`/produits/${product.slug}`}
        className="group block rounded-2xl border border-bordeaux/5 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_36px_rgba(74,16,21,0.14)]"
      >
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl} alt={product.name} className="mb-4 h-36 w-full rounded-lg object-cover" />
        ) : (
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-bordeaux to-bordeaux-light text-gold-light">
            ✦
          </div>
        )}
        <h4 className="font-serif text-lg text-anthracite transition-colors group-hover:text-bordeaux">
          {product.name}
        </h4>
        <p className="mt-2 text-sm text-gray-500 min-h-11">{product.description}</p>
        <div className="mt-4 flex items-center justify-between border-t border-dashed border-bordeaux/15 pt-3.5">
          <span className="font-semibold text-bordeaux">{formatPrice(product.priceCents)}</span>
          <span className="text-right text-xs text-gray-500">
            Acompte : {depositLabel(product.depositType, product.depositValue)}
          </span>
        </div>
      </Link>
    </Reveal>
  );
}
