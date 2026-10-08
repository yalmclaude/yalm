"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";
import { PaymentChoice, type PaymentSelection } from "@/components/PaymentChoice";

// Devis page: the client picks what to pay now, then accepts the devis in one click.
export function QuotePayForm({
  token,
  depositCents,
  totalCents,
  cautionCents,
}: {
  token: string;
  depositCents: number;
  totalCents: number;
  cautionCents: number;
}) {
  const [choice, setChoice] = useState<PaymentSelection>({ full: false, caution: cautionCents > 0 });
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
      <button
        type="submit"
        className="label-caps w-full rounded-md bg-bordeaux px-4 py-3.5 text-cream transition-all hover:-translate-y-0.5 hover:bg-bordeaux-light"
      >
        Accepter le devis et payer {formatPrice(amount)}
      </button>
    </form>
  );
}
