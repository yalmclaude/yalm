import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const steps = await prisma.howItWorksStep.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ steps });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const data = await request.json();
  const maxOrder = await prisma.howItWorksStep.aggregate({ _max: { order: true } });
  const step = await prisma.howItWorksStep.create({
    data: {
      title: data.title ?? "",
      description: data.description ?? "",
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });
  return NextResponse.json({ step });
}
