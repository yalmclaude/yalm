"use client";

import { useEffect, useRef, useState } from "react";

const SLOGAN = "Your Amazing Life Moments";

// Chandelier positions (normalized x across screen)
const CHANDELIERS = [0.18, 0.5, 0.82];

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ nx: 0, ny: 0 });
  const [visibleLetters, setVisibleLetters] = useState(0);

  // Letter-by-letter slogan reveal
  useEffect(() => {
    const delay = setTimeout(() => {
      let count = 0;
      const iv = setInterval(() => {
        count++;
        setVisibleLetters(count);
        if (count >= SLOGAN.length) clearInterval(iv);
      }, 65);
      return () => clearInterval(iv);
    }, 1900);
    return () => clearTimeout(delay);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Bokeh — chandelier crystals & fairy lights, sorted far→near once
    const bokeh = Array.from({ length: 75 }, () => ({
      nx: Math.random(),
      ny: Math.random() * 1.3,
      vy: -(Math.random() * 0.000016 + 0.000005),
      vx: (Math.random() - 0.5) * 0.000005,
      r: Math.random() * 14 + 2,
      alpha: Math.random() * 0.55 + 0.12,
      z: Math.random(),
      gold: Math.random() > 0.38, // gold vs warm white
    }));
    bokeh.sort((a, b) => a.z - b.z);

    // Fairy lights — twinkling sparkles distributed across the hall
    const fairy = Array.from({ length: 65 }, () => ({
      nx: Math.random(),
      ny: Math.random(),
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.04 + 0.008,
      maxAlpha: Math.random() * 0.95 + 0.05,
    }));

    let nextShoot = 2200;
    let lastTime = 0;
    const shooters: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number }[] = [];

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        nx: (e.clientX - rect.left) / rect.width * 2 - 1,
        ny: (e.clientY - rect.top) / rect.height * 2 - 1,
      };
    });
    canvas.addEventListener("mouseleave", () => {
      mouseRef.current = { nx: 0, ny: 0 };
    });

    // Triangular spotlight cone from a chandelier on the ceiling
    const drawSpotlight = (cxNorm: number, w: number, h: number, intensity: number) => {
      const cx = cxNorm * w;
      const spread = w * 0.21;
      ctx.save();
      const g = ctx.createRadialGradient(cx, 0, 0, cx, 0, h * 0.92);
      g.addColorStop(0, `rgba(201,162,39,${0.22 * intensity})`);
      g.addColorStop(0.25, `rgba(201,162,39,${0.09 * intensity})`);
      g.addColorStop(0.6, `rgba(201,162,39,${0.03 * intensity})`);
      g.addColorStop(1, "rgba(201,162,39,0)");
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx - spread, h);
      ctx.lineTo(cx + spread, h);
      ctx.closePath();
      ctx.fillStyle = g;
      ctx.fill();
      ctx.restore();

      // Halo at ceiling
      const halo = ctx.createRadialGradient(cx, 0, 0, cx, 0, w * 0.14);
      halo.addColorStop(0, `rgba(255,240,180,${0.18 * intensity})`);
      halo.addColorStop(1, "rgba(201,162,39,0)");
      ctx.beginPath();
      ctx.arc(cx, 0, w * 0.14, 0, Math.PI * 2);
      ctx.fillStyle = halo;
      ctx.fill();
    };

    const draw = (ts: number) => {
      const w = canvas.width, h = canvas.height;
      const dt = Math.min(ts - lastTime, 50);
      lastTime = ts;
      ctx.clearRect(0, 0, w, h);

      const { nx: mnx, ny: mny } = mouseRef.current;

      // Chandelier spotlights — subtle parallax on beams too
      for (const c of CHANDELIERS) {
        const shift = mnx * 0.012;
        drawSpotlight(c + shift, w, h, 1.0);
      }

      // Bokeh particles with depth parallax
      for (const b of bokeh) {
        b.ny += b.vy * dt;
        b.nx += b.vx * dt;
        if (b.ny < -0.15) { b.ny = 1.18; b.nx = Math.random(); }
        if (b.nx < -0.1) b.nx = 1.1;
        if (b.nx > 1.1) b.nx = -0.1;

        const scale = 0.22 + b.z * 0.78;
        const px = b.nx * w + mnx * b.z * 58;
        const py = b.ny * h + mny * b.z * 38;
        const r = b.r * scale;
        const c = b.gold ? [201, 162, 39] : [255, 248, 220];

        const gr = ctx.createRadialGradient(px, py, 0, px, py, r * 4);
        gr.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${b.alpha})`);
        gr.addColorStop(0.3, `rgba(${c[0]},${c[1]},${c[2]},${b.alpha * 0.45})`);
        gr.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
        ctx.beginPath();
        ctx.arc(px, py, r * 4, 0, Math.PI * 2);
        ctx.fillStyle = gr;
        ctx.fill();

        // Bright specular point
        ctx.beginPath();
        ctx.arc(px, py, Math.max(r * 0.45, 0.8), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,252,235,${b.alpha * 0.92})`;
        ctx.fill();
      }

      // Shooting stars
      nextShoot -= dt;
      if (nextShoot <= 0) {
        const a = Math.random() * Math.PI * 0.3 + Math.PI * 0.1;
        shooters.push({ x: Math.random() * w * 0.6, y: Math.random() * h * 0.5, vx: Math.cos(a) * 8, vy: Math.sin(a) * 3, life: 0, maxLife: 40 + Math.random() * 30 });
        nextShoot = 3000 + Math.random() * 5500;
      }
      for (let i = shooters.length - 1; i >= 0; i--) {
        const s = shooters[i];
        s.x += s.vx; s.y += s.vy; s.life++;
        const p = s.life / s.maxLife;
        const a = p < 0.2 ? p / 0.2 : p > 0.7 ? 1 - (p - 0.7) / 0.3 : 1;
        const g = ctx.createLinearGradient(s.x - s.vx * 15, s.y - s.vy * 15, s.x, s.y);
        g.addColorStop(0, "rgba(201,162,39,0)");
        g.addColorStop(1, `rgba(255,242,165,${a * 0.9})`);
        ctx.beginPath();
        ctx.moveTo(s.x - s.vx * 15, s.y - s.vy * 15);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.8;
        ctx.stroke();
        if (s.life >= s.maxLife) shooters.splice(i, 1);
      }

      // Fairy light twinkles — 4-point stars
      for (const sp of fairy) {
        sp.phase += sp.speed;
        const a = (Math.sin(sp.phase) * 0.5 + 0.5) * sp.maxAlpha;
        if (a < 0.04) continue;
        const px = sp.nx * w, py = sp.ny * h;
        ctx.beginPath();
        ctx.arc(px, py, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,248,210,${a})`;
        ctx.fill();
        const len = 3 + a * 8;
        ctx.strokeStyle = `rgba(255,248,210,${a * 0.5})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(px - len, py); ctx.lineTo(px + len, py);
        ctx.moveTo(px, py - len * 0.75); ctx.lineTo(px, py + len * 0.75);
        ctx.stroke();
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
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{ animation: "hallEntrance 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both" }}
    >
      {/* Deep dark hall background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #060102 0%, #160407 18%, #2a0810 44%, #200709 72%, #0e0204 100%)",
        }}
      />

      {/* Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Warm floor glow — candlelit tables */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: "28%",
          background:
            "linear-gradient(0deg, rgba(201,162,39,0.07) 0%, rgba(201,162,39,0.02) 60%, transparent 100%)",
        }}
      />

      {/* Edge vignette — depth of field */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, transparent 42%, rgba(4,0,1,0.6) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative flex flex-col items-center text-center" style={{ zIndex: 2 }}>

        {/* yalm — Cormorant Garamond lowercase, like the logo */}
        <h1
          className="select-none font-serif"
          style={{
            fontSize: "clamp(5.5rem, 25vw, 24rem)",
            fontWeight: 300,
            letterSpacing: "0.06em",
            lineHeight: 1,
            background:
              "linear-gradient(90deg, #c8b898, #f0e6d0, #e4d8be, #faf5ec, #e4d8be, #f0e6d0, #c8b898)",
            backgroundSize: "250% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation:
              "goldShimmer 7s linear infinite, yalmIn 1.4s cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          yalm
        </h1>

        {/* "events" in small caps — faithful to the logo */}
        <p
          style={{
            fontFamily: "var(--font-jost), sans-serif",
            fontSize: "clamp(0.5rem, 1.1vw, 0.82rem)",
            fontWeight: 500,
            letterSpacing: "0.48em",
            color: "rgba(240,230,205,0.5)",
            textTransform: "uppercase",
            marginTop: "0.25em",
            animation: "heroFadeUp 0.8s ease 1.3s both",
          }}
        >
          events
        </p>

        {/* Gold divider */}
        <div
          style={{
            width: "clamp(36px, 7vw, 72px)",
            height: "1px",
            margin: "1.1em 0 0.75em",
            background:
              "linear-gradient(90deg, transparent, rgba(201,162,39,0.55), transparent)",
            animation: "heroFadeUp 0.8s ease 1.6s both",
          }}
        />

        {/* "Your Amazing Life Moments" — Great Vibes, warm beige */}
        <p
          aria-label={SLOGAN}
          style={{
            fontFamily: "var(--font-script), cursive",
            fontSize: "clamp(1.8rem, 4.6vw, 3.5rem)",
            color: "rgba(240,228,202,0.92)",
            letterSpacing: "0.03em",
            lineHeight: 1.4,
            textShadow:
              "0 0 40px rgba(201,162,39,0.4), 0 0 90px rgba(201,162,39,0.15)",
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
                    : "translateY(14px) scale(0.8)",
                filter: i < visibleLetters ? "blur(0)" : "blur(7px)",
                transition:
                  "opacity 0.55s ease, transform 0.55s cubic-bezier(0.22,1,0.36,1), filter 0.55s ease",
              }}
            >
              {ch === " " ? " " : ch}
            </span>
          ))}
        </p>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ zIndex: 2, animation: "heroFadeUp 1s ease 3s both" }}
      >
        <span className="text-[0.55rem] uppercase tracking-[0.3em] text-white/28">
          Découvrir
        </span>
        <div className="scroll-arrow" />
      </div>
    </section>
  );
}
