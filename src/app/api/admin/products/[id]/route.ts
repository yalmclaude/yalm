import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { parseDurationOptions } from "@/lib/format";
import { deleteProducts, deletePack, uniqueSlug } from "@/lib/catalog";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await params;
  const data = await request.json();
  const product = await prisma.product.update({
    where: { id },
    data: {
      slug: await uniqueSlug("product", data.slug, data.name, id),
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
    include: { category: true, images: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json({ product });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await prisma.$transaction((tx) => deleteProducts(tx, [id]));
  } catch (err) {
    console.error("Product delete failed", err);
    return NextResponse.json({ error: "La suppression a échoué, réessayez." }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
