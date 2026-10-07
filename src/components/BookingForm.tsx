"use client";

import { useEffect, useState } from "react";
import { formatPrice, formatHours, type DurationOption } from "@/lib/format";
import { CautionChoice } from "@/components/CautionChoice";
import { depositFor } from "@/lib/pricing";

type Props = {
  productId?: string;
  packId?: string;
  priceCents: number;
  depositType: "FIXED" | "PERCENT";
  depositValue: number;
  totalQuantity?: number;
  allowFullPayment?: boolean;
  cautionCents?: number;
  durationOptions?: DurationOption[];
  saleMode?: string;
  purchasePriceCents?: number;
  askCustomText?: boolean;
  title?: string;
};

export function BookingForm({
  productId,
  packId,
  priceCents,
  depositType,
  depositValue,
  totalQuantity,
  allowFullPayment = false,
  cautionCents = 0,
  durationOptions = [],
  saleMode = "RENT",
  purchasePriceCents = 0,
  askCustomText = false,
  title = "Réserver cette prestation",
}: Props) {
  const [eventDate, setEventDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentType, setPaymentType] = useState<"DEPOSIT" | "FULL">("DEPOSIT");
  const [durationHours, setDurationHours] = useState<number | null>(durationOptions[0]?.hours ?? null);
  const [mode, setMode] = useState<"RENT" | "BUY">(saleMode === "BUY" ? "BUY" : "RENT");
  const [cautionLater, setCautionLater] = useState(false);
  const [customText, setCustomText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const idParam = packId ? `packId=${packId}` : `productId=${productId}`;

  useEffect(() => {
    if (!eventDate) {
      setRemaining(null);
      return;
    }
    setCheckingAvailability(true);
    fetch(`/api/availability?${idParam}&date=${eventDate}`)
      .then((res) => res.json())
      .then((data) => setRemaining(data.remaining))
      .finally(() => setCheckingAvailability(false));
  }, [eventDate, idParam]);

  const buying = mode === "BUY";
  const rentalDurations = buying ? [] : durationOptions;
  const chosenDuration = rentalDurations.find((d) => d.hours === durationHours) ?? null;
  const rentPrice = chosenDuration ? chosenDuration.priceCents : priceCents;
  const unitPrice = buying ? purchasePriceCents : rentPrice;
  const deposit = depositFor({ depositType, depositValue }, unitPrice) * quantity;
  const total = unitPrice * quantity;
  // No deposit on this offer: the client can only pay the whole price.
  const fullOnly = deposit >= total;
  const payNow = fullOnly ? "FULL" : paymentType;
  // Bought items stay with the client: no caution, and the rental stock doesn't apply.
  const caution = buying ? 0 : cautionCents * quantity;
  const cautionNow = cautionLater ? 0 : caution;
  const amountToPay = (payNow === "FULL" ? total : deposit) + cautionNow;
  const needsDuration = rentalDurations.length > 0 && !chosenDuration;
  const isSoldOut = !buying && remaining !== null && remaining <= 0;
  const exceedsStock = !buying && remaining !== null && quantity > remaining;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, packId, customerName, email, phone, eventDate, quantity, paymentType: payNow, durationHours: buying ? null : durationHours, mode, cautionLater, customText: askCustomText ? customText : undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Une erreur est survenue, veuillez réessayer");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-bordeaux/20 bg-background px-3.5 py-2.5 text-sm text-bordeaux placeholder:text-bordeaux/40 focus:border-bordeaux focus:outline-none";
  const labelClass = "block text-sm font-medium text-bordeaux/80";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-bordeaux/15 bg-cream-light p-7 shadow-[0_12px_30px_rgba(74,16,21,0.1)]"
    >
      <h3 className="font-serif text-xl text-bordeaux">{title}</h3>

      <div>
        <label className={labelClass}>Date de l&apos;événement</label>
        <input
          type="date"
          required
          min={today}
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className={inputClass}
        />
        {checkingAvailability && <p className="mt-1.5 text-xs text-bordeaux/60">Vérification de la disponibilité…</p>}
        {!buying && !checkingAvailability && remaining !== null && (
          <p className={`mt-1.5 text-xs ${isSoldOut ? "text-red-600" : "text-green-700"}`}>
            {isSoldOut ? "Indisponible à cette date" : `${remaining} disponible(s) à cette date`}
          </p>
        )}
      </div>

      {!packId && totalQuantity !== undefined && totalQuantity > 1 && (
        <div>
          <label className={labelClass}>Quantité</label>
          <input
            type="number"
            min={1}
            max={totalQuantity}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className={`${inputClass} w-24`}
          />
        </div>
      )}

      {saleMode === "BOTH" && (
        <div>
          <p className={labelClass}>Location ou achat</p>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {(
              [
                [
                  "RENT",
                  "Louer",
                  durationOptions.length
                    ? `dès ${formatPrice(Math.min(...durationOptions.map((d) => d.priceCents)))}`
                    : formatPrice(priceCents),
                ],
                ["BUY", "Le garder", formatPrice(purchasePriceCents)],
              ] as const
            ).map(([value, label, price]) => {
              const active = mode === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value)}
                  aria-pressed={active}
                  className={`rounded-lg border px-3 py-2.5 text-center transition-colors ${
                    active
                      ? "border-bordeaux bg-bordeaux text-cream"
                      : "border-bordeaux/20 bg-background text-bordeaux hover:border-bordeaux"
                  }`}
                >
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className={`block text-xs ${active ? "text-cream/80" : "text-bordeaux/60"}`}>{price}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {rentalDurations.length > 0 && (
        <div>
          <p className={labelClass}>Durée</p>
          <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {rentalDurations.map((d) => {
              const active = d.hours === durationHours;
              return (
                <button
                  key={d.hours}
                  type="button"
                  onClick={() => setDurationHours(d.hours)}
                  aria-pressed={active}
                  className={`rounded-lg border px-3 py-2.5 text-center transition-colors ${
                    active
                      ? "border-bordeaux bg-bordeaux text-cream"
                      : "border-bordeaux/20 bg-background text-bordeaux hover:border-bordeaux"
                  }`}
                >
                  <span className="block text-sm font-semibold">{formatHours(d.hours)}</span>
                  <span className={`block text-xs ${active ? "text-cream/80" : "text-bordeaux/60"}`}>
                    {formatPrice(d.priceCents)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {askCustomText && (
        <div>
          <label className={labelClass}>Texte à afficher</label>
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Ex. : Bienvenue au mariage de Nadia & Souleymane — 12 juin 2027"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-bordeaux/55">
            Prénoms, date, message… tel que vous voulez qu&apos;il apparaisse. Vous pourrez l&apos;ajuster avec nous avant
            l&apos;événement.
          </p>
        </div>
      )}

      <div>
        <label className={labelClass}>Nom complet</label>
        <input
          type="text"
          required
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Téléphone</label>
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
        />
      </div>

      {allowFullPayment && !fullOnly && (
        <div className="rounded-lg border border-bordeaux/15 bg-beige-dark/40 p-4 space-y-2">
          <p className="text-sm font-medium text-bordeaux/80">Mode de paiement</p>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="paymentType"
              value="DEPOSIT"
              checked={paymentType === "DEPOSIT"}
              onChange={() => setPaymentType("DEPOSIT")}
              className="accent-bordeaux"
            />
            <span className="text-sm text-bordeaux/80">
              Payer l&apos;acompte uniquement — <span className="font-semibold text-bordeaux">{formatPrice(deposit)}</span>
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="paymentType"
              value="FULL"
              checked={paymentType === "FULL"}
              onChange={() => setPaymentType("FULL")}
              className="accent-bordeaux"
            />
            <span className="text-sm text-bordeaux/80">
              Payer le montant total — <span className="font-semibold text-bordeaux">{formatPrice(total)}</span>
            </span>
          </label>
        </div>
      )}

      {!allowFullPayment && !fullOnly && (
        <div className="rounded-lg bg-beige-dark/40 border border-bordeaux/10 p-3.5 text-sm text-bordeaux/80">
          Acompte à régler pour bloquer la date : <span className="font-semibold text-bordeaux">{formatPrice(deposit)}</span>
        </div>
      )}

      {fullOnly && (
        <div className="rounded-lg bg-beige-dark/40 border border-bordeaux/10 p-3.5 text-sm text-bordeaux/80">
          Paiement de la totalité à la réservation : <span className="font-semibold text-bordeaux">{formatPrice(total)}</span>
        </div>
      )}

      <CautionChoice cautionCents={caution} later={cautionLater} onChange={setCautionLater} />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting || isSoldOut || exceedsStock || !eventDate || needsDuration}
        className="w-full rounded-md bg-bordeaux px-4 py-3 label-caps text-cream transition-all hover:-translate-y-0.5 hover:bg-bordeaux-light hover:shadow-[0_10px_20px_rgba(78,13,21,0.3)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {submitting
          ? "Redirection vers le paiement…"
          : payNow === "FULL" || cautionNow > 0
          ? `Réserver et payer ${formatPrice(amountToPay)}`
          : "Réserver et payer l'acompte"}
      </button>
    </form>
  );
}
