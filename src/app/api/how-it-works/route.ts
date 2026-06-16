import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const steps = await prisma.howItWorksStep.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ steps });
}
