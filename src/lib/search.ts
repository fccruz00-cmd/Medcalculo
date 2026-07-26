import { normalize } from './utils';

/**
 * Versão enxuta e serializável de uma calculadora.
 *
 * Este módulo não importa o catálogo de propósito: componentes de cliente
 * podem usá-lo sem arrastar todas as definições (e funções `compute`) para
 * dentro do bundle do navegador.
 */
export interface SearchEntry {
  slug: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  kind: string;
  specialties: string[];
  /** Texto normalizado com título, sinônimos e especialidades. */
  haystack: string;
}

/**
 * Busca por termos: um item entra no resultado quando contém todos os termos
 * digitados. A ordenação favorece quem casa no começo do título.
 */
export function searchEntries(index: SearchEntry[], query: string, limit?: number): SearchEntry[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const scored = index
    .filter((entry) => terms.every((term) => entry.haystack.includes(term)))
    .map((entry) => {
      const title = normalize(entry.title);
      const short = normalize(entry.shortTitle);
      let score = 0;
      if (terms.every((term) => title.startsWith(term) || short.startsWith(term))) score -= 3;
      if (terms.every((term) => title.includes(term) || short.includes(term))) score -= 2;
      score += title.length / 200;
      return { entry, score };
    })
    .sort((a, b) => a.score - b.score || a.entry.title.localeCompare(b.entry.title, 'pt-BR'));

  const result = scored.map((item) => item.entry);
  return limit ? result.slice(0, limit) : result;
}
