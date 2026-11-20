import Link from "next/link";

const NAV_LINKS = [
  { href: "/prestations", label: "Prestations" },
  { href: "/formules", label: "Formules" },
  { href: "/comment-ca-marche", label: "Comment ça marche ?" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-bordeaux/10 bg-cream/90 backdrop-blur-md">
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
                // Plain links: a full page load also closes this <details> menu.
                <a key={l.href} href={l.href} className="px-6 py-3 font-serif text-2xl hover:bg-cream/10">
                  {l.label}
                </a>
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
