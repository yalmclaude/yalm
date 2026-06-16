import Link from "next/link";
import { formatPrice, depositLabel } from "@/lib/format";
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
  items: PackCardProduct[];
};

export function PackCard({ pack }: { pack: PackCardData }) {
  return (
    <Reveal>
      <Link
        href={`/formules/${pack.slug}`}
        className="group block rounded-2xl border border-gold/40 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_36px_rgba(74,16,21,0.14)]"
      >
        {pack.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pack.imageUrl} alt={pack.name} className="mb-4 h-36 w-full rounded-lg object-cover" />
        ) : (
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-light text-bordeaux-dark">
            ★
          </div>
        )}
        <h4 className="font-serif text-lg text-anthracite transition-colors group-hover:text-bordeaux">
          {pack.name}
        </h4>
        <p className="mt-2 text-sm text-gray-500">{pack.description}</p>
        <ul className="mt-3 space-y-0.5 text-xs text-gray-500">
          {pack.items.map((item, i) => (
            <li key={i}>
              • {item.quantity > 1 ? `${item.quantity}× ` : ""}
              {item.product.name}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t border-dashed border-bordeaux/15 pt-3.5">
          <span className="font-semibold text-bordeaux">{formatPrice(pack.priceCents)}</span>
          <span className="text-right text-xs text-gray-500">
            Acompte : {depositLabel(pack.depositType, pack.depositValue)}
          </span>
        </div>
      </Link>
    </Reveal>
  );
}
