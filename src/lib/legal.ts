import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/contact";

/* Everything the "Mentions légales" page (LCEN art. 6, Code de la consommation) displays.
   Values left as null are shown as "à compléter" and must be filled in before publishing. */
export const LEGAL = {
  siteUrl: "https://www.yalm-events.com",
  companyName: "YALM Events",
  legalForm: null as string | null, // ex. "Micro-entreprise" ou "SAS au capital de 1 000 €"
  owner: null as string | null, // nom et prénom de l'entrepreneur, ou du dirigeant
  address: null as string | null, // adresse du siège (ou de domiciliation)
  siret: null as string | null,
  rcsOrRm: null as string | null, // ex. "RCS Paris 123 456 789", ou null si micro-entrepreneur non inscrit
  vatNumber: null as string | null, // ou "TVA non applicable, art. 293 B du CGI"
  publicationDirector: null as string | null,
  mediator: null as { name: string; url: string } | null, // médiateur de la consommation
  email: CONTACT_EMAIL,
  phone: CONTACT_PHONE,
  host: {
    name: "Vercel Inc.",
    address: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
    url: "https://vercel.com",
  },
};
