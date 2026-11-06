import Link from "next/link";
import { formatPrice, parseDurationOptions, paymentTermsLabel, startingPriceCents } from "@/lib/format";
import { Reveal } from "@/components/Reveal";
import { SpinBadge, SplitPhotos } from "@/components/SpinBadge";

type PackCardProduct = { product: { name: string; images?: { url: string }[] }; quantity: number };

// Photos shown for a formule: one per included prestation (its main photo), else the
// formule's own image.
export function packPhotos(pack: { imageUrl: string | null; items: PackCardProduct[] }) {
  const fromItems = pack.items.map((i) => i.product.images?.[0]?.url).filter((u): u is string => Boolean(u));
  if (fromItems.length > 0) return fromItems.slice(0, 2);
  return pack.imageUrl ? [pack.imageUrl] : [];
}

type PackCardData = {
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  depositType: "FIXED" | "PERCENT";
  depositValue: number;
  imageUrl: string | null;
  durationOptions: unknown;
  quoteOnly: boolean;
  items: PackCardProduct[];
};

export function PackCard({ pack }: { pack: PackCardData }) {
  return (
    <Reveal>
      <Link
        href={`/formules/${pack.slug}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-cream/20 p-7 text-cream transition-[color,border-color,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] before:absolute before:inset-0 before:-z-10 before:translate-y-full before:rounded-[2rem] before:bg-cream before:transition-transform before:duration-700 before:ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:border-cream hover:text-bordeaux hover:before:translate-y-0 isolate"
      >
        {packPhotos(pack).length > 0 ? (
          <SplitPhotos
            urls={packPhotos(pack)}
            alt={pack.name}
            badgeId={`badge-pack-${pack.slug}`}
            className="mb-6 rounded-[1.25rem]"
            zoomOnHover
          />
        ) : (
          <div className="mb-6">
            <SpinBadge id={`badge-pack-${pack.slug}`}>★</SpinBadge>
          </div>
        )}
        <h4 className="font-serif text-3xl leading-tight">
          {pack.name}
        </h4>
        <p className="mt-2 text-sm opacity-75">{pack.description}</p>
        {pack.items.length > 0 && (
          <div className="mt-4">
            <p className="label-caps opacity-60">Comprend</p>
            <ul className="mt-2 space-y-1 text-sm">
              {pack.items.map((item, i) => (
                <li key={i} className="flex items-baseline gap-2">
                  <span className="opacity-60">✦</span>
                  {item.quantity > 1 ? `${item.quantity}× ` : ""}
                  {item.product.name}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex-1" />
        <div className="mt-4 flex items-center justify-between border-t border-dashed border-current/25 pt-3.5">
          {pack.quoteOnly ? (
            <>
              <span className="font-semibold">Sur devis</span>
              <span className="text-right text-xs opacity-70">Appelez-nous</span>
            </>
          ) : (
            <>
              <span className="font-semibold">
                {parseDurationOptions(pack.durationOptions).length > 0 && "Dès "}
                {formatPrice(startingPriceCents(pack.priceCents, parseDurationOptions(pack.durationOptions)))}
              </span>
              <span className="text-right text-xs opacity-70">
                {paymentTermsLabel(pack.depositType, pack.depositValue)}
              </span>
            </>
          )}
        </div>
      </Link>
    </Reveal>
  );
}

// Entry point to the "formule personnalisée" builder, shown alongside the ready-made formules.
export function CustomFormulaCard({ minItems, discountPercent }: { minItems: number; discountPercent: number }) {
  return (
    <Reveal>
      <Link
        href="/formules/personnalisee"
        className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-cream/20 p-7 text-cream transition-[color,border-color,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] before:absolute before:inset-0 before:-z-10 before:translate-y-full before:rounded-[2rem] before:bg-cream before:transition-transform before:duration-700 before:ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:border-cream hover:text-bordeaux hover:before:translate-y-0 isolate"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <SpinBadge id="badge-custom-formula" />
          {discountPercent > 0 && (
            <span className="text-right">
              <span className="block font-serif text-5xl leading-none">-{String(discountPercent).replace(".", ",")} %</span>
              <span className="mt-1 block label-caps opacity-70">par prestation</span>
            </span>
          )}
        </div>
        <h4 className="font-serif text-3xl leading-tight">Formule personnalisée</h4>
        <p className="mt-2 flex-1 text-sm opacity-75">
          Composez votre propre formule à partir de {minItems} prestations, à un tarif avantageux.
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-dashed border-current/25 pt-3.5">
          <span className="font-semibold">Sur mesure</span>
          <span className="label-caps opacity-80 transition-transform group-hover:translate-x-1">Composer →</span>
        </div>
      </Link>
    </Reveal>
  );
}
