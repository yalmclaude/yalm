import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string }>;
}) {
  const { booking: bookingId } = await searchParams;
  const booking = bookingId
    ? await prisma.booking.findFirst({ where: { id: bookingId }, include: { product: true, pack: true } })
    : null;
  const itemName = booking?.product?.name ?? booking?.pack?.name;

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
        <Link
          href="/"
          className="mt-9 inline-block rounded-full bg-gold px-7 py-3 font-medium text-bordeaux-dark transition-all hover:-translate-y-0.5 hover:bg-gold-light"
        >
          Retour au catalogue
        </Link>
      </main>
    </>
  );
}
