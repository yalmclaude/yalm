import { prisma } from "@/lib/prisma";
import { getBankTransferSettings, newTransferRef, transferAvailable } from "@/lib/bank";
import { sendTransferRequestEmails } from "@/lib/transfer-emails";
import { sendOrderEmails } from "@/lib/email";

const withNames = { product: { select: { name: true } }, pack: { select: { name: true } } };

// Switches a pending booking to "awaiting bank transfer": reference, hold deadline, emails.
// Returns the client's instructions page.
export async function startTransfer(bookingId: string, origin: string) {
  const settings = await getBankTransferSettings();
  if (!transferAvailable(settings)) throw new Error("Le paiement par virement n'est pas disponible");

  const booking = await prisma.booking.findFirst({ where: { id: bookingId } });
  if (!booking) throw new Error("Réservation introuvable");

  // The date is held for a few days, never beyond the event itself.
  const holdUntil = new Date(Date.now() + settings.holdDays * 24 * 3600 * 1000);
  const dueAt = holdUntil < booking.eventDate ? holdUntil : booking.eventDate;
  const ref = booking.transferRef ?? newTransferRef();

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { paymentMethod: "TRANSFER", transferRef: ref, transferDueAt: dueAt },
    include: withNames,
  });
  const url = `${origin}/virement/${ref}`;
  const errors = await sendTransferRequestEmails(updated, settings, url);
  for (const e of errors) console.error("Erreur email virement:", e);
  return url;
}

// YALM saw the transfer on its account: the booking is confirmed like a card payment.
export async function confirmTransfer(bookingId: string) {
  const { count } = await prisma.booking.updateMany({
    where: { id: bookingId, status: "PENDING_DEPOSIT", paymentMethod: "TRANSFER" },
    data: { status: "CONFIRMED", transferDueAt: null },
  });
  if (count === 0) throw new Error("Cette réservation n'attend pas de virement");

  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: {},
    include: withNames,
  });
  // The caution was part of the transfer unless the client chose to pay it later.
  if (booking.cautionCents > 0 && !booking.cautionLater) {
    await prisma.booking.update({ where: { id: bookingId }, data: { cautionPaidAt: new Date() } });
  }
  if (booking.depositAmountCents >= booking.totalCents) {
    await prisma.booking.update({ where: { id: bookingId }, data: { balancePaidAt: new Date() } });
  }
  if (booking.quoteId) {
    await prisma.quote.updateMany({ where: { id: booking.quoteId }, data: { status: "ACCEPTED", bookingId } });
  }
  return sendOrderEmails(booking);
}
