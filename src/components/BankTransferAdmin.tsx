"use client";

import { useEffect, useState } from "react";

type Settings = { enabled: boolean; holder: string; iban: string; bic: string; holdDays: number };

// Admin card: bank details shown to clients who pay by transfer, and how long their date is held.
export function BankTransferAdmin() {
  const [s, setS] = useState<Settings | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/bank-transfer")
      .then((r) => r.json())
      .then((d) => setS(d.settings ?? null))
      .catch(() => setMessage("Impossible de charger les réglages"));
  }, []);

  async function save() {
    if (!s) return;
    setSaving(true);
    const res = await fetch("/api/admin/bank-transfer", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (res.ok) {
      setS(data.settings);
      setMessage("Enregistré");
    } else setMessage(data.error ?? "L'enregistrement a échoué");
  }

  if (!s) return <p className="mt-4 text-sm text-gray-500">{message ?? "Chargement…"}</p>;
  const active = s.enabled && s.iban.replace(/\s/g, "").length >= 15 && s.holder.trim().length > 0;
  const input = "mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm";

  return (
    <div className="mt-4 rounded border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium text-anthracite">Paiement par virement (sans frais)</p>
          <p className="text-xs text-gray-500">
            Proposé aux clients à côté de la carte. Leur date est réservée pendant le délai choisi ; confirmez la réservation avec
            « Virement reçu » quand l&apos;argent arrive.
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          {active ? "Proposé aux clients" : "Masqué (IBAN manquant ou désactivé)"}
        </span>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-gray-700">Titulaire du compte</span>
          <input className={input} placeholder="YALM EVENTS" value={s.holder} onChange={(e) => setS({ ...s, holder: e.target.value })} />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-gray-700">IBAN</span>
          <input className={input} placeholder="FR76 …" value={s.iban} onChange={(e) => setS({ ...s, iban: e.target.value })} />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-gray-700">BIC</span>
          <input className={input} placeholder="ex. BNPAFRPPXXX" value={s.bic} onChange={(e) => setS({ ...s, bic: e.target.value })} />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-gray-700">Date réservée pendant (jours)</span>
          <input type="number" min={1} max={30} className={input} value={s.holdDays} onChange={(e) => setS({ ...s, holdDays: Number(e.target.value) })} />
        </label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" checked={s.enabled} onChange={(e) => setS({ ...s, enabled: e.target.checked })} />
          <span className="text-gray-700">Proposer le virement aux clients</span>
        </label>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button onClick={save} disabled={saving} className="rounded bg-bordeaux px-4 py-2 text-sm font-medium text-white hover:bg-bordeaux-dark disabled:opacity-50">
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
        {message && <span className="text-sm text-gray-600">{message}</span>}
      </div>
    </div>
  );
}
