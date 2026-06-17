"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import { ImageUploadField } from "@/components/ImageUploadField";

type ProductOption = { id: string; name: string };

type PackItem = {
  productId: string;
  quantity: number;
  product?: ProductOption;
};

type Pack = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  depositType: "FIXED" | "PERCENT";
  depositValue: number;
  isAvailable: boolean;
  allowFullPayment: boolean;
  imageUrl: string | null;
  items: PackItem[];
};

type EditingPack = Omit<Pack, "id"> & { id?: string };

const emptyPack: EditingPack = {
  slug: "",
  name: "",
  description: "",
  priceCents: 0,
  depositType: "PERCENT",
  depositValue: 30,
  isAvailable: true,
  allowFullPayment: false,
  imageUrl: null,
  items: [],
};

export function PacksAdmin({ products }: { products: ProductOption[] }) {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [editing, setEditing] = useState<EditingPack | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadPacks() {
    const res = await fetch("/api/admin/packs");
    const data = await res.json();
    setPacks(data.packs ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadPacks();
  }, []);

  async function handleSave() {
    if (!editing) return;
    const isNew = !editing.id;
    const url = isNew ? "/api/admin/packs" : `/api/admin/packs/${editing.id}`;
    const method = isNew ? "POST" : "PUT";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editing,
        items: editing.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      }),
    });
    setEditing(null);
    loadPacks();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette formule ?")) return;
    await fetch(`/api/admin/packs/${id}`, { method: "DELETE" });
    loadPacks();
  }

  function addItemRow() {
    if (!editing || products.length === 0) return;
    setEditing({
      ...editing,
      items: [...editing.items, { productId: products[0].id, quantity: 1 }],
    });
  }

  function updateItemRow(index: number, patch: Partial<PackItem>) {
    if (!editing) return;
    const items = editing.items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    setEditing({ ...editing, items });
  }

  function removeItemRow(index: number) {
    if (!editing) return;
    setEditing({ ...editing, items: editing.items.filter((_, i) => i !== index) });
  }

  if (loading) return <p className="text-sm text-gray-500">Chargement…</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-anthracite">Packs &amp; Formules</h2>
        <button
          onClick={() => setEditing({ ...emptyPack })}
          className="rounded bg-bordeaux px-3 py-1.5 text-sm font-medium text-white hover:bg-bordeaux-dark"
        >
          + Ajouter une formule
        </button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packs.map((pack) => (
          <div key={pack.id} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2">
              {pack.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pack.imageUrl} alt="" className="h-10 w-10 rounded object-cover" />
              )}
              <p className="font-medium text-anthracite">{pack.name}</p>
            </div>
            <p className="mt-1 text-xs text-gray-500">{pack.description}</p>
            <p className="mt-2 text-sm font-semibold text-bordeaux">{formatPrice(pack.priceCents)}</p>
            <ul className="mt-2 text-xs text-gray-600 list-disc list-inside">
              {pack.items.map((item) => (
                <li key={item.productId}>
                  {item.quantity}× {item.product?.name ?? "?"}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs">{pack.isAvailable ? "Disponible" : "Bientôt de retour"}</p>
            <div className="mt-3 flex gap-3 text-xs">
              <button
                onClick={() =>
                  setEditing({
                    ...pack,
                    items: pack.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
                  })
                }
                className="text-bordeaux hover:underline"
              >
                Modifier
              </button>
              <button onClick={() => handleDelete(pack.id)} className="text-red-600 hover:underline">
                Supprimer
              </button>
            </div>
          </div>
        ))}
        {packs.length === 0 && <p className="text-sm text-gray-400">Aucune formule pour le moment.</p>}
      </div>

      {editing && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-anthracite">{editing.id ? "Modifier la formule" : "Nouvelle formule"}</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-gray-700">Nom</span>
              <input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-gray-700">Slug</span>
              <input
                value={editing.slug}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-gray-700">Prix (centimes)</span>
              <input
                type="number"
                value={editing.priceCents}
                onChange={(e) => setEditing({ ...editing, priceCents: Number(e.target.value) })}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-gray-700">Type d&apos;acompte</span>
              <select
                value={editing.depositType}
                onChange={(e) =>
                  setEditing({ ...editing, depositType: e.target.value as EditingPack["depositType"] })
                }
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="PERCENT">Pourcentage</option>
                <option value="FIXED">Montant fixe (centimes)</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium text-gray-700">Valeur de l&apos;acompte</span>
              <input
                type="number"
                value={editing.depositValue}
                onChange={(e) => setEditing({ ...editing, depositValue: Number(e.target.value) })}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-gray-700">Disponible</span>
              <select
                value={editing.isAvailable ? "true" : "false"}
                onChange={(e) => setEditing({ ...editing, isAvailable: e.target.value === "true" })}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="true">Oui</option>
                <option value="false">Non (Bientôt de retour)</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium text-gray-700">Paiement intégral autorisé</span>
              <select
                value={editing.allowFullPayment ? "true" : "false"}
                onChange={(e) => setEditing({ ...editing, allowFullPayment: e.target.value === "true" })}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="false">Non — acompte uniquement</option>
                <option value="true">Oui — client peut payer le total</option>
              </select>
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium text-gray-700">Description</span>
              <textarea
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                rows={3}
              />
            </label>
            <div className="sm:col-span-2">
              <ImageUploadField
                label="Photo"
                value={editing.imageUrl}
                onChange={(url) => setEditing({ ...editing, imageUrl: url })}
              />
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Prestations incluses</span>
              <button onClick={addItemRow} className="text-xs text-bordeaux hover:underline">
                + Ajouter une prestation
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {editing.items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select
                    value={item.productId}
                    onChange={(e) => updateItemRow(index, { productId: e.target.value })}
                    className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItemRow(index, { quantity: Number(e.target.value) })}
                    className="w-20 rounded border border-gray-300 px-3 py-2 text-sm"
                  />
                  <button onClick={() => removeItemRow(index)} className="text-xs text-red-600 hover:underline">
                    Retirer
                  </button>
                </div>
              ))}
              {editing.items.length === 0 && (
                <p className="text-xs text-gray-400">Aucune prestation ajoutée à cette formule.</p>
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button onClick={handleSave} className="rounded bg-bordeaux px-4 py-2 text-sm font-medium text-white hover:bg-bordeaux-dark">
              Enregistrer
            </button>
            <button onClick={() => setEditing(null)} className="rounded border border-gray-300 px-4 py-2 text-sm">
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
