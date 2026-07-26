'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { searchEntries, type SearchEntry } from '@/lib/search';
import { SearchIcon } from './icons';

export default function SearchResults({ index }: { index: SearchEntry[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get('q') ?? '';
  const [query, setQuery] = useState(initial);

  // Mantém a URL em sincronia com o campo, sem empilhar histórico.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = query.trim();
      const current = params.get('q') ?? '';
      if (next === current) return;
      router.replace(next ? `/buscar?q=${encodeURIComponent(next)}` : '/buscar', { scroll: false });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query, params, router]);

  const results = useMemo(() => searchEntries(index, query), [index, query]);
  const trimmed = query.trim();

  return (
    <div className="mt-4">
      <div className="relative max-w-2xl">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-ink-400" />
        <input
          type="search"
          value={query}
          autoFocus
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nome do escore, doença ou especialidade"
          aria-label="Buscar calculadora"
          className="w-full rounded-md border border-ink-200 bg-white py-3.5 pr-4 pl-12 text-base text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none"
        />
      </div>

      {trimmed.length === 0 ? (
        <p className="mt-6 text-[15px] text-ink-500">
          Digite para buscar entre {index.length} calculadoras. Você pode procurar pelo nome do
          escore, pela doença ou pela especialidade.
        </p>
      ) : results.length === 0 ? (
        <div className="mt-6 rounded-lg border border-ink-200 bg-white p-6">
          <p className="text-[15px] font-semibold text-ink-800">
            Nenhum resultado para “{trimmed}”.
          </p>
          <p className="mt-1.5 text-[14px] text-ink-500">
            Tente um termo mais curto, verifique a grafia ou navegue por{' '}
            <Link href="/especialidades" className="text-brand-600 hover:underline">
              especialidade
            </Link>
            .
          </p>
        </div>
      ) : (
        <>
          <p className="mt-5 text-sm text-ink-500">
            {results.length} {results.length === 1 ? 'resultado' : 'resultados'} para “{trimmed}”
          </p>
          <ul className="mt-3 divide-y divide-ink-100 overflow-hidden rounded-lg border border-ink-200 bg-white">
            {results.map((entry) => (
              <li key={entry.slug}>
                <Link
                  href={`/calculadora/${entry.slug}`}
                  className="group block px-4 py-3.5 hover:bg-brand-50"
                >
                  <span className="block text-[15px] font-semibold text-brand-700 group-hover:underline">
                    {entry.title}
                  </span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-ink-500">
                    {entry.subtitle}
                  </span>
                  <span className="mt-1.5 flex flex-wrap gap-1.5">
                    <span className="rounded bg-ink-100 px-1.5 py-0.5 text-[11px] font-medium text-ink-600">
                      {entry.kind}
                    </span>
                    {entry.specialties.slice(0, 3).map((specialty) => (
                      <span
                        key={specialty}
                        className="rounded bg-brand-50 px-1.5 py-0.5 text-[11px] font-medium text-brand-700"
                      >
                        {specialty}
                      </span>
                    ))}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
