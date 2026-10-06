import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { SectionTitle, SiteFooter } from "@/components/Brand";
import { CustomFormulaBuilder, type BuilderProduct } from "@/components/CustomFormulaBuilder";
import { parseDurationOptions } from "@/lib/format";
import { CUSTOM_DISCOUNT_PERCENT, CUSTOM_MIN_ITEMS } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function CustomFormulaPage() {
  const products = await prisma.product.findMany({
    where: { isAvailable: true, quoteOnly: false },
    include: { category: true, images: { orderBy: { order: "asc" }, take: 1 } },
    orderBy: [{ category: { order: "asc" } }, { name: "asc" }],
  });

  const items: BuilderProduct[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    category: p.category.name,
    imageUrl: p.images[0]?.url ?? null,
    priceCents: p.priceCents,
    saleMode: p.saleMode,
    purchasePriceCents: p.purchasePriceCents,
    durationOptions: parseDurationOptions(p.durationOptions),
    depositType: p.depositType,
    depositValue: p.depositValue,
    cautionCents: p.cautionCents,
  }));

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <SectionTitle eyebrow="Sur mesure" title="Votre formule personnalisée" />
          <p className="mx-auto mt-5 max-w-2xl text-center text-sm leading-relaxed text-bordeaux/70">
            Composez votre formule avec au moins {CUSTOM_MIN_ITEMS} prestations : chacune bénéficie de{" "}
            <strong className="text-bordeaux">-{CUSTOM_DISCOUNT_PERCENT} %</strong> sur son prix. Choisissez vos options, puis
            réservez votre date.
          </p>
          <div className="mt-12">
            <CustomFormulaBuilder products={items} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
