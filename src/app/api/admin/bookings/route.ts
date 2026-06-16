import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const bookings = await prisma.booking.findMany({
    include: { product: true, pack: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ bookings });
}
