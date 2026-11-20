import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { CustomFormulaCard, PackCard } from "@/components/PackCard";
import { getCustomFormulaSettings } from "@/lib/settings";
import { SectionTitle, SiteFooter } from "@/components/Brand";

export const metadata: Metadata = { title: "Nos formules — YALM Events" };

export const dynamic = "force-dynamic";

export default async function FormulesPage() {
  const packs = await prisma.pack.findMany({
    where: { isAvailable: true },
    include: { items: { include: { product: { include: { images: { orderBy: { order: "asc" }, take: 1 } } } } } },
    orderBy: { name: "asc" },
  });
  const customFormula = await getCustomFormulaSettings();

  return (
    <>
      <SiteHeader />
      <main className="flex-1 overflow-x-clip bg-bordeaux-rich">
        <section className="mx-auto max-w-7xl px-5 py-16 text-cream sm:px-8 sm:py-24">
          <SectionTitle eyebrow="Des offres combinées" title="Nos formules" tone="light" align="left" />
          {packs.length === 0 && !customFormula.enabled ? (
            <p className="mt-10 text-cream/75">Nos formules arrivent bientôt. Appelez-nous pour un devis sur mesure.</p>
          ) : (
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {packs.map((pack) => (
                <PackCard key={pack.id} pack={pack} />
              ))}
              {customFormula.enabled && <CustomFormulaCard minItems={customFormula.minItems} />}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
