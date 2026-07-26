import Link from 'next/link';
import type { Calculator } from '@/lib/types';
import { cx } from '@/lib/utils';

interface Props {
  calc: Pick<Calculator, 'slug' | 'title' | 'subtitle' | 'kind' | 'specialties'> & {
    shortTitle?: string;
  };
  /** `compact` remove a etiqueta de especialidade: usado em listas densas. */
  variant?: 'default' | 'compact';
}

export default function CalculatorCard({ calc, variant = 'default' }: Props) {
  return (
    <Link
      href={`/calculadora/${calc.slug}`}
      className={cx(
        'group card flex flex-col transition-all hover:border-brand-400 hover:shadow-md',
        variant === 'compact' ? 'p-3.5' : 'p-4',
      )}
    >
      <h3
        className={cx(
          'font-semibold text-brand-700 group-hover:text-brand-900 group-hover:underline',
          variant === 'compact' ? 'text-[14px]' : 'text-[15px]',
        )}
      >
        {calc.title}
      </h3>
      {/* O recorte precisa ficar sozinho: `flex-1` no mesmo elemento estica a
          caixa e a terceira linha volta a aparecer sob as reticências. */}
      <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-ink-500">{calc.subtitle}</p>

      {variant === 'default' && (
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
          <span className="rounded bg-ink-100 px-2 py-0.5 text-[11px] font-medium text-ink-600">
            {calc.kind}
          </span>
          {calc.specialties.slice(0, 2).map((specialty) => (
            <span
              key={specialty}
              className="rounded bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700"
            >
              {specialty}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
