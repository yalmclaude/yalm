import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await params;
  const data = await request.json();
  const step = await prisma.howItWorksStep.update({
    where: { id },
    data: {
      ...(typeof data.title === "string" ? { title: data.title } : {}),
      ...(typeof data.description === "string" ? { description: data.description } : {}),
      ...(typeof data.order === "number" ? { order: data.order } : {}),
    },
  });
  return NextResponse.json({ step });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.howItWorksStep.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
