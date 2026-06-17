"use client";

import { useEffect, useState } from "react";
import { formatPrice, depositAmountCents } from "@/lib/format";

type Props = {
  productId?: string;
  packId?: string;
  priceCents: number;
  depositType: "FIXED" | "PERCENT";
  depositValue: number;
  totalQuantity?: number;
  allowFullPayment?: boolean;
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

  const deposit = depositAmountCents(priceCents, depositType, depositValue) * quantity;
  const total = priceCents * quantity;
  const amountToPay = paymentType === "FULL" ? total : deposit;
  const isSoldOut = remaining !== null && remaining <= 0;
  const exceedsStock = remaining !== null && quantity > remaining;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, packId, customerName, email, phone, eventDate, quantity, paymentType }),
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

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-bordeaux/5 bg-white p-7 shadow-[0_12px_30px_rgba(0,0,0,0.08)]"
    >
      <h3 className="font-serif text-xl text-bordeaux">{title}</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700">Date de l&apos;événement</label>
        <input
          type="date"
          required
          min={today}
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-[#ddd6cd] bg-background px-3.5 py-2.5 text-sm focus:border-bordeaux focus:outline-none"
        />
        {checkingAvailability && <p className="mt-1.5 text-xs text-gray-500">Vérification de la disponibilité…</p>}
        {!checkingAvailability && remaining !== null && (
          <p className={`mt-1.5 text-xs ${isSoldOut ? "text-red-600" : "text-green-700"}`}>
            {isSoldOut ? "Indisponible à cette date" : `${remaining} disponible(s) à cette date`}
          </p>
        )}
      </div>

      {!packId && totalQuantity !== undefined && totalQuantity > 1 && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Quantité</label>
          <input
            type="number"
            min={1}
            max={totalQuantity}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="mt-1.5 w-24 rounded-lg border border-[#ddd6cd] bg-background px-3.5 py-2.5 text-sm focus:border-bordeaux focus:outline-none"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Nom complet</label>
        <input
          type="text"
          required
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-[#ddd6cd] bg-background px-3.5 py-2.5 text-sm focus:border-bordeaux focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-[#ddd6cd] bg-background px-3.5 py-2.5 text-sm focus:border-bordeaux focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Téléphone</label>
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-[#ddd6cd] bg-background px-3.5 py-2.5 text-sm focus:border-bordeaux focus:outline-none"
        />
      </div>

      {allowFullPayment && (
        <div className="rounded-lg border border-bordeaux/10 p-4 space-y-2">
          <p className="text-sm font-medium text-gray-700">Mode de paiement</p>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="paymentType"
              value="DEPOSIT"
              checked={paymentType === "DEPOSIT"}
              onChange={() => setPaymentType("DEPOSIT")}
              className="accent-bordeaux"
            />
            <span className="text-sm text-gray-700">
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
            <span className="text-sm text-gray-700">
              Payer le montant total — <span className="font-semibold text-bordeaux">{formatPrice(total)}</span>
            </span>
          </label>
        </div>
      )}

      {!allowFullPayment && (
        <div className="rounded-lg bg-background p-3.5 text-sm text-gray-700">
          Acompte à régler pour bloquer la date : <span className="font-semibold text-bordeaux">{formatPrice(deposit)}</span>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting || isSoldOut || exceedsStock || !eventDate}
        className="w-full rounded-full bg-gold px-4 py-3 font-medium text-bordeaux-dark transition-all hover:-translate-y-0.5 hover:bg-gold-light hover:shadow-[0_10px_20px_rgba(201,162,39,0.35)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {submitting
          ? "Redirection vers le paiement…"
          : paymentType === "FULL"
          ? `Payer ${formatPrice(amountToPay)}`
          : "Réserver et payer l'acompte"}
      </button>
    </form>
  );
}
