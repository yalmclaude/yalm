"use client";

import { useEffect, useMemo, useState } from "react";
import { formatHours, formatPrice, type DurationOption } from "@/lib/format";
import { PaymentChoice } from "@/components/PaymentChoice";
import {
  canBuy,
  canRent,
  defaultMode,
  depositFor,
  discounted,
  resolvePrice,
  type Mode,
} from "@/lib/pricing";

export type BuilderProduct = {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string | null;
  priceCents: number;
  saleMode: string;
  purchasePriceCents: number;
  durationOptions: DurationOption[];
  depositType: "FIXED" | "PERCENT";
  depositValue: number;
  cautionCents: number;
  askCustomText: boolean;
};

type Choice = { mode: Mode; durationHours: number | null; customText?: string };

export function CustomFormulaBuilder({
  products,
  minItems,
  discountPercent,
}: {
  products: BuilderProduct[];
  minItems: number;
  discountPercent: number;
}) {
  const [selected, setSelected] = useState<Record<string, Choice>>({});
  const [eventDate, setEventDate] = useState("");
  const [unavailable, setUnavailable] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentType, setPaymentType] = useState<"DEPOSIT" | "FULL">("DEPOSIT");
  const [cautionLater, setCautionLater] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  function toggle(p: BuilderProduct) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[p.id]) delete next[p.id];
      else next[p.id] = { mode: defaultMode(p), durationHours: p.durationOptions[0]?.hours ?? null };
      return next;
    });
  }

  function choose(id: string, patch: Partial<Choice>) {
    setSelected((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  const lines = useMemo(
    () =>
      products
        .filter((p) => selected[p.id])
        .map((p) => {
          const price = resolvePrice(p, selected[p.id]);
          const priceCents = price.ok ? price.priceCents : 0;
          const discountedCents = discounted(priceCents, discountPercent);
          return {
            product: p,
            choice: selected[p.id],
            priceCents,
            discountedCents,
            depositCents: depositFor(p, discountedCents),
            cautionCents: selected[p.id].mode === "RENT" ? p.cautionCents : 0,
          };
        }),
    [products, selected, discountPercent]
  );

  // Rented products must still have a unit free on the chosen date.
  const rentedIds = lines.filter((l) => l.choice.mode === "RENT").map((l) => l.product.id).join(",");
  useEffect(() => {
    if (!eventDate || !rentedIds) return;
    let cancelled = false;
    Promise.all(
      rentedIds.split(",").map((id) =>
        fetch(`/api/availability?productId=${id}&date=${eventDate}`)
          .then((r) => r.json())
          .then((d) => (d.remaining > 0 ? null : id))
          .catch(() => null)
      )
    ).then((ids) => {
      if (!cancelled) setUnavailable(ids.filter((id): id is string => Boolean(id)));
    });
    return () => {
      cancelled = true;
    };
  }, [eventDate, rentedIds]);

  const count = lines.length;
  const missing = Math.max(0, minItems - count);
  const total = lines.reduce((s, l) => s + l.discountedCents, 0);
  const deposit = lines.reduce((s, l) => s + l.depositCents, 0);
  const caution = lines.reduce((s, l) => s + l.cautionCents, 0);
  // When none of the chosen products takes a deposit, the formule is paid in full.
  const fullOnly = deposit >= total;
  const payNow = fullOnly ? "FULL" : paymentType;
  const amountToPay = (payNow === "FULL" ? total : deposit) + (cautionLater ? 0 : caution);
  const blockedLines = lines.filter((l) => l.choice.mode === "RENT" && unavailable.includes(l.product.id));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customItems: lines.map((l) => ({
            productId: l.product.id,
            mode: l.choice.mode,
            durationHours: l.choice.mode === "RENT" ? l.choice.durationHours : null,
            customText: l.product.askCustomText ? l.choice.customText : undefined,
          })),
          customerName,
          email,
          phone,
          eventDate,
          paymentType: payNow,
          cautionLater,
        }),
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

  const categories = [...new Set(products.map((p) => p.category))];
  const inputClass =
    "mt-1.5 w-full rounded-lg border border-bordeaux/20 bg-background px-3.5 py-2.5 text-sm text-bordeaux placeholder:text-bordeaux/40 focus:border-bordeaux focus:outline-none";
  const labelClass = "block text-sm font-medium text-bordeaux/80";
  const chip = (active: boolean) =>
    `rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
      active ? "border-bordeaux bg-bordeaux text-cream" : "border-bordeaux/25 text-bordeaux hover:border-bordeaux"
    }`;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <div>
        {categories.map((category) => (
          <div key={category} className="mb-10">
            <h3 className="label-caps mb-4 border-b border-bordeaux/10 pb-3 font-sans text-bordeaux">{category}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {products
                .filter((p) => p.category === category)
                .map((p) => {
                  const choice = selected[p.id];
                  const isOn = Boolean(choice);
                  return (
                    <div
                      key={p.id}
                      className={`rounded-lg border bg-cream-light p-5 transition-all ${
                        isOn ? "border-bordeaux shadow-[0_10px_24px_rgba(78,13,21,0.15)]" : "border-bordeaux/15"
                      }`}
                    >
                      <button type="button" onClick={() => toggle(p)} aria-pressed={isOn} className="flex w-full items-start gap-3 text-left">
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                            isOn ? "border-bordeaux bg-bordeaux text-cream" : "border-bordeaux/40"
                          }`}
                          aria-hidden
                        >
                          {isOn && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-serif text-lg leading-snug text-bordeaux">{p.name}</span>
                          <span className="mt-1 block text-xs leading-relaxed text-bordeaux/60">{p.description}</span>
                        </span>
                      </button>

                      {isOn && (
                        <div className="mt-4 space-y-3 border-t border-dashed border-bordeaux/15 pt-3">
                          {canRent(p) && canBuy(p) && (
                            <div className="flex flex-wrap gap-2">
                              <button type="button" className={chip(choice.mode === "RENT")} onClick={() => choose(p.id, { mode: "RENT" })}>
                                Louer
                              </button>
                              <button type="button" className={chip(choice.mode === "BUY")} onClick={() => choose(p.id, { mode: "BUY" })}>
                                Le garder — {formatPrice(p.purchasePriceCents)}
                              </button>
                            </div>
                          )}
                          {p.askCustomText && (
                            <div>
                              <label className="block text-xs font-medium text-bordeaux/80">Texte à afficher</label>
                              <textarea
                                value={choice.customText ?? ""}
                                onChange={(e) => choose(p.id, { customText: e.target.value })}
                                maxLength={500}
                                rows={2}
                                placeholder="Prénoms, date, message…"
                                className="mt-1 w-full rounded-md border border-bordeaux/20 bg-background px-3 py-2 text-sm text-bordeaux placeholder:text-bordeaux/40 focus:border-bordeaux focus:outline-none"
                              />
                            </div>
                          )}
                          {choice.mode === "RENT" && p.durationOptions.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {p.durationOptions.map((d) => (
                                <button
                                  key={d.hours}
                                  type="button"
                                  className={chip(choice.durationHours === d.hours)}
                                  onClick={() => choose(p.id, { durationHours: d.hours })}
                                >
                                  {formatHours(d.hours)} — {formatPrice(d.priceCents)}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <p className="mt-3 text-right text-sm text-bordeaux/70">
                        {(() => {
                          const price = resolvePrice(p, choice ?? { mode: defaultMode(p), durationHours: p.durationOptions[0]?.hours ?? null });
                          if (!price.ok) return null;
                          return (
                            <>
                              <span className="font-semibold text-bordeaux">{formatPrice(discounted(price.priceCents, discountPercent))}</span>
                            </>
                          );
                        })()}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="h-fit space-y-4 rounded-lg border border-bordeaux/15 bg-cream-light p-6 shadow-[0_12px_30px_rgba(74,16,21,0.1)] lg:sticky lg:top-28"
      >
        <h3 className="font-serif text-xl text-bordeaux">Votre formule</h3>

        {count === 0 ? (
          <p className="text-sm text-bordeaux/60">
            Cochez au moins {minItems} prestations pour composer votre formule.
          </p>
        ) : (
          <ul className="space-y-1.5 text-sm text-bordeaux/80">
            {lines.map((l) => (
              <li key={l.product.id} className="flex justify-between gap-3">
                <span className="min-w-0">
                  {l.product.name}
                  <span className="block text-xs text-bordeaux/50">
                    {l.choice.mode === "BUY" ? "À garder" : "Location"}
                    {l.choice.mode === "RENT" && l.choice.durationHours ? ` · ${formatHours(l.choice.durationHours)}` : ""}
                  </span>
                </span>
                <span className="shrink-0 font-medium text-bordeaux">{formatPrice(l.discountedCents)}</span>
              </li>
            ))}
          </ul>
        )}

        {missing > 0 ? (
          <p className="rounded-lg bg-beige-dark/40 p-3 text-sm text-bordeaux/80">
            Encore <strong>{missing}</strong>{" "}prestation{missing > 1 ? "s" : ""} à choisir pour valider votre formule.
          </p>
        ) : (
          <div className="space-y-1 border-t border-dashed border-bordeaux/15 pt-3 text-sm text-bordeaux/80">
            <p className="flex justify-between text-base font-semibold text-bordeaux">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </p>
          </div>
        )}

        {missing === 0 && (
          <>
            <div>
              <label className={labelClass}>Date de l&apos;événement</label>
              <input type="date" required min={today} value={eventDate} onChange={(e) => setEventDate(e.target.value)} className={inputClass} />
              {blockedLines.length > 0 && (
                <p className="mt-1.5 text-xs text-red-600">
                  Indisponible à cette date : {blockedLines.map((l) => l.product.name).join(", ")}
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>Nom complet</label>
              <input type="text" required value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Téléphone</label>
              <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
            </div>

            <PaymentChoice
              depositCents={deposit}
              totalCents={total}
              cautionCents={caution}
              value={{ full: payNow === "FULL", caution: !cautionLater }}
              onChange={(v) => {
                setPaymentType(v.full ? "FULL" : "DEPOSIT");
                setCautionLater(!v.caution);
              }}
            />
            {caution > 0 && lines.filter((l) => l.cautionCents > 0).length > 1 && (
              <ul className="-mt-2 space-y-0.5 text-xs text-bordeaux/55">
                {lines
                  .filter((l) => l.cautionCents > 0)
                  .map((l) => (
                    <li key={l.product.id} className="flex justify-between gap-3">
                      <span>Caution {l.product.name}</span>
                      <span>{formatPrice(l.cautionCents)}</span>
                    </li>
                  ))}
              </ul>
            )}
          </>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting || missing > 0 || !eventDate || blockedLines.length > 0}
          className="label-caps w-full rounded-md bg-bordeaux px-4 py-3 text-cream transition-all hover:-translate-y-0.5 hover:bg-bordeaux-light disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {submitting ? "Redirection vers le paiement…" : missing > 0 ? `Choisissez ${missing} de plus` : `Réserver et payer ${formatPrice(amountToPay)}`}
        </button>
      </form>
    </div>
  );
}
