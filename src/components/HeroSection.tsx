"use client";

import { useEffect, useState } from "react";

const SLOGAN = "Your Amazing Life Moments";

export function HeroSection() {
  // 0 = exterior immobile
  // 1 = portes s'ouvrent
  // 2 = zoom / entrée dans la salle
  // 3 = interior plein écran + slogan
  const [phase, setPhase] = useState(0);
  const [visibleLetters, setVisibleLetters] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1500);   // ouverture des portes
    const t2 = setTimeout(() => setPhase(2), 4800);   // zoom d'entrée
    const t3 = setTimeout(() => setPhase(3), 6500);   // interior + slogan
    const t4 = setTimeout(() => {
      let n = 0;
      const iv = setInterval(() => {
        n++;
        setVisibleLetters(n);
        if (n >= SLOGAN.length) clearInterval(iv);
      }, 72);
      return () => clearInterval(iv);
    }, 7200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
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
      {/* ── Interior — apparaît après le zoom ─────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/hero-interior.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity:    phase >= 3 ? 1 : 0,
          transform:  phase >= 3 ? "scale(1)" : "scale(1.08)",
          transition: "opacity 1.4s ease, transform 1.4s ease",
        }}
      />

      {/* ── Couche extérieure : image + portes + zoom ──────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          // zoom d'entrée : on "fonce" vers l'intérieur
          transform:  phase >= 2 ? "scale(2.8)" : "scale(1)",
          transition: phase >= 2
            ? "transform 1.8s cubic-bezier(0.4, 0, 1, 1)"
            : "none",
          transformOrigin: "center center",
          // disparaît quand l'interior prend le relais
          opacity:    phase >= 3 ? 0 : 1,
        }}
      >
        {/* Image exterior complète — visible quand les portes ne couvrent pas tout */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('/hero-exterior.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Porte gauche — glisse à gauche */}
        <div
          style={{
            position: "absolute",
            top: 0, left: 0,
            width: "50%", height: "100%",
            overflow: "hidden",
            transform:  phase >= 1 ? "translateX(-100%)" : "translateX(0)",
            transition: "transform 3.2s cubic-bezier(0.76, 0, 0.24, 1)",
          }}
        >
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

        {/* Porte droite — glisse à droite */}
        <div
          style={{
            position: "absolute",
            top: 0, right: 0,
            width: "50%", height: "100%",
            overflow: "hidden",
            transform:  phase >= 1 ? "translateX(100%)" : "translateX(0)",
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
      </div>

      {/* ── Slogan ──────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          pointerEvents: "none",
          opacity:    phase >= 3 ? 1 : 0,
          transition: "opacity 1.4s ease 0.6s",
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
              {ch === " " ? " " : ch}
            </span>
          ))}
        </p>
      </div>

      {/* ── Flèche scroll ────────────────────────────────────── */}
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
