import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { coffretInclude, serializeCoffret } from "@/lib/coffret";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const coffret = await prisma.coffret.findUnique({ where: { slug }, include: coffretInclude });
  if (!coffret) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  return NextResponse.json({ coffret: serializeCoffret(coffret) });
}
