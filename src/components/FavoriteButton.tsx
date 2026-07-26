'use client';

import { useEffect, useState } from 'react';
import { FAVORITES_EVENT, readFavorites, toggleFavorite } from '@/lib/favorites';
import { cx } from '@/lib/utils';
import { StarIcon } from './icons';

export default function FavoriteButton({ slug }: { slug: string }) {
  // Começa sempre em `false` para o HTML do servidor bater com o do cliente;
  // o valor real chega no efeito, após a hidratação.
  const [favorito, setFavorito] = useState(false);

  useEffect(() => {
    const sync = () => setFavorito(readFavorites().includes(slug));
    sync();
    window.addEventListener(FAVORITES_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(FAVORITES_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [slug]);

  return (
    <button
      type="button"
      onClick={() => setFavorito(toggleFavorite(slug).includes(slug))}
      aria-pressed={favorito}
      aria-label={favorito ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
      title={favorito ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
      className={cx(
        'no-print flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-semibold transition-colors',
        favorito
          ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
          : 'border-ink-200 bg-white text-ink-500 hover:border-brand-300 hover:text-brand-700',
      )}
    >
      <StarIcon filled={favorito} className="h-4 w-4" />
      <span className="hidden sm:inline">{favorito ? 'Salva' : 'Salvar'}</span>
    </button>
  );
}
