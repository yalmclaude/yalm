import { Marquee } from "@/components/motion/Marquee";

const SERVICES = [
  "Photobooth 360°",
  "Box photo",
  "Livre d'or audio",
  "Décoration",
  "Signalétique",
  "Photo & vidéo",
  "Miroir photobooth",
];

// Two crossing bands between the hero and the catalogue: a solid bordeaux one in serif
// capitals and an outlined one in script, running in opposite directions.
export function ServicesMarquee() {
  return (
    <div className="relative -my-4 overflow-hidden py-16 sm:py-20" aria-hidden>
      <div className="relative z-10 -rotate-[3deg] scale-[1.06] bg-bordeaux-band py-4 text-cream shadow-[0_20px_40px_-20px_rgba(78,13,21,0.6)] sm:py-5">
        <Marquee>
          {SERVICES.map((s) => (
            <span key={s} className="flex items-center">
              <span className="px-6 font-serif text-3xl uppercase tracking-[-0.01em] sm:px-10 sm:text-5xl">{s}</span>
              <span className="text-lg text-cream/50 sm:text-2xl">✦</span>
            </span>
          ))}
        </Marquee>
      </div>
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 rotate-[2.5deg] scale-[1.06] border-y border-bordeaux/20 bg-cream-light py-3 sm:py-4">
        <Marquee reverse>
          {SERVICES.map((s) => (
            <span key={s} className="flex items-center">
              <span className="font-script px-6 text-4xl leading-none text-bordeaux/70 sm:px-10 sm:text-5xl">{s}</span>
              <span className="text-bordeaux/30">✦</span>
            </span>
          ))}
        </Marquee>
      </div>
    </div>
  );
}
