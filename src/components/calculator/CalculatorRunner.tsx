'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Calculator, Field, FieldValue, Result, Values } from '@/lib/types';
import { isFieldVisible, missingFields, num } from '@/lib/utils';
import { lazyCalculators } from '@/data/calculators/lazy';
import FieldRow from './FieldRow';
import { PendingBar, ResultCard, StickyResultBar, useCopy } from './ResultPanel';

/**
 * Carrega a definição da calculadora sob demanda e conduz o formulário.
 *
 * A definição contém funções (`compute`, `showIf`) e por isso não pode vir do
 * servidor como propriedade: o componente busca o módulo pelo slug, o que
 * também garante que cada calculadora vire um chunk separado.
 */
export default function CalculatorRunner({ slug }: { slug: string }) {
  const [calc, setCalc] = useState<Calculator | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [values, setValues] = useState<Values>({});
  const [copied, copy] = useCopy();

  useEffect(() => {
    let cancelled = false;
    const load = lazyCalculators[slug];
    if (!load) {
      setLoadError(true);
      return;
    }
    load()
      .then((loaded) => {
        if (!cancelled) setCalc(loaded);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleChange = useCallback((id: string, value: FieldValue) => {
    setValues((current) => ({ ...current, [id]: value }));
  }, []);

  const reset = useCallback(() => {
    setValues({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const visibleFields = useMemo(
    () => (calc ? calc.fields.filter((field) => isFieldVisible(field, values)) : []),
    [calc, values],
  );

  const missing = useMemo(
    () => (calc ? missingFields(calc.fields, values) : []),
    [calc, values],
  );

  const result: Result | null = useMemo(() => {
    if (!calc || missing.length > 0) return null;
    try {
      return calc.compute(values);
    } catch {
      return null;
    }
  }, [calc, missing.length, values]);

  if (loadError) {
    return (
      <div className="card p-6 text-sm text-ink-600">
        Não foi possível carregar esta calculadora. Recarregue a página para tentar novamente.
      </div>
    );
  }

  if (!calc) {
    return <RunnerSkeleton />;
  }

  const requiredCount = calc.fields.filter(
    (field) => !field.optional && isFieldVisible(field, values),
  ).length;

  function handleCopy() {
    if (!calc || !result) return;
    copy(buildSummary(calc, visibleFields, values, result));
  }

  return (
    <div className="space-y-6">
      <div className="card overflow-hidden">
        {visibleFields.map((field) => (
          <FieldRow
            key={field.id}
            field={field}
            values={values}
            onChange={handleChange}
            highlightMissing={missing.length > 0 && missing.length < requiredCount}
          />
        ))}
      </div>

      {result ? (
        <>
          <ResultCard result={result} />
          <StickyResultBar
            result={result}
            onCopy={handleCopy}
            onReset={reset}
            copied={copied}
          />
        </>
      ) : (
        <PendingBar missing={missing.length} total={requiredCount} />
      )}
    </div>
  );
}

function RunnerSkeleton() {
  return (
    <div className="card divide-y divide-ink-100" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((row) => (
        <div key={row} className="flex items-center gap-6 px-5 py-5">
          <div className="h-4 w-2/5 animate-pulse rounded bg-ink-100" />
          <div className="ml-auto flex gap-2">
            <div className="h-9 w-20 animate-pulse rounded bg-ink-100" />
            <div className="h-9 w-20 animate-pulse rounded bg-ink-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Descrição legível do valor escolhido, usada no texto copiado. */
function describeValue(field: Field, values: Values): string {
  const value = values[field.id];
  if (value === null || value === undefined || value === '') return '-';

  switch (field.kind) {
    case 'boolean': {
      const [noLabel, yesLabel] = field.labels ?? ['Não', 'Sim'];
      return value === (field.pointsIfNo ?? 0) ? noLabel : yesLabel;
    }
    case 'choice':
    case 'select': {
      const match = field.options.find((option) => option.value === value);
      return match ? match.label : String(value);
    }
    case 'number':
      return typeof value === 'number'
        ? `${num(value, Number.isInteger(value) ? 0 : 2)}${field.unit ? ` ${field.unit}` : ''}`
        : String(value);
  }
}

/** Monta o bloco de texto colado no prontuário. */
function buildSummary(
  calc: Calculator,
  fields: Field[],
  values: Values,
  result: Result,
): string {
  const lines: string[] = [calc.title, ''];

  for (const field of fields) {
    lines.push(`- ${field.label}: ${describeValue(field, values)}`);
  }

  lines.push('');
  lines.push(
    `Resultado: ${result.value}${result.unit ? ` ${result.unit}` : ''}${
      result.label ? ` (${result.label})` : ''
    }`,
  );

  for (const detail of result.details ?? []) {
    lines.push(`${detail.label}: ${detail.value}`);
  }

  lines.push('');
  lines.push(result.interpretation);
  lines.push('');
  lines.push('Calculado com MedCálculo: ferramenta de apoio à decisão clínica.');

  return lines.join('\n');
}
