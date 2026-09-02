import { Prisma } from "@prisma/client";

export const coffretInclude = {
  photos: { orderBy: { order: "asc" as const } },
  videos: { orderBy: { order: "asc" as const } },
  messages: { orderBy: { order: "asc" as const } },
  products: { orderBy: { order: "asc" as const } },
};

type CoffretWithItems = Prisma.CoffretGetPayload<{ include: typeof coffretInclude }>;

export function serializeCoffret(c: CoffretWithItems) {
  return {
    slug: c.slug,
    names: c.names,
    date: c.date,
    location: c.location,
    username: c.username,
    code: c.code,
    cover: c.cover,
    final: c.final,
    categories: c.categories,
    updatedAt: c.updatedAt.getTime(),
    photos: c.photos.map((p) => ({ id: p.id, category: p.category, src: p.src })),
    videos: c.videos.map((v) => ({ id: v.id, title: v.title, duration: v.duration, thumb: v.thumb, src: v.src })),
    messages: c.messages.map((m) => ({ id: m.id, name: m.name, duration: m.duration, quote: m.quote, src: m.src })),
    products: c.products.map((pr) => ({
      id: pr.id,
      name: pr.name,
      price: pr.price,
      description: pr.description,
      image: pr.image,
      link: pr.link,
    })),
  };
}
