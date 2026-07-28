import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { ProductCard } from "@/components/ProductCard";
import { PackCard } from "@/components/PackCard";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { HeroSection } from "@/components/HeroSection";
import { Reveal } from "@/components/Reveal";

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

        {/* CTAs */}
        <section className="bg-background py-16 text-center">
          <Reveal>
            <div className="mx-auto max-w-2xl px-6">
              <div className="flex flex-wrap justify-center gap-4">
                <a href="#catalogue" className="rounded-full bg-bordeaux px-8 py-3.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-bordeaux-light hover:shadow-[0_10px_28px_rgba(74,16,21,0.3)]">
                  Voir les prestations
                </a>
                <a href="#formules" className="rounded-full border border-bordeaux/30 px-8 py-3.5 text-sm font-light text-bordeaux transition-all hover:-translate-y-0.5 hover:border-bordeaux hover:bg-bordeaux/5">
                  Nos formules
                </a>
              </div>
            </div>
          </Reveal>
        </section>

        {packs.length > 0 && (
          <section id="formules" className="mx-auto max-w-6xl px-6 py-12">
            <Reveal>
              <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                Des offres combinées
              </p>
              <h2 className="mt-2 text-center font-serif text-3xl text-bordeaux">Nos formules</h2>
            </Reveal>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {packs.map((pack) => (
                <PackCard key={pack.id} pack={pack} />
              ))}
            </div>
          </section>
        )}

        <section id="catalogue" className="mx-auto max-w-6xl px-6 py-16">
          <Reveal>
            <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              Notre catalogue
            </p>
            <h2 className="mt-2 text-center font-serif text-3xl text-bordeaux">
              Prestations disponibles
            </h2>
          </Reveal>

          {categories.map((category) => {
            const available = category.products.filter((p) => p.isAvailable);
            if (available.length === 0) return null;
            return (
              <div key={category.id} className="mt-12">
                <Reveal>
                  <h3 className="mb-6 border-b border-bordeaux/10 pb-3 text-sm font-semibold uppercase tracking-[0.12em] text-gold">
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
              <h3 className="mb-6 border-b border-bordeaux/10 pb-3 text-sm font-semibold uppercase tracking-[0.12em] text-gray-400">
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
      <footer className="bg-bordeaux-dark py-9 text-center text-sm text-white/70">
        <span className="font-serif italic text-gold-light">yalm</span>{" "}
        <span className="text-[0.62rem] uppercase tracking-[0.32em] text-white/50">events</span>
        <p className="mt-2">© {new Date().getFullYear()} YALM Événements — Tous droits réservés</p>
      </footer>
    </>
  );
}
