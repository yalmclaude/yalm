import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { BookingForm } from "@/components/BookingForm";
import { formatPrice, depositLabel } from "@/lib/format";

export default async function PackPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pack = await prisma.pack.findFirst({
    where: { slug },
    include: { items: { include: { product: true } } },
  });

  if (!pack || !pack.isAvailable) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-5xl px-6 py-14 grid gap-10 md:grid-cols-2">
          <div>
            {pack.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pack.imageUrl}
                alt={pack.name}
                className="mb-5 h-64 w-full rounded-2xl object-cover shadow-[0_12px_30px_rgba(0,0,0,0.08)]"
              />
            )}
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Formule</p>
            <h1 className="mt-2 font-serif text-3xl text-anthracite">{pack.name}</h1>
            <p className="mt-4 text-gray-600">{pack.description}</p>

            <div className="mt-6">
              <p className="text-sm font-medium text-anthracite">Cette formule inclut :</p>
              <ul className="mt-2 space-y-1 text-sm text-gray-700">
                {pack.items.map((item) => (
                  <li key={item.id}>
                    • {item.quantity > 1 ? `${item.quantity}× ` : ""}
                    {item.product.name}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 space-y-1.5 text-sm text-gray-700">
              <p>
                Prix : <span className="font-semibold text-bordeaux">{formatPrice(pack.priceCents)}</span>
              </p>
              <p>Acompte requis : {depositLabel(pack.depositType, pack.depositValue)}</p>
            </div>
          </div>

          <BookingForm
            packId={pack.id}
            priceCents={pack.priceCents}
            depositType={pack.depositType}
            depositValue={pack.depositValue}
            title="Réserver cette formule"
          />
        </div>
      </main>
      <footer className="bg-bordeaux-dark py-9 text-center text-sm text-white/70">
        © {new Date().getFullYear()} YALM Événements
      </footer>
    </>
  );
}
