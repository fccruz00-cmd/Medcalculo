import type { Field, Severity, Values } from './types';

/** Junta classes ignorando valores vazios. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** Formata número no padrão brasileiro (vírgula decimal). */
export function num(value: number, decimals = 0): string {
  if (!Number.isFinite(value)) return '-';
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Faixa de combining diacritical marks, removida ao normalizar. */
const DIACRITICS = /[̀-ͯ]/g;

/** Remove acentos e caixa, para comparações de busca. */
export function normalize(text: string): string {
  return text.normalize('NFD').replace(DIACRITICS, '').toLowerCase().trim();
}

/** Gera slug a partir de um texto livre. */
export function slugify(text: string): string {
  return normalize(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Um campo só conta se estiver visível de acordo com `showIf`. */
export function isFieldVisible(field: Field, values: Values): boolean {
  return field.showIf ? field.showIf(values) : true;
}

/** Campos visíveis, obrigatórios e ainda sem resposta. */
export function missingFields(fields: Field[], values: Values): Field[] {
  return fields.filter((field) => {
    if (field.optional) return false;
    if (!isFieldVisible(field, values)) return false;
    const value = values[field.id];
    return value === null || value === undefined || value === '';
  });
}

/** Soma os valores numéricos dos campos visíveis: o padrão dos escores. */
export function sumPoints(fields: Field[], values: Values): number {
  return fields.reduce((total, field) => {
    if (!isFieldVisible(field, values)) return total;
    const value = values[field.id];
    return typeof value === 'number' ? total + value : total;
  }, 0);
}

/** Lê um campo numérico, devolvendo 0 quando vazio. */
export function n(values: Values, id: string): number {
  const value = values[id];
  return typeof value === 'number' ? value : 0;
}

const SEVERITY_STYLES: Record<Severity, { bar: string; panel: string; text: string; dot: string }> = {
  info: {
    bar: 'bg-brand-700',
    panel: 'border-brand-200 bg-brand-50',
    text: 'text-brand-800',
    dot: 'bg-brand-600',
  },
  baixo: {
    bar: 'bg-emerald-700',
    panel: 'border-emerald-200 bg-emerald-50',
    text: 'text-emerald-900',
    dot: 'bg-emerald-600',
  },
  moderado: {
    bar: 'bg-amber-600',
    panel: 'border-amber-200 bg-amber-50',
    text: 'text-amber-900',
    dot: 'bg-amber-500',
  },
  alto: {
    bar: 'bg-orange-700',
    panel: 'border-orange-200 bg-orange-50',
    text: 'text-orange-900',
    dot: 'bg-orange-600',
  },
  critico: {
    bar: 'bg-red-800',
    panel: 'border-red-200 bg-red-50',
    text: 'text-red-900',
    dot: 'bg-red-700',
  },
};

export function severityStyles(severity: Severity = 'info') {
  return SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.info;
}
