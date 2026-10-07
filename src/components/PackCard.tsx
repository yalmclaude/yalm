import Link from "next/link";
import { formatPrice, parseDurationOptions, paymentTermsLabel, startingPriceCents } from "@/lib/format";
import { Reveal } from "@/components/Reveal";

type PackCardProduct = { product: { name: string }; quantity: number };

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
        className="group flex h-full flex-col rounded-lg bg-bordeaux p-6 text-cream shadow-[0_8px_24px_rgba(74,16,21,0.18)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_36px_rgba(74,16,21,0.3)]"
      >
        {pack.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pack.imageUrl} alt={pack.name} className="mb-4 h-36 w-full rounded-lg object-cover" />
        ) : (
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cream text-bordeaux">
            ★
          </div>
        )}
        <h4 className="font-serif text-lg">
          {pack.name}
        </h4>
        <p className="mt-2 text-sm text-cream/75">{pack.description}</p>
        <ul className="mt-3 flex-1 space-y-0.5 text-xs text-cream/65">
          {pack.items.map((item, i) => (
            <li key={i}>
              • {item.quantity > 1 ? `${item.quantity}× ` : ""}
              {item.product.name}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t border-dashed border-cream/25 pt-3.5">
          {pack.quoteOnly ? (
            <>
              <span className="font-semibold">Sur devis</span>
              <span className="text-right text-xs text-cream/70">Appelez-nous</span>
            </>
          ) : (
            <>
              <span className="font-semibold">
                {parseDurationOptions(pack.durationOptions).length > 0 && "Dès "}
                {formatPrice(startingPriceCents(pack.priceCents, parseDurationOptions(pack.durationOptions)))}
              </span>
              <span className="text-right text-xs text-cream/70">
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
export function CustomFormulaCard({ minItems }: { minItems: number }) {
  return (
    <Reveal>
      <Link
        href="/formules/personnalisee"
        className="group flex h-full flex-col rounded-lg bg-bordeaux p-6 text-cream shadow-[0_8px_24px_rgba(74,16,21,0.18)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_36px_rgba(74,16,21,0.3)]"
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cream text-bordeaux">✦</div>
        <h4 className="font-serif text-lg">Formule personnalisée</h4>
        <p className="mt-2 flex-1 text-sm text-cream/75">
          Composez votre propre formule à partir de {minItems} prestations, à un tarif avantageux.
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-dashed border-cream/25 pt-3.5">
          <span className="font-semibold">Sur mesure</span>
          <span className="label-caps text-cream/80 transition-transform group-hover:translate-x-1">Composer →</span>
        </div>
      </Link>
    </Reveal>
  );
}
