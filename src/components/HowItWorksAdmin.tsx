"use client";

import { useEffect, useState } from "react";

type Step = {
  id: string;
  order: number;
  title: string;
  description: string;
};

export function HowItWorksAdmin() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadSteps() {
    const res = await fetch("/api/admin/how-it-works");
    const data = await res.json();
    setSteps(data.steps ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadSteps();
  }, []);

  async function handleAdd() {
    await fetch("/api/admin/how-it-works", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Nouvelle étape", description: "" }),
    });
    loadSteps();
  }

  function updateLocal(id: string, patch: Partial<Step>) {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  async function persist(id: string, patch: Partial<Step>) {
    await fetch(`/api/admin/how-it-works/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette étape ?")) return;
    await fetch(`/api/admin/how-it-works/${id}`, { method: "DELETE" });
    loadSteps();
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= steps.length) return;
    const a = steps[index];
    const b = steps[target];
    const newSteps = [...steps];
    newSteps[index] = { ...b, order: a.order };
    newSteps[target] = { ...a, order: b.order };
    setSteps(newSteps.sort((s1, s2) => s1.order - s2.order));
    await Promise.all([
      fetch(`/api/admin/how-it-works/${a.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: b.order }),
      }),
      fetch(`/api/admin/how-it-works/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: a.order }),
      }),
    ]);
  }

  if (loading) return <p className="text-sm text-gray-500">Chargement…</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-anthracite">Popup &quot;Comment ça marche&quot;</h2>
        <button
          onClick={handleAdd}
          className="rounded bg-bordeaux px-3 py-1.5 text-sm font-medium text-white hover:bg-bordeaux-dark"
        >
          + Ajouter une étape
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        Ce contenu s&apos;affiche dans la popup &quot;Comment ça marche ?&quot; visible par vos
        visiteurs sur le site public.
      </p>

      <div className="mt-4 space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <div className="flex flex-col gap-1 pt-1">
                <button
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0}
                  className="text-gray-400 hover:text-bordeaux disabled:opacity-30"
                  title="Monter"
                >
                  ▲
                </button>
                <button
                  onClick={() => handleMove(index, 1)}
                  disabled={index === steps.length - 1}
                  className="text-gray-400 hover:text-bordeaux disabled:opacity-30"
                  title="Descendre"
                >
                  ▼
                </button>
              </div>
              <div className="flex-1 space-y-2">
                <input
                  value={step.title}
                  onChange={(e) => updateLocal(step.id, { title: e.target.value })}
                  onBlur={(e) => persist(step.id, { title: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm font-medium"
                  placeholder="Titre de l'étape"
                />
                <textarea
                  value={step.description}
                  onChange={(e) => updateLocal(step.id, { description: e.target.value })}
                  onBlur={(e) => persist(step.id, { description: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  rows={2}
                  placeholder="Description détaillée"
                />
              </div>
              <button
                onClick={() => handleDelete(step.id)}
                className="text-xs text-red-600 hover:underline mt-1"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
        {steps.length === 0 && <p className="text-sm text-gray-400">Aucune étape définie.</p>}
      </div>
    </div>
  );
}
