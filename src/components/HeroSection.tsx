"use client";

import { useEffect, useRef, useState } from "react";

const SLOGAN = "Your Amazing Life Moments";

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ nx: 0, ny: 0 });
  const [visibleLetters, setVisibleLetters] = useState(0);

  useEffect(() => {
    const delay = setTimeout(() => {
      let count = 0;
      const iv = setInterval(() => {
        count++;
        setVisibleLetters(count);
        if (count >= SLOGAN.length) clearInterval(iv);
      }, 65);
      return () => clearInterval(iv);
    }, 1600);
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

    // Bokeh — dark bordeaux on light beige background
    const bokeh = Array.from({ length: 55 }, () => ({
      nx: Math.random(),
      ny: Math.random() * 1.2,
      vy: -(Math.random() * 0.000018 + 0.000008),
      vx: (Math.random() - 0.5) * 0.000006,
      r: Math.random() * 10 + 3,
      alpha: Math.random() * 0.12 + 0.04,
      z: Math.random(),
      // true = bordeaux, false = warm gold tint (sun through windows)
      warm: Math.random() > 0.45,
    }));
    bokeh.sort((a, b) => a.z - b.z);

    const sparkles = Array.from({ length: 45 }, () => ({
      nx: Math.random(),
      ny: Math.random(),
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.025 + 0.007,
      maxAlpha: Math.random() * 0.35 + 0.08,
    }));

    let nextShoot = 2000;
    let lastTime = 0;
    const shooters: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number }[] = [];

    canvas.addEventListener("mousemove", (e) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current = {
        nx: (e.clientX - r.left) / r.width * 2 - 1,
        ny: (e.clientY - r.top) / r.height * 2 - 1,
      };
    });
    canvas.addEventListener("mouseleave", () => {
      mouseRef.current = { nx: 0, ny: 0 };
    });

    const draw = (ts: number) => {
      const w = canvas.width, h = canvas.height;
      const dt = Math.min(ts - lastTime, 50);
      lastTime = ts;
      ctx.clearRect(0, 0, w, h);

      const { nx: mnx, ny: mny } = mouseRef.current;

      // Subtle light beams from above (warm, like sunlit windows)
      for (const [bx, angle, bw] of [
        [0.2, 0.1, 0.22],
        [0.8, -0.1, 0.18],
        [0.5, 0, 0.12],
      ] as [number, number, number][]) {
        ctx.save();
        ctx.translate(bx * w, 0);
        ctx.rotate(angle);
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, "rgba(74,16,21,0.05)");
        g.addColorStop(0.5, "rgba(74,16,21,0.015)");
        g.addColorStop(1, "rgba(74,16,21,0)");
        ctx.fillStyle = g;
        ctx.fillRect(-bw * w * 0.5, 0, bw * w, h * 2);
        ctx.restore();
      }

      // Bokeh with parallax depth
      for (const b of bokeh) {
        b.ny += b.vy * dt;
        b.nx += b.vx * dt;
        if (b.ny < -0.18) { b.ny = 1.15; b.nx = Math.random(); }
        if (b.nx < -0.12) b.nx = 1.12;
        if (b.nx > 1.12) b.nx = -0.12;

        const scale = 0.3 + b.z * 0.7;
        const px = b.nx * w + mnx * b.z * 40;
        const py = b.ny * h + mny * b.z * 26;
        const r = b.r * scale;
        // bordeaux = [74,16,21], warm gold = [160,100,30]
        const c = b.warm ? [74, 16, 21] : [160, 100, 30];

        const gr = ctx.createRadialGradient(px, py, 0, px, py, r * 3.5);
        gr.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${b.alpha})`);
        gr.addColorStop(0.4, `rgba(${c[0]},${c[1]},${c[2]},${b.alpha * 0.35})`);
        gr.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
        ctx.beginPath();
        ctx.arc(px, py, r * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = gr;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, r * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${b.alpha * 0.7})`;
        ctx.fill();
      }

      // Shooting stars — bordeaux streaks
      nextShoot -= dt;
      if (nextShoot <= 0) {
        const a = Math.random() * Math.PI * 0.32 + Math.PI * 0.09;
        shooters.push({
          x: Math.random() * w * 0.55,
          y: Math.random() * h * 0.38,
          vx: Math.cos(a) * 7,
          vy: Math.sin(a) * 2.5,
          life: 0,
          maxLife: 42 + Math.random() * 28,
        });
        nextShoot = 3500 + Math.random() * 5000;
      }
      for (let i = shooters.length - 1; i >= 0; i--) {
        const s = shooters[i];
        s.x += s.vx; s.y += s.vy; s.life++;
        const p = s.life / s.maxLife;
        const a = p < 0.2 ? p / 0.2 : p > 0.7 ? 1 - (p - 0.7) / 0.3 : 1;
        const g = ctx.createLinearGradient(s.x - s.vx * 12, s.y - s.vy * 12, s.x, s.y);
        g.addColorStop(0, "rgba(74,16,21,0)");
        g.addColorStop(1, `rgba(74,16,21,${a * 0.55})`);
        ctx.beginPath();
        ctx.moveTo(s.x - s.vx * 12, s.y - s.vy * 12);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.4;
        ctx.stroke();
        if (s.life >= s.maxLife) shooters.splice(i, 1);
      }

      // Sparkles — tiny bordeaux stars
      for (const sp of sparkles) {
        sp.phase += sp.speed;
        const a = (Math.sin(sp.phase) * 0.5 + 0.5) * sp.maxAlpha;
        if (a < 0.03) continue;
        const px = sp.nx * w, py = sp.ny * h;
        ctx.beginPath();
        ctx.arc(px, py, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(74,16,21,${a})`;
        ctx.fill();
        const len = 2 + a * 5;
        ctx.strokeStyle = `rgba(74,16,21,${a * 0.5})`;
        ctx.lineWidth = 0.6;
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
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* Subtle radial warmth at center */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(74,16,21,0.04) 0%, transparent 70%)",
        }}
      />

      {/* Interactive canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Content */}
      <div className="relative flex flex-col items-center text-center" style={{ zIndex: 2 }}>
        {/* YALM — Cinzel Decorative, bordeaux shimmer */}
        <h1
          className="select-none"
          style={{
            fontFamily: "var(--font-display), serif",
            fontSize: "clamp(4rem, 19vw, 17rem)",
            fontWeight: 900,
            letterSpacing: "0.22em",
            lineHeight: 1,
            background:
              "linear-gradient(90deg, #320a0e, #4a1015, #6d1f26, #9a2a35, #6d1f26, #4a1015, #320a0e)",
            backgroundSize: "250% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation:
              "goldShimmer 5s linear infinite, yalmIn 1.2s cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          YALM
        </h1>

        {/* Bordeaux divider */}
        <div
          style={{
            width: "clamp(40px, 9vw, 90px)",
            height: "1px",
            margin: "0.6em 0 0.5em",
            background:
              "linear-gradient(90deg, transparent, rgba(74,16,21,0.4), transparent)",
            animation: "heroFadeUp 0.8s ease 1.4s both",
          }}
        />

        {/* "Your Amazing Life Moments" — Great Vibes, bordeaux, letter by letter */}
        <p
          aria-label={SLOGAN}
          style={{
            fontFamily: "var(--font-script), cursive",
            fontSize: "clamp(1.8rem, 4.8vw, 3.6rem)",
            color: "rgba(74,16,21,0.88)",
            letterSpacing: "0.04em",
            lineHeight: 1.4,
            textShadow: "0 2px 20px rgba(74,16,21,0.12)",
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

      {/* Scroll arrow */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ zIndex: 2, animation: "heroFadeUp 1s ease 2.6s both" }}
      >
        <span className="text-[0.55rem] uppercase tracking-[0.3em] text-bordeaux/40">
          Découvrir
        </span>
        <div className="scroll-arrow" />
      </div>
    </section>
  );
}
