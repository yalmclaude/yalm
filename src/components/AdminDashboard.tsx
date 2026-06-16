"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { PacksAdmin } from "@/components/PacksAdmin";
import { HowItWorksAdmin } from "@/components/HowItWorksAdmin";
import { ProductImageGalleryAdmin } from "@/components/ProductImageGalleryAdmin";

type Category = {
  id: string;
  slug: string;
  name: string;
  order: number;
};

type ProductImg = { id: string; url: string; order: number };

type Product = {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  category: Category;
  description: string;
  priceCents: number;
  depositType: "FIXED" | "PERCENT";
  depositValue: number;
  totalQuantity: number;
  isAvailable: boolean;
  images: ProductImg[];
};

type Booking = {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  eventDate: string;
  quantity: number;
  status: string;
  depositAmountCents: number;
  product: { name: string } | null;
  pack: { name: string } | null;
};

type EditingProduct = Omit<Product, "category" | "id"> & { id?: string };

const SOON_COLUMN = "SOON";

export function AdminDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [editing, setEditing] = useState<EditingProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string; productCount: number } | null>(
    null
  );
  const [reassignTargetId, setReassignTargetId] = useState("");

  async function loadData() {
    const [productsRes, categoriesRes, bookingsRes] = await Promise.all([
      fetch("/api/admin/products"),
      fetch("/api/admin/categories"),
      fetch("/api/admin/bookings"),
    ]);
    const productsData = await productsRes.json();
    const categoriesData = await categoriesRes.json();
    const bookingsData = await bookingsRes.json();
    setProducts(productsData.products ?? []);
    setCategories(categoriesData.categories ?? []);
    setBookings(bookingsData.bookings ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  async function handleSave() {
    if (!editing) return;
    const isNew = !editing.id;
    const url = isNew ? "/api/admin/products" : `/api/admin/products/${editing.id}`;
    const method = isNew ? "POST" : "PUT";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });

    if (isNew) {
      const data = await res.json();
      const newProductId = data.product.id;
      const tempImages = editing.images.filter((img) => img.id.startsWith("temp-"));
      for (const image of tempImages) {
        await fetch(`/api/admin/products/${newProductId}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: image.url }),
        });
      }
    }

    setEditing(null);
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce produit ?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    loadData();
  }

  async function moveProduct(productId: string, columnKey: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const isAvailable = columnKey !== SOON_COLUMN;
    const categoryId = columnKey === SOON_COLUMN ? product.categoryId : columnKey;

    if (product.isAvailable === isAvailable && product.categoryId === categoryId) return;

    const newCategory = categories.find((c) => c.id === categoryId) ?? product.category;
    const updated = { ...product, isAvailable, categoryId, category: newCategory };
    setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));

    await fetch(`/api/admin/products/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
  }

  async function handleAddCategory() {
    setCategoryError(null);
    if (!newCategoryName.trim()) return;
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategoryName.trim() }),
    });
    if (!res.ok) {
      const data = await res.json();
      setCategoryError(data.error ?? "Erreur lors de la création");
      return;
    }
    setNewCategoryName("");
    loadData();
  }

  async function handleDeleteCategory(id: string) {
    const category = categories.find((c) => c.id === id);
    if (!category) return;
    if (!confirm(`Supprimer la catégorie "${category.name}" ?`)) return;

    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (res.ok) {
      loadData();
      return;
    }

    const data = await res.json();
    if (data.requiresReassignment) {
      setCategoryToDelete({ id, name: category.name, productCount: data.productCount });
      setReassignTargetId(categories.find((c) => c.id !== id)?.id ?? "");
      return;
    }
    alert(data.error ?? "Erreur lors de la suppression");
  }

  async function confirmReassignAndDelete() {
    if (!categoryToDelete || !reassignTargetId) return;
    const res = await fetch(`/api/admin/categories/${categoryToDelete.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reassignCategoryId: reassignTargetId }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error ?? "Erreur lors de la suppression");
      return;
    }
    setCategoryToDelete(null);
    loadData();
  }

  if (loading) {
    return <main className="flex-1 p-8 text-center text-gray-500">Chargement…</main>;
  }

  return (
    <main className="flex-1 mx-auto max-w-6xl w-full px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-anthracite">Administration YALM</h1>
        <button onClick={handleLogout} className="text-sm text-bordeaux hover:underline">
          Se déconnecter
        </button>
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-lg font-semibold text-anthracite">Catalogue</h2>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
              placeholder="Nouvelle catégorie"
              className="rounded border border-gray-300 px-3 py-1.5 text-sm"
            />
            <button
              onClick={handleAddCategory}
              className="rounded border border-bordeaux px-3 py-1.5 text-sm font-medium text-bordeaux hover:bg-bordeaux/5"
            >
              + Catégorie
            </button>
            <button
              onClick={() => {
                if (categories.length === 0) return;
                setEditing({
                  slug: "",
                  name: "",
                  categoryId: categories[0].id,
                  description: "",
                  priceCents: 0,
                  depositType: "PERCENT",
                  depositValue: 30,
                  totalQuantity: 1,
                  isAvailable: true,
                  images: [],
                });
              }}
              className="rounded bg-bordeaux px-3 py-1.5 text-sm font-medium text-white hover:bg-bordeaux-dark"
            >
              + Ajouter un produit
            </button>
          </div>
        </div>
        {categoryError && <p className="mt-2 text-sm text-red-600">{categoryError}</p>}

        <p className="mt-2 text-sm text-gray-500">
          Glissez-déposez une prestation dans une autre colonne pour changer sa catégorie ou la
          basculer en &quot;Bientôt de retour&quot;.
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-5">
          {[...categories.map((c) => ({ key: c.id, label: c.name, category: c })), { key: SOON_COLUMN, label: "Bientôt de retour", category: null }].map(
            (col) => {
              const items =
                col.key === SOON_COLUMN
                  ? products.filter((p) => !p.isAvailable)
                  : products.filter((p) => p.isAvailable && p.categoryId === col.key);

              return (
                <div
                  key={col.key}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverColumn(col.key);
                  }}
                  onDragLeave={() => setDragOverColumn(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    const productId = e.dataTransfer.getData("text/plain");
                    moveProduct(productId, col.key);
                    setDragOverColumn(null);
                  }}
                  className={`rounded-lg border p-3 min-h-[160px] transition-colors ${
                    dragOverColumn === col.key
                      ? "border-bordeaux bg-bordeaux/5"
                      : col.key === SOON_COLUMN
                      ? "border-gray-200 bg-gray-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h3
                      className={`text-xs font-semibold uppercase tracking-wide ${
                        col.key === SOON_COLUMN ? "text-gray-400" : "text-gold"
                      }`}
                    >
                      {col.label}
                    </h3>
                    {col.category && (
                      <button
                        onClick={() => handleDeleteCategory(col.category!.id)}
                        title="Supprimer la catégorie"
                        className="text-xs text-gray-400 hover:text-red-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {items.map((p) => (
                      <div
                        key={p.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", p.id);
                        }}
                        className="cursor-grab rounded border border-gray-200 bg-white p-3 text-sm shadow-sm active:cursor-grabbing"
                      >
                        <div className="flex items-center gap-2">
                          {p.images[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.images[0].url} alt="" className="h-8 w-8 rounded object-cover" />
                          ) : null}
                          <p className="font-medium text-anthracite">{p.name}</p>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {formatPrice(p.priceCents)} · Qté {p.totalQuantity}
                        </p>
                        <div className="mt-2 flex gap-3 text-xs">
                          <button onClick={() => setEditing(p)} className="text-bordeaux hover:underline">
                            Modifier
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                    {items.length === 0 && (
                      <p className="rounded border border-dashed border-gray-200 p-3 text-center text-xs text-gray-400">
                        Aucune prestation
                      </p>
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </section>

      {categoryToDelete && (
        <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-6">
          <h3 className="font-semibold text-anthracite">
            La catégorie &quot;{categoryToDelete.name}&quot; contient {categoryToDelete.productCount} prestation
            {categoryToDelete.productCount > 1 ? "s" : ""}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Choisissez une catégorie de destination pour ces prestations avant de supprimer
            &quot;{categoryToDelete.name}&quot;.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <select
              value={reassignTargetId}
              onChange={(e) => setReassignTargetId(e.target.value)}
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            >
              {categories
                .filter((c) => c.id !== categoryToDelete.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
            <button
              onClick={confirmReassignAndDelete}
              disabled={!reassignTargetId}
              className="rounded bg-bordeaux px-4 py-2 text-sm font-medium text-white hover:bg-bordeaux-dark disabled:opacity-50"
            >
              Déplacer et supprimer la catégorie
            </button>
            <button
              onClick={() => setCategoryToDelete(null)}
              className="rounded border border-gray-300 px-4 py-2 text-sm"
            >
              Annuler
            </button>
          </div>
          {categories.length <= 1 && (
            <p className="mt-3 text-sm text-red-600">
              Il n&apos;y a aucune autre catégorie disponible. Créez-en une nouvelle avant de
              supprimer celle-ci.
            </p>
          )}
        </div>
      )}

      {editing && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-anthracite">{editing.id ? "Modifier le produit" : "Nouveau produit"}</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Nom">
              <input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Slug">
              <input
                value={editing.slug}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Catégorie">
              <select
                value={editing.categoryId}
                onChange={(e) => setEditing({ ...editing, categoryId: e.target.value })}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Prix (centimes)">
              <input
                type="number"
                value={editing.priceCents}
                onChange={(e) => setEditing({ ...editing, priceCents: Number(e.target.value) })}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Type d'acompte">
              <select
                value={editing.depositType}
                onChange={(e) =>
                  setEditing({ ...editing, depositType: e.target.value as EditingProduct["depositType"] })
                }
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="PERCENT">Pourcentage</option>
                <option value="FIXED">Montant fixe (centimes)</option>
              </select>
            </Field>
            <Field label="Valeur de l'acompte">
              <input
                type="number"
                value={editing.depositValue}
                onChange={(e) => setEditing({ ...editing, depositValue: Number(e.target.value) })}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Quantité totale (multi-machines)">
              <input
                type="number"
                min={0}
                value={editing.totalQuantity}
                onChange={(e) => setEditing({ ...editing, totalQuantity: Number(e.target.value) })}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Disponible">
              <select
                value={editing.isAvailable ? "true" : "false"}
                onChange={(e) => setEditing({ ...editing, isAvailable: e.target.value === "true" })}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="true">Oui</option>
                <option value="false">Non (Bientôt de retour)</option>
              </select>
            </Field>
            <Field label="Description" full>
              <textarea
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                rows={3}
              />
            </Field>
            <div className="sm:col-span-2">
              <ProductImageGalleryAdmin
                productId={editing.id}
                images={editing.images}
                onChange={(images) => setEditing({ ...editing, images })}
              />
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

      <section className="mt-10">
        <PacksAdmin products={products.map((p) => ({ id: p.id, name: p.name }))} />
      </section>

      <section className="mt-10">
        <HowItWorksAdmin />
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-anthracite">Réservations</h2>
        <div className="mt-4 overflow-x-auto rounded border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-3 py-2">Client</th>
                <th className="px-3 py-2">Produit</th>
                <th className="px-3 py-2">Date événement</th>
                <th className="px-3 py-2">Qté</th>
                <th className="px-3 py-2">Acompte</th>
                <th className="px-3 py-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t border-gray-100">
                  <td className="px-3 py-2">
                    {b.customerName}
                    <div className="text-xs text-gray-500">
                      {b.email} · {b.phone}
                    </div>
                  </td>
                  <td className="px-3 py-2">{b.product?.name ?? b.pack?.name ?? "—"}</td>
                  <td className="px-3 py-2">{new Date(b.eventDate).toLocaleDateString("fr-FR")}</td>
                  <td className="px-3 py-2">{b.quantity}</td>
                  <td className="px-3 py-2">{formatPrice(b.depositAmountCents)}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={b.status} />
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-gray-400">
                    Aucune réservation pour le moment
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block text-sm ${full ? "sm:col-span-2" : ""}`}>
      <span className="font-medium text-gray-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    CONFIRMED: "bg-green-100 text-green-700",
    PENDING_DEPOSIT: "bg-yellow-100 text-yellow-700",
    CANCELLED: "bg-gray-100 text-gray-600",
    EXPIRED: "bg-gray-100 text-gray-500",
  };
  const labels: Record<string, string> = {
    CONFIRMED: "Confirmée",
    PENDING_DEPOSIT: "En attente d'acompte",
    CANCELLED: "Annulée",
    EXPIRED: "Expirée",
  };
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${styles[status] ?? "bg-gray-100 text-gray-600"}`}>
      {labels[status] ?? status}
    </span>
  );
}
