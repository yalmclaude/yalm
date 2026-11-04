import type { ReactNode } from "react";
import { CONTACT_EMAIL, CONTACT_PHONE, SOCIAL_LINKS, phoneHref } from "@/lib/contact";
import { Marquee } from "@/components/motion/Marquee";
import { SplitWords } from "@/components/motion/SplitWords";

/* Shared pieces of the brand banner look: the "line ✷ line" divider, the white line icons,
   section titles with a brush-script headline, and the footer. */

export function Ornament({ tone = "dark", className = "" }: { tone?: "dark" | "light"; className?: string }) {
  const color = tone === "light" ? "text-cream" : "text-bordeaux";
  return (
    <div className={`flex items-center justify-center gap-3 ${color} ${className}`} aria-hidden>
      <span className="h-px w-full max-w-[11rem] bg-gradient-to-l from-current to-transparent opacity-80" />
      <svg width="16" height="16" className="shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0l1.6 8.4L22 6l-6.4 6L22 18l-8.4-2.4L12 24l-1.6-8.4L2 18l6.4-6L2 6l8.4 2.4z" />
      </svg>
      <span className="h-px w-full max-w-[11rem] bg-gradient-to-r from-current to-transparent opacity-80" />
    </div>
  );
}

// Section heading. Centered (with the ✷ ornament) by default; the homepage uses the
// editorial variant: a numbered rule that draws in, then an oversized script title.
export function SectionTitle({
  eyebrow,
  title,
  tone = "dark",
  index,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  tone?: "dark" | "light";
  index?: string;
  align?: "center" | "left";
}) {
  const text = tone === "light" ? "text-cream" : "text-bordeaux";
  const muted = tone === "light" ? "text-cream/60" : "text-bordeaux/55";

  if (align === "left") {
    return (
      <div className={text}>
        <div className={`flex items-center gap-4 label-caps ${muted}`}>
          {index && <span>({index})</span>}
          <span data-line className="h-px flex-1 bg-current opacity-40" />
          <span>{eyebrow}</span>
        </div>
        <h2
          data-split
          className="font-script mt-4 text-[clamp(4.2rem,11vw,10rem)] leading-[0.95] -tracking-[0.01em]"
        >
          <SplitWords text={title} />
        </h2>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className={`label-caps ${muted}`}>{eyebrow}</p>
      <h2 data-split className={`font-script mt-1 text-6xl leading-tight sm:text-7xl ${text}`}>
        <SplitWords text={title} />
      </h2>
      <Ornament tone={tone} className="mt-3" />
    </div>
  );
}

const iconProps = {
  width: 52,
  height: 52,
  viewBox: "0 0 48 48",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const SERVICES: { label: string; icon: ReactNode }[] = [
  {
    label: "Vidéo",
    icon: (
      <svg {...iconProps}>
        <circle cx="15" cy="13" r="6" />
        <circle cx="28" cy="12" r="7" />
        <rect x="6" y="20" width="27" height="17" rx="2" />
        <rect x="10" y="24" width="10" height="5" rx="1" />
        <path d="M33 25l9-5v17l-9-5" />
      </svg>
    ),
  },
  {
    label: "Photobooth, box photo…",
    icon: (
      <svg {...iconProps}>
        <rect x="17" y="4" width="14" height="16" rx="2" />
        <circle cx="24" cy="10" r="3" />
        <path d="M20 16h8M24 20v6M24 26l-9 18M24 26l9 18M24 26v18" />
      </svg>
    ),
  },
  {
    label: "Décoration personnalisée",
    icon: (
      <svg {...iconProps}>
        <path d="M9 44V22a15 15 0 0 1 30 0v22" />
        <path d="M9 22c4 4 6 12 4 22M39 22c-4 4-6 12-4 22" />
        <path d="M12 44h-6M42 44h-6" />
        <circle cx="13" cy="13" r="2" />
        <circle cx="16" cy="10" r="1.5" />
      </svg>
    ),
  },
  {
    label: "Personnalisation sur mesure",
    icon: (
      <svg {...iconProps}>
        <path d="M33 6l9 9L18 39l-11 3 3-11z" />
        <path d="M28 11l9 9M10 31l7 7" />
      </svg>
    ),
  },
  {
    label: "Photographie",
    icon: (
      <svg {...iconProps}>
        <path d="M6 16a3 3 0 0 1 3-3h7l3-4h10l3 4h7a3 3 0 0 1 3 3v20a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z" />
        <circle cx="24" cy="26" r="8" />
        <circle cx="24" cy="26" r="4" />
        <path d="M36 18h2" />
      </svg>
    ),
  },
];

export function ServiceIcons() {
  return (
    <ul className="grid grid-cols-2 gap-y-7 text-cream sm:flex sm:items-start sm:justify-center">
      {SERVICES.map((s, i) => (
        <li
          key={s.label}
          className={`flex flex-col items-center gap-3 px-2 text-center sm:min-w-0 sm:flex-1 ${
            i > 0 ? "sm:border-l sm:border-cream/70" : ""
          } ${i === SERVICES.length - 1 ? "col-span-2" : ""}`}
        >
          {s.icon}
          <span className="label-caps max-w-[9rem] leading-snug !text-[0.62rem] !tracking-[0.06em] lg:!text-[0.72rem] lg:!tracking-[0.12em]">{s.label}</span>
        </li>
      ))}
    </ul>
  );
}

// Simple line/brand marks for the social links, drawn in currentColor.
const SOCIAL_ICONS: Record<string, ReactNode> = {
  Instagram: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  TikTok: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.6 3c.4 2.2 1.8 3.7 4 3.9v3.2c-1.5 0-2.8-.4-4-1.2v6.3c0 3.4-2.7 5.8-5.9 5.8S5 18.6 5 15.3c0-3.4 2.9-6 6.4-5.6v3.3c-1.6-.4-3.1.8-3.1 2.3 0 1.3 1.1 2.4 2.4 2.4 1.4 0 2.6-1 2.6-2.8V3h3.3z" />
    </svg>
  ),
  Snapchat: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden>
      <path d="M12 3c3 0 5 2.2 5 5.1v2.4l1.6-.5c.6-.2 1 .5.5.9l-1.8 1.2c.4 1.6 1.7 2.9 3.2 3.4-.3.6-1.2.9-2.3 1-.2.4-.2 1-.5 1.2-.8 0-1.6-.3-2.6.1-.9.4-1.6 1.2-3.1 1.2s-2.2-.8-3.1-1.2c-1-.4-1.8-.1-2.6-.1-.3-.2-.3-.8-.5-1.2-1.1-.1-2-.4-2.3-1 1.5-.5 2.8-1.8 3.2-3.4l-1.8-1.2c-.5-.4-.1-1.1.5-.9l1.6.5V8.1C7 5.2 9 3 12 3z" />
    </svg>
  ),
};

// Footer: an oversized call to action, a scrolling band and the contact details.
// Arched top edge echoes the floral arch.
export function SiteFooter() {
  return (
    <footer className="relative mt-10 overflow-hidden rounded-t-[2.5rem] bg-bordeaux-rich-alt text-cream sm:rounded-t-[5rem]">
      <div className="mx-auto max-w-7xl px-5 pt-16 sm:px-8 sm:pt-24">
        <p data-fade-up className="label-caps text-cream/55">
          Votre événement commence ici
        </p>
        <h2 className="mt-4 font-serif uppercase leading-[0.86] tracking-[-0.03em] text-[clamp(2.9rem,9vw,8.5rem)]">
          <span data-split className="block">
            <SplitWords text="Parlons de" />
          </span>
          <span data-split className="block font-script normal-case tracking-normal text-[1.05em] leading-[0.8] sm:ml-[12%]">
            <SplitWords text="votre événement" />
          </span>
        </h2>

        <div data-fade-up className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <a href={phoneHref(CONTACT_PHONE)} data-magnetic className="btn btn-cream">
            Appeler le {CONTACT_PHONE}
            <span className="btn-arrow" aria-hidden>
              →
            </span>
          </a>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="nav-link w-fit label-caps text-cream/85 hover:text-cream sm:ml-4"
          >
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>

      <div className="mt-16 border-y border-cream/15 py-5 sm:mt-24">
        <Marquee>
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="flex items-center">
              <span className="font-script px-8 text-5xl leading-none sm:text-6xl">Your amazing life moments</span>
              <span className="text-xl text-cream/50">✦</span>
            </span>
          ))}
        </Marquee>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 pb-12 sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div className="flex items-center gap-4">
          {SOCIAL_LINKS.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              aria-label={`${s.name} — yalm.events`}
              title={`${s.name} — yalm.events`}
              data-magnetic="0.4"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-cream/35 transition-colors duration-500 hover:border-cream hover:bg-cream hover:text-bordeaux"
            >
              {SOCIAL_ICONS[s.name]}
            </a>
          ))}
        </div>
        <div className="text-xs text-cream/55 sm:text-right">
          <p>
            © {new Date().getFullYear()} YALM Events — Tous droits réservés ·{" "}
            <a href="/mentions-legales" className="underline underline-offset-2 hover:text-cream">
              Mentions légales
            </a>{" "}
            ·{" "}
            <a href="/cgv" className="underline underline-offset-2 hover:text-cream">
              CGV
            </a>
          </p>
          <p className="mt-2">Site réalisé par Dololka Agency</p>
        </div>
      </div>

    </footer>
  );
}
