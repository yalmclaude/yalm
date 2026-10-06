"use client";

import type { DurationOption } from "@/lib/format";

// Admin editor for hour-based pricing: each row is a duration (in hours) and its price (in euros).
export function DurationOptionsEditor({
  value,
  onChange,
}: {
  value: DurationOption[];
  onChange: (next: DurationOption[]) => void;
}) {
  const update = (i: number, patch: Partial<DurationOption>) =>
    onChange(value.map((o, j) => (j === i ? { ...o, ...patch } : o)));

  return (
    <div className="space-y-2">
      {value.map((o, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="number"
            min={0.5}
            step={0.5}
            value={o.hours}
            onChange={(e) => update(i, { hours: Number(e.target.value) })}
            className="w-24 rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <span className="text-sm text-gray-500">heure(s)</span>
          <input
            type="number"
            min={0}
            step={1}
            value={o.priceCents / 100}
            onChange={(e) => update(i, { priceCents: Math.round(Number(e.target.value) * 100) })}
            className="w-28 rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <span className="text-sm text-gray-500">€</span>
          <button
            type="button"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="ml-auto text-xs text-red-600 hover:underline"
          >
            Retirer
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => {
          const last = value[value.length - 1];
          onChange([...value, { hours: last ? last.hours + 1 : 2, priceCents: last?.priceCents ?? 0 }]);
        }}
        className="rounded border border-bordeaux/40 px-3 py-1.5 text-xs font-medium text-bordeaux hover:bg-bordeaux/5"
      >
        + Ajouter une durée
      </button>
      <p className="text-xs text-gray-500">
        Sans durée, le client paie le prix de base. Avec des durées, il choisit la sienne et le prix (et l&apos;acompte en %)
        suit.
      </p>
    </div>
  );
}
