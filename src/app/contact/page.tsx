import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SOCIAL_ICONS, SiteFooter } from "@/components/Brand";
import { CONTACT_EMAIL, CONTACT_PHONE, SOCIAL_LINKS, phoneHref } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Contact — YALM Events",
  description: "Appelez-nous, écrivez-nous ou retrouvez-nous sur les réseaux pour préparer votre événement.",
};

const lineIcon = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const PhoneIcon = (
  <svg {...lineIcon}>
    <path d="M13.8 16.6a1 1 0 0 0 1.2-.3l.4-.5A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.5.4a1 1 0 0 0-.3 1.2 14 14 0 0 0 6.4 6.4" />
  </svg>
);

const MailIcon = (
  <svg {...lineIcon}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-9 5.7a2 2 0 0 1-2 0L2 7" />
  </svg>
);

// One contact channel: icon, label, value; the whole card is the link.
function ContactCard({
  href,
  icon,
  label,
  value,
  external = false,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  value: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="group flex items-center gap-5 rounded-2xl border border-bordeaux/15 bg-cream-light px-5 py-4 transition-colors hover:border-bordeaux"
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-bordeaux text-cream">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block label-caps text-bordeaux/55">{label}</span>
        <span className="mt-1 block truncate font-serif text-xl text-bordeaux sm:text-2xl">{value}</span>
      </span>
      <span className="text-bordeaux/40 transition-colors group-hover:text-bordeaux" aria-hidden>
        →
      </span>
    </a>
  );
}

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-cream text-bordeaux">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-16">
          {/* Introduction and photo */}
          <div>
            <p className="label-caps text-bordeaux/55">Contact</p>
            <h1 className="mt-4 font-serif text-[clamp(2.4rem,6vw,4rem)] leading-[1.05]">
              Parlons de
              <span className="mt-1 block font-script text-[1.25em] leading-[1]">votre événement</span>
            </h1>
            <p className="mt-6 max-w-md leading-relaxed text-bordeaux/75">
              Mariage, anniversaire, soirée d&apos;entreprise… Dites-nous votre date et vos envies : nous vous
              répondons rapidement avec une proposition sur mesure.
            </p>
            <div className="mt-10 aspect-[3/2] overflow-hidden rounded-[2rem]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/salle-reception.webp"
                alt="Salle de réception décorée, tables dressées et lustres"
                width={1200}
                height={800}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Contact channels */}
          <div className="flex min-w-0 flex-col gap-4 lg:pt-10">
            <ContactCard href={phoneHref(CONTACT_PHONE)} icon={PhoneIcon} label="Téléphone" value={CONTACT_PHONE} />
            <ContactCard href={`mailto:${CONTACT_EMAIL}`} icon={MailIcon} label="Email" value={CONTACT_EMAIL} />

            <p className="mt-6 label-caps text-bordeaux/55">Suivez-nous</p>
            {SOCIAL_LINKS.map((s) => (
              <ContactCard
                key={s.name}
                href={s.url}
                icon={SOCIAL_ICONS[s.name]}
                label={s.name}
                value="@yalm.events"
                external
              />
            ))}

            <div className="mt-6 rounded-2xl bg-bordeaux px-6 py-5 text-cream">
              <p className="font-serif text-xl">Bon à savoir</p>
              <p className="mt-1 text-sm leading-relaxed text-cream/80">
                Un acompte est requis pour bloquer votre date — les disponibilités sont limitées.
              </p>
              <a href="/formules" className="mt-3 inline-block label-caps underline-offset-4 hover:underline">
                Voir nos formules →
              </a>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
