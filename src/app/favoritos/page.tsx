import type { Metadata } from 'next';
import { buildSearchIndex } from '@/data/registry';
import FavoritesList from '@/components/FavoritesList';

export const metadata: Metadata = {
  title: 'Favoritos',
  description: 'As calculadoras que você salvou, guardadas neste navegador.',
};

export default function FavoritesPage() {
  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">Favoritos</h1>
      <p className="mt-2 text-[15px] text-ink-600">
        Salvas neste navegador. Nada é enviado para servidor algum.
      </p>
      <FavoritesList index={buildSearchIndex()} />
    </div>
  );
}
