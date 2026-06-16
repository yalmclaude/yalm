import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";

type PackItemInput = { productId: string; quantity: number };

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await params;
  const data = await request.json();
  const items: PackItemInput[] = Array.isArray(data.items) ? data.items : [];

  await prisma.packItem.deleteMany({ where: { packId: id } });

  const pack = await prisma.pack.update({
    where: { id },
    data: {
      slug: data.slug,
      name: data.name,
      description: data.description,
      priceCents: Number(data.priceCents),
      depositType: data.depositType,
      depositValue: Number(data.depositValue),
      isAvailable: Boolean(data.isAvailable),
      imageUrl: data.imageUrl ?? null,
      items: {
        create: items
          .filter((i) => i.productId)
          .map((i) => ({ productId: i.productId, quantity: Math.max(1, Number(i.quantity) || 1) })),
      },
    },
    include: { items: { include: { product: true } } },
  });

  return NextResponse.json({ pack });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.pack.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
