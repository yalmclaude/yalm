import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { coffretInclude, serializeCoffret } from "@/lib/coffret";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";

  if (!username || !code) {
    return NextResponse.json({ error: "Identifiants incorrects" }, { status: 400 });
  }

  const coffret = await prisma.coffret.findFirst({ where: { username, code }, include: coffretInclude });
  if (!coffret) {
    return NextResponse.json({ error: "Identifiants incorrects" }, { status: 404 });
  }

  return NextResponse.json({ coffret: serializeCoffret(coffret) });
}
