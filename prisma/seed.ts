import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const categories = [
  { slug: "visuel", name: "Visuel & Souvenirs", order: 0 },
  { slug: "animation-bar", name: "Animation & Bars", order: 1 },
  { slug: "signaletique", name: "Signalétique", order: 2 },
  { slug: "autre", name: "Autre", order: 3 },
];

const availableProducts = [
  {
    slug: "photobooth-360",
    name: "Photobooth 360°",
    categorySlug: "visuel",
    description: "Vidéos immersives à 360° pour des souvenirs uniques de votre événement.",
    priceCents: 45000,
    depositType: "PERCENT" as const,
    depositValue: 30,
    totalQuantity: 2,
  },
  {
    slug: "photobooth-normal",
    name: "Photobooth normal / Box photo",
    categorySlug: "visuel",
    description: "Box photo avec impression instantanée pour vos invités.",
    priceCents: 35000,
    depositType: "PERCENT" as const,
    depositValue: 30,
    totalQuantity: 3,
  },
  {
    slug: "livre-or-audio",
    name: "Livre d'or audio",
    categorySlug: "visuel",
    description: "Enregistrement de messages vocaux par vos invités, un souvenir précieux.",
    priceCents: 15000,
    depositType: "FIXED" as const,
    depositValue: 5000,
    totalQuantity: 4,
  },
  {
    slug: "photo-video",
    name: "Prestations Photos & Vidéos",
    categorySlug: "visuel",
    description: "Photographe et vidéaste professionnels présents physiquement à votre événement.",
    priceCents: 80000,
    depositType: "PERCENT" as const,
    depositValue: 30,
    totalQuantity: 2,
  },
  {
    slug: "fontaine-bienvenue",
    name: "Fontaine de bienvenue",
    categorySlug: "animation-bar",
    description: "Fontaine spectaculaire pour accueillir vos invités avec élégance.",
    priceCents: 25000,
    depositType: "PERCENT" as const,
    depositValue: 30,
    totalQuantity: 1,
  },
  {
    slug: "bar-halal",
    name: "Bar Halal",
    categorySlug: "animation-bar",
    description: "Mocktails et boissons sans alcool préparés par nos bartenders.",
    priceCents: 60000,
    depositType: "PERCENT" as const,
    depositValue: 30,
    totalQuantity: 2,
  },
  {
    slug: "bar-personnalise",
    name: "Bar personnalisé",
    categorySlug: "animation-bar",
    description: "Bar sur mesure avec logos, prénoms et thématique adaptés à votre événement.",
    priceCents: 70000,
    depositType: "PERCENT" as const,
    depositValue: 30,
    totalQuantity: 1,
  },
  {
    slug: "planche-cocktails",
    name: "Planche de cocktails",
    categorySlug: "animation-bar",
    description: "Présentation et dégustation de cocktails raffinés pour vos invités.",
    priceCents: 40000,
    depositType: "PERCENT" as const,
    depositValue: 30,
    totalQuantity: 2,
  },
  {
    slug: "plexiglas-personnalise",
    name: "Plexiglas personnalisé",
    categorySlug: "signaletique",
    description: "Panneaux de bienvenue, menus et plans de table en plexiglas sur mesure.",
    priceCents: 20000,
    depositType: "FIXED" as const,
    depositValue: 8000,
    totalQuantity: 3,
  },
];

const unavailableProducts = [
  {
    slug: "decorations",
    name: "Décorations",
    categorySlug: "autre",
    description: "Décoration complète pour votre événement.",
    priceCents: 0,
    depositType: "PERCENT" as const,
    depositValue: 30,
    totalQuantity: 0,
  },
  {
    slug: "petits-fours",
    name: "Petits fours",
    categorySlug: "autre",
    description: "Service traiteur de petits fours pour vos invités.",
    priceCents: 0,
    depositType: "PERCENT" as const,
    depositValue: 30,
    totalQuantity: 0,
  },
  {
    slug: "location-vaisselle",
    name: "Location de vaisselle",
    categorySlug: "autre",
    description: "Location de vaisselle haut de gamme pour votre événement.",
    priceCents: 0,
    depositType: "PERCENT" as const,
    depositValue: 30,
    totalQuantity: 0,
  },
  {
    slug: "barnum",
    name: "Barnum",
    categorySlug: "autre",
    description: "Location de tentes et tonnelles pour vos événements en extérieur.",
    priceCents: 0,
    depositType: "PERCENT" as const,
    depositValue: 30,
    totalQuantity: 0,
  },
];

async function main() {
  const categoryIdBySlug: Record<string, string> = {};
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, order: category.order },
      create: category,
    });
    categoryIdBySlug[category.slug] = created.id;
  }

  const allProducts = [
    ...availableProducts.map((p) => ({ ...p, isAvailable: true })),
    ...unavailableProducts.map((p) => ({ ...p, isAvailable: false })),
  ];

  const productIdBySlug: Record<string, string> = {};
  for (const { categorySlug, ...product } of allProducts) {
    const categoryId = categoryIdBySlug[categorySlug];
    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: { ...product, categoryId },
      create: { ...product, categoryId },
    });
    productIdBySlug[product.slug] = created.id;
  }

  const howItWorksSteps = [
    {
      order: 0,
      title: "Choisissez votre prestation",
      description: "Parcourez notre catalogue et sélectionnez les services adaptés à votre événement.",
    },
    {
      order: 1,
      title: "Vérifiez la date",
      description:
        "Chaque prestation a son propre calendrier ; certaines disposent de plusieurs unités disponibles.",
    },
    {
      order: 2,
      title: "Bloquez la date",
      description:
        "Un acompte est nécessaire pour valider définitivement votre réservation et verrouiller la date.",
    },
  ];

  const existingSteps = await prisma.howItWorksStep.count();
  if (existingSteps === 0) {
    for (const step of howItWorksSteps) {
      await prisma.howItWorksStep.create({ data: step });
    }
  }

  const examplePack = {
    slug: "formule-mariage-essentielle",
    name: "Formule Mariage Essentielle",
    description: "Photobooth, bar personnalisé et signalétique réunis dans une formule avantageuse.",
    priceCents: 130000,
    depositType: "PERCENT" as const,
    depositValue: 30,
    isAvailable: true,
    items: [
      { slug: "photobooth-normal", quantity: 1 },
      { slug: "bar-personnalise", quantity: 1 },
      { slug: "plexiglas-personnalise", quantity: 1 },
    ],
  };

  const pack = await prisma.pack.upsert({
    where: { slug: examplePack.slug },
    update: {
      name: examplePack.name,
      description: examplePack.description,
      priceCents: examplePack.priceCents,
      depositType: examplePack.depositType,
      depositValue: examplePack.depositValue,
      isAvailable: examplePack.isAvailable,
    },
    create: {
      slug: examplePack.slug,
      name: examplePack.name,
      description: examplePack.description,
      priceCents: examplePack.priceCents,
      depositType: examplePack.depositType,
      depositValue: examplePack.depositValue,
      isAvailable: examplePack.isAvailable,
    },
  });

  for (const item of examplePack.items) {
    const productId = productIdBySlug[item.slug];
    if (!productId) continue;
    await prisma.packItem.upsert({
      where: { packId_productId: { packId: pack.id, productId } },
      update: { quantity: item.quantity },
      create: { packId: pack.id, productId, quantity: item.quantity },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
