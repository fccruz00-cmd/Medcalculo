'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CloseIcon, MenuIcon } from './icons';

interface Props {
  links: Array<{ href: string; label: string }>;
}

export default function MobileNav({ links }: Props) {
  const [open, setOpen] = useState(false);

  // Trava a rolagem do corpo enquanto o menu está aberto.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        className="rounded p-2 text-brand-100 hover:bg-brand-800 hover:text-white"
      >
        <MenuIcon className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-brand-900/95 backdrop-blur-sm">
          <div className="container-page flex h-16 items-center justify-between">
            <span className="text-xl font-bold text-white">
              Med<span className="text-brand-300">Cálculo</span>
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
              className="rounded p-2 text-brand-100 hover:bg-brand-800 hover:text-white"
            >
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="container-page mt-6 flex flex-col gap-1" aria-label="Navegação principal">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-4 py-3 text-lg font-medium text-brand-100 hover:bg-brand-800 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
