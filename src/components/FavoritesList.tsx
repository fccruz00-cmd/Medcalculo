'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { SearchEntry } from '@/lib/search';
import { FAVORITES_EVENT, readFavorites, toggleFavorite } from '@/lib/favorites';
import { StarIcon } from './icons';

export default function FavoritesList({ index }: { index: SearchEntry[] }) {
  const [slugs, setSlugs] = useState<string[] | null>(null);

  useEffect(() => {
    const sync = () => setSlugs(readFavorites());
    sync();
    window.addEventListener(FAVORITES_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(FAVORITES_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  // `null` enquanto o localStorage ainda não foi lido, para não piscar o vazio.
  if (slugs === null) {
    return <div className="mt-6 h-24 animate-pulse rounded-lg bg-ink-100" aria-hidden="true" />;
  }

  const saved = slugs
    .map((slug) => index.find((entry) => entry.slug === slug))
    .filter((entry): entry is SearchEntry => Boolean(entry));

  if (saved.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-dashed border-ink-300 bg-white p-8 text-center">
        <StarIcon className="mx-auto h-8 w-8 text-ink-300" />
        <p className="mt-3 text-[15px] font-semibold text-ink-700">
          Você ainda não salvou nenhuma calculadora.
        </p>
        <p className="mt-1 text-[14px] text-ink-500">
          Use o botão “Salvar” na página de qualquer calculadora para tê-la aqui.
        </p>
        <Link
          href="/calculadoras"
          className="mt-4 inline-block rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Ver o catálogo
        </Link>
      </div>
    );
  }

  return (
    <ul className="mt-6 divide-y divide-ink-100 overflow-hidden rounded-lg border border-ink-200 bg-white">
      {saved.map((entry) => (
        <li key={entry.slug} className="flex items-center gap-3 px-4 py-3.5">
          <Link href={`/calculadora/${entry.slug}`} className="group min-w-0 flex-1">
            <span className="block text-[15px] font-semibold text-brand-700 group-hover:underline">
              {entry.title}
            </span>
            <span className="mt-0.5 block truncate text-[13px] text-ink-500">{entry.subtitle}</span>
          </Link>
          <button
            type="button"
            onClick={() => setSlugs(toggleFavorite(entry.slug))}
            aria-label={`Remover ${entry.title} dos favoritos`}
            className="shrink-0 rounded p-2 text-amber-500 hover:bg-amber-50"
          >
            <StarIcon filled className="h-5 w-5" />
          </button>
        </li>
      ))}
    </ul>
  );
}
