import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function BookingCancelledPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-2xl px-6 py-20 text-center bg-background">
        <h1 className="font-serif text-3xl text-bordeaux">Paiement annulé</h1>
        <p className="mt-4 text-gray-600">
          Votre réservation n&apos;a pas été confirmée car l&apos;acompte n&apos;a pas été réglé. La date
          reste disponible pour d&apos;autres clients.
        </p>
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
