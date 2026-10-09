import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SectionTitle, SiteFooter } from "@/components/Brand";
import { CGV_RULES, LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Conditions générales de vente — YALM Events",
};

/* Note: values inserted in the text are followed by an explicit {" "} — the compiler drops the space
   between an inserted value and the next word when the text continues on the next line. */

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

const List = ({ items }: { items: string[] }) => (
  <ul className="list-disc space-y-1 pl-5">
    {items.map((i) => (
      <li key={i}>{i}</li>
    ))}
  </ul>
);

export default function CgvPage() {
  const r = CGV_RULES;
  const co = LEGAL.companyName;
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <SectionTitle eyebrow="Informations" title="Conditions générales de vente" />
          <p className="mt-6 text-center text-xs text-bordeaux/55">Version en vigueur au {r.updatedAt}</p>

          <Article n={1} title="Objet et documents contractuels">
            <p>
              Les présentes conditions générales de vente (CGV) s&apos;appliquent à toutes les prestations et ventes
              réalisées par {co},{" "}
              {LEGAL.legalForm}{" "}au capital de {LEGAL.capital}, siège social {LEGAL.address},{" "}
              {LEGAL.rcsOrRm}, SIREN {LEGAL.siren}, code APE 9329Z, joignable au {LEGAL.phone}{" "}et à {LEGAL.email}.
            </p>
            <p>
              Le devis accepté, le contrat de prestations de services événementiels lorsqu&apos;il est signé, les présentes
              CGV et tout avenant forment un ensemble contractuel unique. Pour une commande passée sur le site, les présentes
              CGV, acceptées en cochant la case prévue avant le paiement, et le récapitulatif de commande valent contrat.
            </p>
          </Article>

          <Article n={2} title="Prestations">
            <p>Les prestations proposées peuvent notamment comprendre :</p>
            <List
              items={[
                "la location d'un photobooth, d'un photobooth 360, d'un livre d'or audio ou d'une grande box photo ;",
                "des prestations de photographie, de vidéographie ou combinées photo et vidéo ;",
                "la conception, la fabrication et la livraison de tableaux de bienvenue personnalisés en plexiglas et d'objets personnalisés ;",
                "la décoration et toute autre prestation expressément mentionnée au devis ou sur le site.",
              ]}
            />
            <p>
              Seules les prestations figurant sur le devis accepté ou sur le récapitulatif de commande sont dues. Les visuels
              du site sont fournis à titre indicatif.
            </p>
          </Article>

          <Article n={3} title="Formation du contrat">
            <p>
              La réservation devient ferme et définitive lorsque la commande ou le devis est accepté et que l&apos;acompte
              prévu (ou la totalité du prix) est effectivement encaissé par {co}. Lorsqu&apos;un contrat de prestations est
              proposé, sa signature est également requise. Tant que ces conditions ne sont pas réunies,{" "}
              {co}{" "}reste libre d&apos;accepter une autre réservation pour la même date. En cas de paiement par virement
              bancaire, la date est réservée pendant le délai indiqué lors de la commande ; si le virement n&apos;est pas
              reçu dans ce délai, la réservation peut être annulée sans frais.
            </p>
            <p>
              Le client s&apos;engage à fournir des informations exactes (date, horaires, lieu, nombre approximatif
              d&apos;invités, contraintes d&apos;accès) et à signaler toute modification, qui pourra donner lieu à une
              étude de faisabilité, à une adaptation du tarif ou à un avenant.
            </p>
          </Article>

          <Article n={4} title="Prix">
            <p>
              Les prix sont exprimés en euros toutes taxes comprises (TTC), TVA de 20 % incluse, sauf indication contraire.
              Le prix applicable est celui du devis accepté ou affiché lors de la commande. Les options, heures
              supplémentaires, frais de déplacement ou demandes non prévues font l&apos;objet d&apos;un devis
              complémentaire ou d&apos;un avenant accepté avant leur réalisation.
            </p>
            <p>
              Toute demande formulée pendant l&apos;événement (prolongation, impressions ou présence supplémentaires, ajout
              de prestation…) peut être acceptée selon les disponibilités et est facturée au tarif en vigueur au jour de
              l&apos;événement.
            </p>
          </Article>

          <Article n={5} title="Acompte, solde et paiement">
            <p>
              Pour réserver la date, le client verse un acompte de {r.depositPercent}{" "}
              % du montant total TTC, sauf montant différent indiqué sur le devis ou la fiche du produit ; il peut aussi
              régler la totalité dès la commande. Cette somme constitue un acompte au sens du Code civil et non des arrhes :
              la réservation engage définitivement les deux parties, sous réserve des articles relatifs à
              l&apos;annulation, au report et à la force majeure.
            </p>
            <p>
              Sauf disposition contraire du devis, le solde est intégralement réglé au plus tard {r.balanceDaysBefore}{" "}
              jours calendaires avant l&apos;événement, notamment au moyen du lien de paiement envoyé par email. Pour une
              réservation effectuée moins de {r.balanceDaysBefore}{" "}
              jours avant l&apos;événement, le paiement intégral est exigé à la commande. À défaut de paiement du solde à
              l&apos;échéance, {co}{" "}peut suspendre ou refuser l&apos;exécution de la prestation.
            </p>
            <p>
              Les paiements en ligne s&apos;effectuent via la plateforme sécurisée Stripe, par carte bancaire, Apple Pay, Google Pay, PayPal, Klarna ou tout autre moyen proposé au moment du paiement ;{" "}
              {co}{" "}n&apos;a jamais accès aux données bancaires. Le virement, les espèces (dans les limites légales) ou tout
              autre moyen accepté par {co}{" "}sont également possibles ; les chèques ne sont acceptés qu&apos;avec son accord
              exprès.
            </p>
            <p>
              Toute somme impayée à son échéance produit de plein droit des intérêts au taux légal ; les frais de
              recouvrement restent à la charge du client dans les limites légales. Pour un client professionnel, les
              pénalités de retard sont calculées au taux directeur de la BCE majoré de 10 points, et une indemnité
              forfaitaire de 40 € pour frais de recouvrement est due (article L441-10 du Code de commerce).
            </p>
          </Article>

          <Article n={6} title="Déplacement, livraison et installation">
            <p>
              Les frais de déplacement sont inclus dans un rayon de {r.includedTravelKm}{" "}
              km autour du siège social. Au-delà, des frais kilométriques sont facturés selon le devis. Péages,
              stationnement, accès réglementés et, lorsque la distance ou les horaires l&apos;imposent, l&apos;hébergement
              peuvent être refacturés, après indication au devis.
            </p>
            <p>
              Le client garantit un accès simple et sécurisé au lieu et signale à l&apos;avance toute contrainte (absence
              d&apos;ascenseur, escaliers, accès piéton, distance importante, restrictions de circulation). À défaut, le
              temps d&apos;installation supplémentaire peut être facturé, de même que toute attente supérieure à{" "}
              {r.waitingMinutes}{" "}
              minutes imputable au client. {co}{" "}peut refuser une installation dont les conditions de sécurité ne permettent
              pas de préserver les personnes, le matériel ou les biens.
            </p>
          </Article>

          <Article n={7} title="Conditions techniques">
            <p>
              Le client met à disposition un espace suffisant, une alimentation électrique conforme lorsqu&apos;elle est
              nécessaire et un environnement sécurisé et abrité des intempéries. Le matériel ne doit pas être exposé à la
              pluie, la neige, un vent important, l&apos;humidité, la forte chaleur, les projections d&apos;eau, la fumée
              dense, des produits inflammables ou toute situation susceptible de l&apos;endommager. En cas de refus de
              respecter ces conditions, la prestation peut être interrompue ou refusée sans remboursement.
            </p>
          </Article>

          <Article n={8} title="Location de matériel">
            <p>
              Le matériel (photobooth, photobooth 360, livre d&apos;or audio, box photo…) reste la propriété exclusive de{" "}
              {co}{" "}; le client n&apos;en a qu&apos;un droit d&apos;utilisation temporaire. Il ne peut être vendu, prêté,
              sous-loué, déplacé, démonté ou modifié sans accord écrit. L&apos;installation, les réglages et la
              désinstallation sont réalisés par {co}, sauf accord contraire.
            </p>
            <p>Sont notamment interdits :</p>
            <List
              items={[
                "le déplacement du matériel pendant son fonctionnement et toute tentative de démontage ;",
                "l'utilisation sous la pluie ou en environnement humide sans accord écrit ;",
                "l'utilisation par une personne manifestement alcoolisée ou au comportement dangereux ;",
                "l'utilisation du photobooth 360 au-delà de la capacité maximale indiquée ;",
                "le fait de monter, de s'accrocher au matériel ou de l'exposer à de la mousse, des poudres colorées ou des confettis humides.",
              ]}
            />
            <p>
              Sauf présence permanente de {co}{" "}prévue au devis, la surveillance du matériel incombe au client pendant
              l&apos;événement ; les enfants restent sous la surveillance de leurs parents. {co}{" "}peut interrompre
              l&apos;utilisation d&apos;un équipement en cas de risque pour la sécurité, sans remboursement lorsque le
              risque résulte du comportement du client ou de ses invités.
            </p>
            <p>
              En cas de panne non imputable au client, {co}{" "}intervient dans les meilleurs délais ou fournit un matériel
              équivalent lorsque c&apos;est possible ; à défaut, le remboursement est limité à la partie de la prestation non
              réalisée, sans autre indemnité, sauf disposition légale contraire.
            </p>
          </Article>

          <Article n={9} title="Dépôt de garantie (caution)">
            <p>
              Lorsque la prestation prévoit un dépôt de garantie, son montant est indiqué sur le devis ou avant la commande.
              Le client peut le régler avec sa réservation ou plus tard, au plus tard le jour de l&apos;événement, avant la
              mise à disposition du matériel.
            </p>
            <p>
              Un état contradictoire du matériel peut être réalisé avant l&apos;installation et après la reprise, notamment
              par photographies horodatées. En cas de dégradation, perte ou vol imputable au client ou à ses invités, seul le
              coût réel de remise en état ou de remplacement est dû, déduction faite le cas échéant d&apos;un coefficient de
              vétusté, sur justificatifs ; il peut être retenu sur le dépôt de garantie et la différence éventuelle reste
              due. Le dépôt est restitué dans un délai maximal de {r.cautionRefundDays}{" "}
              jours après la restitution du matériel, en l&apos;absence de dommage constaté.
            </p>
          </Article>

          <Article n={10} title="Prestations photo et vidéo">
            <p>
              Les prestations sont réalisées avec du matériel professionnel par {co}{" "}ou, en cas d&apos;empêchement
              légitime, par un professionnel aux compétences équivalentes, sans coût supplémentaire. La durée de présence,
              le nombre approximatif de fichiers, leur format, le délai de livraison et les options sont ceux du devis.
            </p>
            <p>
              Le client communique le programme de l&apos;événement et les moments importants à couvrir. Les images sont
              réalisées selon la sensibilité artistique de {co}, que le client reconnaît connaître. Les fichiers bruts (RAW)
              ne sont pas remis, sauf accord écrit ; les retouches supplémentaires peuvent être facturées. Le délai de
              livraison est indicatif. Les fichiers sont conservés {r.filesKeptMonths}{" "}
              mois après leur livraison ; au-delà, leur archivage n&apos;est plus garanti.
            </p>
          </Article>

          <Article n={11} title="Propriété intellectuelle et droit à l'image">
            <p>
              {co}{" "}conserve l&apos;intégralité de ses droits d&apos;auteur sur les photographies, vidéos, montages et
              créations réalisés ; le paiement n&apos;emporte pas cession de ces droits. Sous réserve du paiement intégral, le
              client dispose d&apos;un droit d&apos;utilisation privé, personnel et non exclusif : conserver les fichiers,
              les partager avec ses proches et les publier sur ses réseaux sociaux personnels. Toute utilisation commerciale,
              toute modification portant atteinte à l&apos;œuvre et toute suppression du crédit ou du logo sont interdites
              sans accord écrit.
            </p>
            <p>
              {co}{" "}n&apos;utilise des images du client ou de ses invités à des fins commerciales qu&apos;avec leur
              autorisation expresse, recueillie séparément ; aucune image permettant d&apos;identifier un mineur n&apos;est
              diffusée sans l&apos;accord de ses représentants légaux. Le client informe ses invités de la présence de
              dispositifs de captation photo et vidéo ; toute personne ne souhaitant pas apparaître doit le signaler avant
              le début de la prestation.
            </p>
          </Article>

          <Article n={12} title="Produits personnalisés (plexiglas, miroir…)">
            <p>
              Avant toute fabrication, un bon à tirer (BAT) ou un aperçu numérique est transmis au client, qui en vérifie
              l&apos;orthographe, les noms, les dates, les couleurs, les polices et les dimensions. Le texte saisi lors de
              la commande sert de base à ce BAT. La fabrication ne débute qu&apos;après validation écrite ; toute
              modification ultérieure peut entraîner un délai et un coût supplémentaires, et une erreur reproduite
              conformément au BAT validé ne peut être reprochée à {co}.
            </p>
            <p>
              Les délais de fabrication sont indicatifs. Le client vérifie l&apos;état apparent du produit à sa remise et
              signale immédiatement tout dommage visible. Les produits bénéficient de la garantie légale de conformité
              (articles L217-3 et suivants du Code de la consommation) et de la garantie des vices cachés (articles 1641 et
              suivants du Code civil).
            </p>
          </Article>

          <Article n={13} title="Annulation, report et modification par le client">
            <p>
              Toute annulation est notifiée par écrit (email ou lettre recommandée) ; sa date de réception détermine ses
              conséquences. Compte tenu du préjudice subi (date bloquée, demandes refusées, préparation, commandes
              fournisseurs), les sommes suivantes restent dues, sous réserve des dispositions impératives du droit
              français :
            </p>
            <ul className="list-disc space-y-1 pl-5">
              {r.cancellation.map((c) => (
                <li key={c.when}>
                  {c.when} : {c.due}.
                </li>
              ))}
            </ul>
            <p>
              Le dépôt de garantie versé est restitué en cas d&apos;annulation. {co}{" "}peut, sans y être tenue, proposer un
              report ou un avoir. Une demande de report est étudiée selon la disponibilité des équipes et du matériel ; elle
              n&apos;est définitive qu&apos;après confirmation écrite et, à défaut de nouvelle date, elle vaut annulation.
              Toute modification (horaires, lieu, prestations, durée, invités) peut entraîner une adaptation du tarif ou
              un avenant et n&apos;est acquise qu&apos;après confirmation écrite.
            </p>
          </Article>

          <Article n={14} title="Droit de rétractation">
            <p>
              Conformément à l&apos;article L221-28 du Code de la consommation, le droit de rétractation ne s&apos;applique
              pas aux biens confectionnés selon les spécifications du client ou nettement personnalisés (3°), ni aux
              prestations d&apos;activités de loisirs fournies à une date déterminée (12°), ce qui est le cas des
              réservations pour un événement daté.
            </p>
            <p>
              Pour les autres achats à distance (par exemple un produit non personnalisé acheté pour être conservé), le
              client dispose de 14 jours à compter de sa réception pour se rétracter, par écrit à {LEGAL.email}{" "}; il est
              remboursé dans les 14 jours suivant sa demande, après retour du bien à ses frais.
            </p>
          </Article>

          <Article n={15} title="Empêchement et force majeure">
            <p>
              En cas de force majeure au sens de l&apos;article 1218 du Code civil (catastrophe naturelle, incendie,
              inondation, tempête, pandémie avec restrictions administratives, interdiction préfectorale ou municipale,
              conflit armé, attentat, grève générale paralysant les transports, panne généralisée des réseaux…), les
              obligations des parties sont suspendues et une solution de report amiable est recherchée en priorité.
            </p>
            <p>
              En cas d&apos;empêchement du photographe, du vidéaste ou d&apos;un technicien, {co}{" "}fait intervenir un
              professionnel équivalent. Si aucun remplacement raisonnable n&apos;est possible, ou si {co}{" "}annule une
              prestation, les sommes correspondant aux prestations non exécutées sont remboursées, sans autre indemnité,
              sauf disposition légale contraire.
            </p>
          </Article>

          <Article n={16} title="Responsabilités">
            <p>
              Le client garantit l&apos;exactitude des informations transmises, l&apos;accès au lieu, les installations
              nécessaires et les autorisations requises pour son événement. Il désigne une personne référente majeure,
              joignable pendant toute la prestation et habilitée à décider en cas d&apos;imprévu. Il répond des
              dégradations causées par lui-même, ses invités, ses prestataires ou toute personne dont il répond.
            </p>
            <p>
              {co}{" "}est tenue d&apos;une obligation de moyens. Sa responsabilité ne peut être engagée qu&apos;en cas de faute
              prouvée, et non notamment en cas de coupure d&apos;électricité ou d&apos;internet du lieu, d&apos;accès refusé,
              de retard imputable au client ou à un tiers, de modification du déroulement décidée par le client, de
              conditions météorologiques, du comportement des invités ou de restrictions imposées par le lieu. Les échanges
              par email entre les parties valent preuve, sous réserve des dispositions légales.
            </p>
          </Article>

          <Article n={17} title="Coffret souvenir">
            <p>
              Les photos, vidéos et messages du coffret souvenir sont accessibles aux mariés avec l&apos;identifiant et le
              code qui leur sont remis ; ils sont responsables de leur diffusion. Il leur appartient de télécharger leurs
              fichiers ; ceux-ci sont supprimés sur simple demande.
            </p>
          </Article>

          <Article n={18} title="Données personnelles">
            <p>
              Les données collectées (identité, coordonnées, informations sur l&apos;événement, fichiers photo et vidéo) sont
              utilisées uniquement pour l&apos;organisation de la prestation, la gestion administrative, la facturation, le
              suivi de la relation client et les obligations légales ; elles ne sont jamais vendues. Le détail du traitement
              et des droits du client figure dans les{" "}
              <a href="/mentions-legales" className="underline">
                mentions légales
              </a>
              .
            </p>
          </Article>

          <Article n={19} title="Réclamations, médiation et droit applicable">
            <p>
              Toute réclamation peut être adressée à {LEGAL.email}{" "}ou au {LEGAL.phone}. Pour un client consommateur, tout
              différend fait d&apos;abord l&apos;objet d&apos;une tentative de résolution amiable ; à défaut, il peut
              recourir gratuitement au médiateur de la consommation :{" "}
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
              Les présentes CGV sont soumises au droit français. Si l&apos;une de leurs clauses était déclarée nulle, les
              autres conserveraient leur plein effet. À défaut de résolution amiable, le litige est porté devant la
              juridiction compétente selon les règles légales.
            </p>
          </Article>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
