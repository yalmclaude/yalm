"use client";

import { useState } from "react";
import { MAX_UPLOAD_BYTES, compressImage, uploadErrorMessage } from "@/lib/compressImage";

export function ImageUploadField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null | undefined;
  onChange: (url: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const prepared = await compressImage(file);
      if (prepared.size > MAX_UPLOAD_BYTES) {
        setError("Image trop lourde (max 4 Mo)");
        return;
      }
      const formData = new FormData();
      formData.append("file", prepared);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(uploadErrorMessage(res.status, data.error));
        return;
      }
      onChange(data.url);
    } catch {
      setError("Erreur lors de l'envoi, réessayez");
    } finally {
      setUploading(false);
      input.value = "";
    }
  }

  return (
    <div>
      <span className="block text-sm font-medium text-gray-700">{label}</span>
      <div className="mt-1 flex items-center gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-16 w-16 rounded object-cover border border-gray-200" />
        ) : (
          <div className="h-16 w-16 rounded border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">
            Aucune
          </div>
        )}
        <div>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFileChange}
            disabled={uploading}
            className="text-sm"
          />
          {uploading && <p className="text-xs text-gray-500 mt-1">Envoi en cours…</p>}
          {value && !uploading && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="mt-1 text-xs text-red-600 hover:underline"
            >
              Retirer la photo
            </button>
          )}
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
