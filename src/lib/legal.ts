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
  rcsOrRm: "RCS Pontoise 105 185 342 (immatriculée le 1er juin 2026)" as string | null,
  vatNumber: "FR03 105 185 342",
  publicationDirector: "Jonathan Loquemanique",
  mediator: null as { name: string; url: string } | null, // médiateur de la consommation
  email: CONTACT_EMAIL,
  phone: CONTACT_PHONE,
  host: {
    name: "Vercel Inc.",
    address: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
    url: "https://vercel.com",
    contact: "https://vercel.com/contact",
  },
};

/* Business rules quoted in the CGV (/cgv), taken from YALM Events' "Contrat de prestations de services
   événementiels". */
export const CGV_RULES = {
  depositPercent: 40, // acompte (au sens du Code civil, pas des arrhes)
  balanceDaysBefore: 7, // solde dû au plus tard N jours calendaires avant l'événement
  cautionRefundDays: 15, // délai maximal de restitution du dépôt de garantie
  includedTravelKm: 15, // déplacement inclus autour du siège
  waitingMinutes: 30, // attente imputable au client au-delà de laquelle un supplément peut être facturé
  filesKeptMonths: 6, // conservation des photos et vidéos après livraison
  // Sommes restant dues en cas d'annulation par le client, selon le délai avant l'événement.
  cancellation: [
    { when: "Plus de 90 jours avant l'événement", due: "l'acompte reste acquis" },
    { when: "Entre 90 et 31 jours", due: "70 % du montant TTC de la commande" },
    { when: "Entre 30 et 15 jours", due: "85 % du montant TTC de la commande" },
    { when: "Moins de 15 jours", due: "100 % du montant TTC de la commande" },
  ],
  updatedAt: "8 octobre 2026",
};
