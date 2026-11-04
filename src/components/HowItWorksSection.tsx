import Link from "next/link";
import { SectionTitle } from "@/components/Brand";

type Step = {
  id: string;
  title: string;
  description: string;
};

// Steps as an editorial timeline: a rule draws across as you scroll, each step carries an
// oversized outlined number that fills in on hover.
export function HowItWorksSection({ steps }: { steps: Step[] }) {
  if (steps.length === 0) return null;

  return (
    <section id="comment-ca-marche" className="relative overflow-hidden bg-cream py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionTitle index="03" eyebrow="Le processus" title="Comment ça marche ?" align="left" />

        <div className="relative mt-16 sm:mt-20">
          <span data-line="scrub" className="absolute left-0 right-0 top-0 hidden h-px bg-bordeaux/25 sm:block" />
          <ol className="grid gap-12 sm:grid-cols-3 sm:gap-8">
            {steps.map((step, index) => {
              const content = (
                <div className="group relative pt-0 sm:pt-10">
                  <span className="absolute -top-[5px] left-0 hidden h-[9px] w-[9px] rounded-full bg-bordeaux sm:block" />
                  <span className="block font-serif text-[clamp(5rem,9vw,8rem)] leading-none text-stroke-bordeaux transition-colors duration-700 group-hover:text-bordeaux">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 font-serif text-3xl text-bordeaux">{step.title}</h3>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed text-bordeaux/70">{step.description}</p>
                  {index === 0 && (
                    <span className="mt-5 inline-flex items-center gap-2 label-caps text-bordeaux">
                      Voir le catalogue
                      <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                    </span>
                  )}
                </div>
              );

              return (
                <li key={step.id} data-fade-up data-delay={String(index * 0.12)}>
                  {index === 0 ? (
                    <Link href="/#catalogue" className="block cursor-pointer">
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
