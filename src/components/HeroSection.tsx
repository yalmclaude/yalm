"use client";

import { useEffect, useRef } from "react";

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

    const drift = Array.from({ length: 75 }, () => ({
      x: Math.random() * canvas!.width,
      y: Math.random() * canvas!.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.6 + 0.3,
      alpha: Math.random() * 0.35 + 0.06,
    }));

    const orbitals = Array.from({ length: 12 }, (_, i) => ({
      angle: (i / 12) * Math.PI * 2,
      radius: 160 + (i % 3) * 60,
      speed: 0.004 + (i % 4) * 0.0015,
      r: Math.random() * 2 + 0.8,
      alpha: Math.random() * 0.55 + 0.25,
    }));

    let nextShoot = 2000;
    let lastTime = 0;
    const shooters: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number }[] = [];

    function spawnShooter(w: number, h: number) {
      const angle = Math.random() * Math.PI * 0.4 + Math.PI * 0.1;
      shooters.push({ x: Math.random() * w * 0.4, y: Math.random() * h * 0.5, vx: Math.cos(angle) * 6, vy: Math.sin(angle) * 2, life: 0, maxLife: 50 + Math.random() * 30 });
    }

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas!.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    });
    canvas.addEventListener("mouseleave", () => { mouse.current = { x: -9999, y: -9999 }; });

    function draw(ts: number) {
      const w = canvas!.width, h = canvas!.height;
      const cx = w * 0.5, cy = h * 0.5;
      const dt = ts - lastTime; lastTime = ts;
      ctx!.clearRect(0, 0, w, h);

      nextShoot -= dt;
      if (nextShoot <= 0) { spawnShooter(w, h); nextShoot = 2500 + Math.random() * 3000; }

      for (let i = shooters.length - 1; i >= 0; i--) {
        const s = shooters[i];
        s.x += s.vx; s.y += s.vy; s.life++;
        const p = s.life / s.maxLife;
        const a = p < 0.2 ? p / 0.2 : p > 0.7 ? 1 - (p - 0.7) / 0.3 : 1;
        const g = ctx!.createLinearGradient(s.x - s.vx * 10, s.y - s.vy * 10, s.x, s.y);
        g.addColorStop(0, "rgba(201,162,39,0)");
        g.addColorStop(1, `rgba(240,210,120,${a * 0.8})`);
        ctx!.beginPath(); ctx!.moveTo(s.x - s.vx * 10, s.y - s.vy * 10); ctx!.lineTo(s.x, s.y);
        ctx!.strokeStyle = g; ctx!.lineWidth = 1.5; ctx!.stroke();
        if (s.life >= s.maxLife) shooters.splice(i, 1);
      }

      for (const o of orbitals) {
        o.angle += o.speed;
        const ox = cx + Math.cos(o.angle) * o.radius * (w / 900);
        const oy = cy + Math.sin(o.angle) * o.radius * 0.45 * (h / 600);
        ctx!.beginPath(); ctx!.arc(ox, oy, o.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(201,162,39,${o.alpha})`; ctx!.fill();
        ctx!.beginPath(); ctx!.arc(ox, oy, o.r * 3, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(201,162,39,${o.alpha * 0.12})`; ctx!.fill();
      }

      for (const p of drift) {
        const dx = mouse.current.x - p.x, dy = mouse.current.y - p.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 160 && d > 1) { p.vx += (dx / d) * 0.04; p.vy += (dy / d) * 0.04; }
        p.vx *= 0.97; p.vy *= 0.97;
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > 2) { p.vx = (p.vx / spd) * 2; p.vy = (p.vy / spd) * 2; }
        p.x = (p.x + p.vx + w) % w; p.y = (p.y + p.vy + h) % h;
        ctx!.beginPath(); ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(201,162,39,${p.alpha})`; ctx!.fill();
      }

      for (let i = 0; i < drift.length; i++) {
        for (let j = i + 1; j < drift.length; j++) {
          const dx = drift[i].x - drift[j].x, dy = drift[i].y - drift[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx!.beginPath(); ctx!.moveTo(drift[i].x, drift[i].y); ctx!.lineTo(drift[j].x, drift[j].y);
            ctx!.strokeStyle = `rgba(201,162,39,${0.1 * (1 - d / 100)})`; ctx!.lineWidth = 0.4; ctx!.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #0d0205 0%, #1e0508 30%, #3a0d11 65%, #280710 100%)" }} />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute pointer-events-none" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "min(700px, 90vw)", height: "min(300px, 40vh)", background: "radial-gradient(ellipse, rgba(201,162,39,0.13) 0%, transparent 70%)", filter: "blur(30px)" }} />

      <div className="relative" style={{ zIndex: 2 }}>
        <h1
          className="font-serif select-none text-center"
          style={{
            fontSize: "clamp(5rem, 22vw, 20rem)",
            fontWeight: 700,
            letterSpacing: "0.12em",
            lineHeight: 1,
            background: "linear-gradient(90deg, #a07818, #c9a227, #f0d478, #ffe9a0, #f0d478, #c9a227, #a07818)",
            backgroundSize: "250% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "goldShimmer 4s linear infinite, yalmIn 1.2s cubic-bezier(0.22,1,0.36,1) both",
            filter: "drop-shadow(0 0 50px rgba(201,162,39,0.3))",
          }}
        >
          YALM
        </h1>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{ zIndex: 2, animation: "heroFadeUp 1s ease 1.5s both" }}>
        <span className="text-[0.55rem] uppercase tracking-[0.3em] text-white/30">Découvrir</span>
        <div className="scroll-arrow" />
      </div>
    </section>
  );
}
