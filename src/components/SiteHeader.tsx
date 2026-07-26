import Link from 'next/link';
import { buildSearchIndex } from '@/data/registry';
import HeaderSearch from './HeaderSearch';
import MobileNav from './MobileNav';

const NAV_LINKS = [
  { href: '/calculadoras', label: 'Calculadoras' },
  { href: '/especialidades', label: 'Especialidades' },
  { href: '/favoritos', label: 'Favoritos' },
  { href: '/sobre', label: 'Sobre' },
];

export default function SiteHeader() {
  const index = buildSearchIndex();

  return (
    <header className="no-print sticky top-0 z-40 bg-brand-900 shadow-sm">
      <div className="container-page flex h-16 items-center gap-4">
        <Link
          href="/"
          // O padding vertical amplia a área de toque sem mexer no layout.
          className="shrink-0 py-2 text-xl font-bold tracking-tight text-white"
          aria-label="MedCálculo: página inicial"
        >
          Med<span className="text-brand-300">Cálculo</span>
        </Link>

        <div className="hidden min-w-0 flex-1 md:block">
          <HeaderSearch index={index} />
        </div>

        <nav className="hidden shrink-0 items-center gap-1 lg:flex" aria-label="Navegação principal">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded px-3 py-2 text-sm font-medium text-brand-100 transition-colors hover:bg-brand-800 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <MobileNav links={NAV_LINKS} />
      </div>

      <div className="container-page pb-3 md:hidden">
        <HeaderSearch index={index} />
      </div>
    </header>
  );
}
