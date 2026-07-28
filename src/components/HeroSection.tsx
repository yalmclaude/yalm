"use client";

import { useEffect, useRef, useState } from "react";

const SLOGAN = "Your Amazing Life Moments";
const SCROLL_LENGTH_VH = 240; // hauteur de scroll consacrée à l'effet (en % de viewport)

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

// easing doux pour la bande de pellicule (accélère puis ralentit en douceur)
function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const sprocketTopRef = useRef<HTMLDivElement>(null);
  const sprocketBottomRef = useRef<HTMLDivElement>(null);
  const reelLeftRef = useRef<HTMLDivElement>(null);
  const reelRightRef = useRef<HTMLDivElement>(null);
  const sloganRef = useRef<HTMLDivElement>(null);

  const [revealed, setRevealed] = useState(false); // true une fois la pellicule totalement déroulée
  const revealedRef = useRef(false);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const scrollable = section.offsetHeight - window.innerHeight;
      const progress = scrollable > 0 ? clamp(-rect.top / scrollable, 0, 1) : 0;

      // la bande défile de 0 (porte) à -50% (salle) — easing léger pour un mouvement de bobine fluide
      const strip = smoothstep(0, 1, progress);
      if (stripRef.current) {
        stripRef.current.style.transform = `translateX(${-strip * 50}%)`;
      }
      // perforations : même mouvement, légèrement amplifié pour l'effet parallax de pellicule
      const sprocketX = -strip * 55;
      if (sprocketTopRef.current) sprocketTopRef.current.style.transform = `translateX(${sprocketX}%)`;
      if (sprocketBottomRef.current) sprocketBottomRef.current.style.transform = `translateX(${sprocketX}%)`;

      // bobines qui tournent au fil du scroll
      const reelDeg = progress * 620;
      if (reelLeftRef.current) reelLeftRef.current.style.transform = `translateY(-50%) rotate(${reelDeg}deg)`;
      if (reelRightRef.current) reelRightRef.current.style.transform = `translateY(-50%) rotate(${-reelDeg}deg)`;

      // slogan : apparaît en douceur une fois la salle presque révélée
      const sloganT = smoothstep(0.82, 1, progress);
      if (sloganRef.current) {
        sloganRef.current.style.opacity = String(sloganT);
        sloganRef.current.style.transform = `translateY(${(1 - sloganT) * 16}px)`;
      }

      if (progress >= 0.995 !== revealedRef.current) {
        revealedRef.current = progress >= 0.995;
        setRevealed(revealedRef.current);
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={sectionRef} style={{ position: "relative", height: `${SCROLL_LENGTH_VH}vh` }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          padding: "clamp(1.5rem, 4vw, 3rem) clamp(1rem, 4vw, 2rem)",
          background: "radial-gradient(120% 100% at 50% 0%, #fbf3e6 0%, #f2e3cd 55%, #e8d3b3 100%)",
        }}
      >
        <div style={{ position: "relative", width: "min(100%, 1100px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* ── bobine gauche ─────────────────────────────────────── */}
          <div
            ref={reelLeftRef}
            className="hero-reel"
            style={{ position: "absolute", left: "clamp(-56px, -6vw, -20px)", top: "50%", transform: "translateY(-50%)" }}
          />

          {/* ── CADRE : ratio identique aux photos (3:2) ─────────── */}
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "3 / 2",
              borderRadius: "clamp(8px, 1.2vw, 16px)",
              overflow: "hidden",
              background: "#1a1210",
              boxShadow:
                "0 40px 90px -30px rgba(74,16,21,0.45), 0 0 0 1px rgba(201,162,39,0.35), inset 0 0 0 1px rgba(255,255,255,0.06)",
            }}
          >
            {/* ── bande de pellicule : porte + salle, l'une à côté de l'autre ── */}
            <div ref={stripRef} style={{ position: "absolute", inset: 0, width: "200%", height: "100%", display: "flex", willChange: "transform" }}>
              <div style={{ width: "50%", height: "100%", backgroundImage: "url('/hero-exterior.png')", backgroundSize: "cover", backgroundPosition: "center" }} />
              <div style={{ width: "50%", height: "100%", backgroundImage: "url('/hero-interior.png')", backgroundSize: "cover", backgroundPosition: "center" }} />
              {/* séparateur de frame façon pellicule : solidaire de la bande, toujours pile entre les 2 photos */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  width: "10px",
                  height: "100%",
                  marginLeft: "-5px",
                  background: "rgba(10,6,5,0.9)",
                  boxShadow: "0 0 0 1px rgba(201,162,39,0.4)",
                  zIndex: 3,
                }}
              />
            </div>

            {/* ── perforations haut / bas, façon 35mm ──────────────── */}
            <div
              ref={sprocketTopRef}
              style={{
                position: "absolute",
                top: 0, left: 0,
                width: "220%", height: "clamp(8px, 2.2%, 16px)",
                background: "rgba(8,5,4,0.92)",
                backgroundImage: "radial-gradient(circle, rgba(250,246,240,0.9) 34%, transparent 36%)",
                backgroundSize: "26px 100%",
                backgroundPosition: "10px center",
                zIndex: 4,
              }}
            />
            <div
              ref={sprocketBottomRef}
              style={{
                position: "absolute",
                bottom: 0, left: 0,
                width: "220%", height: "clamp(8px, 2.2%, 16px)",
                background: "rgba(8,5,4,0.92)",
                backgroundImage: "radial-gradient(circle, rgba(250,246,240,0.9) 34%, transparent 36%)",
                backgroundSize: "26px 100%",
                backgroundPosition: "10px center",
                zIndex: 4,
              }}
            />

            {/* ── voile pour la lisibilité du slogan ───────────────── */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.02) 30%, rgba(0,0,0,0.3) 100%)",
                zIndex: 2,
              }}
            />

            {/* ── SLOGAN ────────────────────────────────────────────── */}
            <div
              ref={sloganRef}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 5,
                pointerEvents: "none",
                opacity: 0,
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-script), cursive",
                  fontSize: "clamp(1.4rem, 4vw, 3.2rem)",
                  color: "rgba(255,248,220,0.97)",
                  letterSpacing: "0.04em",
                  lineHeight: 1.4,
                  textAlign: "center",
                  padding: "0 1.5rem",
                  textShadow: "0 2px 40px rgba(0,0,0,0.85)",
                }}
              >
                {SLOGAN}
              </p>
            </div>
          </div>

          {/* ── bobine droite ─────────────────────────────────────── */}
          <div
            ref={reelRightRef}
            className="hero-reel"
            style={{ position: "absolute", right: "clamp(-56px, -6vw, -20px)", top: "50%", transform: "translateY(-50%)" }}
          />
        </div>

        {/* ── indication de scroll (avant la révélation complète) ── */}
        <div
          style={{
            marginTop: "clamp(1rem, 3vw, 1.75rem)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
            opacity: revealed ? 0 : 1,
            transition: "opacity 0.5s ease",
          }}
        >
          <span className="text-[0.55rem] uppercase tracking-[0.3em] text-bordeaux/50">
            Scrollez pour ouvrir les portes
          </span>
          <div
            className="scroll-arrow"
            style={{ borderRightColor: "rgba(74,16,21,0.4)", borderBottomColor: "rgba(74,16,21,0.4)" }}
          />
        </div>
      </div>
    </section>
  );
}
