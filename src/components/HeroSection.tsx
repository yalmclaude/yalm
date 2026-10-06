import { Ornament, ServiceIcons } from "@/components/Brand";

// Mirrors the brand banner: a bordeaux panel on cream, the logo on a raised cream card,
// a brush-script headline, the service icons, and a cream card holding the calls to action.
export function HeroSection() {
  return (
    <section className="bg-cream px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-6xl rounded-xl bg-bordeaux px-5 py-10 sm:px-10 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)] lg:items-center lg:gap-10 lg:py-14 lg:pl-0">
        <div className="mx-auto max-w-sm rounded-lg bg-cream px-8 py-12 text-center shadow-[0_24px_50px_rgba(0,0,0,0.45)] lg:-ml-8 lg:max-w-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-tight.png" alt="YALM Events" className="mx-auto w-full max-w-[16rem]" />
          <p className="mt-8 text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-bordeaux sm:text-[0.7rem] sm:tracking-[0.55em]">
            Your amazing life moments
          </p>
        </div>

        <div className="mt-10 lg:mt-0">
          <h1 className="font-script text-center text-5xl leading-tight text-cream sm:text-6xl lg:text-[3.2rem] xl:whitespace-nowrap xl:text-[3.6rem]">
            Créons ensemble vos moments inoubliables
          </h1>
          <Ornament tone="light" className="mt-3" />
          <div className="mt-8">
            <ServiceIcons />
          </div>

          <div className="mt-9 flex flex-col items-center gap-5 rounded-lg bg-cream px-6 py-5 shadow-[0_16px_34px_rgba(0,0,0,0.35)] sm:flex-row sm:justify-between">
            <p className="font-script text-center text-4xl leading-none text-bordeaux sm:whitespace-nowrap sm:text-left">Rejoignez-nous dès maintenant</p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="#catalogue"
                className="label-caps w-44 rounded-md bg-bordeaux px-4 py-3 text-center text-cream transition-all hover:-translate-y-0.5 hover:bg-bordeaux-light"
              >
                Nos prestations
              </a>
              <a
                href="#formules"
                className="label-caps w-44 rounded-md border border-bordeaux px-4 py-3 text-center text-bordeaux transition-all hover:-translate-y-0.5 hover:bg-bordeaux/5"
              >
                Nos formules
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
