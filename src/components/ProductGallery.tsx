"use client";

import { useState } from "react";

export function ProductGallery({ images, alt }: { images: { url: string }[]; alt: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) return null;

  return (
    <div className="mb-5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[activeIndex].url}
        alt={alt}
        className="h-64 w-full rounded-2xl object-cover shadow-[0_12px_30px_rgba(0,0,0,0.08)]"
      />
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.url + index}
              onClick={() => setActiveIndex(index)}
              className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                index === activeIndex ? "border-bordeaux" : "border-transparent"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
