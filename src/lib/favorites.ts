const STORAGE_KEY = 'medcalculo:favoritos';

/** Evento disparado quando a lista muda, para sincronizar abas e componentes. */
export const FAVORITES_EVENT = 'medcalculo:favoritos-alterados';

export function readFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    // Armazenamento indisponível (modo privativo, cota cheia): segue sem favoritos.
    return [];
  }
}

export function toggleFavorite(slug: string): string[] {
  const current = readFavorites();
  const next = current.includes(slug)
    ? current.filter((item) => item !== slug)
    : [...current, slug];

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignora falha de escrita: a interface ainda reflete a mudança na sessão.
  }
  window.dispatchEvent(new CustomEvent(FAVORITES_EVENT));
  return next;
}
