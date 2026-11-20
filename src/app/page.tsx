import { SiteHeader } from "@/components/SiteHeader";
import { HeroSection } from "@/components/HeroSection";
import { ServicesMarquee } from "@/components/ServicesMarquee";
import { SiteFooter } from "@/components/Brand";

// Home: just the introduction. Prestations, formules, the process and contact each have
// their own page (see the header tabs).
export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col overflow-x-clip bg-cream">
        <HeroSection />
        <ServicesMarquee />
      </main>
      <SiteFooter />
    </>
  );
}
