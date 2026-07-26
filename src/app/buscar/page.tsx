import type { Metadata } from 'next';
import { Suspense } from 'react';
import { buildSearchIndex } from '@/data/registry';
import SearchResults from '@/components/SearchResults';

export const metadata: Metadata = {
  title: 'Buscar',
  description: 'Busque escores, regras de decisão e fórmulas médicas por nome, doença ou especialidade.',
};

export default function SearchPage() {
  const index = buildSearchIndex();

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">Buscar</h1>
      <Suspense fallback={<p className="mt-4 text-sm text-ink-500">Carregando busca…</p>}>
        <SearchResults index={index} />
      </Suspense>
    </div>
  );
}
