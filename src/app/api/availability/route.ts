import { NextRequest, NextResponse } from "next/server";
import { getRemainingStock, getRemainingStockForPack } from "@/lib/availability";

export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get("productId");
  const packId = request.nextUrl.searchParams.get("packId");
  const date = request.nextUrl.searchParams.get("date");

  if ((!productId && !packId) || !date) {
    return NextResponse.json({ error: "productId ou packId, et date, sont requis" }, { status: 400 });
  }

  const eventDate = new Date(date);
  if (Number.isNaN(eventDate.getTime())) {
    return NextResponse.json({ error: "date invalide" }, { status: 400 });
  }

  const remaining = packId
    ? await getRemainingStockForPack(packId, eventDate)
    : await getRemainingStock(productId!, eventDate);

  return NextResponse.json({ remaining });
}
