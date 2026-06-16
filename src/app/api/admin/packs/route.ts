import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const packs = await prisma.pack.findMany({
    include: { items: { include: { product: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ packs });
}

type PackItemInput = { productId: string; quantity: number };

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const data = await request.json();
  const items: PackItemInput[] = Array.isArray(data.items) ? data.items : [];

  const pack = await prisma.pack.create({
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
