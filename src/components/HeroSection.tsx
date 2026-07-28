"use client";

import { useEffect, useRef, useState } from "react";

const SLOGAN = "Your Amazing Life Moments";

const eio   = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef  = useRef({ x: 0.5, y: 0.5 });
  const [visibleLetters, setVisibleLetters] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      let n = 0;
      const iv = setInterval(() => {
        n++;
        setVisibleLetters(n);
        if (n >= SLOGAN.length) clearInterval(iv);
      }, 72);
      return () => clearInterval(iv);
    }, 6500);
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

    const imgExt = new window.Image();
    const imgInt = new window.Image();
    imgExt.src = "/hero-exterior.png";
    imgInt.src = "/hero-interior.png";

    // Dessine une image en cover centré
    const cover = (img: HTMLImageElement, dx: number, dy: number, dw: number, dh: number) => {
      if (!img.complete || !img.naturalWidth) return;
      const s  = Math.max(dw / img.naturalWidth, dh / img.naturalHeight);
      const sw = img.naturalWidth * s, sh = img.naturalHeight * s;
      ctx.drawImage(img, dx + (dw - sw) / 2, dy + (dh - sh) / 2, sw, sh);
    };

    const draw = (ts: number) => {
      const w = canvas.width, h = canvas.height;
      const t = (ts - start) / 1000;

      // ── Timeline ─────────────────────────────────────────
      // 0 – 1.2s  : image extérieure statique
      // 1.2 – 4.2s: portes s'ouvrent (split)
      // 4.2 – 6.0s: on entre dans la salle (transition vers intérieur)
      // 6.0s+     : intérieur plein écran + slogan
      const doorProg  = clamp(eio((t - 1.2) / 3.0), 0, 1);
      const enterProg = clamp(eio((t - 4.2) / 1.8), 0, 1);

      ctx.clearRect(0, 0, w, h);

      // ── Intérieur (derrière, toujours présent) ────────────
      cover(imgInt, 0, 0, w, h);

      // ── Extérieur split — demi-gauche et demi-droite ──────
      if (enterProg < 1 && imgExt.complete && imgExt.naturalWidth) {
        const iw = imgExt.naturalWidth, ih = imgExt.naturalHeight;
        const s  = Math.max(w / iw, h / ih);
        const fw = iw * s, fh = ih * s;
        const ox = (w - fw) / 2, oy = (h - fh) / 2;
        const hw = fw / 2;

        // Chaque demi-porte glisse vers son bord + fondu sortant
        const slide = doorProg * w * 0.6;
        const alpha = 1 - enterProg;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Moitié gauche → glisse à gauche
        ctx.save();
        ctx.beginPath(); ctx.rect(0, 0, w / 2, h); ctx.clip();
        ctx.drawImage(imgExt, 0, 0, iw / 2, ih, ox - slide, oy, hw, fh);
        ctx.restore();

        // Moitié droite → glisse à droite
        ctx.save();
        ctx.beginPath(); ctx.rect(w / 2, 0, w / 2, h); ctx.clip();
        ctx.drawImage(imgExt, iw / 2, 0, iw / 2, ih, ox + hw + slide, oy, hw, fh);
        ctx.restore();

        ctx.restore();
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
            textShadow:    "0 2px 40px rgba(0,0,0,0.8)",
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
                transitionDelay: `${i * 0.012}s`,
              }}
            >
              {ch === " " ? " " : ch}
            </span>
          ))}
        </p>
      </div>

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
