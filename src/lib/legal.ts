import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/contact";

/* Everything the "Mentions légales" page (LCEN art. 6, Code de la consommation) displays.
   Values left as null are shown as "à compléter" and must be filled in before publishing. */
export const LEGAL = {
  siteUrl: "https://www.yalm-events.com",
  companyName: "YALM Events",
  legalForm: "société par actions simplifiée (SAS)",
  capital: "1 000 €",
  owner: "Jonathan Loquemanique, directeur général",
  address: "10 passage d'Adrienne, 95000 Cergy",
  siren: "105 185 342",
  siret: "105 185 342 00018",
  rcsOrRm: "RCS Pontoise 105 185 342",
  vatNumber: "FR03 105 185 342",
  publicationDirector: "Jonathan Loquemanique",
  mediator: null as { name: string; url: string } | null, // médiateur de la consommation
  email: CONTACT_EMAIL,
  phone: CONTACT_PHONE,
  host: {
    name: "Vercel Inc.",
    address: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
    url: "https://vercel.com",
  },
};
