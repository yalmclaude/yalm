import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/contact";
import { formatPrice } from "@/lib/format";
import { quoteTotals, VAT_RATE, type QuoteLine } from "@/lib/billing";
import { BORDEAUX, CREAM, esc, layout, orderTitle, sendEmail, type BookingForEmail } from "@/lib/email";

/* Emails for devis and balance payments, in the same layout as the order emails. */

const button = (href: string, text: string) =>
  `<p style="margin:26px 0;text-align:center"><a href="${href}" style="display:inline-block;background:${BORDEAUX};color:${CREAM};text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;font-size:13px">${text}</a></p>`;

const frDate = (d: Date) => d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

const row = (label: string, value: string, strong = false) =>
  `<tr><td style="padding:8px 0;border-bottom:1px solid #eadfcf;color:#7a5a52">${label}</td><td style="padding:8px 0;border-bottom:1px solid #eadfcf;text-align:right">${strong ? `<strong>${value}</strong>` : value}</td></tr>`;

const firstNameOf = (name: string) => esc(name.split(" ")[0] || name);

export type QuoteForEmail = {
  number: string;
  customerName: string;
  email: string;
  eventDate: Date;
  lines: QuoteLine[];
  depositPercent: number;
  cautionCents: number;
  note: string;
  validUntil: Date;
};

// The devis itself, with a button to accept it online by paying the deposit.
export async function sendQuoteEmail(q: QuoteForEmail, url: string) {
  const t = quoteTotals(q.lines, q.depositPercent);
  const partial = t.depositCents < t.totalCents;
  const lines = q.lines
    .map(
      (l) =>
        `<tr><td style="padding:9px 0;border-bottom:1px solid #eadfcf"><strong>${esc(l.label)}</strong>${
          l.description ? `<br><span style="color:#7a5a52;font-size:13px;white-space:pre-line">${esc(l.description)}</span>` : ""
        }</td><td style="padding:9px 0;border-bottom:1px solid #eadfcf;text-align:right;white-space:nowrap">${formatPrice(l.priceCents)}</td></tr>`
    )
    .join("");
  const html = layout(
    `Votre devis ${q.number}`,
    `<p>Bonjour ${firstNameOf(q.customerName)},</p>
     <p>Merci pour votre demande ! Voici notre proposition pour votre événement du <strong>${frDate(q.eventDate)}</strong> :</p>
     <table style="width:100%;border-collapse:collapse;margin-top:8px">${lines}</table>
     <table style="width:100%;border-collapse:collapse;margin-top:14px">
       ${row("Total TTC", formatPrice(t.totalCents), true)}
       ${row(`dont TVA (${VAT_RATE} %)`, formatPrice(t.vatCents))}
       ${row(partial ? "Acompte pour réserver la date" : "À régler pour réserver la date", formatPrice(t.depositCents), true)}
       ${q.cautionCents > 0 ? row("Caution remboursable, réglée avec le solde", formatPrice(q.cautionCents)) : ""}
     </table>
     ${q.note ? `<p style="margin-top:18px;white-space:pre-line">${esc(q.note)}</p>` : ""}
     ${button(url, partial ? "Accepter et payer l'acompte" : "Accepter et payer")}
     <p style="font-size:13px;color:#7a5a52">Devis valable jusqu'au ${q.validUntil.toLocaleDateString("fr-FR")}. Une question ? Appelez-nous au <strong>${CONTACT_PHONE}</strong> ou répondez à cet email.</p>`
  );
  await sendEmail([{ email: q.email, name: q.customerName }], `Votre devis YALM Events — ${q.number}`, html, CONTACT_EMAIL);
}

// Asks the client to pay what's left: the rest of the price and/or a caution kept for later.
export async function sendBalanceRequestEmail(b: BookingForEmail, url: string, restCents: number, cautionCents: number) {
  const html = layout(
    "Le solde de votre réservation",
    `<p>Bonjour ${firstNameOf(b.customerName)},</p>
     <p>Votre événement du <strong>${frDate(b.eventDate)}</strong> approche ! Voici ce qu'il reste à régler pour <strong>${esc(orderTitle(b))}</strong> :</p>
     <table style="width:100%;border-collapse:collapse;margin-top:8px">
       ${row("Total de la commande (TTC)", formatPrice(b.totalCents))}
       ${row("Déjà réglé", formatPrice(b.depositAmountCents))}
       ${restCents > 0 ? row("Solde", formatPrice(restCents), true) : ""}
       ${cautionCents > 0 ? row("Caution remboursable", formatPrice(cautionCents), true) : ""}
       ${row("Total à régler", formatPrice(restCents + cautionCents), true)}
     </table>
     ${button(url, `Payer ${formatPrice(restCents + cautionCents)}`)}
     <p style="font-size:13px;color:#7a5a52">Paiement sécurisé par carte. Une question ? Appelez-nous au <strong>${CONTACT_PHONE}</strong>.</p>`
  );
  await sendEmail([{ email: b.email, name: b.customerName }], `Solde de votre réservation — ${orderTitle(b)}`, html, CONTACT_EMAIL);
}

// Receipt to the client and notice to YALM once the balance is paid. Returns the sending errors.
export async function sendBalancePaidEmails(b: BookingForEmail, paidCents: number, cautionCents: number): Promise<string[]> {
  const detail = `${formatPrice(paidCents)}${cautionCents > 0 ? `, dont ${formatPrice(cautionCents)} de caution remboursable` : ""}`;
  const results = await Promise.allSettled([
    sendEmail(
      [{ email: b.email, name: b.customerName }],
      `Paiement reçu — ${orderTitle(b)}`,
      layout(
        "Merci, votre réservation est soldée",
        `<p>Bonjour ${firstNameOf(b.customerName)},</p>
         <p>Nous avons bien reçu votre paiement de <strong>${detail}</strong> pour votre événement du <strong>${frDate(b.eventDate)}</strong>. Il n'y a plus rien à régler.</p>
         <p>À très bientôt,<br>L'équipe YALM Events</p>`
      ),
      CONTACT_EMAIL
    ),
    sendEmail(
      [{ email: CONTACT_EMAIL, name: "YALM Events" }],
      `💶 Solde payé — ${orderTitle(b)} — ${b.customerName}`,
      layout(
        `Solde payé — ${esc(orderTitle(b))}`,
        `<p><strong>${esc(b.customerName)}</strong> (${esc(b.email)}) a réglé <strong>${detail}</strong> pour l'événement du ${frDate(b.eventDate)}.</p>`
      ),
      b.email
    ),
  ]);
  return results.flatMap((r) => (r.status === "rejected" ? [String((r.reason as Error)?.message ?? r.reason)] : []));
}
