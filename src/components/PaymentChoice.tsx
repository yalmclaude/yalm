"use client";

import { formatPrice } from "@/lib/format";

export type PaymentSelection = { full: boolean; caution: boolean };

/* One simple choice for the client: what to pay now — deposit or full price, with or without the
   refundable caution. Each option is a card showing its exact amount and what will be left. */
export function PaymentChoice({
  depositCents,
  totalCents,
  cautionCents,
  allowFull = true,
  value,
  onChange,
  name = "paymentChoice",
}: {
  depositCents: number;
  totalCents: number;
  cautionCents: number;
  allowFull?: boolean;
  value: PaymentSelection;
  onChange: (value: PaymentSelection) => void;
  name?: string;
}) {
  const fullOnly = depositCents >= totalCents;
  const canFull = allowFull || fullOnly;
  const rest = totalCents - depositCents;

  const options: { full: boolean; caution: boolean; title: string; note: string }[] = [];
  if (!fullOnly) {
    options.push({ full: false, caution: false, title: "Acompte", note: `Reste ${formatPrice(rest)}${cautionCents ? " + caution" : ""} à régler plus tard` });
    if (cautionCents) options.push({ full: false, caution: true, title: "Acompte + caution", note: `Reste ${formatPrice(rest)} à régler plus tard` });
  }
  if (canFull) {
    options.push({
      full: true,
      caution: false,
      title: fullOnly ? "Paiement" : "Totalité",
      note: cautionCents ? "Caution à régler au plus tard le jour J" : "Plus rien à régler ensuite",
    });
    if (cautionCents) options.push({ full: true, caution: true, title: fullOnly ? "Paiement + caution" : "Totalité + caution", note: "Plus rien à régler ensuite" });
  }

  // Keep the selection valid when the amounts change (e.g. no caution any more).
  const current = options.find((o) => o.full === value.full && o.caution === value.caution) ?? options[0];
  if (current && (current.full !== value.full || current.caution !== value.caution)) {
    queueMicrotask(() => onChange({ full: current.full, caution: current.caution }));
  }

  if (options.length <= 1) {
    return (
      <div className="rounded-lg border border-bordeaux/10 bg-beige-dark/40 p-3.5 text-sm text-bordeaux/80">
        {fullOnly ? "Paiement de la totalité à la réservation" : "Acompte à régler pour bloquer la date"} :{" "}
        <span className="font-semibold text-bordeaux">{formatPrice(fullOnly ? totalCents : depositCents)}</span>
      </div>
    );
  }

  return (
    <fieldset>
      <legend className="block text-sm font-medium text-bordeaux/80">Que souhaitez-vous régler maintenant ?</legend>
      <div className="mt-1.5 grid grid-cols-2 gap-2">
        {options.map((o) => {
          const active = current === o;
          const amount = (o.full ? totalCents : depositCents) + (o.caution ? cautionCents : 0);
          return (
            <label
              key={`${o.full}-${o.caution}`}
              className={`flex cursor-pointer flex-col rounded-lg border px-3 py-2.5 transition-colors ${
                active ? "border-bordeaux bg-bordeaux text-cream" : "border-bordeaux/20 bg-background text-bordeaux hover:border-bordeaux"
              }`}
            >
              <input
                type="radio"
                name={name}
                className="sr-only"
                checked={active}
                onChange={() => onChange({ full: o.full, caution: o.caution })}
              />
              <span className="text-sm font-semibold">{o.title}</span>
              <span className="text-base font-semibold">{formatPrice(amount)}</span>
              <span className={`mt-0.5 text-[0.7rem] leading-snug ${active ? "text-cream/75" : "text-bordeaux/55"}`}>{o.note}</span>
            </label>
          );
        })}
      </div>
      {cautionCents > 0 && (
        <p className="mt-1.5 text-xs text-bordeaux/55">
          Caution de {formatPrice(cautionCents)}, restituée après l&apos;événement si le matériel est rendu en bon état.
        </p>
      )}
    </fieldset>
  );
}
