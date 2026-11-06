// Round bordeaux badge with "Your amazing life moments" turning around its edge, like the
// one in the hero. `id` must be unique on the page (it names the SVG text path).
export function SpinBadge({
  id,
  children,
  className = "h-20 w-20",
  text = "Your amazing life moments ✦ ",
}: {
  id: string;
  children?: React.ReactNode;
  className?: string;
  text?: string;
}) {
  return (
    <span
      className={`relative grid shrink-0 place-items-center rounded-full bg-bordeaux-orb text-cream shadow-[0_16px_32px_-14px_rgba(30,4,8,0.8)] ${className}`}
    >
      <svg data-spin viewBox="0 0 100 100" className="spin-slow absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <path id={id} d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
        </defs>
        <text
          fill="currentColor"
          className="text-[8.4px] uppercase tracking-[0.32em]"
          style={{ fontFamily: "var(--font-montserrat)" }}
        >
          <textPath href={`#${id}`}>{text}</textPath>
        </text>
      </svg>
      <span className="text-lg" aria-hidden>
        {children ?? "✦"}
      </span>
    </span>
  );
}

// Two photos sharing one frame, cut along a diagonal with a thin cream seam, and the
// spinning badge sitting on the cut. Falls back to a single photo when only one is given.
export function SplitPhotos({
  urls,
  alt,
  badgeId,
  className = "",
  zoomOnHover = false,
}: {
  urls: string[];
  alt: string;
  badgeId: string;
  className?: string;
  zoomOnHover?: boolean;
}) {
  const zoom = zoomOnHover
    ? "transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
    : "";
  const [a, b] = urls;
  return (
    <div className={`relative aspect-[4/3] overflow-hidden ${className}`}>
      {b ? (
        <>
          <div className="absolute inset-y-0 left-0 w-[58%] overflow-hidden [clip-path:polygon(0_0,100%_0,72.4%_100%,0_100%)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a} alt={alt} className={`h-full w-full object-cover ${zoom}`} />
          </div>
          <div className="absolute inset-y-0 right-0 w-[58%] overflow-hidden [clip-path:polygon(27.6%_0,100%_0,100%_100%,0_100%)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b} alt="" className={`h-full w-full object-cover ${zoom}`} />
          </div>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
            <line x1="58" y1="0" x2="42" y2="100" stroke="#f7ead5" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          </svg>
        </>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={a} alt={alt} className={`h-full w-full object-cover ${zoom}`} />
      )}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <SpinBadge id={badgeId} />
      </div>
    </div>
  );
}
