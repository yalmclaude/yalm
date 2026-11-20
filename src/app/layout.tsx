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

// Runs before first paint, on every full page load of the public site:
// - a reload always opens at the very top (the hero), on phones and desktops alike: the
//   browser's scroll restoration is turned off and a leftover #anchor is dropped;
const SCROLL_BOOT = `try{if(!location.pathname.startsWith("/admin")){history.scrollRestoration="manual";var n=performance.getEntriesByType("navigation")[0];if(n&&n.type==="reload"&&location.hash)history.replaceState(history.state,"",location.pathname+location.search);if(!location.hash)window.scrollTo(0,0);}}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${cormorant.variable} ${montserrat.variable} ${hurricane.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCROLL_BOOT }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
