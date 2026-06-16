import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";

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
      slug: data.slug,
      name: data.name,
      categoryId: data.categoryId,
      description: data.description,
      priceCents: Number(data.priceCents),
      depositType: data.depositType,
      depositValue: Number(data.depositValue),
      totalQuantity: Number(data.totalQuantity),
      isAvailable: Boolean(data.isAvailable),
    },
    include: { category: true, images: true },
  });
  return NextResponse.json({ product });
}
