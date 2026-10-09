"use client";

export type PaymentMethod = "CARD" | "TRANSFER";

// Card/PayPal/Klarna through Stripe, or a fee-free bank transfer (offered once YALM's IBAN is set).
export function PaymentMethodChoice({
  value,
  onChange,
  holdDays,
}: {
  value: PaymentMethod;
  onChange: (m: PaymentMethod) => void;
  holdDays: number;
}) {
  const options: { id: PaymentMethod; title: string; note: string }[] = [
    { id: "CARD", title: "Carte, PayPal, Klarna…", note: "Paiement immédiat et sécurisé" },
    { id: "TRANSFER", title: "Virement bancaire", note: `Sans frais — date réservée ${holdDays} jour${holdDays > 1 ? "s" : ""}` },
  ];
  return (
    <fieldset>
      <legend className="block text-sm font-medium text-bordeaux/80">Moyen de paiement</legend>
      <div className="mt-1.5 grid grid-cols-2 gap-2">
        {options.map((o) => {
          const active = value === o.id;
          return (
            <label
              key={o.id}
              className={`flex cursor-pointer flex-col rounded-lg border px-3 py-2.5 transition-colors ${
                active ? "border-bordeaux bg-bordeaux text-cream" : "border-bordeaux/20 bg-background text-bordeaux hover:border-bordeaux"
              }`}
            >
              <input type="radio" name="paymentMethod" className="sr-only" checked={active} onChange={() => onChange(o.id)} />
              <span className="text-sm font-semibold">{o.title}</span>
              <span className={`mt-0.5 text-[0.7rem] leading-snug ${active ? "text-cream/75" : "text-bordeaux/55"}`}>{o.note}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
