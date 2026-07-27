"use client";

import { useEffect, useRef, useState } from "react";

const SLOGAN = "Your Amazing Life Moments";

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const [visibleLetters, setVisibleLetters] = useState(0);

  // Slogan letter-by-letter reveal
  useEffect(() => {
    const t = setTimeout(() => {
      let n = 0;
      const iv = setInterval(() => {
        n++;
        setVisibleLetters(n);
        if (n >= SLOGAN.length) clearInterval(iv);
      }, 65);
      return () => clearInterval(iv);
    }, 1300);
    return () => clearTimeout(t);
  }, []);

  // Canvas — fine dust + golden sparkles, mouse repulsion
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

    // Fine bordeaux dust particles
    const dust = Array.from({ length: 85 }, () => ({
      x: Math.random() * (canvas.offsetWidth || 1400),
      y: Math.random() * (canvas.offsetHeight || 900),
      vx: (Math.random() - 0.5) * 0.15,
      vy: -(Math.random() * 0.18 + 0.05),
      r: Math.random() * 1.8 + 0.4,
      alpha: Math.random() * 0.22 + 0.06,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: Math.random() * 0.01 + 0.003,
    }));

    // Golden sparkles that twinkle
    const sparkles = Array.from({ length: 22 }, () => ({
      x: Math.random() * (canvas.offsetWidth || 1400),
      y: Math.random() * (canvas.offsetHeight || 900),
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.035 + 0.01,
      maxAlpha: Math.random() * 0.55 + 0.18,
      r: Math.random() * 1.6 + 0.6,
    }));

    // Mouse trail sparkles (burst on move)
    let trailTimer = 0;
    const trail: { x: number; y: number; life: number; maxLife: number; r: number }[] = [];

    let lastTime = 0;

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseRef.current = { x, y };
      // Spawn a trail sparkle every few ms
      if (trailTimer <= 0) {
        trail.push({ x: x + (Math.random() - 0.5) * 12, y: y + (Math.random() - 0.5) * 12, life: 0, maxLife: 35 + Math.random() * 20, r: Math.random() * 2.5 + 0.8 });
        trailTimer = 3;
      }
    });
    canvas.addEventListener("mouseleave", () => {
      mouseRef.current = { x: -9999, y: -9999 };
    });

    const draw = (ts: number) => {
      const w = canvas.width, h = canvas.height;
      const dt = Math.min(ts - lastTime, 50);
      lastTime = ts;
      trailTimer -= dt;
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x, my = mouseRef.current.y;

      // Dust particles with gentle sway + mouse repulsion
      for (const p of dust) {
        p.phase += p.phaseSpeed;
        // Gentle horizontal drift
        p.vx += Math.cos(p.phase * 0.8) * 0.004;
        p.vy += -0.008; // float upward
        // Drag
        p.vx *= 0.97; p.vy *= 0.97;
        // Cap speed
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > 0.9) { p.vx = p.vx / spd * 0.9; p.vy = p.vy / spd * 0.9; }

        // Mouse repulsion
        const dx = mx - p.x, dy = my - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 130 * 130 && d2 > 1) {
          const d = Math.sqrt(d2);
          const force = (130 - d) / 130 * 0.45;
          p.vx -= (dx / d) * force;
          p.vy -= (dy / d) * force;
        }

        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -20) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -20) p.x = w + 10;
        if (p.x > w + 20) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(74,16,21,${p.alpha})`;
        ctx.fill();
      }

      // Delicate connecting lines between nearby dust
      for (let i = 0; i < dust.length; i++) {
        for (let j = i + 1; j < dust.length; j++) {
          const dx = dust[i].x - dust[j].x;
          const dy = dust[i].y - dust[j].y;
          const d = dx * dx + dy * dy;
          if (d < 80 * 80) {
            const a = (1 - Math.sqrt(d) / 80) * 0.08;
            ctx.beginPath();
            ctx.moveTo(dust[i].x, dust[i].y);
            ctx.lineTo(dust[j].x, dust[j].y);
            ctx.strokeStyle = `rgba(74,16,21,${a})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }

      // Golden sparkle stars
      for (const sp of sparkles) {
        sp.phase += sp.speed;
        const a = (Math.sin(sp.phase) * 0.5 + 0.5) * sp.maxAlpha;
        if (a < 0.03) continue;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(160,118,35,${a})`;
        ctx.fill();
        // 4-point star cross
        const len = 3 + a * 8;
        ctx.strokeStyle = `rgba(160,118,35,${a * 0.55})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(sp.x - len, sp.y); ctx.lineTo(sp.x + len, sp.y);
        ctx.moveTo(sp.x, sp.y - len * 0.75); ctx.lineTo(sp.x, sp.y + len * 0.75);
        ctx.stroke();
      }

      // Mouse trail — little bursts of gold that fade
      for (let i = trail.length - 1; i >= 0; i--) {
        const t = trail[i];
        t.life++;
        const p = t.life / t.maxLife;
        const a = p < 0.3 ? p / 0.3 : 1 - (p - 0.3) / 0.7;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.r * (1 - p * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(160,118,35,${a * 0.6})`;
        ctx.fill();
        if (t.life >= t.maxLife) trail.splice(i, 1);
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
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-beige">
      {/* Canvas — particles & sparkles */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Soft radial warmth behind logo */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -56%)",
          width: "clamp(260px, 50vw, 640px)",
          height: "clamp(260px, 50vw, 640px)",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(74,16,21,0.055) 0%, transparent 70%)",
          animation: "glowPulse 5.5s ease-in-out infinite",
        }}
      />

      {/* Content */}
      <div className="relative flex flex-col items-center text-center z-10 px-6">

        {/* Float wrapper */}
        <div style={{ animation: "logoFloat 5s ease-in-out 1.4s infinite" }}>
          {/* Breathe + glow wrapper */}
          <div
            style={{
              borderRadius: "16px",
              animation:
                "logoReveal 1.4s cubic-bezier(0.22,1,0.36,1) both, logoBreathe 6s ease-in-out 3s infinite, logoGlow 6s ease-in-out 3s infinite",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="YALM Events"
              style={{
                width: "clamp(200px, 38vw, 480px)",
                height: "auto",
                display: "block",
                borderRadius: "16px",
              }}
            />
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            width: "clamp(36px, 7vw, 70px)",
            height: "1px",
            margin: "2rem 0 1.4rem",
            background:
              "linear-gradient(90deg, transparent, rgba(74,16,21,0.32), transparent)",
            animation: "heroFadeUp 0.8s ease 1.6s both",
          }}
        />

        {/* Slogan — Great Vibes, bordeaux, lettre par lettre puis breathe élégant */}
        <p
          aria-label={SLOGAN}
          style={{
            fontFamily: "var(--font-script), cursive",
            fontSize: "clamp(1.8rem, 4.4vw, 3.4rem)",
            color: "rgba(74,16,21,0.87)",
            letterSpacing: "0.03em",
            lineHeight: 1.4,
            textShadow: "0 2px 20px rgba(74,16,21,0.1)",
            animation: "sloganBreathe 7s ease-in-out 5s infinite",
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
                  "opacity 0.52s ease, transform 0.52s cubic-bezier(0.22,1,0.36,1), filter 0.52s ease",
              }}
            >
              {ch === " " ? " " : ch}
            </span>
          ))}
        </p>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        style={{ animation: "heroFadeUp 1s ease 2.7s both" }}
      >
        <span className="text-[0.55rem] uppercase tracking-[0.3em] text-bordeaux/35">
          Découvrir
        </span>
        <div className="scroll-arrow" />
      </div>
    </section>
  );
}
