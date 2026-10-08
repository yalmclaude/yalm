import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SectionTitle, SiteFooter } from "@/components/Brand";
import { CGV_RULES, LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Conditions générales de vente — YALM Events",
};

function Article({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="mt-9">
      <h2 className="font-serif text-2xl text-bordeaux">
        Article {n} — {title}
      </h2>
      <div className="mt-3 space-y-2 text-sm leading-relaxed text-bordeaux/80">{children}</div>
    </section>
  );
}

export default function CgvPage() {
  const r = CGV_RULES;
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <SectionTitle eyebrow="Informations" title="Conditions générales de vente" />
          <p className="mt-6 text-center text-xs text-bordeaux/55">Version en vigueur au {r.updatedAt}</p>

          <Article n={1} title="Objet">
            <p>
              Les présentes conditions générales de vente (CGV) s&apos;appliquent à toutes les commandes passées auprès de{" "}
              {LEGAL.companyName}, {LEGAL.legalForm}{" "}au capital de {LEGAL.capital}, dont le siège est situé {LEGAL.address},
              immatriculée {LEGAL.rcsOrRm} (SIRET {LEGAL.siret}), sur le site {LEGAL.siteUrl.replace("https://", "")}, par
              devis ou par tout autre moyen : location et vente de matériel événementiel, décoration, prestations
              photo et vidéo, objets personnalisés et coffrets souvenirs.
            </p>
            <p>
              Toute commande implique l&apos;acceptation sans réserve des présentes CGV, que le client reconnaît avoir lues
              avant de payer en cochant la case prévue à cet effet.
            </p>
          </Article>

          <Article n={2} title="Prestations, produits et devis">
            <p>
              Les prestations et produits sont décrits sur le site. Certaines offres sont proposées « sur devis » : leur prix
              est établi après échange avec le client. Un devis indique le détail des prestations, leur prix, l&apos;acompte
              demandé, la caution éventuelle et sa durée de validité ; il est accepté en ligne par le paiement demandé.
            </p>
            <p>
              Les photos et visuels du site sont fournis à titre indicatif ; de légères différences de couleur ou
              d&apos;aspect peuvent exister.
            </p>
          </Article>

          <Article n={3} title="Prix">
            <p>
              Les prix sont indiqués en euros, toutes taxes comprises (TTC), TVA de 20 % incluse. Le prix applicable est
              celui affiché au moment de la commande ou figurant sur le devis accepté. Les éventuels frais de livraison,
              d&apos;installation ou de déplacement sont précisés avant la commande.
            </p>
          </Article>

          <Article n={4} title="Commande et réservation de la date">
            <p>
              La réservation n&apos;est définitive qu&apos;après réception du paiement demandé (acompte ou totalité). La
              date est alors bloquée pour le client et une confirmation lui est envoyée par email. Tant que ce paiement
              n&apos;est pas reçu, la date reste disponible pour d&apos;autres clients.
            </p>
          </Article>

          <Article n={5} title="Paiement">
            <p>
              Le paiement s&apos;effectue en ligne par carte bancaire, via la plateforme sécurisée Stripe. {LEGAL.companyName}{" "}
              n&apos;a jamais accès aux données bancaires du client.
            </p>
            <p>
              Au moment de la commande, le client choisit de régler un acompte (dont le montant est indiqué pour chaque
              offre) ou la totalité du prix. Le solde est à régler au plus tard {r.balanceDaysBefore}{" "}jours avant la date de
              l&apos;événement, au moyen du lien de paiement envoyé par email. Certaines offres doivent être réglées en
              totalité à la commande ; c&apos;est alors indiqué avant le paiement.
            </p>
            <p>
              À défaut de paiement du solde dans ce délai, et après une relance restée sans effet, {LEGAL.companyName}{" "}peut
              considérer la commande comme annulée par le client, dans les conditions de l&apos;article 8.
            </p>
          </Article>

          <Article n={6} title="Caution">
            <p>
              Certaines locations donnent lieu au versement d&apos;une caution, dont le montant est indiqué avant la
              commande. Le client peut la régler avec sa réservation ou plus tard, au plus tard le jour de l&apos;événement,
              avant la mise à disposition du matériel.
            </p>
            <p>
              La caution est restituée dans un délai de {r.cautionRefundDays}{" "}jours après le retour du matériel complet et
              en bon état. En cas de casse, de perte, de vol ou de dégradation, {LEGAL.companyName}{" "}peut retenir sur la
              caution le coût de la réparation ou du remplacement, sur justificatif ; si ce coût dépasse le montant de la
              caution, la différence reste due par le client.
            </p>
          </Article>

          <Article n={7} title="Produits personnalisés">
            <p>
              Pour les produits personnalisés (miroir, plexiglas, objets à vos prénoms…), le client fournit le texte à
              afficher lors de la commande ou ultérieurement. Il est responsable de son contenu, qui ne doit porter atteinte
              ni aux droits des tiers ni à l&apos;ordre public. Une fois le texte validé et la fabrication lancée, il ne peut
              plus être modifié.
            </p>
          </Article>

          <Article n={8} title="Annulation ou report par le client">
            <p>Toute annulation doit être adressée par écrit, à {LEGAL.email}.</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Plus de {r.freeCancellationDays}{" "}jours avant l&apos;événement : l&apos;acompte reste acquis à{" "}
                {LEGAL.companyName}{" "}; les sommes versées au-delà de l&apos;acompte sont remboursées.
              </li>
              <li>
                {r.freeCancellationDays}{" "}jours ou moins avant l&apos;événement : le prix total de la commande reste dû et
                aucun remboursement n&apos;est effectué.
              </li>
              <li>Les produits personnalisés dont la fabrication a commencé ne sont pas remboursables.</li>
              <li>La caution versée est intégralement restituée en cas d&apos;annulation.</li>
            </ul>
            <p>
              Un report de date peut être accordé, sous réserve de disponibilité, si la demande est faite plus de{" "}
              {r.freeCancellationDays}{" "}jours avant l&apos;événement ; les sommes déjà versées sont alors reportées sur la
              nouvelle date.
            </p>
          </Article>

          <Article n={9} title="Annulation par YALM Events">
            <p>
              Si {LEGAL.companyName}{" "}devait annuler une prestation, hors cas de force majeure, le client serait remboursé de
              l&apos;intégralité des sommes versées, caution comprise, sans autre indemnité. Une solution de remplacement lui
              sera proposée dans la mesure du possible.
            </p>
          </Article>

          <Article n={10} title="Droit de rétractation">
            <p>
              Conformément à l&apos;article L221-28 du Code de la consommation, le droit de rétractation ne peut pas être
              exercé pour les biens confectionnés selon les spécifications du client ou nettement personnalisés, ni pour les
              prestations d&apos;activités de loisirs devant être fournies à une date déterminée, ce qui est le cas des
              réservations pour un événement daté.
            </p>
            <p>
              Pour les autres achats à distance (par exemple un produit non personnalisé acheté pour être conservé), le
              client dispose d&apos;un délai de 14 jours à compter de la réception du bien pour se rétracter, en
              l&apos;indiquant par écrit à {LEGAL.email}. Le remboursement intervient dans les 14 jours suivant la réception
              de sa demande, après retour du bien, les frais de retour restant à sa charge.
            </p>
          </Article>

          <Article n={11} title="Livraison, installation et utilisation du matériel">
            <p>
              Le matériel est livré, installé et récupéré aux horaires convenus avec le client. Celui-ci s&apos;engage à
              garantir l&apos;accès au lieu, un emplacement adapté et, si nécessaire, une alimentation électrique.
            </p>
            <p>
              Pendant toute la durée de la location, le matériel est placé sous la garde et la responsabilité du client. Il
              doit être utilisé conformément à sa destination et aux consignes données, et ne peut être ni déplacé ni confié
              à un tiers sans accord.
            </p>
          </Article>

          <Article n={12} title="Coffret souvenir">
            <p>
              Les photos, vidéos et messages du coffret souvenir sont accessibles aux mariés avec l&apos;identifiant et le
              code qui leur sont remis. Ils sont responsables de leur diffusion. Il leur appartient de télécharger leurs
              fichiers ; ceux-ci sont supprimés sur simple demande.
            </p>
          </Article>

          <Article n={13} title="Responsabilité et force majeure">
            <p>
              {LEGAL.companyName}{" "}est tenue d&apos;une obligation de moyens. Sa responsabilité ne saurait être engagée en cas
              de mauvaise utilisation du matériel par le client ou ses invités, ni en cas de force majeure au sens de
              l&apos;article 1218 du Code civil (intempéries exceptionnelles, décision administrative, etc.). En cas de force
              majeure, les parties recherchent ensemble une nouvelle date ; à défaut, les sommes versées sont remboursées,
              déduction faite des frais engagés et justifiés.
            </p>
          </Article>

          <Article n={14} title="Données personnelles">
            <p>
              Les données collectées lors d&apos;une commande sont traitées conformément à notre politique décrite dans les{" "}
              <a href="/mentions-legales" className="underline">
                mentions légales
              </a>
              .
            </p>
          </Article>

          <Article n={15} title="Réclamations, médiation et droit applicable">
            <p>
              Toute réclamation peut être adressée à {LEGAL.email}{" "}ou au {LEGAL.phone}. En cas de litige non résolu, le client
              peut recourir gratuitement au médiateur de la consommation :{" "}
              {LEGAL.mediator ? (
                <a href={LEGAL.mediator.url} className="underline" target="_blank" rel="noreferrer">
                  {LEGAL.mediator.name}
                </a>
              ) : (
                "en cours de désignation, ses coordonnées seront indiquées ici dès que possible"
              )}
              .
            </p>
            <p>
              Les présentes CGV sont soumises au droit français. À défaut de résolution amiable, le litige sera porté devant
              les juridictions compétentes dans les conditions prévues par la loi.
            </p>
          </Article>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
