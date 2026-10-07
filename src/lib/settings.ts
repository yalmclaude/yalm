import { prisma } from "@/lib/prisma";

// Settings of the "formule personnalisée", editable from the admin (Formules section).
export type CustomFormulaSettings = { enabled: boolean; minItems: number; discountPercent: number };

export const DEFAULT_CUSTOM_FORMULA: CustomFormulaSettings = { enabled: true, minItems: 4, discountPercent: 5 };

const KEY = "customFormula";

export function sanitizeCustomFormula(value: unknown): CustomFormulaSettings {
  const v = (value ?? {}) as Partial<Record<keyof CustomFormulaSettings, unknown>>;
  const minItems = Math.round(Number(v.minItems));
  const discountPercent = Number(v.discountPercent);
  return {
    enabled: typeof v.enabled === "boolean" ? v.enabled : DEFAULT_CUSTOM_FORMULA.enabled,
    minItems: minItems >= 2 && minItems <= 20 ? minItems : DEFAULT_CUSTOM_FORMULA.minItems,
    discountPercent:
      discountPercent >= 0 && discountPercent <= 90 ? Math.round(discountPercent * 10) / 10 : DEFAULT_CUSTOM_FORMULA.discountPercent,
  };
}

export async function getCustomFormulaSettings() {
  const row = await prisma.setting.findMany({ where: { key: KEY }, take: 1 }).then((r) => r[0] ?? null);
  return sanitizeCustomFormula(row?.value);
}

export async function saveCustomFormulaSettings(value: unknown) {
  const settings = sanitizeCustomFormula(value);
  await prisma.setting.upsert({ where: { key: KEY }, create: { key: KEY, value: settings }, update: { value: settings } });
  return settings;
}
