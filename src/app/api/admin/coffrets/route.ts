import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const coffrets = await prisma.coffret.findMany({
    orderBy: { updatedAt: "desc" },
    select: { slug: true, names: true, date: true, location: true, code: true, updatedAt: true },
  });
  return NextResponse.json({
    coffrets: coffrets.map((c) => ({ ...c, updatedAt: c.updatedAt.getTime() })),
  });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const { slug, names, date, location, code, cover, final, categories, photos, videos, messages, products } = body;

  if (!slug) {
    return NextResponse.json({ error: "Slug manquant" }, { status: 400 });
  }

  const coffret = await prisma.$transaction(async (tx) => {
    const saved = await tx.coffret.upsert({
      where: { slug },
      create: {
        slug,
        names: names ?? "",
        date: date ?? "",
        location: location ?? "",
        code: code ?? "",
        cover: cover ?? "",
        final: final ?? "",
        categories: Array.isArray(categories) ? categories : undefined,
      },
      update: {
        names: names ?? "",
        date: date ?? "",
        location: location ?? "",
        code: code ?? "",
        cover: cover ?? "",
        final: final ?? "",
        categories: Array.isArray(categories) ? categories : undefined,
      },
    });

    await tx.coffretPhoto.deleteMany({ where: { coffretId: saved.id } });
    await tx.coffretVideo.deleteMany({ where: { coffretId: saved.id } });
    await tx.coffretMessage.deleteMany({ where: { coffretId: saved.id } });
    await tx.coffretProduct.deleteMany({ where: { coffretId: saved.id } });

    if (Array.isArray(photos) && photos.length > 0) {
      await tx.coffretPhoto.createMany({
        data: photos.map((p: { category?: string; src?: string }, i: number) => ({
          coffretId: saved.id,
          category: p.category ?? "",
          src: p.src ?? "",
          order: i,
        })),
      });
    }
    if (Array.isArray(videos) && videos.length > 0) {
      await tx.coffretVideo.createMany({
        data: videos.map(
          (v: { title?: string; duration?: string; thumb?: string; src?: string }, i: number) => ({
            coffretId: saved.id,
            title: v.title ?? "",
            duration: v.duration ?? "",
            thumb: v.thumb ?? "",
            src: v.src ?? "",
            order: i,
          })
        ),
      });
    }
    if (Array.isArray(messages) && messages.length > 0) {
      await tx.coffretMessage.createMany({
        data: messages.map(
          (m: { name?: string; duration?: number; quote?: string; src?: string }, i: number) => ({
            coffretId: saved.id,
            name: m.name ?? "",
            duration: Number(m.duration) || 30,
            quote: m.quote ?? "",
            src: m.src ?? "",
            order: i,
          })
        ),
      });
    }
    if (Array.isArray(products) && products.length > 0) {
      await tx.coffretProduct.createMany({
        data: products.map(
          (
            pr: { name?: string; price?: string; description?: string; image?: string; link?: string },
            i: number
          ) => ({
            coffretId: saved.id,
            name: pr.name ?? "",
            price: pr.price ?? "",
            description: pr.description ?? "",
            image: pr.image ?? "",
            link: pr.link ?? "",
            order: i,
          })
        ),
      });
    }

    return saved;
  });

  return NextResponse.json({ slug: coffret.slug });
}
