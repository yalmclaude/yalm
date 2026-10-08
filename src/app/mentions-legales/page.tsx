import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SectionTitle, SiteFooter } from "@/components/Brand";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Mentions légales — YALM Events",
};

const fill = (value: string | null) => value ?? <span className="rounded bg-amber-100 px-1 text-amber-900">à compléter</span>;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-serif text-2xl text-bordeaux">{title}</h2>
      <div className="mt-3 space-y-2 text-sm leading-relaxed text-bordeaux/80">{children}</div>
    </section>
  );
}

export default function MentionsLegalesPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <SectionTitle eyebrow="Informations" title="Mentions légales" />

          <Section title="Éditeur du site">
            <p>
              Le site {LEGAL.siteUrl.replace("https://", "")} est édité par <strong>{LEGAL.companyName}</strong>,{" "}
              {LEGAL.legalForm}{" "}au capital de {fill(LEGAL.capital)}, représentée par {fill(LEGAL.owner)}.
            </p>
            <p>Siège social : {LEGAL.address}</p>
            <p>SIREN : {LEGAL.siren} — SIRET : {LEGAL.siret}</p>
            {LEGAL.rcsOrRm && <p>Immatriculation : {LEGAL.rcsOrRm}</p>}
            <p>N° de TVA intracommunautaire : {LEGAL.vatNumber}</p>
            <p>
              Contact : <a href={`mailto:${LEGAL.email}`} className="underline">{LEGAL.email}</a> · {LEGAL.phone}
            </p>
            <p>Directeur de la publication : {fill(LEGAL.publicationDirector)}</p>
          </Section>

          <Section title="Hébergement">
            <p>
              Le site est hébergé par {LEGAL.host.name}, {LEGAL.host.address} —{" "}
              <a href={LEGAL.host.url} className="underline" target="_blank" rel="noreferrer">
                {LEGAL.host.url.replace("https://", "")}
              </a>
              .
            </p>
            <p>
              Téléphone de l&apos;hébergeur : {LEGAL.host.phone}{" "}— email :{" "}
              <a href={`mailto:${LEGAL.host.email}`} className="underline">
                {LEGAL.host.email}
              </a>
              .
            </p>
            <p>
              Les données (réservations, coffrets) sont stockées par Neon (base de données) et Vercel Blob (photos, vidéos
              et fichiers audio des coffrets).
            </p>
          </Section>

          <Section title="Propriété intellectuelle">
            <p>
              L&apos;ensemble des éléments du site (textes, logo, visuels, mise en page) est la propriété de {LEGAL.companyName}{" "}
              ou de ses partenaires. Toute reproduction, totale ou partielle, sans autorisation écrite préalable est
              interdite.
            </p>
            <p>
              Les photos, vidéos et messages déposés dans les coffrets souvenirs restent la propriété des mariés et de leurs
              auteurs ; ils ne sont accessibles qu&apos;avec l&apos;identifiant et le code remis aux mariés.
            </p>
          </Section>

          <Section title="Données personnelles">
            <p>
              Lors d&apos;une réservation, nous collectons votre nom, votre adresse email, votre numéro de téléphone, la date
              de votre événement et, le cas échéant, le texte de personnalisation que vous nous transmettez. Ces données
              servent uniquement à traiter votre commande, à vous contacter pour préparer votre événement et à respecter nos
              obligations comptables. Elles ne sont ni vendues ni cédées.
            </p>
            <p>
              Le paiement est réalisé par Stripe : vos données bancaires ne transitent pas par nos serveurs et ne nous sont
              jamais communiquées. Les emails de confirmation sont envoyés via Brevo.
            </p>
            <p>
              Certains de ces prestataires (Vercel, Neon, Stripe) hébergent ou traitent des données aux États-Unis. Ces
              transferts hors de l&apos;Union européenne sont encadrés par les garanties prévues par le RGPD : cadre de
              protection des données UE–États-Unis (Data Privacy Framework) ou clauses contractuelles types de la Commission
              européenne.
            </p>
            <p>
              Les données de commande sont conservées le temps nécessaire à la relation commerciale, puis archivées pendant
              la durée légale de conservation des pièces comptables (10 ans). Les contenus des coffrets souvenirs sont
              conservés tant que les mariés y ont accès et supprimés à leur demande.
            </p>
            <p>
              Conformément au Règlement général sur la protection des données (RGPD) et à la loi « Informatique et
              Libertés », vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de limitation,
              d&apos;opposition et de portabilité de vos données. Pour l&apos;exercer, écrivez-nous à{" "}
              <a href={`mailto:${LEGAL.email}`} className="underline">{LEGAL.email}</a>. Vous pouvez également introduire une
              réclamation auprès de la CNIL (
              <a href="https://www.cnil.fr" className="underline" target="_blank" rel="noreferrer">
                cnil.fr
              </a>
              ).
            </p>
          </Section>

          <Section title="Cookies">
            <p>
              Le site n&apos;utilise aucun cookie publicitaire ni de mesure d&apos;audience. Seul un cookie strictement
              nécessaire est déposé pour maintenir la connexion à l&apos;espace d&apos;administration ; il ne requiert pas
              votre consentement.
            </p>
          </Section>

          <Section title="Médiation de la consommation">
            <p>
              Conformément aux articles L.611-1 et suivants du Code de la consommation, en cas de litige non résolu avec
              nous, vous pouvez recourir gratuitement au médiateur de la consommation :{" "}
              {LEGAL.mediator ? (
                <a href={LEGAL.mediator.url} className="underline" target="_blank" rel="noreferrer">
                  {LEGAL.mediator.name}
                </a>
              ) : (
                "en cours de désignation, ses coordonnées seront indiquées ici dès que possible"
              )}
              .
            </p>
          </Section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
