import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { ProductCard } from "@/components/ProductCard";
import { CustomFormulaCard, PackCard } from "@/components/PackCard";
import { CUSTOM_MIN_ITEMS } from "@/lib/pricing";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { HeroSection } from "@/components/HeroSection";
import { Reveal } from "@/components/Reveal";
import { SectionTitle, SiteFooter } from "@/components/Brand";

// Rendered on every request so admin changes (prices, "sur devis", new offers) show up immediately.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      products: {
        orderBy: { name: "asc" },
        include: { images: { orderBy: { order: "asc" } } },
      },
    },
  });

  const packs = await prisma.pack.findMany({
    where: { isAvailable: true },
    include: { items: { include: { product: true } } },
    orderBy: { name: "asc" },
  });

  const howItWorksSteps = await prisma.howItWorksStep.findMany({ orderBy: { order: "asc" } });

  const unavailable = categories.flatMap((c) => c.products.filter((p) => !p.isAvailable));

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />

        <section id="formules" className="mx-auto max-w-6xl px-6 py-16">
          <Reveal>
            <SectionTitle eyebrow="Des offres combinées" title="Nos formules" />
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packs.map((pack) => (
              <PackCard key={pack.id} pack={pack} />
            ))}
            <CustomFormulaCard minItems={CUSTOM_MIN_ITEMS} />
          </div>
        </section>

        <section id="catalogue" className="mx-auto max-w-6xl px-6 py-16">
          <Reveal>
            <SectionTitle eyebrow="Notre catalogue" title="Nos prestations" />
          </Reveal>

          {categories.map((category) => {
            const available = category.products.filter((p) => p.isAvailable);
            if (available.length === 0) return null;
            return (
              <div key={category.id} className="mt-12">
                <Reveal>
                  <h3 className="mb-6 border-b border-bordeaux/10 pb-3 label-caps text-bordeaux">
                    {category.name}
                  </h3>
                </Reveal>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {available.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            );
          })}

          {unavailable.length > 0 && (
            <div className="mt-14">
              <h3 className="mb-6 border-b border-bordeaux/10 pb-3 label-caps text-bordeaux/40">
                Bientôt de retour
              </h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {unavailable.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </section>

        <HowItWorksSection steps={howItWorksSteps} />
      </main>
      <SiteFooter />
    </>
  );
}
