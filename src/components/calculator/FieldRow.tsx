'use client';

import { useState } from 'react';
import type { Field, FieldValue, Option, Values } from '@/lib/types';
import { cx } from '@/lib/utils';
import { ChevronDownIcon, InfoIcon } from '../icons';

interface Props {
  field: Field;
  values: Values;
  onChange: (id: string, value: FieldValue) => void;
  /** Destaca campos obrigatórios ainda em branco. */
  highlightMissing: boolean;
}

const SIM_NAO: [string, string] = ['Não', 'Sim'];

export default function FieldRow({ field, values, onChange, highlightMissing }: Props) {
  const [showHelp, setShowHelp] = useState(false);
  const value = values[field.id];
  const isEmpty = value === null || value === undefined || value === '';
  const isMissing = highlightMissing && isEmpty && !field.optional;

  return (
    <div
      className={cx(
        'flex flex-col gap-3 border-b border-ink-100 px-4 py-4 last:border-b-0 sm:flex-row sm:items-start sm:gap-6 sm:px-5',
        isMissing && 'bg-amber-50/60',
      )}
    >
      {/* Coluna do rótulo */}
      <div className="sm:w-[46%] sm:shrink-0 sm:pt-1.5">
        <div className="flex items-start gap-1.5">
          <span className="text-[15px] leading-snug font-semibold text-ink-900">{field.label}</span>
          {field.optional && (
            <span className="mt-0.5 shrink-0 rounded bg-ink-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-ink-500 uppercase">
              opcional
            </span>
          )}
          {field.help && (
            <button
              type="button"
              onClick={() => setShowHelp((open) => !open)}
              aria-expanded={showHelp}
              aria-label={`Ajuda sobre ${field.label}`}
              // -m-1 compensa o padding: a área de toque cresce para 24px sem
              // deslocar o ícone em relação ao rótulo.
              className="-m-1 shrink-0 rounded p-1 text-brand-500 hover:text-brand-700"
            >
              <InfoIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {field.hint && <p className="mt-1 text-[13px] leading-snug text-ink-500">{field.hint}</p>}

        {showHelp && field.help && (
          <p className="mt-2 rounded border border-brand-100 bg-brand-50 p-2.5 text-[13px] leading-relaxed text-brand-900">
            {field.help}
          </p>
        )}
      </div>

      {/* Coluna do controle */}
      <div className="min-w-0 flex-1">
        <FieldControl field={field} value={value} onChange={onChange} />
      </div>
    </div>
  );
}

function FieldControl({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: FieldValue;
  onChange: (id: string, value: FieldValue) => void;
}) {
  switch (field.kind) {
    case 'boolean': {
      const [noLabel, yesLabel] = field.labels ?? SIM_NAO;
      const noPoints = field.pointsIfNo ?? 0;
      const yesPoints = field.points ?? 1;
      const options: Option[] = [
        { label: noLabel, value: noPoints },
        { label: yesLabel, value: yesPoints, badge: yesPoints > 0 ? `+${yesPoints}` : undefined },
      ];
      return (
        <OptionButtons
          options={options}
          value={value}
          onSelect={(next) => onChange(field.id, next)}
        />
      );
    }

    case 'choice':
      return (
        <OptionButtons
          options={field.options}
          value={value}
          layout={field.layout}
          onSelect={(next) => onChange(field.id, next)}
        />
      );

    case 'select':
      return (
        <div className="relative">
          <select
            value={value === null || value === undefined ? '' : String(value)}
            onChange={(event) => {
              const raw = event.target.value;
              if (raw === '') return onChange(field.id, null);
              const match = field.options.find((option) => String(option.value) === raw);
              onChange(field.id, match ? match.value : raw);
            }}
            className="w-full appearance-none rounded-md border border-ink-300 bg-white py-2.5 pr-9 pl-3 text-[15px] text-ink-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none"
          >
            <option value="">{field.placeholder ?? 'Selecione...'}</option>
            {field.options.map((option) => (
              <option key={String(option.value)} value={String(option.value)}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-ink-400" />
        </div>
      );

    case 'number':
      return <NumberInput field={field} value={value} onChange={onChange} />;
  }
}

function OptionButtons({
  options,
  value,
  layout = 'auto',
  onSelect,
}: {
  options: Option[];
  value: FieldValue;
  layout?: 'auto' | 'stack';
  onSelect: (value: number | string) => void;
}) {
  return (
    <div
      className={cx(
        'flex gap-2',
        layout === 'stack' ? 'flex-col' : 'flex-wrap sm:justify-end',
      )}
      role="group"
    >
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={String(option.value) + option.label}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(option.value)}
            className={cx(
              'rounded-md border px-3.5 py-2 text-left text-[14px] font-medium transition-colors',
              layout === 'stack' ? 'w-full' : 'flex-1 sm:flex-none',
              selected
                ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
                : 'border-ink-300 bg-white text-ink-700 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800',
            )}
          >
            <span className="flex items-baseline justify-between gap-2">
              <span>{option.label}</span>
              {option.badge && (
                <span
                  className={cx(
                    'shrink-0 text-[11px] font-bold tabular-nums',
                    selected ? 'text-brand-100' : 'text-ink-400',
                  )}
                >
                  {option.badge}
                </span>
              )}
            </span>
            {option.hint && (
              <span
                className={cx(
                  'mt-0.5 block text-[12px] leading-snug font-normal',
                  selected ? 'text-brand-100' : 'text-ink-500',
                )}
              >
                {option.hint}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function NumberInput({
  field,
  value,
  onChange,
}: {
  field: Extract<Field, { kind: 'number' }>;
  value: FieldValue;
  onChange: (id: string, value: FieldValue) => void;
}) {
  const toggle = field.unitToggle;
  const [useAlt, setUseAlt] = useState(false);

  // O estado guarda sempre a unidade base; a alternativa é só de exibição.
  const displayValue =
    typeof value === 'number' && toggle && useAlt
      ? String(roundSmart(toggle.fromBase(value)))
      : value === null || value === undefined
        ? ''
        : String(value);

  const unit = toggle && useAlt ? toggle.alt : field.unit;

  return (
    <div className="sm:flex sm:justify-end">
      <div className="w-full sm:max-w-[280px]">
        <div className="flex items-stretch overflow-hidden rounded-md border border-ink-300 bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200">
          <input
            type="number"
            inputMode="decimal"
            value={displayValue}
            min={field.min}
            max={field.max}
            step={field.step ?? 'any'}
            placeholder={field.placeholder ?? 'Digite o valor'}
            onChange={(event) => {
              const raw = event.target.value;
              if (raw === '') return onChange(field.id, null);
              const parsed = Number(raw);
              if (Number.isNaN(parsed)) return;
              onChange(field.id, toggle && useAlt ? toggle.toBase(parsed) : parsed);
            }}
            className="w-full min-w-0 bg-transparent px-3 py-2.5 text-[15px] text-ink-900 focus:outline-none"
          />
          {unit && (
            <span className="flex shrink-0 items-center border-l border-ink-200 bg-ink-50 px-3 text-[13px] font-medium text-ink-600">
              {unit}
            </span>
          )}
        </div>

        <div className="mt-1 flex items-center justify-between gap-3">
          {field.normalRange ? (
            <span className="text-[12px] text-ink-400">Referência: {field.normalRange}</span>
          ) : (
            <span />
          )}
          {toggle && (
            <button
              type="button"
              onClick={() => setUseAlt((current) => !current)}
              // -my-1 compensa o padding, que existe só para o alvo de toque
              // chegar a 24px sem afastar o botão do campo.
              className="-my-1 py-1 text-[12px] font-semibold text-brand-600 hover:text-brand-800 hover:underline"
            >
              usar {useAlt ? field.unit : toggle.alt}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Evita dízimas longas ao converter unidades no campo. */
function roundSmart(value: number): number {
  const abs = Math.abs(value);
  const decimals = abs >= 100 ? 0 : abs >= 10 ? 1 : abs >= 1 ? 2 : 3;
  return Number(value.toFixed(decimals));
}
