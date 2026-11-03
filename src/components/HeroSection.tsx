// An edge-to-edge photo of a decorated reception hall, with the cream card holding the
// calls to action below it. The frame is taller on phones (4:3) and panoramic on wider
// screens (21:9), always cropped around the floral arch.
export function HeroSection() {
  return (
    <section className="bg-cream pb-10 sm:pb-14">
      <h1 className="sr-only">YALM Events — Créons ensemble vos moments inoubliables</h1>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero-salle.webp"
        srcSet="/hero-salle-900.webp 900w, /hero-salle.webp 1672w"
        sizes="100vw"
        alt="Salle de réception décorée en bordeaux et blanc, arche fleurie et lustre"
        width={1672}
        height={941}
        fetchPriority="high"
        className="block aspect-[4/3] w-full object-cover object-[50%_45%] sm:aspect-[16/9] lg:aspect-[21/9] lg:object-[50%_15%]"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="mt-6 flex flex-col items-center gap-5 rounded-lg bg-cream px-6 py-6 shadow-[0_16px_34px_rgba(0,0,0,0.35)] sm:mt-8 sm:flex-row sm:justify-between sm:px-10">
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
