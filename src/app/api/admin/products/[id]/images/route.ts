import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await params;
  const { url } = await request.json();
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL d'image requise" }, { status: 400 });
  }

  const maxOrder = await prisma.productImage.aggregate({
    where: { productId: id },
    _max: { order: true },
  });

  const image = await prisma.productImage.create({
    data: { productId: id, url, order: (maxOrder._max.order ?? -1) + 1 },
  });

  return NextResponse.json({ image });
}
