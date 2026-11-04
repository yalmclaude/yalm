import type { ReactNode } from "react";

// An infinite horizontal band. The content is rendered twice so the track can loop by
// shifting exactly half its width; the motion system speeds it up with scroll velocity
// and flips its direction with the scroll direction.
export function Marquee({
  children,
  className = "",
  reverse = false,
}: {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
}) {
  return (
    <div className={`overflow-hidden ${className}`} data-marquee={reverse ? "reverse" : ""} aria-hidden>
      <div className="marquee-track">
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center">{children}</div>
      </div>
    </div>
  );
}
