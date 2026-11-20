import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SectionTitle, SiteFooter, SocialLinks } from "@/components/Brand";
import { CONTACT_EMAIL, CONTACT_PHONE, phoneHref } from "@/lib/contact";

export const metadata: Metadata = { title: "Contact — YALM Events" };

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-cream">
        <section className="mx-auto max-w-3xl px-5 py-16 text-bordeaux sm:px-8 sm:py-24">
          <SectionTitle eyebrow="Votre événement commence ici" title="Contact" align="left" />
          <p className="mt-8 text-bordeaux/75">
            Une date, une idée, une question ? Appelez-nous ou écrivez-nous, nous répondons rapidement.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <a href={phoneHref(CONTACT_PHONE)} className="btn btn-primary">
              Appeler le {CONTACT_PHONE}
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="btn btn-ghost">
              {CONTACT_EMAIL}
            </a>
          </div>
          <p className="mt-12 label-caps text-bordeaux/60">Suivez-nous</p>
          <SocialLinks className="mt-4" />
          <p className="mt-12 text-sm text-bordeaux/60">Acompte requis pour bloquer votre date — disponibilités limitées.</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
