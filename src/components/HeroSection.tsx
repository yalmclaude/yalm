import { Ornament, ServiceIcons } from "@/components/Brand";

// Mirrors the brand banner: a bordeaux panel on cream with a brush-script headline,
// the service icons and a cream card holding the calls to action, all full width.
export function HeroSection() {
  return (
    <section className="bg-cream px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-6xl rounded-xl bg-bordeaux px-5 py-12 sm:px-10 lg:px-16 lg:py-16">
        <h1 className="font-script text-center text-5xl leading-tight text-cream sm:text-6xl lg:text-7xl">
          Créons ensemble vos moments inoubliables
        </h1>
        <Ornament tone="light" className="mt-4" />
        <div className="mt-10">
          <ServiceIcons />
        </div>

        <div className="mt-12 flex flex-col items-center gap-5 rounded-lg bg-cream px-6 py-6 shadow-[0_16px_34px_rgba(0,0,0,0.35)] sm:flex-row sm:justify-between sm:px-10">
          <p className="font-script text-center text-4xl leading-none text-bordeaux sm:text-left sm:text-5xl">
            Rejoignez-nous dès maintenant
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="#formules"
              className="label-caps w-44 rounded-md bg-bordeaux px-4 py-3 text-center text-cream transition-all hover:-translate-y-0.5 hover:bg-bordeaux-light"
            >
              Nos formules
            </a>
            <a
              href="#catalogue"
              className="label-caps w-44 rounded-md border border-bordeaux px-4 py-3 text-center text-bordeaux transition-all hover:-translate-y-0.5 hover:bg-bordeaux/5"
            >
              Nos prestations
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
