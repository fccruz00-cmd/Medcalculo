import type { Calculator, Specialty } from '@/lib/types';
import type { SearchEntry } from '@/lib/search';
import { normalize } from '@/lib/utils';
import { calculators } from './calculators';

/**
 * Acesso ao catálogo. Este módulo importa todas as definições, então deve ser
 * usado apenas em componentes de servidor: o cliente recebe só o índice
 * enxuto produzido por `buildSearchIndex`.
 */

/** Ordem de exibição das especialidades na navegação. */
export const SPECIALTY_ORDER: Specialty[] = [
  'Cardiologia',
  'Emergência',
  'Terapia Intensiva',
  'Clínica Médica',
  'Pneumologia',
  'Neurologia',
  'Nefrologia',
  'Gastroenterologia',
  'Hepatologia',
  'Infectologia',
  'Hematologia',
  'Endocrinologia',
  'Obstetrícia',
  'Pediatria',
  'Psiquiatria',
  'Ortopedia',
  'Oncologia',
  'Cirurgia',
  'Reumatologia',
  'Urologia',
  'Geriatria',
  'Anestesiologia',
  'Otorrinolaringologia',
  'Toxicologia',
];

/** Catálogo completo, ordenado por título. */
export const allCalculators: Calculator[] = [...calculators].sort((a, b) =>
  a.title.localeCompare(b.title, 'pt-BR'),
);

const bySlug = new Map(allCalculators.map((calc) => [calc.slug, calc]));

export function getCalculator(slug: string): Calculator | undefined {
  return bySlug.get(slug);
}

/**
 * Ordem de destaque na página inicial. Os slugs listados aqui vêm primeiro,
 * nesta ordem; as demais calculadoras marcadas como `popular` seguem em ordem
 * alfabética.
 */
const DESTAQUES = [
  'cha2ds2-vasc',
  'escala-coma-glasgow',
  'tfg-ckd-epi',
  'curb-65',
  'wells-tep',
  'child-pugh',
  'qsofa',
  'heart-score',
  'imc',
];

export function getPopular(limit?: number): Calculator[] {
  const populares = allCalculators.filter((calc) => calc.popular);
  const posicao = (calc: Calculator) => {
    const indice = DESTAQUES.indexOf(calc.slug);
    return indice === -1 ? DESTAQUES.length : indice;
  };

  const ordenadas = [...populares].sort(
    (a, b) => posicao(a) - posicao(b) || a.title.localeCompare(b.title, 'pt-BR'),
  );
  return limit ? ordenadas.slice(0, limit) : ordenadas;
}

export function getBySpecialty(specialty: Specialty): Calculator[] {
  return allCalculators.filter((calc) => calc.specialties.includes(specialty));
}

/** Especialidades presentes no catálogo, com a contagem de calculadoras. */
export function getSpecialties(): Array<{ name: Specialty; count: number }> {
  const counts = new Map<Specialty, number>();
  for (const calc of allCalculators) {
    for (const specialty of calc.specialties) {
      counts.set(specialty, (counts.get(specialty) ?? 0) + 1);
    }
  }
  return SPECIALTY_ORDER.filter((name) => counts.has(name)).map((name) => ({
    name,
    count: counts.get(name) ?? 0,
  }));
}

/** Outras calculadoras da mesma especialidade, para a barra lateral. */
export function getRelated(calc: Calculator, limit = 6): Calculator[] {
  return allCalculators
    .filter(
      (other) =>
        other.slug !== calc.slug &&
        other.specialties.some((specialty) => calc.specialties.includes(specialty)),
    )
    .slice(0, limit);
}

/** Índice enxuto entregue aos componentes de cliente. */
export function buildSearchIndex(): SearchEntry[] {
  return allCalculators.map((calc) => ({
    slug: calc.slug,
    title: calc.title,
    shortTitle: calc.shortTitle ?? calc.title,
    subtitle: calc.subtitle,
    kind: calc.kind,
    specialties: calc.specialties,
    haystack: normalize(
      [calc.title, calc.shortTitle, calc.subtitle, ...(calc.keywords ?? []), ...calc.specialties]
        .filter(Boolean)
        .join(' '),
    ),
  }));
}
