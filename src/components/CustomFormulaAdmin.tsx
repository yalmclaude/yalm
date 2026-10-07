"use client";

import { useEffect, useState } from "react";

type Settings = { enabled: boolean; minItems: number; discountPercent: number };

// Admin card for the "formule personnalisée": shown on the site or not, minimum products, hidden discount.
export function CustomFormulaAdmin() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/custom-formula")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings ?? null))
      .catch(() => setMessage("Impossible de charger les réglages"));
  }, []);

  async function save() {
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/admin/custom-formula", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setMessage(data.error ?? "L'enregistrement a échoué, réessayez.");
      return;
    }
    setSettings(data.settings);
    setMessage("Réglages enregistrés");
  }

  if (!settings) {
    return <p className="mt-4 text-sm text-gray-500">{message ?? "Chargement de la formule personnalisée…"}</p>;
  }

  return (
    <div className="mt-4 rounded border border-bordeaux/30 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium text-anthracite">Formule personnalisée</p>
          <p className="text-xs text-gray-500">
            Le client compose sa formule sur{" "}
            <a href="/formules/personnalisee" target="_blank" rel="noreferrer" className="text-bordeaux underline">
              /formules/personnalisee
            </a>
            . Ses réservations apparaissent dans « Réservations ».
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            settings.enabled ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
          }`}
        >
          {settings.enabled ? "Affichée sur le site" : "Masquée"}
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="font-medium text-gray-700">Sur le site</span>
          <select
            value={settings.enabled ? "true" : "false"}
            onChange={(e) => setSettings({ ...settings, enabled: e.target.value === "true" })}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="true">Affichée</option>
            <option value="false">Masquée</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-gray-700">Minimum de prestations</span>
          <input
            type="number"
            min={2}
            max={20}
            value={settings.minItems}
            onChange={(e) => setSettings({ ...settings, minItems: Number(e.target.value) })}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-gray-700">Remise sur chaque prestation (%)</span>
          <input
            type="number"
            min={0}
            max={90}
            step={0.5}
            value={settings.discountPercent}
            onChange={(e) => setSettings({ ...settings, discountPercent: Number(e.target.value) })}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <span className="mt-1 block text-xs text-gray-500">Non affichée au client : ses prix sont déjà remisés.</span>
        </label>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="rounded bg-bordeaux px-4 py-2 text-sm font-medium text-white hover:bg-bordeaux-dark disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
        {message && <span className="text-sm text-gray-600">{message}</span>}
      </div>
    </div>
  );
}
