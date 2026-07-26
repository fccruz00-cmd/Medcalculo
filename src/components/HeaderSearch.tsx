'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { searchEntries, type SearchEntry } from '@/lib/search';
import { cx } from '@/lib/utils';
import { SearchIcon } from './icons';

interface Props {
  index: SearchEntry[];
  /** Versão grande, usada no bloco de destaque da página inicial. */
  variant?: 'header' | 'hero';
  autoFocus?: boolean;
}

const MAX_SUGGESTIONS = 8;

export default function HeaderSearch({ index, variant = 'header', autoFocus }: Props) {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(
    () => (query.trim().length >= 2 ? searchEntries(index, query, MAX_SUGGESTIONS) : []),
    [index, query],
  );

  // Fecha a lista ao clicar fora.
  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  useEffect(() => {
    setActive(0);
  }, [query]);

  function go(slug: string) {
    setOpen(false);
    setQuery('');
    router.push(`/calculadora/${slug}`);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActive((current) => Math.min(current + 1, suggestions.length - 1));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((current) => Math.max(current - 1, 0));
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const chosen = open ? suggestions[active] : undefined;
      if (chosen) {
        go(chosen.slug);
      } else if (query.trim()) {
        setOpen(false);
        router.push(`/buscar?q=${encodeURIComponent(query.trim())}`);
      }
    }
  }

  const isHero = variant === 'hero';

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <SearchIcon
          className={cx(
            'pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-400',
            isHero ? 'left-4 h-5 w-5' : 'left-3 h-4 w-4',
          )}
        />
        <input
          type="search"
          role="combobox"
          aria-expanded={open && suggestions.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label="Buscar calculadora, escore ou fórmula"
          autoFocus={autoFocus}
          value={query}
          placeholder={
            isHero
              ? 'Busque por escore, doença ou especialidade: ex.: CHA₂DS₂-VASc, sepse, TFG'
              : 'Buscar calculadora ou escore...'
          }
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={cx(
            'w-full rounded-md border bg-white text-ink-900 placeholder:text-ink-400',
            'focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none',
            isHero
              ? 'border-ink-200 py-4 pr-4 pl-12 text-base shadow-lg sm:text-lg'
              : 'border-brand-700 py-2 pr-3 pl-9 text-sm',
          )}
        />
      </div>

      {open && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute top-full right-0 left-0 z-50 mt-1 max-h-96 overflow-y-auto rounded-md border border-ink-200 bg-white py-1 shadow-xl"
        >
          {suggestions.map((entry, position) => (
            <li key={entry.slug} role="option" aria-selected={position === active}>
              <button
                type="button"
                onMouseEnter={() => setActive(position)}
                onClick={() => go(entry.slug)}
                className={cx(
                  'block w-full px-4 py-2.5 text-left transition-colors',
                  position === active ? 'bg-brand-50' : 'bg-white',
                )}
              >
                <span className="block text-sm font-semibold text-brand-800">{entry.title}</span>
                <span className="mt-0.5 block truncate text-xs text-ink-500">{entry.subtitle}</span>
              </button>
            </li>
          ))}
          <li className="border-t border-ink-100">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push(`/buscar?q=${encodeURIComponent(query.trim())}`);
              }}
              className="block w-full px-4 py-2.5 text-left text-xs font-semibold text-brand-600 hover:bg-brand-50"
            >
              Ver todos os resultados para “{query.trim()}”
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
