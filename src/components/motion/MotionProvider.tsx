"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

/* Site-wide motion, driven by data attributes so sections stay server components:

   data-split            words (rendered by <SplitWords>) slide up when the element scrolls in
   data-fade-up          fades and rises in on scroll (optional data-delay, in seconds)
   data-hero             the hero: its splits / fade-ups / [data-hero-img] play as an intro
   data-parallax="0.2"   drifts vertically while scrolling (data-parallax-start="top" for
                         elements already in view at load, e.g. in the hero)
   data-img-parallax     inner image layer that slides inside its masked frame
   data-depth="1"        follows the mouse slightly (hero, fine pointers only)
   data-magnetic         buttons pulled toward the cursor (fine pointers only)
   data-marquee          infinite band, sped up by scroll velocity ("reverse" flips it)
   data-spin             slow continuous rotation, faster while scrolling
   data-panel            clip-path opening as the section scrolls in
   data-line             a rule that draws from the left ("scrub" ties it to scroll)
   data-header           hides on scroll down, shows on scroll up

   Everything is skipped in /admin and when the visitor prefers reduced motion (the
   inline script in the root layout then never adds the `motion` class). */

const EASE = "expo.out";
const HEADER_OFFSET = -90;

function motionEnabled() {
  return document.documentElement.classList.contains("motion");
}

export function MotionProvider() {
  const pathname = usePathname() ?? "/";
  const isAdmin = pathname.startsWith("/admin");

  // Smooth scroll: one Lenis instance for the public site, ticking with GSAP.
  useEffect(() => {
    if (isAdmin || !motionEnabled()) return;
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // In-page anchors ("/#catalogue" while on "/"): glide there instead of jumping.
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.("a[href*='#']");
      if (!(link instanceof HTMLAnchorElement)) return;
      const url = new URL(link.href, location.href);
      if (url.pathname !== location.pathname || !url.hash) return;
      const target = document.querySelector(url.hash);
      if (!target) return;
      e.preventDefault();
      link.closest("details")?.removeAttribute("open");
      lenis.scrollTo(target as HTMLElement, { offset: HEADER_OFFSET, duration: 1.4 });
      history.replaceState(null, "", url.hash);
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, [isAdmin]);

  // Page animations, rebuilt on every route change.
  useEffect(() => {
    if (isAdmin || !motionEnabled()) return;
    gsap.registerPlugin(ScrollTrigger);
    (window as Window & { __yalmMotion?: boolean }).__yalmMotion = true;

    const root = document.documentElement;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const cleanups: (() => void)[] = [];

    const ctx = gsap.context(() => {
      const hero = document.querySelector<HTMLElement>("[data-hero]");
      const playHero = () => {
        if (hero) heroIntro(hero);
      };
      if (root.classList.contains("intro")) {
        playLoader(playHero);
      } else {
        playHero();
      }

      scrollReveals(hero);
      parallax();
      marquees();
      spinners();
      panels();
      lines();
      header();
      if (finePointer) {
        cleanups.push(magnetic(), depth());
      }
    });

    // Positions shift once web fonts and images settle.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh).catch(() => {});

    return () => {
      cleanups.forEach((fn) => fn());
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, [pathname, isAdmin]);

  return null;
}

/* ───────── Intro ───────── */

function playLoader(onReveal: () => void) {
  const root = document.documentElement;
  const loader = document.getElementById("yalm-loader");
  if (!loader) {
    root.classList.remove("intro");
    onReveal();
    return;
  }
  const word = loader.querySelector("[data-loader-word]");
  const count = loader.querySelector("[data-loader-count]");
  const counter = { value: 0 };

  const tl = gsap.timeline({
    onComplete: () => {
      root.classList.remove("intro");
      try {
        sessionStorage.setItem("yalm-intro", "1");
      } catch {}
    },
  });
  tl.fromTo(word, { y: 0, yPercent: 110 }, { y: 0, yPercent: 0, duration: 1, ease: EASE })
    .to(
      counter,
      {
        value: 100,
        duration: 1.3,
        ease: "power2.inOut",
        onUpdate: () => {
          if (count) count.textContent = String(Math.round(counter.value));
        },
      },
      0
    )
    .to(word, { yPercent: -110, duration: 0.7, ease: "expo.in" }, "+=0.1")
    // The curtain lifts with a curved, arch-like bottom edge.
    .fromTo(
      loader,
      { clipPath: "ellipse(150% 100% at 50% 0%)" },
      { clipPath: "ellipse(150% 0% at 50% 0%)", duration: 1.1, ease: "expo.inOut" },
      "-=0.2"
    )
    .add(onReveal, "-=0.7");
}

function heroIntro(hero: HTMLElement) {
  const tl = gsap.timeline({ defaults: { ease: EASE } });
  tl.fromTo(
    hero.querySelectorAll("[data-split] .sw-inner"),
    { y: 0, yPercent: 115 },
    { y: 0, yPercent: 0, duration: 1.4, stagger: 0.07 }
  )
    .fromTo(
      hero.querySelectorAll("[data-hero-img]"),
      { clipPath: "inset(100% 0% 0% 0% round 999px 999px 0px 0px)" },
      { clipPath: "inset(0% 0% 0% 0% round 999px 999px 0px 0px)", duration: 1.7, ease: "expo.inOut", stagger: 0.15 },
      0.1
    )
    .fromTo(hero.querySelectorAll("[data-hero-img] img"), { scale: 1.4 }, { scale: 1, duration: 2.2 }, 0.1)
    .fromTo(
      hero.querySelectorAll("[data-fade-up]"),
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1.2, stagger: 0.08 },
      0.6
    );
}

/* ───────── Scroll ───────── */

function scrollReveals(hero: HTMLElement | null) {
  const outsideHero = (el: Element) => !hero || !hero.contains(el);

  gsap.utils
    .toArray<HTMLElement>("[data-split]")
    .filter(outsideHero)
    .forEach((el) => {
      gsap.fromTo(
        el.querySelectorAll(".sw-inner"),
        { y: 0, yPercent: 115 },
        {
          y: 0,
          yPercent: 0,
          duration: 1.2,
          ease: EASE,
          stagger: 0.06,
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        }
      );
    });

  gsap.utils
    .toArray<HTMLElement>("[data-fade-up]")
    .filter(outsideHero)
    .forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: EASE,
          delay: parseFloat(el.dataset.delay ?? "0"),
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        }
      );
    });
}

function parallax() {
  gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
    const speed = parseFloat(el.dataset.parallax || "0.2");
    const fromTop = el.dataset.parallaxStart === "top";
    gsap.fromTo(
      el,
      { y: fromTop ? 0 : -speed * 120 },
      {
        y: fromTop ? speed * 300 : speed * 120,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: fromTop ? "top top" : "top bottom",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      }
    );
  });

  gsap.utils.toArray<HTMLElement>("[data-img-parallax]").forEach((el) => {
    gsap.fromTo(
      el,
      { yPercent: -7, scale: 1.16 },
      {
        yPercent: 7,
        scale: 1.16,
        ease: "none",
        scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
      }
    );
  });
}

function marquees() {
  gsap.utils.toArray<HTMLElement>("[data-marquee]").forEach((band) => {
    const track = band.querySelector(".marquee-track");
    if (!track) return;
    const reverse = band.dataset.marquee === "reverse";
    const loop = gsap.fromTo(
      track,
      { xPercent: reverse ? -50 : 0 },
      { xPercent: reverse ? 0 : -50, duration: 32, ease: "none", repeat: -1 }
    );
    ScrollTrigger.create({
      trigger: band,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 350, 5);
        gsap.to(loop, {
          timeScale: self.direction * boost,
          duration: 0.2,
          overwrite: true,
          onComplete: () => {
            gsap.to(loop, { timeScale: self.direction, duration: 1.2, ease: "power2.out" });
          },
        });
      },
    });
  });
}

function spinners() {
  gsap.utils.toArray<HTMLElement>("[data-spin]").forEach((el) => {
    const spin = gsap.to(el, { rotation: 360, duration: 20, ease: "none", repeat: -1 });
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 250, 6);
        gsap.to(spin, {
          timeScale: boost,
          duration: 0.2,
          overwrite: true,
          onComplete: () => {
            gsap.to(spin, { timeScale: 1, duration: 1.5 });
          },
        });
      },
    });
  });
}

function panels() {
  gsap.utils.toArray<HTMLElement>("[data-panel]").forEach((el) => {
    gsap.fromTo(
      el,
      { clipPath: "inset(0% 5% 0% 5% round 3rem)" },
      {
        clipPath: "inset(0% 0% 0% 0% round 0rem)",
        ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "top 20%", scrub: true },
      }
    );
  });
}

function lines() {
  gsap.utils.toArray<HTMLElement>("[data-line]").forEach((el) => {
    const scrub = el.dataset.line === "scrub";
    gsap.fromTo(
      el,
      { scaleX: 0, transformOrigin: "left center" },
      {
        scaleX: 1,
        ease: scrub ? "none" : EASE,
        duration: scrub ? undefined : 1.6,
        scrollTrigger: scrub
          ? { trigger: el, start: "top 85%", end: "top 30%", scrub: true }
          : { trigger: el, start: "top 92%", once: true },
      }
    );
  });
}

function header() {
  const el = document.querySelector<HTMLElement>("[data-header]");
  if (!el) return;
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      const y = self.scroll();
      el.classList.toggle("is-scrolled", y > 40);
      const hide = self.direction === 1 && y > 320 && !el.querySelector("details[open]");
      gsap.to(el, { yPercent: hide ? -100 : 0, duration: 0.6, ease: "power3.out", overwrite: true });
    },
  });
}

/* ───────── Pointer ───────── */

function magnetic() {
  const offs: (() => void)[] = [];
  gsap.utils.toArray<HTMLElement>("[data-magnetic]").forEach((el) => {
    const strength = parseFloat(el.dataset.magnetic || "0.3");
    const xTo = gsap.quickTo(el, "x", { duration: 0.7, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.7, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    offs.push(() => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    });
  });
  return () => offs.forEach((fn) => fn());
}

function depth() {
  const layers = gsap.utils.toArray<HTMLElement>("[data-depth]").map((el) => {
    const amount = parseFloat(el.dataset.depth || "1");
    return {
      amount,
      x: gsap.quickTo(el, "x", { duration: 1.2, ease: "power3.out" }),
      y: gsap.quickTo(el, "y", { duration: 1.2, ease: "power3.out" }),
      r: gsap.quickTo(el, "rotation", { duration: 1.2, ease: "power3.out" }),
    };
  });
  if (layers.length === 0) return () => {};
  const move = (e: PointerEvent) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    for (const l of layers) {
      l.x(nx * 36 * l.amount);
      l.y(ny * 36 * l.amount);
      l.r(nx * 3 * l.amount);
    }
  };
  window.addEventListener("pointermove", move);
  return () => window.removeEventListener("pointermove", move);
}
