"use client";

import { useEffect, useRef } from "react";

const SLOGAN = "YOUR AMAZING LIFE MOMENTS".split("");

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;

    function resize() {
      canvas!.width = canvas!.offsetWidth;
      canvas!.height = canvas!.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // Drifting particles
    const drift = Array.from({ length: 75 }, () => ({
      x: Math.random() * canvas!.width,
      y: Math.random() * canvas!.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.6 + 0.3,
      alpha: Math.random() * 0.35 + 0.06,
    }));

    // Orbital particles — circle around the center
    const orbitals = Array.from({ length: 12 }, (_, i) => ({
      angle: (i / 12) * Math.PI * 2,
      radius: 160 + (i % 3) * 60,
      speed: 0.004 + (i % 4) * 0.0015,
      r: Math.random() * 2 + 0.8,
      alpha: Math.random() * 0.55 + 0.25,
    }));

    // Shooting stars
    let nextShoot = 2000;
    let lastTime = 0;
    const shooters: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number }[] = [];

    function spawnShooter(w: number, h: number) {
      const angle = Math.random() * Math.PI * 0.4 + Math.PI * 0.1;
      shooters.push({
        x: Math.random() * w * 0.4,
        y: Math.random() * h * 0.5,
        vx: Math.cos(angle) * 6,
        vy: Math.sin(angle) * 2,
        life: 0,
        maxLife: 50 + Math.random() * 30,
      });
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", () => { mouse.current = { x: -9999, y: -9999 }; });

    function draw(ts: number) {
      const w = canvas!.width, h = canvas!.height;
      const cx = w * 0.5, cy = h * 0.46;
      const dt = ts - lastTime;
      lastTime = ts;
      ctx!.clearRect(0, 0, w, h);

      // Shoot timer
      nextShoot -= dt;
      if (nextShoot <= 0) {
        spawnShooter(w, h);
        nextShoot = 2500 + Math.random() * 3000;
      }

      // Shooting stars
      for (let i = shooters.length - 1; i >= 0; i--) {
        const s = shooters[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life++;
        const p = s.life / s.maxLife;
        const a = p < 0.2 ? p / 0.2 : p > 0.7 ? 1 - (p - 0.7) / 0.3 : 1;
        const grad = ctx!.createLinearGradient(s.x - s.vx * 10, s.y - s.vy * 10, s.x, s.y);
        grad.addColorStop(0, `rgba(201,162,39,0)`);
        grad.addColorStop(1, `rgba(240,210,120,${a * 0.8})`);
        ctx!.beginPath();
        ctx!.moveTo(s.x - s.vx * 10, s.y - s.vy * 10);
        ctx!.lineTo(s.x, s.y);
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = 1.5;
        ctx!.stroke();
        if (s.life >= s.maxLife) shooters.splice(i, 1);
      }

      // Orbital particles
      for (const o of orbitals) {
        o.angle += o.speed;
        const ox = cx + Math.cos(o.angle) * o.radius * (w / 900);
        const oy = cy + Math.sin(o.angle) * o.radius * 0.45 * (h / 600);
        ctx!.beginPath();
        ctx!.arc(ox, oy, o.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(201,162,39,${o.alpha})`;
        ctx!.fill();
        // Glow
        ctx!.beginPath();
        ctx!.arc(ox, oy, o.r * 3, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(201,162,39,${o.alpha * 0.12})`;
        ctx!.fill();
      }

      // Drifting particles with mouse attraction
      for (const p of drift) {
        const dx = mouse.current.x - p.x;
        const dy = mouse.current.y - p.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 160 && d > 1) {
          p.vx += (dx / d) * 0.04;
          p.vy += (dy / d) * 0.04;
        }
        p.vx *= 0.97;
        p.vy *= 0.97;
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > 2) { p.vx = (p.vx / spd) * 2; p.vy = (p.vy / spd) * 2; }
        p.x = (p.x + p.vx + w) % w;
        p.y = (p.y + p.vy + h) % h;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(201,162,39,${p.alpha})`;
        ctx!.fill();
      }

      // Connecting lines
      for (let i = 0; i < drift.length; i++) {
        for (let j = i + 1; j < drift.length; j++) {
          const dx = drift[i].x - drift[j].x;
          const dy = drift[i].y - drift[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx!.beginPath();
            ctx!.moveTo(drift[i].x, drift[i].y);
            ctx!.lineTo(drift[j].x, drift[j].y);
            ctx!.strokeStyle = `rgba(201,162,39,${0.1 * (1 - d / 100)})`;
            ctx!.lineWidth = 0.4;
            ctx!.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden text-white">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(160deg, #0d0205 0%, #1e0508 30%, #3a0d11 65%, #280710 100%)" }}
      />

      {/* Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Central glow behind YALM */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "50%", left: "50%",
          transform: "translate(-50%, -54%)",
          width: "min(700px, 90vw)",
          height: "min(300px, 40vh)",
          background: "radial-gradient(ellipse, rgba(201,162,39,0.12) 0%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />

      {/* Content */}
      <div className="relative flex flex-col items-center text-center px-6" style={{ zIndex: 2 }}>

        {/* YALM */}
        <h1
          className="yalm-title font-serif select-none"
          style={{
            fontSize: "clamp(5rem, 20vw, 18rem)",
            fontWeight: 700,
            letterSpacing: "0.12em",
            lineHeight: 1,
            background: "linear-gradient(90deg, #a07818, #c9a227, #f0d478, #ffe9a0, #f0d478, #c9a227, #a07818)",
            backgroundSize: "250% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "goldShimmer 4s linear infinite, yalmIn 1.2s cubic-bezier(0.22,1,0.36,1) both",
            textShadow: "none",
            filter: "drop-shadow(0 0 40px rgba(201,162,39,0.25))",
          }}
        >
          YALM
        </h1>

        {/* Decorative divider */}
        <div
          className="flex items-center gap-3 mt-2 mb-6"
          style={{ animation: "heroFadeUp 1s ease 0.9s both" }}
        >
          <div style={{ width: 40, height: 1, background: "linear-gradient(90deg, transparent, rgba(201,162,39,0.6))" }} />
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(201,162,39,0.8)" }} />
          <div style={{ width: 40, height: 1, background: "linear-gradient(90deg, rgba(201,162,39,0.6), transparent)" }} />
        </div>

        {/* Slogan — letter by letter */}
        <p
          className="font-sans"
          style={{ letterSpacing: "0.3em", fontSize: "clamp(0.6rem, 1.5vw, 0.85rem)", fontWeight: 300 }}
          aria-label="Your Amazing Life Moments"
        >
          {SLOGAN.map((char, i) => (
            <span
              key={i}
              className="inline-block"
              style={{
                color: char === " " ? "transparent" : "rgba(224,198,116,0.9)",
                animation: `heroFadeUp 0.6s cubic-bezier(0.22,1,0.36,1) ${1 + i * 0.04}s both`,
                minWidth: char === " " ? "0.5em" : undefined,
              }}
            >
              {char === " " ? " " : char}
            </span>
          ))}
        </p>

        {/* Subtitle */}
        <p
          className="mt-5 text-xs uppercase tracking-[0.22em] text-white/35 font-light"
          style={{ animation: "heroFadeUp 1s ease 2.2s both" }}
        >
          Mariages · Soirées privées · Événements d&apos;entreprise
        </p>

        {/* CTAs */}
        <div
          className="mt-10 flex flex-wrap justify-center gap-4"
          style={{ animation: "heroFadeUp 1s ease 2.5s both" }}
        >
          <a
            href="#catalogue"
            className="rounded-full bg-gold px-9 py-3.5 text-sm font-medium text-bordeaux-dark transition-all hover:-translate-y-1 hover:bg-gold-light hover:shadow-[0_12px_32px_rgba(201,162,39,0.45)]"
          >
            Voir les prestations
          </a>
          <a
            href="#formules"
            className="rounded-full border border-white/20 px-9 py-3.5 text-sm font-light text-white/75 transition-all hover:-translate-y-1 hover:border-gold/50 hover:text-gold-light"
          >
            Nos formules
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ animation: "heroFadeUp 1s ease 3s both", zIndex: 2 }}
      >
        <span className="text-[0.55rem] uppercase tracking-[0.3em] text-white/30">Découvrir</span>
        <div className="scroll-arrow" />
      </div>
    </section>
  );
}
