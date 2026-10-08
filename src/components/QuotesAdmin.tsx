"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import { quoteTotals, VAT_RATE, type QuoteLine } from "@/lib/billing-calc";

type Quote = {
  id: string;
  number: string;
  token: string;
  customerName: string;
  email: string;
  phone: string;
  eventDate: string;
  lines: QuoteLine[];
  depositPercent: number;
  cautionCents: number;
  validUntil: string;
  status: "SENT" | "ACCEPTED" | "CANCELLED";
  createdAt: string;
};

type CatalogItem = { id: string; name: string; description: string; priceCents: number; purchasePriceCents: number; saleMode: string };

const emptyForm = {
  customerName: "",
  email: "",
  phone: "",
  eventDate: "",
  depositPercent: 40,
  cautionEuros: 0,
  validDays: 30,
  note: "",
  lines: [{ label: "", description: "", priceCents: 0 }] as QuoteLine[],
};

const input = "w-full rounded border border-gray-300 px-3 py-2 text-sm";

export function QuotesAdmin() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/quotes");
    const data = await res.json().catch(() => ({}));
    setQuotes(data.quotes ?? []);
  }

  useEffect(() => {
    fetch("/api/admin/quotes")
      .then((r) => r.json())
      .then((d) => setQuotes(d.quotes ?? []))
      .catch(() => {});
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => setCatalog(d.products ?? []))
      .catch(() => {});
  }, []);

  const setLine = (i: number, patch: Partial<QuoteLine>) =>
    setForm({ ...form, lines: form.lines.map((l, j) => (j === i ? { ...l, ...patch } : l)) });

  function addFromCatalog(id: string) {
    const p = catalog.find((c) => c.id === id);
    if (!p) return;
    const price = p.saleMode === "BUY" ? p.purchasePriceCents : p.priceCents;
    const blank = form.lines.length === 1 && !form.lines[0].label && !form.lines[0].priceCents;
    const line = { label: p.name.trim(), description: p.description, priceCents: price };
    setForm({ ...form, lines: blank ? [line] : [...form.lines, line] });
  }

  const totals = quoteTotals(
    form.lines.filter((l) => l.label.trim()),
    form.depositPercent
  );

  async function submit() {
    setSending(true);
    const res = await fetch("/api/admin/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, cautionCents: Math.round(form.cautionEuros * 100) }),
    });
    const data = await res.json().catch(() => ({}));
    setSending(false);
    if (!res.ok && !data.quote) {
      alert(data.error ?? "La création du devis a échoué");
      return;
    }
    alert(
      data.error
        ? `${data.error}\n\nLien du devis à envoyer vous-même :\n${data.url}`
        : `Devis ${data.quote.number} envoyé à ${data.quote.email}.\n\nLien du devis :\n${data.url}`
    );
    setForm(emptyForm);
    setShowForm(false);
    load();
  }

  async function resend(q: Quote) {
    if (!confirm(`Renvoyer le devis ${q.number} à ${q.email} ?`)) return;
    const res = await fetch(`/api/admin/quotes/${q.id}`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    alert(data.ok ? "Devis renvoyé." : `L'envoi a échoué : ${data.error ?? "erreur inconnue"}`);
  }

  async function cancel(q: Quote) {
    if (!confirm(`Annuler le devis ${q.number} ? Le client ne pourra plus l'accepter.`)) return;
    const res = await fetch(`/api/admin/quotes/${q.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) alert(data.error ?? "Erreur");
    load();
  }

  async function copyLink(q: Quote) {
    const url = `${location.origin}/devis/${q.token}`;
    try {
      await navigator.clipboard.writeText(url);
      alert("Lien copié :\n" + url);
    } catch {
      prompt("Copiez ce lien :", url);
    }
  }

  const badge = (s: Quote["status"], expired: boolean) =>
    s === "ACCEPTED" ? (
      <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Accepté</span>
    ) : s === "CANCELLED" ? (
      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">Annulé</span>
    ) : expired ? (
      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">Expiré</span>
    ) : (
      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">Envoyé</span>
    );

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-anthracite">Devis</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded bg-bordeaux px-3 py-1.5 text-sm font-medium text-white hover:bg-bordeaux-dark"
        >
          {showForm ? "Fermer" : "+ Nouveau devis"}
        </button>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Le client reçoit son devis par email et l&apos;accepte en payant l&apos;acompte : il devient alors une réservation, visible dans
        « Catalogue &amp; réservations », où vous pourrez demander le solde. Prix TTC.
      </p>

      {showForm && (
        <div className="mt-5 rounded border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-gray-700">Nom du client</span>
              <input className={`mt-1 ${input}`} value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-gray-700">Email du client</span>
              <input type="email" className={`mt-1 ${input}`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-gray-700">Téléphone</span>
              <input className={`mt-1 ${input}`} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-gray-700">Date de l&apos;événement</span>
              <input type="date" className={`mt-1 ${input}`} value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />
            </label>
          </div>

          <div className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-gray-700">Lignes du devis (prix TTC)</p>
              {catalog.length > 0 && (
                <select className="rounded border border-gray-300 px-2 py-1.5 text-sm" value="" onChange={(e) => addFromCatalog(e.target.value)}>
                  <option value="">+ Ajouter depuis le catalogue…</option>
                  {catalog.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name.trim()}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="mt-2 space-y-3">
              {form.lines.map((l, i) => (
                <div key={i} className="grid gap-2 rounded border border-gray-200 p-3 sm:grid-cols-[1fr_8rem_auto]">
                  <input placeholder="Prestation (ex. Photobooth 360°)" className={input} value={l.label} onChange={(e) => setLine(i, { label: e.target.value })} />
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Prix €"
                    className={input}
                    value={l.priceCents / 100 || ""}
                    onChange={(e) => setLine(i, { priceCents: Math.round(Number(e.target.value) * 100) })}
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, lines: form.lines.filter((_, j) => j !== i) })}
                    className="text-xs text-red-600 hover:underline"
                    disabled={form.lines.length === 1}
                  >
                    Retirer
                  </button>
                  <textarea
                    placeholder="Détail (optionnel) : durée, options, livraison…"
                    rows={2}
                    className={`${input} sm:col-span-3`}
                    value={l.description}
                    onChange={(e) => setLine(i, { description: e.target.value })}
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, lines: [...form.lines, { label: "", description: "", priceCents: 0 }] })}
              className="mt-2 rounded border border-bordeaux/40 px-3 py-1.5 text-xs font-medium text-bordeaux hover:bg-bordeaux/5"
            >
              + Ajouter une ligne
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <label className="block text-sm">
              <span className="font-medium text-gray-700">Acompte (%) — 0 = paiement total</span>
              <input type="number" min={0} max={100} className={`mt-1 ${input}`} value={form.depositPercent} onChange={(e) => setForm({ ...form, depositPercent: Number(e.target.value) })} />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-gray-700">Caution remboursable (€)</span>
              <input type="number" min={0} className={`mt-1 ${input}`} value={form.cautionEuros} onChange={(e) => setForm({ ...form, cautionEuros: Number(e.target.value) })} />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-gray-700">Valable (jours)</span>
              <input type="number" min={1} max={180} className={`mt-1 ${input}`} value={form.validDays} onChange={(e) => setForm({ ...form, validDays: Number(e.target.value) })} />
            </label>
            <label className="block text-sm sm:col-span-3">
              <span className="font-medium text-gray-700">Message au client (optionnel)</span>
              <textarea rows={3} className={`mt-1 ${input}`} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </label>
          </div>

          <div className="mt-5 rounded bg-gray-50 p-4 text-sm text-gray-700">
            <p className="flex justify-between"><span>Total HT</span><span>{formatPrice(totals.htCents)}</span></p>
            <p className="flex justify-between"><span>TVA ({VAT_RATE} %)</span><span>{formatPrice(totals.vatCents)}</span></p>
            <p className="flex justify-between font-semibold text-anthracite"><span>Total TTC</span><span>{formatPrice(totals.totalCents)}</span></p>
            <p className="mt-1 flex justify-between"><span>À payer pour accepter</span><span>{formatPrice(totals.depositCents)}</span></p>
          </div>

          <button
            onClick={submit}
            disabled={sending || !form.customerName || !form.email || !form.eventDate || totals.totalCents <= 0}
            className="mt-5 rounded bg-bordeaux px-4 py-2 text-sm font-medium text-white hover:bg-bordeaux-dark disabled:opacity-50"
          >
            {sending ? "Envoi…" : "Créer et envoyer le devis"}
          </button>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-3 py-2">N°</th>
              <th className="px-3 py-2">Client</th>
              <th className="px-3 py-2">Événement</th>
              <th className="px-3 py-2">Total TTC</th>
              <th className="px-3 py-2">Statut</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => {
              const expired = q.status === "SENT" && new Date(q.validUntil) < new Date();
              return (
                <tr key={q.id} className="border-t border-gray-100">
                  <td className="px-3 py-2 font-medium">{q.number}</td>
                  <td className="px-3 py-2">
                    {q.customerName}
                    <div className="text-xs text-gray-500">{q.email}</div>
                  </td>
                  <td className="px-3 py-2">{new Date(q.eventDate).toLocaleDateString("fr-FR")}</td>
                  <td className="px-3 py-2">{formatPrice(quoteTotals(q.lines, q.depositPercent).totalCents)}</td>
                  <td className="px-3 py-2">{badge(q.status, expired)}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <button onClick={() => copyLink(q)} className="text-bordeaux hover:underline">Copier le lien</button>
                      {q.status === "SENT" && (
                        <>
                          <button onClick={() => resend(q)} className="text-bordeaux hover:underline">Renvoyer</button>
                          <button onClick={() => cancel(q)} className="text-red-600 hover:underline">Annuler</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {quotes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-gray-400">Aucun devis pour le moment</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
