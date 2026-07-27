"use client";

import { useEffect, useState } from "react";

const SLOGAN = "Your Amazing Life Moments";

export function HeroSection() {
  const [visibleLetters, setVisibleLetters] = useState(0);

  useEffect(() => {
    const delay = setTimeout(() => {
      let count = 0;
      const iv = setInterval(() => {
        count++;
        setVisibleLetters(count);
        if (count >= SLOGAN.length) clearInterval(iv);
      }, 65);
      return () => clearInterval(iv);
    }, 1200);
    return () => clearTimeout(delay);
  }, []);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* Very subtle warm radial behind the logo */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -55%)",
          width: "clamp(300px, 55vw, 700px)",
          height: "clamp(300px, 55vw, 700px)",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(74,16,21,0.06) 0%, transparent 70%)",
          animation: "glowPulse 5s ease-in-out infinite",
        }}
      />

      {/* Content */}
      <div className="relative flex flex-col items-center text-center z-10 px-6">

        {/* Logo — reveal puis lévitation douce */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="YALM Events"
          style={{
            width: "clamp(200px, 38vw, 480px)",
            height: "auto",
            display: "block",
            borderRadius: "16px",
            animation:
              "logoReveal 1.3s cubic-bezier(0.22,1,0.36,1) both, logoFloat 5s ease-in-out 1.3s infinite",
          }}
        />

        {/* Divider bordeaux */}
        <div
          style={{
            width: "clamp(36px, 7vw, 70px)",
            height: "1px",
            margin: "2rem 0 1.4rem",
            background:
              "linear-gradient(90deg, transparent, rgba(74,16,21,0.35), transparent)",
            animation: "heroFadeUp 0.8s ease 1.5s both",
          }}
        />

        {/* Your Amazing Life Moments — Great Vibes, bordeaux, lettre par lettre */}
        <p
          aria-label={SLOGAN}
          style={{
            fontFamily: "var(--font-script), cursive",
            fontSize: "clamp(1.7rem, 4.2vw, 3.2rem)",
            color: "rgba(74,16,21,0.88)",
            letterSpacing: "0.03em",
            lineHeight: 1.4,
            textShadow: "0 2px 18px rgba(74,16,21,0.1)",
          }}
        >
          {SLOGAN.split("").map((ch, i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                opacity: i < visibleLetters ? 1 : 0,
                transform:
                  i < visibleLetters
                    ? "translateY(0) scale(1)"
                    : "translateY(12px) scale(0.82)",
                filter: i < visibleLetters ? "blur(0)" : "blur(6px)",
                transition:
                  "opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1), filter 0.5s ease",
              }}
            >
              {ch === " " ? " " : ch}
            </span>
          ))}
        </p>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        style={{ animation: "heroFadeUp 1s ease 2.6s both" }}
      >
        <span className="text-[0.55rem] uppercase tracking-[0.3em] text-bordeaux/35">
          Découvrir
        </span>
        <div className="scroll-arrow" />
      </div>
    </section>
  );
}
