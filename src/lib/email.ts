import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/contact";
import { formatHours, formatPrice } from "@/lib/format";
import { parseCustomLines } from "@/lib/pricing";

/* Order emails sent once a booking is paid: a confirmation to the client and the order to YALM.
   Sent through Brevo's transactional API (BREVO_API_KEY); without the key nothing is sent. */

type BookingForEmail = {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  eventDate: Date;
  quantity: number;
  durationHours: number | null;
  purchase: boolean;
  items: unknown;
  depositAmountCents: number;
  totalCents: number;
  cautionCents: number;
  cautionLater: boolean;
  product: { name: string } | null;
  pack: { name: string } | null;
};

const BORDEAUX = "#4e0d15";
const CREAM = "#f7ead5";

export async function sendEmail(to: { email: string; name?: string }[], subject: string, html: string, replyTo?: string) {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("La variable BREVO_API_KEY est absente sur Vercel (ou le site n'a pas été redéployé depuis son ajout).");
  }
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { name: "YALM Events", email: CONTACT_EMAIL },
      to,
      subject,
      htmlContent: html,
      ...(replyTo ? { replyTo: { email: replyTo } } : {}),
    }),
  });
  if (!res.ok) throw new Error(`Brevo a refusé l'envoi (${res.status}) : ${await res.text()}`);
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function orderLines(b: BookingForEmail) {
  const custom = parseCustomLines(b.items);
  if (custom.length) {
    return custom.map((l) => ({
      name: l.name,
      detail: [l.mode === "BUY" ? "À garder" : "Location", l.durationHours ? formatHours(l.durationHours) : null]
        .filter(Boolean)
        .join(" · "),
      price: formatPrice(l.discountedCents),
    }));
  }
  const name = b.product?.name ?? b.pack?.name ?? "Prestation";
  const detail = [
    b.purchase ? "À garder" : "Location",
    b.durationHours ? formatHours(b.durationHours) : null,
    b.quantity > 1 ? `quantité ${b.quantity}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return [{ name, detail, price: b.totalCents ? formatPrice(b.totalCents) : "" }];
}

export function orderTitle(b: BookingForEmail) {
  return b.product?.name ?? b.pack?.name ?? (parseCustomLines(b.items).length ? "Formule personnalisée" : "Prestation");
}

function summaryTable(b: BookingForEmail) {
  const row = (label: string, value: string, strong = false) =>
    `<tr><td style="padding:9px 0;border-bottom:1px solid #eadfcf;color:#7a5a52;width:45%">${label}</td><td style="padding:9px 0;border-bottom:1px solid #eadfcf;${strong ? "font-weight:bold;" : ""}">${value}</td></tr>`;
  const items = orderLines(b)
    .map(
      (l) =>
        `<tr><td style="padding:9px 0;border-bottom:1px solid #eadfcf"><strong>${esc(l.name)}</strong><br><span style="color:#7a5a52;font-size:13px">${esc(l.detail)}</span></td><td style="padding:9px 0;border-bottom:1px solid #eadfcf;text-align:right;white-space:nowrap">${l.price}</td></tr>`
    )
    .join("");
  const remaining = Math.max(0, b.totalCents - b.depositAmountCents);
  const date = b.eventDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return `
    <table style="width:100%;border-collapse:collapse;margin-top:8px">${items}</table>
    <table style="width:100%;border-collapse:collapse;margin-top:18px">
      ${row("Date de l'événement", date, true)}
      ${b.totalCents ? row("Total de la commande", formatPrice(b.totalCents), true) : ""}
      ${row("Montant payé", formatPrice(b.depositAmountCents))}
      ${b.totalCents ? row("Reste à régler", remaining > 0 ? formatPrice(remaining) : "Rien, tout est réglé") : ""}
      ${
        b.cautionCents > 0
          ? row(
              "Caution remboursable",
              `${formatPrice(b.cautionCents)} — ${b.cautionLater ? "à régler au plus tard le jour de l'événement" : "payée en ligne"}`
            )
          : ""
      }
    </table>`;
}

function layout(title: string, body: string) {
  return `
  <div style="background:${CREAM};padding:28px 12px;font-family:Arial,Helvetica,sans-serif;color:#2b2b2b">
    <div style="max-width:600px;margin:0 auto;background:#fffaf3;border-radius:8px;overflow:hidden">
      <div style="background:${BORDEAUX};color:${CREAM};padding:22px 28px">
        <p style="margin:0;font-size:12px;letter-spacing:3px;text-transform:uppercase">YALM Events</p>
        <h1 style="margin:6px 0 0;font-size:22px;font-weight:normal">${title}</h1>
      </div>
      <div style="padding:24px 28px;font-size:15px;line-height:1.55">${body}</div>
      <div style="padding:16px 28px;border-top:1px solid #eadfcf;font-size:12px;color:#7a5a52">
        YALM Events · ${CONTACT_PHONE} · ${CONTACT_EMAIL}
      </div>
    </div>
  </div>`;
}

// Returns the errors (empty when both emails were accepted by Brevo).
export async function sendTestEmail() {
  await sendEmail(
    [{ email: CONTACT_EMAIL, name: "YALM Events" }],
    "Test d'envoi — YALM Events",
    layout("Test d'envoi réussi", "<p>Si vous lisez ce message, les emails de commande fonctionnent : vos clients recevront leur confirmation et vous recevrez leurs commandes.</p>")
  );
}

export async function sendOrderEmails(b: BookingForEmail): Promise<string[]> {
  const title = orderTitle(b);
  const firstName = esc(b.customerName.split(" ")[0] || b.customerName);

  const clientHtml = layout(
    "Votre commande est confirmée",
    `<p>Bonjour ${firstName},</p>
     <p>Merci pour votre confiance ! Votre paiement a bien été reçu et votre date est réservée. Voici le récapitulatif de votre commande :</p>
     ${summaryTable(b)}
     <p style="margin-top:22px">Nous reviendrons vers vous pour préparer ensemble votre événement. Pour toute question, appelez-nous au <strong>${CONTACT_PHONE}</strong> ou répondez simplement à cet email.</p>
     <p>À très bientôt,<br>L'équipe YALM Events</p>
     <p style="font-size:12px;color:#7a5a52">Commande n° ${b.id}</p>`
  );

  const adminHtml = layout(
    `Nouvelle commande — ${esc(title)}`,
    `<table style="width:100%;border-collapse:collapse">
       <tr><td style="padding:6px 0;color:#7a5a52;width:45%">Client</td><td style="padding:6px 0"><strong>${esc(b.customerName)}</strong></td></tr>
       <tr><td style="padding:6px 0;color:#7a5a52">Email</td><td style="padding:6px 0"><a href="mailto:${esc(b.email)}">${esc(b.email)}</a></td></tr>
       <tr><td style="padding:6px 0;color:#7a5a52">Téléphone</td><td style="padding:6px 0"><a href="tel:${esc(b.phone)}">${esc(b.phone)}</a></td></tr>
     </table>
     ${summaryTable(b)}
     <p style="font-size:12px;color:#7a5a52;margin-top:18px">Commande n° ${b.id} — visible dans l'admin, rubrique Réservations.</p>`
  );

  const results = await Promise.allSettled([
    sendEmail([{ email: b.email, name: b.customerName }], `Confirmation de votre commande — ${title}`, clientHtml, CONTACT_EMAIL),
    sendEmail([{ email: CONTACT_EMAIL, name: "YALM Events" }], `🎉 Nouvelle commande — ${title} — ${b.customerName}`, adminHtml, b.email),
  ]);
  const errors = results.flatMap((r, i) =>
    r.status === "rejected" ? [`${i === 0 ? "Email client" : "Email YALM"} : ${(r.reason as Error)?.message ?? r.reason}`] : []
  );
  for (const e of errors) console.error("Envoi email échoué —", e);
  return errors;
}
