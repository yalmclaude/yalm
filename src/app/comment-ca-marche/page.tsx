import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { SiteFooter } from "@/components/Brand";

export const metadata: Metadata = { title: "Comment ça marche ? — YALM Events" };

export const dynamic = "force-dynamic";

export default async function HowItWorksPage() {
  const steps = await prisma.howItWorksStep.findMany({ orderBy: { order: "asc" } });

  return (
    <>
      <SiteHeader />
      <main className="flex-1 overflow-x-clip bg-cream">
        <HowItWorksSection steps={steps} />
      </main>
      <SiteFooter />
    </>
  );
}
