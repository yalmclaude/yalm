import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { formatPrice } from "@/lib/format";

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string }>;
}) {
  const { booking: bookingId } = await searchParams;
  const booking = bookingId
    ? await prisma.booking.findMany({ where: { id: bookingId }, include: { product: true, pack: true }, take: 1 }).then((r) => r[0] ?? null)
    : null;
  const itemName = booking?.product?.name ?? booking?.pack?.name ?? (booking?.items ? "votre formule personnalisée" : undefined);

  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-2xl px-6 py-20 text-center bg-background">
        <h1 className="font-serif text-3xl text-bordeaux">Merci pour votre réservation !</h1>
        {booking ? (
          <p className="mt-4 text-gray-600">
            Votre acompte pour <strong>{itemName}</strong> le{" "}
            {booking.eventDate.toLocaleDateString("fr-FR")} a bien été reçu. Un email de confirmation vous
            a été envoyé à {booking.email}.
          </p>
        ) : (
          <p className="mt-4 text-gray-600">Votre paiement a bien été traité.</p>
        )}
        {booking && booking.cautionCents > 0 && (
          <p className="mt-4 rounded-lg border border-bordeaux/15 bg-cream-light p-4 text-sm text-bordeaux/80">
            {booking.cautionLater ? (
              <>
                Pensez à régler votre caution de <strong>{formatPrice(booking.cautionCents)}</strong> au plus tard le jour
                de l&apos;événement. Elle vous sera restituée si le matériel est rendu en bon état.
              </>
            ) : (
              <>
                Votre caution de <strong>{formatPrice(booking.cautionCents)}</strong> a bien été réglée. Elle vous sera
                restituée après l&apos;événement si le matériel est rendu en bon état.
              </>
            )}
          </p>
        )}
        <Link
          href="/"
          className="mt-9 inline-block rounded-md bg-bordeaux px-7 py-3 label-caps text-cream transition-all hover:-translate-y-0.5 hover:bg-bordeaux-light"
        >
          Retour au catalogue
        </Link>
      </main>
    </>
  );
}
