"use client";

import { useEffect, useRef, useState } from "react";

const SLOGAN = "Your Amazing Life Moments";

const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const [visibleLetters, setVisibleLetters] = useState(0);

  // Slogan démarre à 8s (après l'entrée dans la salle)
  useEffect(() => {
    const t = setTimeout(() => {
      let n = 0;
      const iv = setInterval(() => {
        n++;
        setVisibleLetters(n);
        if (n >= SLOGAN.length) clearInterval(iv);
      }, 70);
      return () => clearInterval(iv);
    }, 8000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;
    const start = performance.now();

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    canvas.addEventListener("mousemove", (e) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX / r.width, y: e.clientY / r.height };
    });

    // Bokeh for interior
    const bokeh = Array.from({ length: 65 }, () => ({
      nx: Math.random(), ny: Math.random() * 1.2,
      vy: -(Math.random() * 0.000016 + 0.000005),
      r: Math.random() * 12 + 2,
      alpha: Math.random() * 0.55 + 0.12,
      gold: Math.random() > 0.38,
    }));

    // Fairy lights (fixed positions on walls)
    const fairyL = Array.from({ length: 70 }, () => ({
      nx: Math.random(), ny: Math.random(),
      phase: Math.random() * Math.PI * 2,
      spd: Math.random() * 0.04 + 0.01,
    }));

    // Stars for exterior sky
    const stars = Array.from({ length: 55 }, (_, i) => ({
      x: ((i * 137.508) % 1),
      y: ((i * 97.3) % 0.55),
      r: Math.random() * 1.2 + 0.4,
      phase: Math.random() * Math.PI * 2,
    }));

    const draw = (ts: number) => {
      const w = canvas.width, h = canvas.height;
      const t = (ts - start) / 1000;
      const mx = mouseRef.current.x, my = mouseRef.current.y;

      // Timeline
      // 0-1.5s  : exterior static
      // 1.5-3.5s: doors open
      // 3.5-7s  : enter the hall
      // 7s+     : inside, parallax
      const doorOpen   = clamp(ease((t - 1.5) / 2.0), 0, 1);
      const enterRaw   = clamp((t - 3.5) / 3.5, 0, 1);
      const enterProg  = ease(enterRaw);
      const insideAmt  = clamp((t - 7.0) / 1.0, 0, 1);

      ctx.clearRect(0, 0, w, h);

      // ─── DARK BASE ───────────────────────────────────────────
      ctx.fillStyle = "#050103";
      ctx.fillRect(0, 0, w, h);

      // ─── ARCH OPENING ─────────────────────────────────────────
      // The arch grows as we enter
      const archCX = w * 0.5 + (mx - 0.5) * 20 * enterProg;
      const archTopY = h * (0.34 - enterProg * 0.38);
      const baseR = lerp(w * 0.14, w * 0.20, ease(doorOpen));
      const archR  = lerp(baseR, w * 2.2, ease(enterRaw));

      // ─── INTERIOR SCENE (inside arch clip) ───────────────────
      ctx.save();
      ctx.beginPath();
      ctx.arc(archCX, archTopY, archR, 0, Math.PI * 2);
      ctx.clip();

      // Interior background gradient
      const intBg = ctx.createLinearGradient(0, 0, 0, h);
      intBg.addColorStop(0, "#0c0206");
      intBg.addColorStop(0.4, "#1e0509");
      intBg.addColorStop(1, "#100305");
      ctx.fillStyle = intBg;
      ctx.fillRect(0, 0, w, h);

      // Vanishing point (parallax with mouse when inside)
      const vpX = w * 0.5 + (mx - 0.5) * 60 * insideAmt;
      const vpY = h * 0.4  + (my - 0.5) * 30 * insideAmt;

      // Hall geometry (perspective)
      const zoom = 0.22 + enterProg * 0.78;
      const bwW = w * zoom * 0.30;
      const bwH = h * zoom * 0.55;
      const bwX = vpX - bwW / 2;
      const bwY = vpY - bwH * 0.42;

      // Floor
      ctx.beginPath();
      ctx.moveTo(0, h); ctx.lineTo(w, h);
      ctx.lineTo(bwX + bwW, bwY + bwH); ctx.lineTo(bwX, bwY + bwH);
      ctx.closePath();
      const flG = ctx.createLinearGradient(0, h, vpX, bwY + bwH);
      flG.addColorStop(0, "rgba(45,14,8,1)");
      flG.addColorStop(0.5, "rgba(60,18,10,1)");
      flG.addColorStop(1, "rgba(30,8,5,1)");
      ctx.fillStyle = flG; ctx.fill();

      // Ceiling
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(w, 0);
      ctx.lineTo(bwX + bwW, bwY); ctx.lineTo(bwX, bwY);
      ctx.closePath();
      const clG = ctx.createLinearGradient(0, 0, 0, bwY);
      clG.addColorStop(0, "rgba(6,1,3,1)");
      clG.addColorStop(1, "rgba(20,6,8,1)");
      ctx.fillStyle = clG; ctx.fill();

      // Left wall
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(0, h);
      ctx.lineTo(bwX, bwY + bwH); ctx.lineTo(bwX, bwY);
      ctx.closePath();
      const lwG = ctx.createLinearGradient(0, 0, bwX, 0);
      lwG.addColorStop(0, "rgba(8,2,4,1)");
      lwG.addColorStop(1, "rgba(30,8,8,1)");
      ctx.fillStyle = lwG; ctx.fill();

      // Right wall
      ctx.beginPath();
      ctx.moveTo(w, 0); ctx.lineTo(w, h);
      ctx.lineTo(bwX + bwW, bwY + bwH); ctx.lineTo(bwX + bwW, bwY);
      ctx.closePath();
      const rwG = ctx.createLinearGradient(w, 0, bwX + bwW, 0);
      rwG.addColorStop(0, "rgba(8,2,4,1)");
      rwG.addColorStop(1, "rgba(30,8,8,1)");
      ctx.fillStyle = rwG; ctx.fill();

      // Back wall — warm gold glow
      const bkG = ctx.createRadialGradient(vpX, vpY, 0, vpX, vpY, bwW * 0.8);
      bkG.addColorStop(0, "rgba(200,140,28,0.92)");
      bkG.addColorStop(0.35, "rgba(110,55,12,0.85)");
      bkG.addColorStop(1, "rgba(28,7,4,0.95)");
      ctx.fillStyle = bkG;
      ctx.fillRect(bwX, bwY, bwW, bwH);

      // Chandelier light cone from ceiling center
      const chG = ctx.createRadialGradient(vpX, 0, 0, vpX, 0, h * 0.7);
      chG.addColorStop(0, "rgba(201,162,39,0.18)");
      chG.addColorStop(0.3, "rgba(180,110,20,0.07)");
      chG.addColorStop(1, "rgba(140,60,10,0)");
      ctx.fillStyle = chG; ctx.fillRect(0, 0, w, h);

      // Candle/floor glow at base
      const flGlow = ctx.createRadialGradient(vpX, h, 0, vpX, h, w * 0.55);
      flGlow.addColorStop(0, "rgba(201,140,30,0.10)");
      flGlow.addColorStop(1, "rgba(140,60,10,0)");
      ctx.fillStyle = flGlow; ctx.fillRect(0, 0, w, h);

      // Bokeh (floating light orbs)
      for (const b of bokeh) {
        b.ny += b.vy;
        if (b.ny < -0.12) { b.ny = 1.15; b.nx = Math.random(); }
        const px = b.nx * w + (mx - 0.5) * b.nx * 50 * insideAmt;
        const py = b.ny * h;
        const r = b.r * (0.3 + enterProg * 0.7);
        const c = b.gold ? [201, 162, 39] : [255, 248, 220];
        const gr = ctx.createRadialGradient(px, py, 0, px, py, r * 4);
        gr.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${b.alpha * enterProg})`);
        gr.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
        ctx.beginPath(); ctx.arc(px, py, r * 4, 0, Math.PI * 2);
        ctx.fillStyle = gr; ctx.fill();
        ctx.beginPath(); ctx.arc(px, py, r * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,252,235,${b.alpha * enterProg * 0.92})`; ctx.fill();
      }

      // Fairy lights (twinkling along walls)
      for (const fl of fairyL) {
        fl.phase += fl.spd;
        const a = (Math.sin(fl.phase) * 0.5 + 0.5) * 0.9 * enterProg;
        if (a < 0.04) continue;
        // scatter both sides of the hall
        const side = fl.nx > 0.5 ? 1 : -1;
        const t2 = fl.nx > 0.5 ? (fl.nx - 0.5) * 2 : fl.nx * 2;
        const px = lerp(side < 0 ? w * 0.05 : w * 0.95, vpX + side * bwW * 0.45, t2 * zoom);
        const py = fl.ny * h;
        ctx.beginPath(); ctx.arc(px, py, 1.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,238,170,${a})`; ctx.fill();
        const len = 2 + a * 6;
        ctx.strokeStyle = `rgba(255,238,170,${a * 0.5})`; ctx.lineWidth = 0.65;
        ctx.beginPath();
        ctx.moveTo(px - len, py); ctx.lineTo(px + len, py);
        ctx.moveTo(px, py - len * 0.75); ctx.lineTo(px, py + len * 0.75);
        ctx.stroke();
      }

      ctx.restore(); // end arch clip

      // ─── EXTERIOR OVERLAY (fades as we enter) ────────────────
      const extAlpha = Math.max(0, 1 - enterRaw * 1.4);
      if (extAlpha > 0.01) {

        // Night sky
        const sky = ctx.createLinearGradient(0, 0, 0, h);
        sky.addColorStop(0, `rgba(5,2,10,${extAlpha})`);
        sky.addColorStop(0.6, `rgba(12,3,8,${extAlpha})`);
        sky.addColorStop(1, `rgba(6,1,4,${extAlpha})`);
        ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);

        // Stars
        for (const s of stars) {
          const sa = (Math.sin(ts * 0.001 + s.phase) * 0.3 + 0.7) * 0.6 * extAlpha;
          ctx.beginPath(); ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,248,220,${sa})`; ctx.fill();
        }

        // Building facade
        const cx = w * 0.5;
        const dW = w * 0.30;
        const dH = h * 0.60;
        const dTop = h * 0.20;

        // Stone walls on sides
        ctx.fillStyle = `rgba(28,8,12,${extAlpha})`;
        ctx.fillRect(0, 0, cx - dW * 0.5 - 2, h);
        ctx.fillRect(cx + dW * 0.5 + 2, 0, w, h);

        // Top of building above arch
        ctx.fillRect(0, 0, w, dTop - dW * 0.5);

        // Steps
        for (let i = 0; i < 3; i++) {
          const sw = dW * (1.5 + i * 0.35);
          ctx.fillStyle = `rgba(32,10,14,${extAlpha})`;
          ctx.fillRect(cx - sw / 2, dTop + dH + i * h * 0.022, sw, h * 0.022);
        }

        // Arch frame
        ctx.strokeStyle = `rgba(60,18,20,${extAlpha})`;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(cx, dTop, dW * 0.5, Math.PI, 0);
        ctx.lineTo(cx + dW * 0.5, dTop + dH);
        ctx.lineTo(cx - dW * 0.5, dTop + dH);
        ctx.closePath();
        ctx.stroke();

        // Door gap warm glow (before doors open fully)
        const gA = extAlpha * (0.6 + doorOpen * 0.3);
        const gG = ctx.createRadialGradient(cx, dTop + dH * 0.5, 0, cx, dTop + dH * 0.5, dW * 0.55);
        gG.addColorStop(0, `rgba(210,145,30,${gA * 0.35})`);
        gG.addColorStop(0.5, `rgba(160,85,15,${gA * 0.12})`);
        gG.addColorStop(1, "rgba(100,40,8,0)");
        ctx.fillStyle = gG;
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, dTop, dW * 0.5, Math.PI, 0);
        ctx.lineTo(cx + dW * 0.5, dTop + dH);
        ctx.lineTo(cx - dW * 0.5, dTop + dH);
        ctx.closePath(); ctx.clip();
        ctx.fillRect(cx - dW, dTop - 20, dW * 2, dH + 40);
        ctx.restore();

        // Left door panel
        const panelW = dW * 0.5 * (1 - ease(doorOpen) * 0.96);
        if (panelW > 1) {
          const ldG = ctx.createLinearGradient(cx - dW * 0.5, 0, cx, 0);
          ldG.addColorStop(0, `rgba(48,14,16,${extAlpha})`);
          ldG.addColorStop(1, `rgba(38,10,12,${extAlpha})`);
          ctx.fillStyle = ldG;
          ctx.fillRect(cx - dW * 0.5, dTop, panelW, dH);
          // panel details
          ctx.strokeStyle = `rgba(75,22,22,${extAlpha * 0.5})`; ctx.lineWidth = 1;
          const px2 = cx - dW * 0.5;
          ctx.strokeRect(px2 + 5, dTop + 18, panelW - 10, dH * 0.39);
          ctx.strokeRect(px2 + 5, dTop + dH * 0.41 + 18, panelW - 10, dH * 0.40);
        }

        // Right door panel
        const rX = cx + dW * 0.5 - panelW;
        if (panelW > 1) {
          const rdG = ctx.createLinearGradient(cx, 0, cx + dW * 0.5, 0);
          rdG.addColorStop(0, `rgba(38,10,12,${extAlpha})`);
          rdG.addColorStop(1, `rgba(48,14,16,${extAlpha})`);
          ctx.fillStyle = rdG;
          ctx.fillRect(rX, dTop, panelW, dH);
          ctx.strokeStyle = `rgba(75,22,22,${extAlpha * 0.5})`; ctx.lineWidth = 1;
          ctx.strokeRect(rX + 5, dTop + 18, panelW - 10, dH * 0.39);
          ctx.strokeRect(rX + 5, dTop + dH * 0.41 + 18, panelW - 10, dH * 0.40);
        }

        // Light flooding out as doors open
        if (doorOpen > 0.05) {
          const floodA = ease(doorOpen) * 0.45 * extAlpha;
          const fG = ctx.createRadialGradient(cx, dTop + dH * 0.55, 0, cx, dTop + dH * 0.55, dW * 1.1);
          fG.addColorStop(0, `rgba(220,155,35,${floodA})`);
          fG.addColorStop(0.5, `rgba(170,90,18,${floodA * 0.4})`);
          fG.addColorStop(1, "rgba(100,40,8,0)");
          ctx.fillStyle = fG;
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, dTop, dW * 0.5, Math.PI, 0);
          ctx.lineTo(cx + dW * 0.5, dTop + dH);
          ctx.lineTo(cx - dW * 0.5, dTop + dH);
          ctx.closePath(); ctx.clip();
          ctx.fillRect(0, 0, w, h);
          ctx.restore();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050103]">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Slogan — apparaît après l'entrée dans la salle */}
      <div className="relative z-10 text-center px-6" style={{ pointerEvents: "none" }}>
        <p
          aria-label={SLOGAN}
          style={{
            fontFamily: "var(--font-script), cursive",
            fontSize: "clamp(2rem, 5.5vw, 4.2rem)",
            color: "rgba(242,228,196,0.95)",
            letterSpacing: "0.04em",
            lineHeight: 1.4,
            textShadow: "0 0 50px rgba(201,162,39,0.55), 0 0 100px rgba(201,162,39,0.2)",
          }}
        >
          {SLOGAN.split("").map((ch, i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                opacity: i < visibleLetters ? 1 : 0,
                transform: i < visibleLetters ? "translateY(0) scale(1)" : "translateY(16px) scale(0.78)",
                filter: i < visibleLetters ? "blur(0)" : "blur(6px)",
                transition: "opacity 0.6s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1), filter 0.6s ease",
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
          <span className="text-[0.55rem] uppercase tracking-[0.3em] text-white/30">Découvrir</span>
          <div className="scroll-arrow" style={{ borderRightColor: "rgba(240,228,196,0.4)", borderBottomColor: "rgba(240,228,196,0.4)" }} />
        </div>
      )}
    </section>
  );
}
