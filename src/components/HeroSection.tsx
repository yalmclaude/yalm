"use client";

import { useEffect, useState } from "react";

const SLOGAN = "Your Amazing Life Moments";

export function HeroSection() {
  const [phase, setPhase] = useState(0);
  // 0 : portes fermées
  // 1 : portes s'ouvrent
  // 2 : zoom vers l'intérieur
  // 3 : salle de mariage + slogan
  const [visibleLetters, setVisibleLetters] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1000);   // début ouverture
    const t2 = setTimeout(() => setPhase(2), 3800);   // zoom d'entrée
    const t3 = setTimeout(() => setPhase(3), 5400);   // salle de mariage
    const t4 = setTimeout(() => {
      let n = 0;
      const iv = setInterval(() => {
        n++;
        setVisibleLetters(n);
        if (n >= SLOGAN.length) clearInterval(iv);
      }, 72);
      return () => clearInterval(iv);
    }, 6100);
    return () => {
      clearTimeout(t1); clearTimeout(t2);
      clearTimeout(t3); clearTimeout(t4);
    };
  }, []);

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(1.75rem, 5vw, 4rem) clamp(1rem, 4vw, 2rem)",
        background:
          "radial-gradient(120% 100% at 50% 0%, #fbf3e6 0%, #f2e3cd 55%, #e8d3b3 100%)",
      }}
    >
      {/* ── CADRE : ratio identique aux photos (3:2) → rien n'est rogné ── */}
      <div
        style={{
          position: "relative",
          width: "min(100%, 1160px)",
          aspectRatio: "3 / 2",
          borderRadius: "clamp(10px, 1.6vw, 22px)",
          overflow: "hidden",
          background: "#1a1210",
          boxShadow:
            "0 40px 90px -30px rgba(74,16,21,0.45), 0 0 0 1px rgba(201,162,39,0.35), inset 0 0 0 1px rgba(255,255,255,0.06)",
        }}
      >
        {/* ── IMAGE 2 : salle de mariage — toujours derrière ─────────── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('/hero-interior.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform:  phase >= 3 ? "scale(1)" : "scale(1.07)",
            transition: "transform 2.2s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />

        {/* ── voile sombre qui s'efface à mesure que la salle apparaît ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.3) 100%)",
            opacity: phase >= 3 ? 0 : 1,
            transition: "opacity 1.6s ease",
            zIndex: 1,
          }}
        />

        {/* ── IMAGE 1 : panneau gauche (demi-gauche de l'extérieur) ─ */}
        <div
          style={{
            position: "absolute",
            top: 0, left: 0,
            width: "50%", height: "100%",
            overflow: "hidden",
            transform: phase >= 2
              ? "translateX(-100%) scale(1.16)"
              : phase >= 1
              ? "translateX(-100%)"
              : "translateX(0)",
            transformOrigin: "left center",
            transition: phase >= 2
              ? "transform 1.6s cubic-bezier(0.45, 0, 0.2, 1)"
              : "transform 2.8s cubic-bezier(0.76, 0, 0.24, 1)",
            opacity:    phase >= 3 ? 0 : 1,
            zIndex: 2,
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

        {/* ── IMAGE 1 : panneau droit (demi-droite de l'extérieur) ─ */}
        <div
          style={{
            position: "absolute",
            top: 0, right: 0,
            width: "50%", height: "100%",
            overflow: "hidden",
            transform: phase >= 2
              ? "translateX(100%) scale(1.16)"
              : phase >= 1
              ? "translateX(100%)"
              : "translateX(0)",
            transformOrigin: "right center",
            transition: phase >= 2
              ? "transform 1.6s cubic-bezier(0.45, 0, 0.2, 1)"
              : "transform 2.8s cubic-bezier(0.76, 0, 0.24, 1)",
            opacity:    phase >= 3 ? 0 : 1,
            zIndex: 2,
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

        {/* ── SLOGAN ───────────────────────────────────────────── */}
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
            transition: "opacity 1.4s ease 0.4s",
          }}
        >
          <p
            aria-label={SLOGAN}
            style={{
              fontFamily:    "var(--font-script), cursive",
              fontSize:      "clamp(1.4rem, 4vw, 3.2rem)",
              color:         "rgba(255,248,220,0.97)",
              letterSpacing: "0.04em",
              lineHeight:    1.4,
              textAlign:     "center",
              padding:       "0 1.5rem",
              textShadow:    "0 2px 40px rgba(0,0,0,0.85)",
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
      </div>

      {/* ── Flèche scroll ─────────────────────────────────────── */}
      {visibleLetters >= SLOGAN.length && (
        <div
          className="flex flex-col items-center gap-2"
          style={{ marginTop: "clamp(1.25rem, 3vw, 2.25rem)", animation: "heroFadeUp 1s ease both" }}
        >
          <span className="text-[0.55rem] uppercase tracking-[0.3em] text-bordeaux/50">
            Découvrir
          </span>
          <div
            className="scroll-arrow"
            style={{
              borderRightColor:  "rgba(74,16,21,0.4)",
              borderBottomColor: "rgba(74,16,21,0.4)",
            }}
          />
        </div>
      )}
    </section>
  );
}
