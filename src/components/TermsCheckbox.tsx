"use client";

// Required before any payment: the client accepts the CGV (opened in a new tab).
export function TermsCheckbox({ checked, onChange, name }: { checked: boolean; onChange: (v: boolean) => void; name?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-sm text-bordeaux/80">
      <input
        type="checkbox"
        name={name}
        required
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-bordeaux"
      />
      <span>
        J&apos;ai lu et j&apos;accepte les{" "}
        <a href="/cgv" target="_blank" rel="noreferrer" className="underline hover:text-bordeaux">
          conditions générales de vente
        </a>
        .
      </span>
    </label>
  );
}
