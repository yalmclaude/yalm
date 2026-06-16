import { prisma } from "@/lib/prisma";

const PENDING_EXPIRY_MINUTES = 30;

function pendingCutoff() {
  return new Date(Date.now() - PENDING_EXPIRY_MINUTES * 60 * 1000);
}

function dayRange(eventDate: Date) {
  const dayStart = new Date(eventDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  return { dayStart, dayEnd };
}

const ACTIVE_STATUS_FILTER = {
  OR: [
    { status: "CONFIRMED" as const },
    { status: "PENDING_DEPOSIT" as const, createdAt: { gte: pendingCutoff() } },
  ],
};

export async function getRemainingStock(productId: string, eventDate: Date) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return 0;

  const { dayStart, dayEnd } = dayRange(eventDate);

  const directBookings = await prisma.booking.findMany({
    where: {
      productId,
      eventDate: { gte: dayStart, lt: dayEnd },
      ...ACTIVE_STATUS_FILTER,
    },
  });
  const directReserved = directBookings.reduce((sum, b) => sum + b.quantity, 0);

  const packItemsUsingProduct = await prisma.packItem.findMany({ where: { productId } });
  let packReserved = 0;
  if (packItemsUsingProduct.length > 0) {
    const packBookings = await prisma.booking.findMany({
      where: {
        packId: { in: packItemsUsingProduct.map((pi) => pi.packId) },
        eventDate: { gte: dayStart, lt: dayEnd },
        ...ACTIVE_STATUS_FILTER,
      },
    });
    for (const booking of packBookings) {
      const item = packItemsUsingProduct.find((pi) => pi.packId === booking.packId);
      if (item) packReserved += booking.quantity * item.quantity;
    }
  }

  return Math.max(0, product.totalQuantity - directReserved - packReserved);
}

export async function getRemainingStockForPack(packId: string, eventDate: Date) {
  const pack = await prisma.pack.findUnique({ where: { id: packId }, include: { items: true } });
  if (!pack || pack.items.length === 0) return 0;

  let remaining = Infinity;
  for (const item of pack.items) {
    const productRemaining = await getRemainingStock(item.productId, eventDate);
    remaining = Math.min(remaining, Math.floor(productRemaining / item.quantity));
  }
  return Math.max(0, remaining);
}
