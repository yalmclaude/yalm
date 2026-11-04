import Link from "next/link";

const NAV_LINKS = [
  { href: "/#formules", label: "Formules" },
  { href: "/#catalogue", label: "Prestations" },
  { href: "/#comment-ca-marche", label: "Comment ça marche ?" },
];

// The bar hides while scrolling down and comes back on scroll up, turning frosted once
// the page has moved (both driven by the motion system through `data-header`).
export function SiteHeader() {
  return (
    <>
      <div className="overflow-hidden bg-bordeaux-band py-2 text-cream">
        <p className="px-4 text-center text-[0.65rem] font-medium uppercase tracking-[0.2em]">
          Acompte requis pour bloquer votre date — disponibilités limitées
        </p>
      </div>
      <header data-header className="sticky top-0 z-50 border-b border-transparent bg-cream/0 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-2.5 sm:px-8">
          <Link href="/" className="flex items-center" data-magnetic="0.2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-tight.png" alt="YALM Events" className="h-10 w-auto sm:h-12" />
          </Link>
          <nav className="hidden items-center gap-8 label-caps text-bordeaux md:flex">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="nav-link">
                {l.label}
              </Link>
            ))}
            <a href="/coffret" data-magnetic="0.25" className="btn btn-primary !px-5 !py-2.5">
              Mon coffret
            </a>
          </nav>
          {/* Mobile: the full nav doesn't fit on a phone, so it folds into a menu (no JS needed). */}
          <details className="relative md:hidden">
            <summary
              className="cursor-pointer list-none p-2 text-bordeaux [&::-webkit-details-marker]:hidden"
              aria-label="Menu"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M4 8h16M8 15h12" />
              </svg>
            </summary>
            <nav className="absolute right-0 mt-3 flex w-64 flex-col overflow-hidden rounded-2xl bg-bordeaux-rich py-3 text-cream shadow-[0_24px_50px_-20px_rgba(78,13,21,0.6)]">
              {NAV_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="px-6 py-3 font-serif text-2xl hover:bg-cream/10">
                  {l.label}
                </Link>
              ))}
              <a href="/coffret" className="px-6 py-3 font-serif text-2xl hover:bg-cream/10">
                Mon coffret
              </a>
            </nav>
          </details>
        </div>
      </header>
    </>
  );
}
