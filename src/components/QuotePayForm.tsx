"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";
import { PaymentChoice, type PaymentSelection } from "@/components/PaymentChoice";
import { TermsCheckbox } from "@/components/TermsCheckbox";
import { PaymentMethodChoice, type PaymentMethod } from "@/components/PaymentMethodChoice";

// Devis page: the client picks what to pay now, then accepts the devis in one click.
export function QuotePayForm({
  token,
  depositCents,
  totalCents,
  cautionCents,
  transferHoldDays = null,
}: {
  transferHoldDays?: number | null; // set when payment by bank transfer is offered
  token: string;
  depositCents: number;
  totalCents: number;
  cautionCents: number;
}) {
  const [choice, setChoice] = useState<PaymentSelection>({ full: false, caution: cautionCents > 0 });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("CARD");
  const full = choice.full || depositCents >= totalCents;
  const amount = (full ? totalCents : depositCents) + (choice.caution ? cautionCents : 0);

  return (
    <form action={`/api/devis/${token}`} method="post" className="mt-6 space-y-4">
      <PaymentChoice
        depositCents={depositCents}
        totalCents={totalCents}
        cautionCents={cautionCents}
        value={choice}
        onChange={setChoice}
        name="quotePayment"
      />
      <input type="hidden" name="pay" value={full ? "full" : "deposit"} />
      <input type="hidden" name="caution" value={choice.caution ? "1" : "0"} />
      <input type="hidden" name="method" value={method} />
      {transferHoldDays && <PaymentMethodChoice value={method} onChange={setMethod} holdDays={transferHoldDays} />}
      <TermsCheckbox checked={acceptTerms} onChange={setAcceptTerms} name="acceptTerms" />
      <button
        type="submit"
        disabled={!acceptTerms}
        className="label-caps w-full rounded-md bg-bordeaux px-4 py-3.5 text-cream transition-all hover:-translate-y-0.5 hover:bg-bordeaux-light disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {method === "TRANSFER" ? `Accepter le devis — virement de ${formatPrice(amount)}` : `Accepter le devis et payer ${formatPrice(amount)}`}
      </button>
    </form>
  );
}
