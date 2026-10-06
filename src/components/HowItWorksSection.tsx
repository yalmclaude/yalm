import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { SectionTitle } from "@/components/Brand";

type Step = {
  id: string;
  title: string;
  description: string;
};

export function HowItWorksSection({ steps }: { steps: Step[] }) {
  if (steps.length === 0) return null;

  return (
    <section id="comment-ca-marche" className="bg-bordeaux py-20">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <SectionTitle eyebrow="Le processus" title="Comment ça marche ?" tone="light" />
        </Reveal>

        <div className="isolate mt-14 grid gap-10 sm:grid-cols-3">
          {steps.map((step, index) => {
            const card = (
              <div className="group relative rounded-lg bg-cream p-8 text-center shadow-[0_16px_34px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-out hover:z-10 hover:scale-105 hover:shadow-[0_24px_44px_rgba(0,0,0,0.45)]">
                <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-bordeaux font-serif text-2xl font-semibold text-bordeaux transition-colors group-hover:bg-bordeaux group-hover:text-cream">
                  {index + 1}
                </span>
                <h3 className="font-serif text-xl text-bordeaux">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-bordeaux/70">{step.description}</p>
              </div>
            );

            return (
              <Reveal key={step.id} delay={index * 120}>
                {index === 0 ? (
                  <Link href="/#catalogue" className="block cursor-pointer">
                    {card}
                  </Link>
                ) : (
                  card
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
