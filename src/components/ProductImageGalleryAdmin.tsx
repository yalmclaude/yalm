"use client";

import { useState } from "react";
import { compressImage } from "@/lib/compressImage";

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
    const input = e.target;
    const files = input.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    // Accumulate locally: `images` is the snapshot from when the upload started, so
    // appending to it on each iteration would keep only the last photo.
    let current = images;
    const failed: string[] = [];

    try {
      for (const file of Array.from(files)) {
        try {
          const formData = new FormData();
          formData.append("file", await compressImage(file));
          const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: formData });
          const uploadData = await uploadRes.json().catch(() => ({}));
          if (!uploadRes.ok || !uploadData.url) {
            failed.push(`${file.name} (${uploadData.error ?? "erreur d'envoi"})`);
            continue;
          }

          let image: ProductImg;
          if (productId) {
            const res = await fetch(`/api/admin/products/${productId}/images`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: uploadData.url }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.image) {
              failed.push(`${file.name} (${data.error ?? "erreur d'enregistrement"})`);
              continue;
            }
            image = data.image;
          } else {
            // Produit pas encore créé : on garde l'image en local, avec un id temporaire
            image = { id: `temp-${Date.now()}-${Math.random()}`, url: uploadData.url, order: current.length };
          }
          current = [...current, image];
          onChange(current);
        } catch {
          failed.push(`${file.name} (erreur d'envoi)`);
        }
      }
      if (failed.length > 0) setError(`Non ajoutée(s) : ${failed.join(", ")}`);
    } finally {
      setUploading(false);
      input.value = "";
    }
  }

  async function handleRemove(image: ProductImg) {
    if (productId && !image.id.startsWith("temp-")) {
      await fetch(`/api/admin/products/${productId}/images/${image.id}`, { method: "DELETE" });
    }
    onChange(images.filter((img) => img.id !== image.id));
  }

  // Moves a photo to a new position; position 0 is the cover shown on the site.
  async function handleMove(from: number, to: number) {
    if (to < 0 || to >= images.length || from === to) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    const reordered = next.map((img, order) => ({ ...img, order }));
    onChange(reordered);

    const savedIds = reordered.filter((img) => !img.id.startsWith("temp-")).map((img) => img.id);
    if (productId && savedIds.length > 0) {
      const res = await fetch(`/api/admin/products/${productId}/images`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: savedIds }),
      });
      if (!res.ok) setError("Impossible d'enregistrer le nouvel ordre des photos");
    }
  }

  return (
    <div>
      <span className="block text-sm font-medium text-gray-700">Photos (illimité)</span>
      <p className="text-xs text-gray-500">La première photo est la photo principale affichée sur le site.</p>
      <div className="mt-2 flex flex-wrap gap-3">
        {images.map((image, index) => (
          <div key={image.id} className="relative w-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt=""
              className={`h-20 w-20 rounded-lg object-cover border-2 ${index === 0 ? "border-bordeaux" : "border-gray-200"}`}
            />
            {index === 0 ? (
              <span className="absolute inset-x-0 top-16 mx-auto w-fit rounded bg-bordeaux px-1.5 text-[0.6rem] font-medium text-white">
                Principale
              </span>
            ) : null}
            <div className="mt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleMove(index, index - 1)}
                disabled={index === 0}
                className="rounded px-1.5 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                title="Décaler vers la gauche"
              >
                ←
              </button>
              {index !== 0 && (
                <button
                  type="button"
                  onClick={() => handleMove(index, 0)}
                  className="rounded px-1 text-sm text-gray-600 hover:bg-gray-100 hover:text-bordeaux"
                  title="Mettre en photo principale"
                >
                  ★
                </button>
              )}
              <button
                type="button"
                onClick={() => handleMove(index, index + 1)}
                disabled={index === images.length - 1}
                className="rounded px-1.5 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                title="Décaler vers la droite"
              >
                →
              </button>
            </div>
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
