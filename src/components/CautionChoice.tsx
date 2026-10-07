"use client";

import { formatPrice } from "@/lib/format";

// Lets the client pay the refundable caution now, or later (by the event day at the latest),
// so the date can be secured with the deposit alone.
export function CautionChoice({
  cautionCents,
  later,
  onChange,
  breakdown = [],
}: {
  cautionCents: number;
  later: boolean;
  onChange: (later: boolean) => void;
  breakdown?: { name: string; cents: number }[];
}) {
  if (cautionCents <= 0) return null;
  return (
    <div className="space-y-2 rounded-lg border border-bordeaux/15 bg-beige-dark/40 p-4">
      <p className="text-sm font-medium text-bordeaux/80">
        Caution remboursable — <span className="font-semibold text-bordeaux">{formatPrice(cautionCents)}</span>
      </p>
      {breakdown.length > 1 && (
        <ul className="space-y-0.5 text-xs text-bordeaux/60">
          {breakdown.map((b) => (
            <li key={b.name} className="flex justify-between gap-3">
              <span>{b.name}</span>
              <span>{formatPrice(b.cents)}</span>
            </li>
          ))}
        </ul>
      )}
      <label className="flex cursor-pointer items-center gap-3">
        <input type="radio" name="cautionTiming" checked={!later} onChange={() => onChange(false)} className="accent-bordeaux" />
        <span className="text-sm text-bordeaux/80">La payer maintenant, avec la réservation</span>
      </label>
      <label className="flex cursor-pointer items-center gap-3">
        <input type="radio" name="cautionTiming" checked={later} onChange={() => onChange(true)} className="accent-bordeaux" />
        <span className="text-sm text-bordeaux/80">La régler plus tard, au plus tard le jour de l&apos;événement</span>
      </label>
      <p className="text-xs text-bordeaux/55">Restituée après l&apos;événement si le matériel est rendu en bon état.</p>
    </div>
  );
}
