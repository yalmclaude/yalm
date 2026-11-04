import { SplitWords } from "@/components/motion/SplitWords";

// Editorial hero: an oversized four-line serif headline next to an
// arch-framed photo — the arch echoes the floral arches of our decorations. A smaller
// floating photo and a spinning badge add depth; layers follow the mouse and drift on
// scroll. The intro (word reveal, arch unveiling) is played by the motion system.
export function HeroSection() {
  return (
    <section data-hero className="relative overflow-hidden bg-cream">
      {/* Soft bordeaux halo behind the composition */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-10 h-[38rem] w-[38rem] rounded-full bg-bordeaux/[0.07] blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-8 sm:px-8 lg:pb-28 lg:pt-12">
        <div data-fade-up className="flex items-center justify-between gap-6 label-caps text-bordeaux/60">
          <span>YALM Events</span>
          <span className="hidden sm:inline">Photobooth · Vidéo · Décoration · Signalétique</span>
          <span>Mariages & réceptions</span>
        </div>

        <div className="relative mt-8 grid items-end gap-10 lg:mt-10 lg:grid-cols-12 lg:gap-6">
          <h1 className="relative z-10 font-serif uppercase leading-[0.84] tracking-[-0.035em] text-bordeaux text-[clamp(3.3rem,12.5vw,11.5rem)] lg:col-span-8 lg:text-[clamp(4rem,8vw,7.2rem)]">
            <span data-split className="block">
              <SplitWords text="Créons" />
            </span>
            <span data-split className="block pl-[12%]">
              <SplitWords text="ensemble" />
            </span>
            <span data-split className="block">
              <SplitWords text="vos moments" />
            </span>
            <span data-split className="block">
              <SplitWords text="inoubliables" />
            </span>
          </h1>

          {/* Arch-framed photo with its floating companions */}
          <div className="relative mx-auto w-[78%] max-w-sm lg:col-span-4 lg:mx-0 lg:w-full lg:max-w-none lg:-mb-6">
            <div data-depth="0.6">
              <div data-parallax="0.12" data-parallax-start="top">
                <div
                  data-hero-img
                  className="aspect-[3/4] overflow-hidden rounded-t-full shadow-[0_40px_80px_-30px_rgba(78,13,21,0.55)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/hero-salle.webp"
                    srcSet="/hero-salle-900.webp 1000w, /hero-salle.webp 1672w"
                    sizes="(min-width: 1024px) 33vw, 80vw"
                    alt="Salle de réception décorée en bordeaux et blanc, arche fleurie et lustre"
                    width={1672}
                    height={941}
                    fetchPriority="high"
                    className="h-full w-full object-cover object-[50%_45%]"
                  />
                </div>
              </div>
            </div>

            {/* Floating photo, further back in depth */}
            <div data-depth="-1.4" className="absolute -left-[12%] top-[12%] w-[36%] sm:-left-[30%]">
              <div data-parallax="0.35" data-parallax-start="top">
                <div
                  data-hero-img
                  className="aspect-[3/4] overflow-hidden rounded-t-full border-4 border-cream shadow-[0_30px_60px_-25px_rgba(78,13,21,0.6)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/galerie/miroir-photobooth-deco.webp"
                    alt="Miroir photobooth décoré d'un voile bordeaux"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Spinning badge linking to the catalogue */}
            <a
              href="#catalogue"
              data-fade-up
              data-magnetic="0.35"
              aria-label="Découvrir nos prestations"
              className="group absolute -bottom-8 -right-4 grid h-28 w-28 place-items-center rounded-full bg-bordeaux text-cream shadow-[0_20px_40px_-15px_rgba(78,13,21,0.7)] sm:h-32 sm:w-32 lg:-right-8"
            >
              <svg data-spin viewBox="0 0 100 100" className="spin-slow absolute inset-0 h-full w-full" aria-hidden>
                <defs>
                  <path id="badge-circle" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
                </defs>
                <text
                  fill="currentColor"
                  className="text-[8.4px] uppercase tracking-[0.32em]"
                  style={{ fontFamily: "var(--font-montserrat)" }}
                >
                  <textPath href="#badge-circle">Your amazing life moments ✦ </textPath>
                </text>
              </svg>
              <span className="text-2xl transition-transform duration-500 group-hover:rotate-45" aria-hidden>
                ↓
              </span>
            </a>
          </div>
        </div>

        <div className="relative z-10 mt-16 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between lg:mt-20">
          <p data-fade-up className="max-w-md text-[0.95rem] leading-relaxed text-bordeaux/75">
            Photobooth, vidéo, décoration et signalétique sur mesure : nous imaginons chaque détail pour que
            votre jour reste gravé.
          </p>
          <div data-fade-up className="flex flex-wrap gap-3">
            <a href="#formules" data-magnetic className="btn btn-primary">
              Nos formules
              <span className="btn-arrow" aria-hidden>
                →
              </span>
            </a>
            <a href="#catalogue" data-magnetic className="btn btn-ghost">
              Nos prestations
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
