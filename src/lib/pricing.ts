import { depositAmountCents, parseDurationOptions, type DurationOption } from "@/lib/format";

/* Pricing shared by the booking forms (client) and the booking API (server), so both always agree. */

export type SaleMode = "RENT" | "BUY" | "BOTH";
export type Mode = "RENT" | "BUY";

export type PricedProduct = {
  priceCents: number;
  saleMode: string;
  purchasePriceCents: number;
  durationOptions: unknown;
  depositType: "FIXED" | "PERCENT";
  depositValue: number;
};

export function saleModeOf(p: { saleMode: string }): SaleMode {
  return p.saleMode === "BUY" || p.saleMode === "BOTH" ? p.saleMode : "RENT";
}

export function canRent(p: { saleMode: string }) {
  return saleModeOf(p) !== "BUY";
}

export function canBuy(p: { saleMode: string }) {
  return saleModeOf(p) !== "RENT";
}

// Mode used when the client hasn't chosen: renting when possible.
export function defaultMode(p: { saleMode: string }): Mode {
  return canRent(p) ? "RENT" : "BUY";
}

export type Selection = { mode?: Mode; durationHours?: number | null };

export type ResolvedPrice =
  | { ok: true; mode: Mode; durationHours: number | null; priceCents: number }
  | { ok: false; error: string };

// Unit price for a product and the client's choices (keep/rent, duration). Durations only apply to rentals.
export function resolvePrice(p: PricedProduct, sel: Selection): ResolvedPrice {
  const mode = sel.mode ?? defaultMode(p);
  if (mode === "BUY") {
    if (!canBuy(p)) return { ok: false, error: "Ce produit n'est pas disponible à l'achat" };
    return { ok: true, mode, durationHours: null, priceCents: p.purchasePriceCents };
  }
  if (!canRent(p)) return { ok: false, error: "Ce produit n'est pas disponible à la location" };
  const durations = parseDurationOptions(p.durationOptions);
  if (durations.length === 0) return { ok: true, mode, durationHours: null, priceCents: p.priceCents };
  const chosen = durations.find((d) => d.hours === Number(sel.durationHours));
  if (!chosen) return { ok: false, error: "Choisissez une durée" };
  return { ok: true, mode, durationHours: chosen.hours, priceCents: chosen.priceCents };
}

// Amount due at booking to secure the date. Without a deposit (0), the whole price is due.
export function depositFor(p: Pick<PricedProduct, "depositType" | "depositValue">, priceCents: number) {
  const deposit = depositAmountCents(priceCents, p.depositType, p.depositValue);
  return deposit > 0 ? Math.min(deposit, priceCents) : priceCents;
}

// Price after the custom-formule discount (percentage set in the admin).
export function discounted(priceCents: number, discountPercent: number) {
  return Math.round((priceCents * (100 - discountPercent)) / 100);
}

// Lowest price a product can be had for, for "Dès …" labels.
export function startingPrice(p: PricedProduct) {
  const prices: number[] = [];
  if (canRent(p)) {
    const durations: DurationOption[] = parseDurationOptions(p.durationOptions);
    prices.push(...(durations.length ? durations.map((d) => d.priceCents) : [p.priceCents]));
  }
  if (canBuy(p)) prices.push(p.purchasePriceCents);
  return { priceCents: Math.min(...prices), hasRange: prices.length > 1 };
}

// Line stored on a custom-formula booking (Booking.items).
export type CustomLine = {
  productId: string;
  name: string;
  mode: Mode;
  durationHours: number | null;
  priceCents: number;
  discountedCents: number;
  customText?: string;
};

export const CUSTOM_TEXT_MAX = 500;

// Text the client wants displayed on a personalised product, cleaned and length-capped.
export function cleanCustomText(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, CUSTOM_TEXT_MAX) : "";
}

export function parseCustomLines(value: unknown): CustomLine[] {
  return Array.isArray(value) ? (value as CustomLine[]) : [];
}
