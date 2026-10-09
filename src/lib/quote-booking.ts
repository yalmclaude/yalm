import { parseQuoteLines, quoteTotals } from "@/lib/billing-calc";
import type { CustomLine } from "@/lib/pricing";

type QuoteRow = {
  id: string;
  number: string;
  customerName: string;
  email: string;
  phone: string;
  eventDate: Date;
  lines: unknown;
  depositPercent: number;
  cautionCents: number;
};

// Booking fields for an accepted devis, whether paid by card (Stripe) or by bank transfer.
// payFull: the client pays everything now; cautionNow: the caution is included in this payment.
export function bookingDataFromQuote(quote: QuoteRow, opts: { payFull: boolean; cautionNow: boolean }) {
  const lines = parseQuoteLines(quote.lines);
  const totals = quoteTotals(lines, quote.depositPercent);
  const items: CustomLine[] = lines.map((l) => ({
    productId: "",
    name: l.label,
    mode: "RENT",
    durationHours: null,
    priceCents: l.priceCents,
    discountedCents: l.priceCents,
    customText: l.description,
  }));
  const payFull = opts.payFull || totals.depositCents >= totals.totalCents;
  return {
    customerName: quote.customerName,
    email: quote.email,
    phone: quote.phone,
    eventDate: quote.eventDate,
    depositAmountCents: payFull ? totals.totalCents : totals.depositCents,
    totalCents: totals.totalCents,
    cautionCents: quote.cautionCents,
    cautionLater: quote.cautionCents > 0 && !opts.cautionNow,
    items,
    label: `Devis ${quote.number}`,
    quoteId: quote.id,
  };
}
