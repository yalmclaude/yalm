import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { coffretInclude, serializeCoffret } from "@/lib/coffret";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim() : "";

  if (!code) {
    return NextResponse.json({ error: "Code incorrect" }, { status: 400 });
  }

  const coffret = await prisma.coffret.findFirst({ where: { code }, include: coffretInclude });
  if (!coffret) {
    return NextResponse.json({ error: "Code incorrect" }, { status: 404 });
  }

  return NextResponse.json({ coffret: serializeCoffret(coffret) });
}
