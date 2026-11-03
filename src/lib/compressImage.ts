const MAX_DIMENSION = 2000;

// Vercel rejects request bodies above ~4.5 Mo, before our route can answer.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

// Shrinks a photo in the browser (max 2000px) before upload, so camera photos of
// 10–20 Mo fit the upload limit and load fast on the site. WebP first; browsers that
// can't encode WebP (older Safari) get a JPEG on a white background. GIFs are sent untouched.
export async function compressImage(file: File): Promise<File> {
  if (file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const baseName = file.name.replace(/\.[^.]+$/, "");
    const webp = await toBlob(canvas, "image/webp", 0.82);
    if (webp?.type === "image/webp") {
      bitmap.close();
      return new File([webp], `${baseName}.webp`, { type: "image/webp" });
    }

    // JPEG has no transparency: paint white behind the photo.
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    bitmap.close();
    const jpeg = await toBlob(canvas, "image/jpeg", 0.85);
    if (jpeg?.type === "image/jpeg") {
      return new File([jpeg], `${baseName}.jpg`, { type: "image/jpeg" });
    }
    return file;
  } catch {
    return file;
  }
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

// Human-readable reason for a failed upload response.
export function uploadErrorMessage(status: number, error?: string) {
  if (error) return error;
  if (status === 413) return "image trop lourde, max 4 Mo";
  if (status === 401) return "session admin expirée, reconnectez-vous";
  return `erreur d'envoi (${status})`;
}
