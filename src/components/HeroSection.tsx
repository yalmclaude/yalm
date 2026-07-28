"use client";

import { useEffect, useState } from "react";

const SLOGAN = "Your Amazing Life Moments";

export function HeroSection() {
  const [doorsOpen, setDoorsOpen]       = useState(false);
  const [sloganReady, setSloganReady]   = useState(false);
  const [visibleLetters, setVisibleLetters] = useState(0);

  useEffect(() => {
    // 1.5 s : début ouverture des portes
    const t1 = setTimeout(() => setDoorsOpen(true), 1500);

    // 5.5 s : slogan (après que les portes soient complètement ouvertes)
    const t2 = setTimeout(() => {
      setSloganReady(true);
      let n = 0;
      const iv = setInterval(() => {
        n++;
        setVisibleLetters(n);
        if (n >= SLOGAN.length) clearInterval(iv);
      }, 72);
      return () => clearInterval(iv);
    }, 5500);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        background: "#000",
      }}
    >
      {/* ── Salle de mariage — toujours présente derrière ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/hero-interior.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* ── Porte gauche — glisse vers la gauche ── */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0,
          width: "50%", height: "100%",
          overflow: "hidden",
          transform: doorsOpen ? "translateX(-100%)" : "translateX(0)",
          transition: "transform 3.2s cubic-bezier(0.76, 0, 0.24, 1)",
        }}
      >
        {/* Contenu plein écran clipé par le panneau */}
        <div
          style={{
            position: "absolute",
            top: 0, left: 0,
            width: "200%", height: "100%",
            backgroundImage: "url('/hero-exterior.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </div>

      {/* ── Porte droite — glisse vers la droite ── */}
      <div
        style={{
          position: "absolute",
          top: 0, right: 0,
          width: "50%", height: "100%",
          overflow: "hidden",
          transform: doorsOpen ? "translateX(100%)" : "translateX(0)",
          transition: "transform 3.2s cubic-bezier(0.76, 0, 0.24, 1)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0, right: 0,
            width: "200%", height: "100%",
            backgroundImage: "url('/hero-exterior.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </div>

      {/* ── Slogan ── */}
      <div
        style={{
          position: "absolute", inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          pointerEvents: "none",
          opacity: sloganReady ? 1 : 0,
          transition: "opacity 1.2s ease",
        }}
      >
        <p
          aria-label={SLOGAN}
          style={{
            fontFamily:    "var(--font-script), cursive",
            fontSize:      "clamp(1.9rem, 5.5vw, 4.2rem)",
            color:         "rgba(255,248,220,0.97)",
            letterSpacing: "0.04em",
            lineHeight:    1.4,
            textAlign:     "center",
            padding:       "0 1.5rem",
            textShadow:    "0 2px 50px rgba(0,0,0,0.85)",
          }}
        >
          {SLOGAN.split("").map((ch, i) => (
            <span
              key={i}
              style={{
                display:    "inline-block",
                opacity:    i < visibleLetters ? 1 : 0,
                transform:  i < visibleLetters ? "translateY(0)" : "translateY(14px)",
                transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1)",
                transitionDelay: `${i * 0.013}s`,
              }}
            >
              {ch === " " ? " " : ch}
            </span>
          ))}
        </p>
      </div>

      {/* ── Flèche scroll ── */}
      {visibleLetters >= SLOGAN.length && (
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
          style={{ animation: "heroFadeUp 1s ease both" }}
        >
          <span className="text-[0.55rem] uppercase tracking-[0.3em] text-white/40">
            Découvrir
          </span>
          <div
            className="scroll-arrow"
            style={{
              borderRightColor:  "rgba(255,240,190,0.5)",
              borderBottomColor: "rgba(255,240,190,0.5)",
            }}
          />
        </div>
      )}
    </section>
  );
}
