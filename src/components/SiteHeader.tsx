import Link from "next/link";

export function SiteHeader() {
  return (
    <>
      <div className="bg-bordeaux-dark text-center text-[0.78rem] tracking-wide text-gold-light py-2 px-4">
        Acompte requis pour bloquer votre date — disponibilités limitées
      </div>
      <header className="sticky top-0 z-50 border-b border-bordeaux/10 bg-background/90 backdrop-blur-md">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-2">
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="YALM Events" className="h-20 w-auto sm:h-24" />
          </Link>
          <nav className="flex items-center gap-8 text-sm font-medium text-anthracite">
            <Link href="/#formules" className="hover:text-bordeaux transition-colors">
              Formules
            </Link>
            <Link href="/#catalogue" className="hover:text-bordeaux transition-colors">
              Prestations
            </Link>
            <Link href="/#comment-ca-marche" className="hover:text-bordeaux transition-colors">
              Comment ça marche ?
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
