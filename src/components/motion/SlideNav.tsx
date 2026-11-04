"use client";

import { useEffect, useState } from "react";

type Item = { href: string; label: string };

// Fixed side navigation for the homepage slides: one tick per slide, the current one
// longer; number and name appear on hover (in a pill, so they stay readable over content).
// Links are plain anchors, glided by the motion system.
// Hidden unless motion is on (see `.slide-nav` in globals.css).
export function SlideNav({ items }: { items: Item[] }) {
  const [active, setActive] = useState(0);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const update = () => {
      const slides = Array.from(document.querySelectorAll<HTMLElement>("[data-slides] > [data-slide]"));
      const probe = window.scrollY + window.innerHeight * 0.5;
      let current = 0;
      slides.forEach((el, i) => {
        if (Number(el.dataset.slideTop ?? Infinity) <= probe) current = i;
      });
      setActive(current);
      setDark(slides[current]?.dataset.slideTone === "dark");
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <nav
      aria-label="Sections de la page"
      className={`slide-nav group/nav fixed right-5 top-1/2 z-50 -translate-y-1/2 flex-col items-end gap-4 transition-colors duration-500 ${
        dark ? "text-cream" : "text-bordeaux"
      }`}
    >
      {items.map((item, i) => {
        const on = i === active;
        return (
          <a key={item.href} href={item.href} className="group flex items-center gap-3" aria-current={on ? "true" : undefined}>
            <span
              className={`label-caps whitespace-nowrap rounded-full px-3 py-1.5 backdrop-blur-md transition-all duration-500 ${
                dark ? "bg-bordeaux/70" : "bg-cream/80"
              } ${
                on
                  ? "translate-x-2 opacity-0 group-hover/nav:translate-x-0 group-hover/nav:opacity-100"
                  : "translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-90"
              }`}
            >
              <span className="mr-2 opacity-50">{String(i + 1).padStart(2, "0")}</span>
              {item.label}
            </span>
            <span
              className={`block h-px bg-current transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                on ? "w-10 opacity-100" : "w-4 opacity-40 group-hover:w-6 group-hover:opacity-80"
              }`}
            />
          </a>
        );
      })}
    </nav>
  );
}
