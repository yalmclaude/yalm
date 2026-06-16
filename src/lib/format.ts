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
