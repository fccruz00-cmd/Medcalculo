'use client';

import { useEffect, useState } from 'react';
import type { Result } from '@/lib/types';
import { cx, severityStyles } from '@/lib/utils';
import { CheckIcon, CopyIcon, PrintIcon, RefreshIcon } from '../icons';

/**
 * Números ficam em destaque grande; resultados textuais ("PERC negativo",
 * "Classe III") encolhem para caber sem quebrar o painel.
 */
function valueSize(value: number | string): string {
  const comprimento = String(value).length;
  if (comprimento <= 5) return 'text-4xl sm:text-5xl';
  if (comprimento <= 10) return 'text-3xl sm:text-4xl';
  if (comprimento <= 18) return 'text-2xl sm:text-3xl';
  return 'text-xl sm:text-2xl';
}

/** Painel de resultado exibido logo abaixo dos campos. */
export function ResultCard({ result }: { result: Result }) {
  const styles = severityStyles(result.severity);

  return (
    <section
      aria-live="polite"
      className={cx('rounded-lg border-2 p-5 sm:p-6', styles.panel)}
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className={cx('font-bold tabular-nums', valueSize(result.value), styles.text)}>
          {result.value}
        </span>
        {result.unit && (
          <span className={cx('text-lg font-medium', styles.text)}>{result.unit}</span>
        )}
        {result.label && (
          <span
            className={cx(
              'ml-auto rounded-full px-3 py-1 text-sm font-bold text-white',
              styles.bar,
            )}
          >
            {result.label}
          </span>
        )}
      </div>

      <div className={cx('prose-clinic mt-4 text-[15px]', styles.text)}>
        {result.interpretation.split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>

      {result.details && result.details.length > 0 && (
        <dl className="mt-5 grid gap-x-6 gap-y-3 border-t border-current/15 pt-4 sm:grid-cols-2">
          {result.details.map((detail) => (
            <div key={detail.label}>
              <dt className={cx('text-xs font-semibold tracking-wide uppercase opacity-70', styles.text)}>
                {detail.label}
              </dt>
              <dd className={cx('mt-0.5 text-[15px] font-semibold', styles.text)}>
                {detail.value}
              </dd>
              {detail.hint && (
                <dd className={cx('text-[12px] opacity-70', styles.text)}>{detail.hint}</dd>
              )}
            </div>
          ))}
        </dl>
      )}

      {result.nextSteps && (
        <div className="mt-5 rounded-md border border-current/15 bg-white/60 p-4">
          <h3 className={cx('text-xs font-bold tracking-wide uppercase', styles.text)}>
            Conduta sugerida
          </h3>
          <div className={cx('prose-clinic mt-2 text-[14px]', styles.text)}>
            {result.nextSteps.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/** Barra fixa no rodapé da janela, sempre visível enquanto há resultado. */
export function StickyResultBar({
  result,
  onCopy,
  onReset,
  copied,
}: {
  result: Result;
  onCopy: () => void;
  onReset: () => void;
  copied: boolean;
}) {
  const styles = severityStyles(result.severity);
  useBottomBarSpacing();

  return (
    <div className={cx('no-print fixed inset-x-0 bottom-0 z-30 text-white shadow-2xl', styles.bar)}>
      <div className="container-page flex items-center gap-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl leading-none font-bold tabular-nums">{result.value}</span>
            {result.unit && <span className="text-sm opacity-90">{result.unit}</span>}
            {result.label && (
              <span className="truncate text-sm font-semibold opacity-95">· {result.label}</span>
            )}
          </div>
          <p className="mt-0.5 truncate text-[13px] opacity-85">
            {result.interpretation.split('\n')[0]}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <BarButton onClick={onCopy} label={copied ? 'Copiado' : 'Copiar'}>
            {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
          </BarButton>
          <BarButton onClick={() => window.print()} label="Imprimir">
            <PrintIcon className="h-4 w-4" />
          </BarButton>
          <BarButton onClick={onReset} label="Limpar">
            <RefreshIcon className="h-4 w-4" />
          </BarButton>
        </div>
      </div>
    </div>
  );
}

function BarButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="flex items-center gap-1.5 rounded-md px-2.5 py-2 text-[13px] font-semibold transition-colors hover:bg-white/20 sm:px-3"
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

/** Mostrado enquanto faltam respostas obrigatórias. */
export function PendingBar({ missing, total }: { missing: number; total: number }) {
  useBottomBarSpacing();
  const answered = total - missing;
  const percent = total > 0 ? Math.round((answered / total) * 100) : 0;

  return (
    <div className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-ink-200 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
      <div className="container-page flex items-center gap-4 py-3">
        <div className="flex-1">
          <p className="text-sm font-semibold text-ink-700">
            {missing === 1
              ? 'Falta 1 campo obrigatório'
              : `Faltam ${missing} campos obrigatórios`}
          </p>
          <div className="mt-1.5 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-ink-100">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
        <span className="shrink-0 text-sm font-bold text-ink-400 tabular-nums">
          {answered}/{total}
        </span>
      </div>
    </div>
  );
}

/**
 * Reserva espaço no rodapé da página enquanto uma barra fixa está visível,
 * para que o conteúdo final não fique escondido atrás dela.
 */
function useBottomBarSpacing() {
  useEffect(() => {
    document.body.dataset.resultOpen = 'true';
    return () => {
      delete document.body.dataset.resultOpen;
    };
  }, []);
}

/** Hook de cópia com aviso temporário de sucesso. */
export function useCopy(): [boolean, (text: string) => void] {
  const [copied, setCopied] = useState(false);

  function copy(text: string) {
    const done = () => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => undefined);
      return;
    }
    // Navegadores sem Clipboard API (ou fora de contexto seguro).
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand('copy');
      done();
    } finally {
      document.body.removeChild(area);
    }
  }

  return [copied, copy];
}
