import { prisma } from "@/lib/prisma";

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

// URL-safe identifier from a name: "Plateau d'Alliances" → "plateau-d-alliances".
export function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "offre"
  );
}

// Slug derived from the given slug (or the name), made unique among products or packs.
export async function uniqueSlug(kind: "product" | "pack", wanted: string, name: string, excludeId?: string) {
  const base = slugify(wanted?.trim() || name || "");
  const taken = async (slug: string) => {
    const where = { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) };
    return kind === "product" ? (await prisma.product.count({ where })) > 0 : (await prisma.pack.count({ where })) > 0;
  };
  let slug = base;
  for (let i = 2; await taken(slug); i++) slug = `${base}-${i}`;
  return slug;
}

// Products may be referenced by formules and past bookings: remove them from formules and keep the
// bookings (unlinked) so the deletion never fails. Product images are removed by cascade.
export async function deleteProducts(tx: Tx, ids: string[]) {
  if (ids.length === 0) return;
  await tx.packItem.deleteMany({ where: { productId: { in: ids } } });
  await tx.booking.updateMany({ where: { productId: { in: ids } }, data: { productId: null } });
  await tx.product.deleteMany({ where: { id: { in: ids } } });
}

export async function deletePack(tx: Tx, id: string) {
  await tx.booking.updateMany({ where: { packId: id }, data: { packId: null } });
  await tx.pack.delete({ where: { id } });
}
