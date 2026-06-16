"use client";

import { useState } from "react";

type ProductImg = { id: string; url: string; order: number };

export function ProductImageGalleryAdmin({
  productId,
  images,
  onChange,
}: {
  productId?: string;
  images: ProductImg[];
  onChange: (images: ProductImg[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          setError(uploadData.error ?? "Erreur lors de l'upload");
          continue;
        }

        if (productId) {
          const res = await fetch(`/api/admin/products/${productId}/images`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: uploadData.url }),
          });
          const data = await res.json();
          onChange([...images, data.image]);
        } else {
          // Produit pas encore créé : on garde l'image en local, avec un id temporaire
          onChange([
            ...images,
            { id: `temp-${Date.now()}-${Math.random()}`, url: uploadData.url, order: images.length },
          ]);
        }
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleRemove(image: ProductImg) {
    if (productId && !image.id.startsWith("temp-")) {
      await fetch(`/api/admin/products/${productId}/images/${image.id}`, { method: "DELETE" });
    }
    onChange(images.filter((img) => img.id !== image.id));
  }

  return (
    <div>
      <span className="block text-sm font-medium text-gray-700">Photos (illimité)</span>
      <div className="mt-2 flex flex-wrap gap-3">
        {images.map((image) => (
          <div key={image.id} className="relative h-20 w-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.url} alt="" className="h-20 w-20 rounded-lg object-cover border border-gray-200" />
            <button
              type="button"
              onClick={() => handleRemove(image)}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white hover:bg-red-700"
              title="Retirer cette photo"
            >
              ✕
            </button>
          </div>
        ))}
        <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 text-xs text-gray-400 hover:border-bordeaux hover:text-bordeaux">
          + Ajouter
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            multiple
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>
      {uploading && <p className="mt-1 text-xs text-gray-500">Envoi en cours…</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
