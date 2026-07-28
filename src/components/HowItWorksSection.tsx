import Link from "next/link";
import { Reveal } from "@/components/Reveal";

type Step = {
  id: string;
  title: string;
  description: string;
};

export function HowItWorksSection({ steps }: { steps: Step[] }) {
  if (steps.length === 0) return null;

  return (
    <section id="comment-ca-marche" className="bg-beige-dark py-20">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-bordeaux/70">
            Le processus
          </p>
          <h2 className="mt-2 text-center font-serif text-3xl text-bordeaux">Comment ça marche ?</h2>
        </Reveal>

        <div className="isolate mt-14 grid gap-10 sm:grid-cols-3">
          {steps.map((step, index) => {
            const card = (
              <div
                className="group relative rounded-2xl border border-bordeaux/12 bg-background p-8 text-center shadow-[0_8px_20px_rgba(74,16,21,0.07)] transition-transform duration-300 ease-out hover:z-10 hover:scale-110 hover:shadow-[0_20px_40px_rgba(74,16,21,0.18)]"
              >
                <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold font-serif text-2xl font-semibold text-bordeaux transition-colors group-hover:bg-gold group-hover:text-bordeaux-dark">
                  {index + 1}
                </span>
                <h3 className="font-serif text-lg text-bordeaux">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-bordeaux/65">{step.description}</p>
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
