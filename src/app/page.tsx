import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { ProductCard } from "@/components/ProductCard";
import { CustomFormulaCard, PackCard } from "@/components/PackCard";
import { getCustomFormulaSettings } from "@/lib/settings";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { HeroSection } from "@/components/HeroSection";
import { ServicesMarquee } from "@/components/ServicesMarquee";
import { SectionTitle, SiteFooter } from "@/components/Brand";
import { SlideNav } from "@/components/motion/SlideNav";

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
  const customFormula = await getCustomFormulaSettings();

  const unavailable = categories.flatMap((c) => c.products.filter((p) => !p.isAvailable));

  return (
    <>
      <SiteHeader />
      {/* Each data-slide is a full-screen "page": with motion on, the next one slides over the
          previous (see slides() in MotionProvider). The dark ground shows as pages recede. */}
      <main data-slides className="flex-1 overflow-x-clip bg-[#1c0407]">
        <div data-slide id="accueil" className="flex min-h-svh flex-col bg-cream">
          <HeroSection />
          <ServicesMarquee />
        </div>

        <div data-slide data-slide-from="right" className="bg-cream">
        <section id="catalogue" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 sm:px-8 sm:py-28">
          <SectionTitle index="01" eyebrow="Notre catalogue" title="Nos prestations" align="left" />

          {categories.map((category) => {
            const available = category.products.filter((p) => p.isAvailable);
            if (available.length === 0) return null;
            return (
              <div key={category.id} className="mt-16 sm:mt-20">
                <div data-fade-up className="mb-10 flex items-end justify-between gap-6 border-b border-bordeaux/15 pb-4">
                  <h3 className="font-serif text-3xl uppercase tracking-[-0.01em] text-bordeaux sm:text-5xl">
                    {category.name}
                  </h3>
                  <span className="label-caps text-bordeaux/50">({String(available.length).padStart(2, "0")})</span>
                </div>
                <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                  {available.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
              </div>
            );
          })}

          {unavailable.length > 0 && (
            <div className="mt-20">
              <h3 className="mb-10 border-b border-bordeaux/10 pb-4 font-serif text-3xl uppercase text-bordeaux/40 sm:text-4xl">
                Bientôt de retour
              </h3>
              <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {unavailable.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            </div>
          )}
        </section>
        </div>

        {(packs.length > 0 || customFormula.enabled) && (
          <div data-slide data-slide-tone="dark" className="flex min-h-svh flex-col justify-center bg-bordeaux">
          <section id="formules" className="relative scroll-mt-24 overflow-hidden bg-bordeaux py-24 text-cream sm:py-32">
            {/* Giant outlined word drifting behind the cards */}
            <p
              aria-hidden
              data-parallax="0.4"
              className="pointer-events-none absolute -right-[5%] top-6 select-none font-script text-[clamp(9rem,26vw,24rem)] leading-none text-cream/[0.05]"
            >
              formules
            </p>
            <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
              <SectionTitle index="02" eyebrow="Des offres combinées" title="Nos formules" tone="light" align="left" />
              <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {packs.map((pack) => (
                  <PackCard key={pack.id} pack={pack} />
                ))}
                {customFormula.enabled && <CustomFormulaCard minItems={customFormula.minItems} />}
              </div>
            </div>
          </section>
          </div>
        )}

        {howItWorksSteps.length > 0 && (
          <div data-slide data-slide-from="right" className="flex min-h-svh flex-col justify-center bg-cream">
            <HowItWorksSection steps={howItWorksSteps} />
          </div>
        )}

        <div data-slide data-slide-plain data-slide-tone="dark" id="contact" className="[&>footer]:mt-0">
          <SiteFooter />
        </div>
      </main>
      <SlideNav
        items={[
          { href: "#accueil", label: "Accueil" },
          { href: "#catalogue", label: "Prestations" },
          ...(packs.length > 0 || customFormula.enabled ? [{ href: "#formules", label: "Formules" }] : []),
          ...(howItWorksSteps.length > 0 ? [{ href: "#comment-ca-marche", label: "Le processus" }] : []),
          { href: "#contact", label: "Contact" },
        ]}
      />
    </>
  );
}
