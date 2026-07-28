"use client";

import { useEffect, useRef, useState } from "react";

const SLOGAN = "Your Amazing Life Moments";

const eio    = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
const eo     = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp  = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp   = (a: number, b: number, t: number) => a + (b - a) * t;

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef  = useRef({ x: 0.5, y: 0.5 });
  const [visibleLetters, setVisibleLetters] = useState(0);

  // Slogan lettre par lettre à 9 s
  useEffect(() => {
    const timer = setTimeout(() => {
      let n = 0;
      const iv = setInterval(() => {
        n++;
        setVisibleLetters(n);
        if (n >= SLOGAN.length) clearInterval(iv);
      }, 72);
      return () => clearInterval(iv);
    }, 9000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;
    const start = performance.now();

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", (e) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX / r.width, y: e.clientY / r.height };
    });

    // ── Images ────────────────────────────────────────────────
    const imgExt = new window.Image();
    const imgInt = new window.Image();
    imgExt.src = "/hero-exterior.png";
    imgInt.src = "/hero-interior.png";

    // ── Bokeh flottants ───────────────────────────────────────
    const bokeh = Array.from({ length: 70 }, () => ({
      nx: Math.random(), ny: Math.random() * 1.4,
      vy: -(Math.random() * 0.000014 + 0.000004),
      r:  Math.random() * 13 + 3,
      a:  Math.random() * 0.55 + 0.1,
      gold: Math.random() > 0.3,
      phase: Math.random() * Math.PI * 2,
    }));

    const draw = (ts: number) => {
      const w = canvas.width, h = canvas.height;
      const t = (ts - start) / 1000;
      const mx = mouseRef.current.x, my = mouseRef.current.y;

      // ── Helpers inline (accès à w, h, ctx) ──────────────
      const cover = (img: HTMLImageElement, dx: number, dy: number, dw: number, dh: number) => {
        if (!img.complete || !img.naturalWidth) return;
        const s = Math.max(dw / img.naturalWidth, dh / img.naturalHeight);
        const sw = img.naturalWidth * s, sh = img.naturalHeight * s;
        ctx.drawImage(img, dx + (dw - sw) / 2, dy + (dh - sh) / 2, sw, sh);
      };

      // Une moitié de l'image extérieure à sa position naturelle
      const extHalf = (side: "left" | "right") => {
        if (!imgExt.complete || !imgExt.naturalWidth) return;
        const iw = imgExt.naturalWidth, ih = imgExt.naturalHeight;
        const s  = Math.max(w / iw, h / ih);
        const fw = iw * s, fh = ih * s;
        const ox = (w - fw) / 2, oy = (h - fh) / 2;
        const hw = fw / 2;
        if (side === "left") {
          ctx.drawImage(imgExt, 0, 0, iw / 2, ih, ox, oy, hw, fh);
        } else {
          ctx.drawImage(imgExt, iw / 2, 0, iw / 2, ih, ox + hw, oy, hw, fh);
        }
      };

      // ── Timeline ─────────────────────────────────────────
      // 0.0 – 2.0s  : extérieur statique (légère respiration)
      // 2.0 – 6.5s  : portes s'ouvrent (split horizontal)
      // 6.5 – 9.0s  : caméra entre dans la salle (zoom)
      // 9.0s+       : intérieur + parallaxe + slogan
      const doorProg   = clamp(eio((t - 2.0) / 4.5), 0, 1);
      const zoomProg   = clamp(eio((t - 6.5) / 2.5), 0, 1);
      const insideProg = clamp((t - 8.5) / 1.2, 0, 1);

      // Extérieur disparaît au début du zoom
      const extAlpha = clamp(1 - zoomProg * 3.0, 0, 1);

      ctx.clearRect(0, 0, w, h);

      // ── 1. INTÉRIEUR ─────────────────────────────────────
      if (imgInt.complete && imgInt.naturalWidth) {
        // Légèrement sombre et "lointain" au début, plus proche et brillant en entrant
        const intScale = lerp(0.92, 1.58, eio(zoomProg));
        const px = (mx - 0.5) * 50 * insideProg;
        const py = (my - 0.5) * 25 * insideProg;

        ctx.save();
        ctx.translate(w / 2 + px, h / 2 + py);
        ctx.scale(intScale, intScale);
        ctx.translate(-w / 2, -h / 2);
        cover(imgInt, 0, 0, w, h);
        ctx.restore();

        // Assombrir l'intérieur quand les portes ne sont pas encore ouvertes
        const darkCover = clamp(1 - doorProg * 1.4, 0, 0.72);
        if (darkCover > 0.01) {
          ctx.fillStyle = `rgba(0,0,0,${darkCover})`;
          ctx.fillRect(0, 0, w, h);
        }

        // Vignette cinématique
        const vigStrength = lerp(0, 0.48, Math.max(zoomProg, doorProg * 0.3));
        if (vigStrength > 0.01) {
          const vig = ctx.createRadialGradient(w / 2, h / 2, w * 0.15, w / 2, h / 2, w * 0.85);
          vig.addColorStop(0, "rgba(0,0,0,0)");
          vig.addColorStop(1, `rgba(0,0,0,${vigStrength})`);
          ctx.fillStyle = vig;
          ctx.fillRect(0, 0, w, h);
        }
      } else {
        // Fond noir tant que l'image charge
        ctx.fillStyle = "#080205";
        ctx.fillRect(0, 0, w, h);
      }

      // ── 2. BOKEH (apparaissent progressivement en entrant) ─
      if (zoomProg > 0.08) {
        const ba = clamp((zoomProg - 0.08) / 0.45, 0, 1);
        for (const b of bokeh) {
          b.ny += b.vy;
          if (b.ny < -0.12) { b.ny = 1.18; b.nx = Math.random(); }
          const bx = b.nx * w + (mx - 0.5) * 35 * insideProg;
          const by = b.ny * h;
          const pulse = 0.7 + Math.sin(ts * 0.0012 + b.phase) * 0.3;
          const r = b.r * pulse;
          const c = b.gold ? "218,165,32" : "255,248,215";
          const gr = ctx.createRadialGradient(bx, by, 0, bx, by, r * 4);
          gr.addColorStop(0, `rgba(${c},${b.a * ba * pulse})`);
          gr.addColorStop(1, `rgba(${c},0)`);
          ctx.beginPath(); ctx.arc(bx, by, r * 4, 0, Math.PI * 2);
          ctx.fillStyle = gr; ctx.fill();
          // Coeur brillant
          ctx.beginPath(); ctx.arc(bx, by, r * 0.36, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,252,230,${b.a * ba * 0.92})`; ctx.fill();
        }
      }

      // ── 3. EXTÉRIEUR — split des portes ───────────────────
      if (extAlpha > 0.005 && imgExt.complete && imgExt.naturalWidth) {
        const split = eo(doorProg) * w * 0.65;
        // Légère zoom Ken Burns sur l'extérieur
        const kb    = 1 + clamp(t * 0.005, 0, 0.06);

        ctx.save();
        ctx.globalAlpha = extAlpha;

        // Demi-gauche : glisse à gauche
        ctx.save();
        ctx.beginPath(); ctx.rect(0, 0, w / 2, h); ctx.clip();
        ctx.translate(w / 2, h / 2); ctx.scale(kb, kb); ctx.translate(-w / 2, -h / 2);
        ctx.translate(-split, 0);
        extHalf("left");
        ctx.restore();

        // Demi-droite : glisse à droite
        ctx.save();
        ctx.beginPath(); ctx.rect(w / 2, 0, w / 2, h); ctx.clip();
        ctx.translate(w / 2, h / 2); ctx.scale(kb, kb); ctx.translate(-w / 2, -h / 2);
        ctx.translate(split, 0);
        extHalf("right");
        ctx.restore();

        ctx.restore(); // fin extAlpha

        // Lumière qui inonde le gap entre les portes
        if (doorProg > 0.04) {
          const ga   = eo(doorProg) * extAlpha;
          const gapW = Math.max(4, split * 2.6);

          // Halo central (là où les portes s'ouvrent)
          const glow = ctx.createRadialGradient(w / 2, h * 0.46, 0, w / 2, h * 0.46, gapW * 0.6);
          glow.addColorStop(0,   `rgba(255,232,150,${ga * 0.7})`);
          glow.addColorStop(0.2, `rgba(245,195,80,${ga * 0.35})`);
          glow.addColorStop(0.6, `rgba(210,150,40,${ga * 0.1})`);
          glow.addColorStop(1,   "rgba(160,90,10,0)");
          ctx.save();
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.rect(w / 2 - gapW / 2, 0, gapW, h);
          ctx.clip();
          ctx.fillRect(0, 0, w, h);
          ctx.restore();

          // Rayons de lumière verticaux
          if (ga > 0.15) {
            ctx.save();
            const raysAlpha = (ga - 0.15) * 0.5;
            const rayGrad = ctx.createLinearGradient(0, 0, 0, h);
            rayGrad.addColorStop(0,   `rgba(255,230,140,0)`);
            rayGrad.addColorStop(0.3, `rgba(255,230,140,${raysAlpha})`);
            rayGrad.addColorStop(0.7, `rgba(255,230,140,${raysAlpha})`);
            rayGrad.addColorStop(1,   `rgba(255,230,140,0)`);
            ctx.fillStyle = rayGrad;
            for (let r = -2; r <= 2; r++) {
              const rx = w / 2 + r * (gapW * 0.12);
              const rw = gapW * 0.06;
              ctx.fillRect(rx - rw / 2, 0, rw, h);
            }
            ctx.restore();
          }
        }
      }

      // ── 4. FLASH doré à l'instant du passage ─────────────
      if (zoomProg > 0 && zoomProg < 0.52) {
        const rise = eio(clamp(zoomProg / 0.26, 0, 1));
        const fall = 1 - clamp((zoomProg - 0.26) / 0.26, 0, 1);
        const bA   = rise * fall;
        const bloom = ctx.createRadialGradient(w / 2, h * 0.44, 0, w / 2, h * 0.44, w * 0.45);
        bloom.addColorStop(0,   `rgba(255,240,170,${bA * 0.55})`);
        bloom.addColorStop(0.4, `rgba(220,165,55,${bA * 0.18})`);
        bloom.addColorStop(1,   "rgba(180,90,20,0)");
        ctx.fillStyle = bloom;
        ctx.fillRect(0, 0, w, h);
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Slogan */}
      <div className="relative z-10 text-center px-6" style={{ pointerEvents: "none" }}>
        <p
          aria-label={SLOGAN}
          style={{
            fontFamily:    "var(--font-script), cursive",
            fontSize:      "clamp(1.9rem, 5.5vw, 4.2rem)",
            color:         "rgba(255,248,220,0.97)",
            letterSpacing: "0.04em",
            lineHeight:    1.4,
            textShadow: [
              "0 0 50px rgba(218,165,32,0.75)",
              "0 0 100px rgba(218,165,32,0.3)",
              "0 2px 60px rgba(0,0,0,0.7)",
            ].join(", "),
          }}
        >
          {SLOGAN.split("").map((ch, i) => (
            <span
              key={i}
              style={{
                display:    "inline-block",
                opacity:    i < visibleLetters ? 1 : 0,
                transform:  i < visibleLetters ? "translateY(0) scale(1)" : "translateY(18px) scale(0.75)",
                filter:     i < visibleLetters ? "blur(0)" : "blur(6px)",
                transition: "opacity 0.75s ease, transform 0.75s cubic-bezier(0.22,1,0.36,1), filter 0.75s ease",
                transitionDelay: `${i * 0.01}s`,
              }}
            >
              {ch === " " ? " " : ch}
            </span>
          ))}
        </p>
      </div>

      {/* Flèche scroll */}
      {visibleLetters >= SLOGAN.length && (
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
          style={{ animation: "heroFadeUp 1.2s ease both" }}
        >
          <span className="text-[0.55rem] uppercase tracking-[0.3em] text-white/40">Découvrir</span>
          <div
            className="scroll-arrow"
            style={{ borderRightColor: "rgba(255,240,190,0.5)", borderBottomColor: "rgba(255,240,190,0.5)" }}
          />
        </div>
      )}
    </section>
  );
}
