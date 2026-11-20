import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { ProductCard } from "@/components/ProductCard";
import { SectionTitle, SiteFooter } from "@/components/Brand";

export const metadata: Metadata = { title: "Nos prestations — YALM Events" };

// Rendered on every request so admin changes (prices, availability) show up immediately.
export const dynamic = "force-dynamic";

export default async function PrestationsPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      products: {
        orderBy: { name: "asc" },
        include: { images: { orderBy: { order: "asc" } } },
      },
    },
  });
  const unavailable = categories.flatMap((c) => c.products.filter((p) => !p.isAvailable));

  return (
    <>
      <SiteHeader />
      <main className="flex-1 overflow-x-clip bg-cream">
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <SectionTitle eyebrow="Notre catalogue" title="Nos prestations" align="left" />

          {categories.map((category) => {
            const available = category.products.filter((p) => p.isAvailable);
            if (available.length === 0) return null;
            return (
              <div key={category.id} className="mt-16 sm:mt-20">
                <div className="mb-10 flex items-end justify-between gap-6 border-b border-bordeaux/15 pb-4">
                  <h3 className="font-serif text-3xl uppercase tracking-[-0.01em] text-bordeaux sm:text-5xl">
                    {category.name}
                  </h3>
                  <span className="label-caps text-bordeaux/50">({String(available.length).padStart(2, "0")})</span>
                </div>
                <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                  {available.map((product) => (
                    <ProductCard key={product.id} product={product} />
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
                {unavailable.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
