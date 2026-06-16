import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { imageId } = await params;
  const { order } = await request.json();
  const image = await prisma.productImage.update({
    where: { id: imageId },
    data: { order: Number(order) },
  });
  return NextResponse.json({ image });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { imageId } = await params;
  await prisma.productImage.delete({ where: { id: imageId } });
  return NextResponse.json({ success: true });
}
