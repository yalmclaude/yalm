"use client";

import { useEffect, useRef } from "react";

const SLOGAN = ["Your", "Amazing", "Life", "Moments"];

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

    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas!.width,
      y: Math.random() * canvas!.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.4,
      alpha: Math.random() * 0.45 + 0.08,
    }));

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    canvas.addEventListener("mousemove", onMouseMove);

    function draw() {
      const w = canvas!.width, h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);

      for (const p of particles) {
        const dx = p.x - mouse.current.x;
        const dy = p.y - mouse.current.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 130) {
          const f = ((130 - d) / 130) * 0.6;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
        p.vx *= 0.97;
        p.vy *= 0.97;
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 2.2) { p.vx = (p.vx / speed) * 2.2; p.vy = (p.vy / speed) * 2.2; }
        p.x = (p.x + p.vx + w) % w;
        p.y = (p.y + p.vy + h) % h;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(201,162,39,${p.alpha})`;
        ctx!.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = `rgba(201,162,39,${0.12 * (1 - d / 110)})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden text-white">
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, #110306 0%, #2a0710 40%, #4a1015 75%, #320a0e 100%)" }}
      />

      {/* Interactive canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* YALM watermark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none" style={{ zIndex: 1 }}>
        <span
          className="yalm-watermark font-serif font-bold leading-none"
          style={{
            fontSize: "clamp(100px, 22vw, 300px)",
            color: "rgba(201,162,39,0.055)",
            letterSpacing: "0.18em",
          }}
        >
          YALM
        </span>
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-5xl px-8 py-32 sm:py-36" style={{ zIndex: 2 }}>
        {/* Slogan — word by word */}
        <p className="mb-2 overflow-hidden">
          {SLOGAN.map((word, i) => (
            <span
              key={word}
              className="inline-block"
              style={{
                fontFamily: "var(--font-jost)",
                fontSize: "0.7rem",
                letterSpacing: "0.38em",
                textTransform: "uppercase",
                color: "rgba(224,198,116,0.85)",
                fontWeight: 300,
                animation: `heroFadeUp 0.9s cubic-bezier(0.22,1,0.36,1) ${0.1 + i * 0.12}s both`,
                marginRight: i < SLOGAN.length - 1 ? "0.5em" : 0,
              }}
            >
              {word}
            </span>
          ))}
        </p>

        {/* Decorative line */}
        <div
          className="mb-8 h-px bg-gold/40"
          style={{ width: 48, animation: "heroFadeUp 1s ease 0.6s both" }}
        />

        {/* Main headline */}
        <h1
          className="font-serif leading-[1.05]"
          style={{
            fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
            fontWeight: 600,
            animation: "heroFadeUp 1s cubic-bezier(0.22,1,0.36,1) 0.55s both",
          }}
        >
          Sublimez votre événement
          <br />
          <em className="not-italic" style={{ color: "#e0c674", fontStyle: "italic" }}>
            avec élégance
          </em>
        </h1>

        {/* Subtitle */}
        <p
          className="mt-6 max-w-xl font-light leading-relaxed text-white/70"
          style={{ animation: "heroFadeUp 1s ease 0.85s both" }}
        >
          Photobooths immersifs, bars sur mesure et signalétique raffinée : une offre haut de gamme
          pensée pour marquer vos invités.
        </p>

        {/* Category tags */}
        <p
          className="mt-4 text-[0.65rem] uppercase tracking-[0.25em] text-white/40"
          style={{ animation: "heroFadeUp 1s ease 1s both" }}
        >
          Mariages · Soirées privées · Événements d&apos;entreprise
        </p>

        {/* CTAs */}
        <div
          className="mt-10 flex flex-wrap gap-4"
          style={{ animation: "heroFadeUp 1s ease 1.15s both" }}
        >
          <a
            href="#catalogue"
            className="rounded-full bg-gold px-8 py-3.5 text-sm font-medium text-bordeaux-dark transition-all hover:-translate-y-0.5 hover:bg-gold-light hover:shadow-[0_10px_28px_rgba(201,162,39,0.4)]"
          >
            Voir les prestations
          </a>
          <a
            href="#formules"
            className="rounded-full border border-white/25 px-8 py-3.5 text-sm font-light text-white/85 transition-all hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/5"
          >
            Découvrir nos formules
          </a>
        </div>
      </div>
    </section>
  );
}
