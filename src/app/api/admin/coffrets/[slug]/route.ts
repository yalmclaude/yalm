import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { coffretInclude, serializeCoffret } from "@/lib/coffret";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { slug } = await params;
  const coffret = await prisma.coffret.findUnique({ where: { slug }, include: coffretInclude });
  if (!coffret) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  return NextResponse.json({ coffret: serializeCoffret(coffret) });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { slug } = await params;
  await prisma.coffret.deleteMany({ where: { slug } });
  return NextResponse.json({ success: true });
}
