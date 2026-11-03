import { Reveal } from "@/components/Reveal";
import { SectionTitle } from "@/components/Brand";

// Static photos of our equipment, served from public/galerie.
const PHOTOS: { src: string; alt: string }[] = [
  { src: "/galerie/miroir-photobooth-deco.webp", alt: "Miroir photobooth décoré d'un voile bordeaux, de bougies et de pétales" },
  { src: "/galerie/photobooth-360-invite.webp", alt: "Invité sur la plateforme du photobooth 360" },
  { src: "/galerie/colonnes-plissees.webp", alt: "Deux colonnes plissées blanches pour la décoration" },
  { src: "/galerie/miroir-photobooth-duo.webp", alt: "Deux invités prenant la pose devant le miroir photobooth" },
  { src: "/galerie/photobooth-360.webp", alt: "Photobooth 360 avec son bras lumineux" },
  { src: "/galerie/miroir-et-livre-dor-audio.webp", alt: "Miroir photobooth et téléphone livre d'or audio sur un drapé blanc" },
  { src: "/galerie/photobooth-360-plateau.webp", alt: "Plateau du photobooth 360 vu de près" },
  { src: "/galerie/miroir-photobooth-invites.webp", alt: "Invités devant le miroir photobooth" },
];

export function GallerySection() {
  return (
    <section id="galerie" className="mx-auto max-w-6xl px-6 py-16">
      <Reveal>
        <SectionTitle eyebrow="Nos installations" title="En images" />
      </Reveal>
      <div className="mt-10 columns-2 gap-4 lg:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
        {PHOTOS.map((photo, index) => (
          <Reveal key={photo.src} delay={(index % 3) * 120}>
            <div className="overflow-hidden rounded-lg shadow-[0_12px_28px_rgba(0,0,0,0.18)]">
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                className="w-full transition-transform duration-500 ease-out hover:scale-105"
              />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
