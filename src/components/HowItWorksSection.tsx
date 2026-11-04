import Link from "next/link";
import { SectionTitle } from "@/components/Brand";

type Step = {
  id: string;
  title: string;
  description: string;
};

// Steps as cards with an oversized outlined number; hovering one turns it bordeaux and
// zooms it slightly, so moving from 1 to 2 to 3 highlights each step in turn.
export function HowItWorksSection({ steps }: { steps: Step[] }) {
  if (steps.length === 0) return null;

  return (
    <section id="comment-ca-marche" className="relative overflow-hidden bg-cream py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionTitle index="03" eyebrow="Le processus" title="Comment ça marche ?" align="left" />

        <div className="relative mt-14 sm:mt-16">
          <ol className="grid gap-12 sm:grid-cols-3 sm:gap-8">
            {steps.map((step, index) => {
              const content = (
                <div className="step-card group relative h-full rounded-[2rem] border border-bordeaux/15 bg-cream-light p-8 transition-[transform,background-color,border-color,box-shadow,color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:z-10 hover:scale-105 hover:border-bordeaux hover:bg-bordeaux hover:shadow-[0_30px_60px_-25px_rgba(78,13,21,0.65)] sm:p-10">
                  <span className="step-num block font-serif text-[clamp(4.5rem,8vw,7rem)] leading-none text-stroke-bordeaux">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 font-serif text-3xl text-bordeaux transition-colors duration-500 group-hover:text-cream">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-bordeaux/70 transition-colors duration-500 group-hover:text-cream/80">
                    {step.description}
                  </p>
                  {index === 0 && (
                    <span className="mt-6 inline-flex items-center gap-2 label-caps text-bordeaux transition-colors duration-500 group-hover:text-cream">
                      Voir le catalogue
                      <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                    </span>
                  )}
                </div>
              );

              return (
                <li key={step.id} data-fade-up data-delay={String(index * 0.12)}>
                  {index === 0 ? (
                    <Link href="/#catalogue" className="block h-full cursor-pointer">
                      {content}
                    </Link>
                  ) : (
                    content
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
