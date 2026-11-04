import type { Metadata } from "next";
import { Cormorant_Garamond, Hurricane, Montserrat } from "next/font/google";
import "./globals.css";
import { CursorEffects } from "@/components/CursorEffects";
import { MotionProvider } from "@/components/motion/MotionProvider";

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

// Runs before first paint: enables the motion system (hidden initial states + GSAP) unless the
// visitor prefers reduced motion, and flags the intro curtain for a first visit of the homepage.
// Failsafe: if the motion system hasn't started after 6s (JS failed), show everything as is.
const MOTION_BOOT = `try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches&&!location.pathname.startsWith("/admin")){var c=document.documentElement.classList;c.add("motion");if(location.pathname==="/"&&!sessionStorage.getItem("yalm-intro"))c.add("intro");setTimeout(function(){if(!window.__yalmMotion)c.remove("motion","intro")},6000)}}catch(e){}`;

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
        <script dangerouslySetInnerHTML={{ __html: MOTION_BOOT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <div
          id="yalm-loader"
          aria-hidden
          className="fixed inset-0 z-[10000] flex-col items-center justify-center bg-bordeaux-rich text-cream"
        >
          <div className="overflow-hidden px-6 pb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              data-loader-word
              src="/logo-cream.png"
              alt=""
              width={1200}
              height={668}
              className="h-auto w-[min(62vw,22rem)]"
            />
          </div>
          <p className="label-caps mt-2 text-cream/60">
            <span data-loader-count>0</span>%
          </p>
        </div>
        {children}
        <MotionProvider />
        <CursorEffects />
      </body>
    </html>
  );
}
