/* Pure billing maths (devis totals, VAT, balance due), usable in the browser and on the server.
   All prices on the site are TTC (VAT included, 20 %). */

export const VAT_RATE = 20;

export type QuoteLine = { label: string; description: string; priceCents: number };

export function parseQuoteLines(value: unknown): QuoteLine[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((l) => ({
      label: String(l?.label ?? "").trim().slice(0, 200),
      description: String(l?.description ?? "").trim().slice(0, 1000),
      priceCents: Math.max(0, Math.round(Number(l?.priceCents) || 0)),
    }))
    .filter((l) => l.label);
}

// VAT included in a TTC amount, and the matching HT amount.
export function vatBreakdown(ttcCents: number) {
  const htCents = Math.round((ttcCents * 100) / (100 + VAT_RATE));
  return { htCents, vatCents: ttcCents - htCents };
}

export function quoteTotals(lines: QuoteLine[], depositPercent: number) {
  const totalCents = lines.reduce((s, l) => s + l.priceCents, 0);
  const pct = Math.min(100, Math.max(0, depositPercent));
  // 0 % means the client pays everything when accepting.
  const depositCents = pct > 0 ? Math.round((totalCents * pct) / 100) : totalCents;
  return { totalCents, depositCents, ...vatBreakdown(totalCents) };
}

type BalanceBooking = {
  totalCents: number;
  depositAmountCents: number;
  balancePaidAt: Date | null;
  cautionCents: number;
  cautionLater: boolean;
  cautionPaidAt: Date | null;
};

// What the client still owes on a booking: the rest of the price, plus a caution they chose to pay later.
export function balanceDue(b: BalanceBooking) {
  const restCents = b.balancePaidAt ? 0 : Math.max(0, b.totalCents - b.depositAmountCents);
  const cautionCents = b.cautionLater && !b.cautionPaidAt ? b.cautionCents : 0;
  return { restCents, cautionCents, totalDueCents: restCents + cautionCents };
}
