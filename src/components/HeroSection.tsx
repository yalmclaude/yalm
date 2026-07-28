"use client";

import { useEffect, useRef, useState } from "react";

const SLOGAN = "Your Amazing Life Moments";

const eio = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
const eo  = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef  = useRef({ x: 0.5, y: 0.5 });
  const [visibleLetters, setVisibleLetters] = useState(0);

  // Slogan apparaît à 9 s
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

    // Images
    const imgExt = new window.Image();
    const imgInt = new window.Image();
    imgExt.src = "/hero-exterior.jpg";
    imgInt.src = "/hero-interior.jpg";

    // Bokeh
    const bokeh = Array.from({ length: 65 }, () => ({
      nx: Math.random(), ny: Math.random() * 1.3,
      vy: -(Math.random() * 0.000013 + 0.000004),
      r: Math.random() * 14 + 3,
      alpha: Math.random() * 0.5 + 0.1,
      gold: Math.random() > 0.32,
    }));

    const draw = (ts: number) => {
      const w = canvas.width, h = canvas.height;
      const t = (ts - start) / 1000;
      const mx = mouseRef.current.x, my = mouseRef.current.y;

      // ── Helpers définis ici pour accéder à w, h, ctx ──────
      const drawCover = (img: HTMLImageElement, dx: number, dy: number, dw: number, dh: number) => {
        if (!img.complete || !img.naturalWidth) return;
        const s = Math.max(dw / img.naturalWidth, dh / img.naturalHeight);
        const sw = img.naturalWidth * s, sh = img.naturalHeight * s;
        ctx.drawImage(img, dx + (dw - sw) / 2, dy + (dh - sh) / 2, sw, sh);
      };

      // Dessine une demi-image de l'extérieur à sa position naturelle
      // (le glissement est appliqué via ctx.translate avant l'appel)
      const drawExtHalf = (side: "left" | "right") => {
        if (!imgExt.complete || !imgExt.naturalWidth) return;
        const iw = imgExt.naturalWidth, ih = imgExt.naturalHeight;
        const s  = Math.max(w / iw, h / ih);
        const fw = iw * s, fh = ih * s;
        const ox = (w - fw) / 2, oy = (h - fh) / 2;
        const hw = fw / 2;
        if (side === "left") {
          ctx.drawImage(imgExt, 0,      0, iw / 2, ih, ox,      oy, hw, fh);
        } else {
          ctx.drawImage(imgExt, iw / 2, 0, iw / 2, ih, ox + hw, oy, hw, fh);
        }
      };

      // ── Timeline ───────────────────────────────────────────
      // 0.0 – 1.5s  : extérieur statique
      // 1.5 – 5.5s  : portes s'ouvrent (split)
      // 5.5 – 9.0s  : caméra entre dans la salle (zoom)
      // 9.0s+       : intérieur + parallaxe + slogan
      const doorProg   = clamp(eio((t - 1.5) / 4.0), 0, 1);
      const zoomProg   = clamp(eio((t - 5.5) / 3.5), 0, 1);
      const insideProg = clamp((t - 8.5) / 1.5, 0, 1);
      const extAlpha   = clamp(1 - zoomProg * 2.5, 0, 1);

      ctx.clearRect(0, 0, w, h);

      // ── 1. INTÉRIEUR (fond toujours présent) ──────────────
      {
        const zoom = 1.0 + zoomProg * 0.55;
        const px   = (mx - 0.5) * 45 * insideProg;
        const py   = (my - 0.5) * 22 * insideProg;
        ctx.save();
        ctx.translate(w / 2 + px, h / 2 + py);
        ctx.scale(zoom, zoom);
        ctx.translate(-w / 2, -h / 2);
        drawCover(imgInt, 0, 0, w, h);
        ctx.restore();

        // Vignette
        const vig = ctx.createRadialGradient(w / 2, h / 2, w * 0.18, w / 2, h / 2, w * 0.82);
        vig.addColorStop(0, "rgba(0,0,0,0)");
        vig.addColorStop(1, `rgba(0,0,0,${0.42 * Math.max(zoomProg, 0.1)})`);
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, w, h);
      }

      // ── 2. BOKEH ──────────────────────────────────────────
      if (zoomProg > 0.1) {
        const ba = clamp((zoomProg - 0.1) / 0.5, 0, 1);
        for (const b of bokeh) {
          b.ny += b.vy;
          if (b.ny < -0.1) { b.ny = 1.2; b.nx = Math.random(); }
          const bx = b.nx * w + (mx - 0.5) * 32 * insideProg;
          const by = b.ny * h;
          const c  = b.gold ? "218,165,32" : "255,248,220";
          const gr = ctx.createRadialGradient(bx, by, 0, bx, by, b.r * 3.8);
          gr.addColorStop(0, `rgba(${c},${b.alpha * ba})`);
          gr.addColorStop(1, `rgba(${c},0)`);
          ctx.beginPath(); ctx.arc(bx, by, b.r * 3.8, 0, Math.PI * 2);
          ctx.fillStyle = gr; ctx.fill();
          ctx.beginPath(); ctx.arc(bx, by, b.r * 0.38, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,252,235,${b.alpha * ba * 0.88})`; ctx.fill();
        }
      }

      // ── 3. EXTÉRIEUR — ouverture des portes ───────────────
      if (extAlpha > 0.005 && imgExt.complete && imgExt.naturalWidth) {
        const split = eo(doorProg) * w * 0.62;
        const kb    = 1 + clamp(t / 8, 0, 1) * 0.05; // léger Ken Burns

        ctx.save();
        ctx.globalAlpha = extAlpha;

        // Demi-gauche : clip screen gauche, glisse à gauche
        ctx.save();
        ctx.beginPath(); ctx.rect(0, 0, w / 2, h); ctx.clip();
        ctx.translate(w / 2, h / 2); ctx.scale(kb, kb); ctx.translate(-w / 2, -h / 2);
        ctx.translate(-split, 0);
        drawExtHalf("left");
        ctx.restore();

        // Demi-droite : clip screen droite, glisse à droite
        ctx.save();
        ctx.beginPath(); ctx.rect(w / 2, 0, w / 2, h); ctx.clip();
        ctx.translate(w / 2, h / 2); ctx.scale(kb, kb); ctx.translate(-w / 2, -h / 2);
        ctx.translate(split, 0);
        drawExtHalf("right");
        ctx.restore();

        ctx.restore();

        // Lumière qui jaillit du gap entre les portes
        if (doorProg > 0.06) {
          const ga   = eo(doorProg) * extAlpha;
          const gapW = split * 2.5;
          const glow = ctx.createRadialGradient(w / 2, h * 0.47, 0, w / 2, h * 0.47, gapW * 0.65);
          glow.addColorStop(0,   `rgba(255,228,140,${ga * 0.62})`);
          glow.addColorStop(0.3, `rgba(220,170,55,${ga * 0.22})`);
          glow.addColorStop(1,   "rgba(180,100,20,0)");
          ctx.save();
          ctx.fillStyle = glow;
          ctx.beginPath(); ctx.rect(w / 2 - gapW / 2, 0, gapW, h); ctx.clip();
          ctx.fillRect(0, 0, w, h);
          ctx.restore();
        }
      }

      // ── 4. BLOOM doré à la transition d'entrée ────────────
      if (zoomProg > 0 && zoomProg < 0.55) {
        const rise = eio(clamp(zoomProg / 0.28, 0, 1));
        const fall = 1 - clamp((zoomProg - 0.28) / 0.27, 0, 1);
        const bA   = rise * fall;
        const bloom = ctx.createRadialGradient(w / 2, h * 0.45, 0, w / 2, h * 0.45, w * 0.42);
        bloom.addColorStop(0,   `rgba(255,235,160,${bA * 0.5})`);
        bloom.addColorStop(0.5, `rgba(220,160,50,${bA * 0.15})`);
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
            textShadow:
              "0 0 50px rgba(218,165,32,0.7), 0 0 100px rgba(218,165,32,0.25), 0 2px 50px rgba(0,0,0,0.6)",
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
                transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1), filter 0.7s ease",
              }}
            >
              {ch === " " ? " " : ch}
            </span>
          ))}
        </p>
      </div>

      {/* Flèche scroll */}
      {visibleLetters >= SLOGAN.length && (
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
          style={{ animation: "heroFadeUp 1s ease both" }}
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
