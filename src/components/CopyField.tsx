"use client";

import { useState } from "react";

// A value the client copies into their bank app (IBAN, reference…), with a one-tap copy button.
export function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-3 border-b border-bordeaux/10 py-2.5">
      <span className="text-bordeaux/65">{label}</span>
      <span className="flex items-center gap-2">
        <span className="font-mono text-sm font-semibold text-bordeaux">{value}</span>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value.replace(/\s/g, label === "IBAN" ? "" : " "));
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {
              /* copying is a convenience; the value stays readable */
            }
          }}
          className="rounded border border-bordeaux/25 px-2 py-0.5 text-xs text-bordeaux hover:bg-bordeaux/5"
        >
          {copied ? "Copié" : "Copier"}
        </button>
      </span>
    </div>
  );
}
