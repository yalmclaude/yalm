import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await params;
  const data = await request.json();
  const product = await prisma.product.update({
    where: { id },
    data: {
      slug: data.slug,
      name: data.name,
      categoryId: data.categoryId,
      description: data.description,
      priceCents: Number(data.priceCents),
      depositType: data.depositType,
      depositValue: Number(data.depositValue),
      totalQuantity: Number(data.totalQuantity),
      isAvailable: Boolean(data.isAvailable),
      allowFullPayment: Boolean(data.allowFullPayment),
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
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
