import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/contact";
import { formatPrice } from "@/lib/format";
import { esc, layout, orderTitle, sendEmail, summaryTable, type BookingForEmail } from "@/lib/email";
import { transferAmountCents, type BankTransferSettings } from "@/lib/bank";

/* Emails for bookings paid by bank transfer: instructions to the client, notice to YALM. */

type TransferBooking = BookingForEmail & { transferRef: string | null; transferDueAt: Date | null };

const frDate = (d: Date) => d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export function bankDetailsHtml(s: BankTransferSettings, amountCents: number, ref: string) {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:7px 0;border-bottom:1px solid #eadfcf;color:#7a5a52;width:40%">${label}</td><td style="padding:7px 0;border-bottom:1px solid #eadfcf;font-family:Consolas,monospace;font-size:14px"><strong>${esc(value)}</strong></td></tr>`;
  return `<table style="width:100%;border-collapse:collapse;margin:14px 0;background:#f7ead5;border-radius:6px">
    ${row("Montant", formatPrice(amountCents))}
    ${row("Bénéficiaire", s.holder)}
    ${row("IBAN", s.iban)}
    ${s.bic ? row("BIC", s.bic) : ""}
    ${row("Référence à indiquer", ref)}
  </table>`;
}

// Sends the transfer instructions to the client and the "awaiting transfer" notice to YALM. Returns errors.
export async function sendTransferRequestEmails(b: TransferBooking, s: BankTransferSettings, url: string): Promise<string[]> {
  const amount = transferAmountCents(b);
  const ref = b.transferRef ?? "";
  const due = b.transferDueAt ? b.transferDueAt.toLocaleDateString("fr-FR") : "";
  const firstName = esc(b.customerName.split(" ")[0] || b.customerName);
  const results = await Promise.allSettled([
    sendEmail(
      [{ email: b.email, name: b.customerName }],
      `Votre réservation — virement à effectuer (${ref})`,
      layout(
        "Plus qu'une étape : votre virement",
        `<p>Bonjour ${firstName},</p>
         <p>Merci pour votre réservation ! Votre date est <strong>réservée jusqu'au ${due}</strong>, le temps que votre virement nous parvienne. Voici les informations à utiliser :</p>
         ${bankDetailsHtml(s, amount, ref)}
         <p style="font-size:13px;color:#7a5a52">Indiquez bien la référence <strong>${esc(ref)}</strong> dans le libellé du virement, pour que nous puissions l'associer à votre réservation. Un virement instantané arrive en quelques secondes ; un virement classique, en 1 à 2 jours ouvrés.</p>
         <p>Dès réception, nous vous envoyons la confirmation définitive de votre réservation.</p>
         ${summaryTable(b, { awaitingTransfer: true })}
         <p style="font-size:13px;color:#7a5a52">Retrouvez ces informations à tout moment : <a href="${url}">${url}</a>. Une question ? ${CONTACT_PHONE}.</p>`
      ),
      CONTACT_EMAIL
    ),
    sendEmail(
      [{ email: CONTACT_EMAIL, name: "YALM Events" }],
      `⏳ Réservation en attente de virement — ${orderTitle(b)} — ${b.customerName}`,
      layout(
        `En attente de virement — ${esc(orderTitle(b))}`,
        `<p><strong>${esc(b.customerName)}</strong> (${esc(b.email)}, ${esc(b.phone)}) a réservé pour le <strong>${frDate(b.eventDate)}</strong> et va payer par virement.</p>
         <p>Montant attendu : <strong>${formatPrice(amount)}</strong> — référence <strong>${esc(ref)}</strong>. La date est bloquée jusqu'au ${due}.</p>
         <p>Quand le virement arrive sur votre compte, cliquez sur <strong>« Virement reçu »</strong> dans l'admin (Réservations) : la réservation sera confirmée et le client recevra sa confirmation.</p>`
      ),
      b.email
    ),
  ]);
  return results.flatMap((r) => (r.status === "rejected" ? [String((r.reason as Error)?.message ?? r.reason)] : []));
}
