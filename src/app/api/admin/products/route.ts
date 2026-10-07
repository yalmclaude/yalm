import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { parseDurationOptions } from "@/lib/format";
import { deleteProducts, deletePack, uniqueSlug } from "@/lib/catalog";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const products = await prisma.product.findMany({
    include: { category: true, images: { orderBy: { order: "asc" } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const data = await request.json();
  const product = await prisma.product.create({
    data: {
      slug: await uniqueSlug("product", data.slug, data.name),
      name: data.name,
      categoryId: data.categoryId,
      description: data.description,
      priceCents: Number(data.priceCents),
      depositType: data.depositType,
      depositValue: Number(data.depositValue),
      totalQuantity: Number(data.totalQuantity),
      isAvailable: Boolean(data.isAvailable),
      allowFullPayment: Boolean(data.allowFullPayment),
      cautionCents: Math.max(0, Math.round(Number(data.cautionCents) || 0)),
      durationOptions: parseDurationOptions(data.durationOptions),
      quoteOnly: Boolean(data.quoteOnly),
      saleMode: ["RENT", "BUY", "BOTH"].includes(data.saleMode) ? data.saleMode : "RENT",
      purchasePriceCents: Math.max(0, Math.round(Number(data.purchasePriceCents) || 0)),
      askCustomText: Boolean(data.askCustomText),
    },
    include: { category: true, images: true },
  });
  return NextResponse.json({ product });
}
