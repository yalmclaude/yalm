export function formatPrice(cents: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function depositLabel(depositType: "FIXED" | "PERCENT", depositValue: number) {
  return depositType === "PERCENT" ? `${depositValue}% du prix` : formatPrice(depositValue);
}

export function depositAmountCents(priceCents: number, depositType: "FIXED" | "PERCENT", depositValue: number) {
  return depositType === "PERCENT" ? Math.round((priceCents * depositValue) / 100) : depositValue;
}

// Hour-based pricing: an offer can list durations (e.g. 2 h → 300 €) the client picks from.
export type DurationOption = { hours: number; priceCents: number };

export function parseDurationOptions(value: unknown): DurationOption[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((o) => ({ hours: Number(o?.hours), priceCents: Math.round(Number(o?.priceCents)) }))
    .filter((o) => o.hours > 0 && Number.isFinite(o.hours) && o.priceCents >= 0 && Number.isFinite(o.priceCents))
    .sort((a, b) => a.hours - b.hours);
}

export function formatHours(hours: number) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m} min`;
  return m ? `${h} h ${m.toString().padStart(2, "0")}` : `${h} h`;
}

// Lowest price an offer can be booked at, for "Dès …" labels.
export function startingPriceCents(priceCents: number, options: DurationOption[]) {
  return options.length ? Math.min(...options.map((o) => o.priceCents)) : priceCents;
}

// An offer with a 0 deposit can't be booked with a deposit: the whole price is paid at booking.
export function hasDeposit(depositType: "FIXED" | "PERCENT", depositValue: number) {
  return depositValue > 0;
}

export function paymentTermsLabel(depositType: "FIXED" | "PERCENT", depositValue: number) {
  return hasDeposit(depositType, depositValue)
    ? `Acompte : ${depositLabel(depositType, depositValue)}`
    : "Paiement intégral à la réservation";
}
