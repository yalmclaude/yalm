import { CONTACT_EMAIL, CONTACT_PHONE, phoneHref } from "@/lib/contact";

// Replaces the booking form on offers marked "sur devis": the client has to call to get a price.
export function QuoteContact({ title = "Cette prestation est sur devis" }: { title?: string }) {
  return (
    <div className="space-y-4 rounded-lg border border-bordeaux/15 bg-cream-light p-7 text-center shadow-[0_12px_30px_rgba(74,16,21,0.1)]">
      <p className="label-caps text-bordeaux/60">Sur devis</p>
      <h3 className="font-serif text-2xl text-bordeaux">{title}</h3>
      <p className="text-sm leading-relaxed text-bordeaux/75">
        Chaque projet est unique : appelez-nous pour en parler ensemble. Nous établirons votre devis
        personnalisé selon vos envies, la durée et le lieu de l&apos;événement.
      </p>
      <a
        href={phoneHref(CONTACT_PHONE)}
        className="label-caps inline-flex w-full items-center justify-center gap-2 rounded-md bg-bordeaux px-4 py-3.5 text-cream transition-all hover:-translate-y-0.5 hover:bg-bordeaux-light hover:shadow-[0_10px_20px_rgba(78,13,21,0.3)]"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 3a2 2 0 0 1-.4 2.1L8 10.3a16 16 0 0 0 6 6l1.5-1.5a2 2 0 0 1 2-.4c1 .3 2 .6 3 .7a2 2 0 0 1 1.7 2Z" />
        </svg>
        Appeler le {CONTACT_PHONE}
      </a>
      <p className="text-xs text-bordeaux/55">
        Ou écrivez-nous à{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-bordeaux">
          {CONTACT_EMAIL}
        </a>
      </p>
    </div>
  );
}
