import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

export * from "@/lib/billing-calc";

/* Server-side helpers for devis and balance payments. */

export function newToken() {
  return randomBytes(18).toString("base64url");
}

export async function nextQuoteNumber() {
  const year = new Date().getFullYear();
  const count = await prisma.quote.count({ where: { number: { startsWith: `DEV-${year}-` } } });
  return `DEV-${year}-${String(count + 1).padStart(3, "0")}`;
}

export function siteOrigin(fallback: string) {
  return process.env.SITE_URL?.replace(/\/$/, "") || fallback;
}
