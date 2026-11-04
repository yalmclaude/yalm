"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Decorative pointer effects on the public site: a soft golden glow that follows the
// mouse (fading out when it stops) and a few drifting twinkles on click / tap. Drawn on a
// single click-through canvas; the animation loop only runs while something is visible.
// Off in the admin and when the visitor prefers reduced motion.

// Champagne tones, kept soft and few for a refined look.
const SPARKLE_COLORS = ["#f6e7c1", "#fffaf0", "#e9d29a"];
const SPARKLES_PER_CLICK = 7;
const GLOW_RADIUS = 130;

type Sparkle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  spin: number;
  life: number; // 1 → 0
  decay: number;
  color: string;
};

function drawStar(ctx: CanvasRenderingContext2D, s: Sparkle) {
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.rotate(s.rotation);
  // Fade in then out (sine over the lifetime) instead of popping in at full opacity.
  ctx.globalAlpha = Math.max(0, Math.sin(Math.PI * s.life)) * 0.9;
  ctx.fillStyle = s.color;
  ctx.shadowColor = s.color;
  ctx.shadowBlur = 4;
  // Slim four-point twinkle.
  const r = s.size;
  const inner = r * 0.14;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const radius = i % 2 === 0 ? r : inner;
    const angle = (Math.PI / 4) * i;
    ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function CursorEffects() {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const disabled = pathname?.startsWith("/admin");

  useEffect(() => {
    if (disabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const pointer = { x: -1000, y: -1000 };
    const glow = { x: -1000, y: -1000, alpha: 0 };
    let lastMove = 0;
    let sparkles: Sparkle[] = [];
    let frame = 0;

    const loop = (now: number) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Glow eases toward the pointer, and fades out ~600ms after the mouse stops.
      glow.x += (pointer.x - glow.x) * 0.25;
      glow.y += (pointer.y - glow.y) * 0.25;
      const target = now - lastMove < 600 ? 1 : 0;
      glow.alpha += (target - glow.alpha) * 0.08;
      if (glow.alpha > 0.01) {
        const g = ctx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, GLOW_RADIUS);
        g.addColorStop(0, `rgba(255, 240, 210, ${0.18 * glow.alpha})`);
        g.addColorStop(0.4, `rgba(233, 210, 154, ${0.07 * glow.alpha})`);
        g.addColorStop(1, "rgba(233, 210, 154, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(glow.x, glow.y, GLOW_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }

      sparkles = sparkles.filter((s) => s.life > 0);
      for (const s of sparkles) {
        s.vx *= 0.95;
        s.vy = s.vy * 0.95 - 0.01; // drift gently upward
        s.x += s.vx;
        s.y += s.vy;
        s.rotation += s.spin;
        s.life -= s.decay;
        drawStar(ctx, s);
      }

      if (glow.alpha > 0.01 || sparkles.length > 0) {
        frame = requestAnimationFrame(loop);
      } else {
        frame = 0;
      }
    };
    const start = () => {
      if (!frame) frame = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (glow.alpha < 0.01) {
        glow.x = e.clientX;
        glow.y = e.clientY;
      }
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      lastMove = performance.now();
      start();
    };

    const onDown = (e: PointerEvent) => {
      for (let i = 0; i < SPARKLES_PER_CLICK; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.6 + Math.random() * 1.6;
        sparkles.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.4,
          size: 3 + Math.random() * 4,
          rotation: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 0.04,
          life: 1,
          decay: 0.012 + Math.random() * 0.01,
          color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
        });
      }
      start();
    };

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [disabled]);

  if (disabled) return null;
  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-[9999] h-full w-full" />;
}
