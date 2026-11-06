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
   data-slides           (homepage) its [data-slide] children stack like full-screen pages:
                         each one sticks, the next slides over it while it recedes and
                         dims, and a scroll gesture inside a transition completes it;
                         data-slide-from="right" makes a slide enter sideways instead

   Everything is skipped in /admin and when the visitor prefers reduced motion (the
   inline script in the root layout then never adds the `motion` class). */

const EASE = "expo.out";

// The live Lenis instance, so route changes can reset its scroll position.
let lenisInstance: Lenis | null = null;
const HEADER_OFFSET = -90;
// True while a scroll is driven by code (slide snap, anchor glide), so the slide snap
// doesn't react to it.
let slideAuto = false;
function setSlideAuto(on: boolean) {
  slideAuto = on;
  // Native scroll snapping (touch screens) would fight code-driven scrolls.
  document.documentElement.classList.toggle("slides-auto", on);
}

const easeInOutQuart = (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2);

// Where to scroll for an anchor: the natural top of its slide when it opens one (slides
// cover the header area themselves), otherwise just below the sticky header.
function anchorY(target: HTMLElement) {
  const slide = target.closest<HTMLElement>("[data-slide]");
  if (slide?.dataset.slideTop && (slide === target || slide.firstElementChild === target)) {
    return Number(slide.dataset.slideTop);
  }
  return target.getBoundingClientRect().top + window.scrollY + HEADER_OFFSET;
}

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
    lenisInstance = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // In-page anchors ("/#catalogue" while on "/"): glide there instead of jumping.
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname) return;
      // A link to the page we're already on (the logo on the homepage): glide back to the top.
      if (!url.hash) {
        if (link.target || e.metaKey || e.ctrlKey || e.shiftKey || url.search !== location.search) return;
        e.preventDefault();
        link.closest("details")?.removeAttribute("open");
        setSlideAuto(true);
        lenis.scrollTo(0, {
          duration: 1.6,
          force: true,
          onComplete: () => {
            setSlideAuto(false);
          },
        });
        history.replaceState(history.state, "", url.pathname + url.search);
        return;
      }
      const target = document.querySelector(url.hash);
      if (!target) return;
      e.preventDefault();
      link.closest("details")?.removeAttribute("open");
      setSlideAuto(true);
      lenis.scrollTo(anchorY(target as HTMLElement), {
        duration: 1.4,
        force: true,
        onComplete: () => {
          setSlideAuto(false);
        },
      });
      history.replaceState(null, "", url.hash);
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisInstance = null;
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
      cleanups.push(slides());
      if (finePointer) {
        cleanups.push(magnetic(), depth());
      }
    });

    // A new page must open at its top: Next scrolls the window, but Lenis would otherwise
    // glide back to the previous page's position. Anchored URLs (/#formules) keep their target.
    if (lenisInstance) {
      const lenis = lenisInstance;
      const hashTarget = location.hash ? document.querySelector<HTMLElement>(location.hash) : null;
      setSlideAuto(true);
      lenis.resize();
      lenis.scrollTo(hashTarget ? anchorY(hashTarget) : 0, { immediate: true, force: true });
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setSlideAuto(false);
        })
      );
    }

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
    },
  });
  // The counter always runs all the way to 100 %, holds there a moment, then the curtain lifts.
  tl.fromTo(word, { y: 0, yPercent: 110 }, { y: 0, yPercent: 0, duration: 1, ease: EASE })
    .to(
      counter,
      {
        value: 100,
        duration: 1.8,
        ease: "power2.inOut",
        onUpdate: () => {
          if (count) count.textContent = String(Math.round(counter.value));
        },
        onComplete: () => {
          if (count) count.textContent = "100";
        },
      },
      0
    )
    .to(word, { yPercent: -110, duration: 0.7, ease: "expo.in" }, "+=0.35")
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

/* ───────── Slides (homepage) ───────── */

function slides() {
  const wrap = document.querySelector<HTMLElement>("[data-slides]");
  const lenis = lenisInstance;
  const els = wrap ? Array.from(wrap.querySelectorAll<HTMLElement>(":scope > [data-slide]")) : [];
  if (!wrap || !lenis || els.length < 2) return () => {};

  const root = document.documentElement;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  type Zone = {
    start: number;
    end: number;
    out: HTMLElement;
    inc: HTMLElement;
    covers: boolean;
    // "right": the next slide is held at the top of the screen and slides in sideways;
    // "bottom": it simply rises with the scroll.
    from: "right" | "bottom";
  };
  let zones: Zone[] = [];

  const render = (scroll: number) => {
    for (const z of zones) {
      const p = gsap.utils.clamp(0, 1, (scroll - z.start) / (z.end - z.start));
      z.out.style.setProperty("--dim", (p * 0.62).toFixed(3));
      const side = z.from === "right";
      z.out.style.transform =
        p > 0 ? `${side ? `translateX(${(-12 * p).toFixed(2)}%) ` : ""}scale(${(1 - 0.08 * p).toFixed(4)})` : "";
      // Once fully covered, hide it so it can't peek out behind the next receding slide.
      z.out.style.visibility = p >= 1 && z.covers ? "hidden" : "";
      const r = `${((1 - p) * 56).toFixed(1)}px`;
      z.inc.style.setProperty("--r-tl", r);
      z.inc.style.setProperty(side ? "--r-bl" : "--r-tr", r);
      const first = z.inc.firstElementChild as HTMLElement | null;
      if (side) {
        // Cancel the scroll's vertical travel so the slide stays pinned to the top while it
        // comes in from the right; its content lags a little behind for depth.
        const lift = Math.max(0, z.end - scroll);
        z.inc.style.translate = p > 0 && p < 1 ? `${((1 - p) * 100).toFixed(2)}% ${(-lift).toFixed(1)}px` : "";
        z.inc.style.boxShadow = p > 0 && p < 1 ? "-40px 0 80px -20px rgba(20, 3, 6, 0.5)" : "";
        if (first) first.style.translate = p > 0 && p < 1 ? `${(-(1 - p) * 30).toFixed(2)}% 0` : "";
      } else if (first) {
        first.style.translate = p < 1 ? `0 ${((1 - p) * 90).toFixed(1)}px` : "";
      }
    }
  };

  // Slides keep their natural flow positions (sticky doesn't move them in the layout), so
  // each transition zone runs from "next slide's top enters the viewport bottom" to "it
  // reaches the top". Tall slides stick by their bottom edge (negative top).
  // One snap marker per slide, at its natural top (sticky slides can't carry it: they
  // move). Used by the CSS scroll snapping on touch screens.
  if (getComputedStyle(wrap).position === "static") wrap.style.position = "relative";
  const markers = els.map(() => {
    const m = document.createElement("span");
    m.className = "slide-snap";
    m.setAttribute("aria-hidden", "true");
    wrap.appendChild(m);
    return m;
  });

  const measure = () => {
    const vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    const wrapTop = wrap.getBoundingClientRect().top + window.scrollY;
    let top = wrapTop;
    zones = [];
    els.forEach((el, i) => {
      const h = el.offsetHeight;
      el.dataset.slideTop = String(Math.round(top));
      markers[i].style.top = `${Math.round(top - wrapTop)}px`;
      if (i < els.length - 1) el.style.top = `${Math.min(0, vh - h)}px`;
      if (i > 0) {
        const start = Math.max(0, top - vh);
        const end = Math.min(top, max);
        if (end - start > 40) zones.push({
            start,
            end,
            out: els[i - 1],
            inc: el,
            covers: h >= vh,
            from: el.dataset.slideFrom === "right" && h >= vh && end === top ? "right" : "bottom",
          });
      }
      top += h;
    });
    render(lenis.scroll);
  };

  // A gesture inside a transition finishes it in that direction: down slides the next
  // page in, up slides back to the previous one.
  let last = lenis.scroll;
  let dir = 1;
  const snapTarget = (scroll: number) => {
    const z = zones.find((zone) => scroll > zone.start + 2 && scroll < zone.end - 2);
    return z ? (dir > 0 ? z.end : z.start) : null;
  };
  const settle = (scroll: number) => {
    if (slideAuto) return;
    const target = snapTarget(scroll);
    if (target === null) return;
    setSlideAuto(true);
    lenis.scrollTo(target, {
      duration: 1.25,
      easing: easeInOutQuart,
      lock: true,
      force: true,
      onComplete: () => {
        setSlideAuto(false);
      },
    });
  };
  // Touch screens: the browser's own scroll snapping (CSS, on markers placed at each
  // slide's start by measure()) stops a swipe's momentum right on a slide's edge, so its
  // title isn't left cut off. A swipe that ends mid-transition is finished here once the
  // page has come to rest, in the finger's direction (scroll deltas are unreliable there).
  let timer: ReturnType<typeof setTimeout> | undefined;
  let touchY: number | null = null;
  const onTouchStart = (e: TouchEvent) => {
    touchY = e.touches[0]?.clientY ?? null;
  };
  const onTouchMove = (e: TouchEvent) => {
    const y = e.touches[0]?.clientY;
    if (touchY === null || y === undefined || Math.abs(y - touchY) < 6) return;
    dir = y < touchY ? 1 : -1;
  };
  if (coarse) {
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
  }

  const offScroll = lenis.on("scroll", () => {
    const s = lenis.scroll;
    if (s !== last && !coarse) dir = s > last ? 1 : -1;
    last = s;
    render(s);
    if (coarse) {
      clearTimeout(timer);
      timer = setTimeout(() => settle(lenis.scroll), 160);
    } else {
      settle(s);
    }
  });

  // ScrollTrigger measures the page with slides unstuck and untransformed.
  const unstick = () => root.classList.add("slides-measuring");
  const restick = () => {
    root.classList.remove("slides-measuring");
    measure();
  };
  root.classList.add("has-slides");
  ScrollTrigger.addEventListener("refreshInit", unstick);
  ScrollTrigger.addEventListener("refresh", restick);
  measure();

  return () => {
    offScroll();
    clearTimeout(timer);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);
    markers.forEach((m) => m.remove());
    wrap.style.removeProperty("position");
    ScrollTrigger.removeEventListener("refreshInit", unstick);
    ScrollTrigger.removeEventListener("refresh", restick);
    root.classList.remove("has-slides", "slides-measuring");
    els.forEach((el) => {
      el.style.removeProperty("top");
      el.style.removeProperty("transform");
      el.style.removeProperty("visibility");
      el.style.removeProperty("--dim");
      ["--r-tl", "--r-tr", "--r-bl", "translate", "box-shadow"].forEach((prop) => el.style.removeProperty(prop));
      (el.firstElementChild as HTMLElement | null)?.style.removeProperty("translate");
    });
  };
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
