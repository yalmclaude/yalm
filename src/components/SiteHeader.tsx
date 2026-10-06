import Link from "next/link";

const NAV_LINKS = [
  { href: "/#formules", label: "Formules" },
  { href: "/#catalogue", label: "Prestations" },
  { href: "/#comment-ca-marche", label: "Comment ça marche ?" },
];

export function SiteHeader() {
  return (
    <>
      <div className="bg-bordeaux text-center text-[0.68rem] font-medium uppercase tracking-[0.16em] text-cream py-2 px-4">
        Acompte requis pour bloquer votre date — disponibilités limitées
      </div>
      <header className="sticky top-0 z-50 border-b border-bordeaux/10 bg-cream/90 backdrop-blur-md">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-2">
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="YALM Events" className="h-16 w-auto sm:h-24" />
          </Link>
          <nav className="hidden md:flex items-center gap-7 label-caps text-bordeaux">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-bordeaux transition-colors">
                {l.label}
              </Link>
            ))}
            <a href="/coffret" className="hover:text-bordeaux transition-colors">
              Mon coffret
            </a>
            <a href="/admin" className="text-bordeaux/45 hover:text-bordeaux transition-colors">
              Admin
            </a>
          </nav>
          {/* Mobile: the full nav doesn't fit on a phone, so it folds into a menu (no JS needed). */}
          <details className="md:hidden relative">
            <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer p-2 text-bordeaux" aria-label="Menu">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </summary>
            <nav className="absolute right-0 mt-2 w-56 flex flex-col rounded border border-bordeaux/10 bg-cream-light py-2 label-caps text-bordeaux shadow-lg">
              {NAV_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="px-5 py-3 hover:bg-bordeaux/5">
                  {l.label}
                </Link>
              ))}
              <a href="/coffret" className="px-5 py-3 hover:bg-bordeaux/5">
                Mon coffret
              </a>
              <a href="/admin" className="px-5 py-3 text-bordeaux/50 hover:bg-bordeaux/5">
                Admin
              </a>
            </nav>
          </details>
        </div>
      </header>
    </>
  );
}
