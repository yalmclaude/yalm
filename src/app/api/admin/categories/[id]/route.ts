import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await params;
  const data = await request.json();

  const category = await prisma.category.update({
    where: { id },
    data: {
      ...(typeof data.name === "string" ? { name: data.name } : {}),
      ...(typeof data.order === "number" ? { order: data.order } : {}),
    },
  });
  return NextResponse.json({ category });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await params;

  let reassignCategoryId: string | undefined;
  try {
    const body = await request.json();
    reassignCategoryId = body?.reassignCategoryId;
  } catch {
    // no body provided, that's fine
  }

  const productCount = await prisma.product.count({ where: { categoryId: id } });

  if (productCount > 0) {
    if (!reassignCategoryId) {
      return NextResponse.json(
        {
          error: "Cette catégorie contient des prestations",
          productCount,
          requiresReassignment: true,
        },
        { status: 409 }
      );
    }

    if (reassignCategoryId === id) {
      return NextResponse.json(
        { error: "La catégorie de destination doit être différente" },
        { status: 400 }
      );
    }

    const targetExists = await prisma.category.findMany({ where: { id: reassignCategoryId }, take: 1 }).then((r) => r[0] ?? null);
    if (!targetExists) {
      return NextResponse.json({ error: "Catégorie de destination introuvable" }, { status: 400 });
    }

    await prisma.product.updateMany({
      where: { categoryId: id },
      data: { categoryId: reassignCategoryId },
    });
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
