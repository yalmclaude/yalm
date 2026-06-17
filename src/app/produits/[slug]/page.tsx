import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { BookingForm } from "@/components/BookingForm";
import { ProductGallery } from "@/components/ProductGallery";
import { formatPrice, depositLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product] = await prisma.product.findMany({
    where: { slug },
    include: { category: true, images: { orderBy: { order: "asc" } } },
    take: 1,
  });

  if (!product || !product.isAvailable) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-5xl px-6 py-14 grid gap-10 md:grid-cols-2">
          <div>
            <ProductGallery images={product.images} alt={product.name} />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              {product.category.name}
            </p>
            <h1 className="mt-2 font-serif text-3xl text-anthracite">{product.name}</h1>
            <p className="mt-4 text-gray-600">{product.description}</p>
            <div className="mt-6 space-y-1.5 text-sm text-gray-700">
              <p>
                Prix : <span className="font-semibold text-bordeaux">{formatPrice(product.priceCents)}</span>
              </p>
              <p>Acompte requis : {depositLabel(product.depositType, product.depositValue)}</p>
              {product.totalQuantity > 1 && <p>{product.totalQuantity} unités disponibles dans notre flotte</p>}
            </div>
          </div>

          <BookingForm
            productId={product.id}
            priceCents={product.priceCents}
            depositType={product.depositType}
            depositValue={product.depositValue}
            totalQuantity={product.totalQuantity}
            allowFullPayment={product.allowFullPayment}
          />
        </div>
      </main>
      <footer className="bg-bordeaux-dark py-9 text-center text-sm text-white/70">
        © {new Date().getFullYear()} YALM Événements
      </footer>
    </>
  );
}
