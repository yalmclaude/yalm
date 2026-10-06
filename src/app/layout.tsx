import type { Metadata } from "next";
import { Cormorant_Garamond, Hurricane, Montserrat } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Brush signature used for headlines, matching the "Créons ensemble vos moments inoubliables" banner.
const hurricane = Hurricane({
  variable: "--font-hurricane",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "YALM — Prestations événementielles haut de gamme",
  description:
    "Réservez vos prestations événementielles : photobooth, bars, animations et signalétique sur mesure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${cormorant.variable} ${montserrat.variable} ${hurricane.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
