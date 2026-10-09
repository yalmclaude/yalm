import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

/* Payment by bank transfer: no fees. The client gets the IBAN and a reference, the date is held for a few
   days, and YALM confirms the booking from the admin once the money has arrived. */

export type BankTransferSettings = { enabled: boolean; holder: string; iban: string; bic: string; holdDays: number };

const KEY = "bankTransfer";

export function sanitizeBankTransfer(value: unknown): BankTransferSettings {
  const v = (value ?? {}) as Record<string, unknown>;
  const clean = (s: unknown, max: number) => String(s ?? "").trim().slice(0, max);
  const iban = clean(v.iban, 42).toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/(.{4})/g, "$1 ").trim();
  const holdDays = Math.round(Number(v.holdDays));
  return {
    enabled: v.enabled !== false,
    holder: clean(v.holder, 120),
    iban,
    bic: String(v.bic ?? "").replace(/\s/g, "").toUpperCase().slice(0, 11),
    holdDays: holdDays >= 1 && holdDays <= 30 ? holdDays : 3,
  };
}

// The option is only offered once the bank details are filled in.
export function transferAvailable(s: BankTransferSettings) {
  return s.enabled && s.iban.length >= 15 && s.holder.length > 0;
}

export async function getBankTransferSettings() {
  const row = await prisma.setting.findMany({ where: { key: KEY }, take: 1 }).then((r) => r[0] ?? null);
  return sanitizeBankTransfer(row?.value);
}

export async function saveBankTransferSettings(value: unknown) {
  const settings = sanitizeBankTransfer(value);
  await prisma.setting.upsert({ where: { key: KEY }, create: { key: KEY, value: settings }, update: { value: settings } });
  return settings;
}

// Short reference the client writes on the transfer, e.g. YALM-4F2K9Q (no 0/O/1/I to avoid typos).
export function newTransferRef() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  return `YALM-${[...bytes].map((b) => alphabet[b % alphabet.length]).join("")}`;
}

// What the client must transfer to secure the booking: the chosen amount, plus the caution when paid now.
export function transferAmountCents(b: { depositAmountCents: number; cautionCents: number; cautionLater: boolean }) {
  return b.depositAmountCents + (b.cautionLater ? 0 : b.cautionCents);
}
