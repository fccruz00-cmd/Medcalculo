import type { Metadata } from 'next';
import Link from 'next/link';
import { allCalculators, getSpecialties } from '@/data/registry';
import { slugify } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Todas as calculadoras',
  description:
    'Catálogo completo de escores, regras de decisão e fórmulas médicas do MedCálculo, em ordem alfabética.',
};

/** Primeira letra do título, ignorando acentos, para o agrupamento A-Z. */
function initial(title: string): string {
  const letter = title.normalize('NFD').replace(/[^A-Za-z0-9]/g, '').charAt(0).toUpperCase();
  return /[A-Z]/.test(letter) ? letter : '#';
}

export default function CalculatorsPage() {
  const specialties = getSpecialties();

  const groups = new Map<string, typeof allCalculators>();
  for (const calc of allCalculators) {
    const key = initial(calc.title);
    const list = groups.get(key) ?? [];
    list.push(calc);
    groups.set(key, list);
  }
  const letters = [...groups.keys()].sort();

  return (
    <div className="container-page py-8">
      <header>
        <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">Todas as calculadoras</h1>
        <p className="mt-2 text-[15px] text-ink-600">
          {allCalculators.length} instrumentos em {specialties.length} especialidades, em ordem
          alfabética.
        </p>
      </header>

      {/* Índice de letras */}
      <nav aria-label="Índice alfabético" className="sticky top-16 z-20 -mx-1 mt-6 bg-ink-50/95 py-3 backdrop-blur">
        <div className="flex flex-wrap gap-1">
          {letters.map((letter) => (
            <a
              key={letter}
              href={`#letra-${letter}`}
              className="flex h-8 w-8 items-center justify-center rounded border border-ink-200 bg-white text-[13px] font-bold text-brand-700 hover:border-brand-400 hover:bg-brand-50"
            >
              {letter}
            </a>
          ))}
        </div>
      </nav>

      <div className="mt-4 space-y-8">
        {letters.map((letter) => (
          <section key={letter} id={`letra-${letter}`} className="scroll-mt-32">
            <h2 className="mb-2 border-b-2 border-brand-200 pb-1 text-lg font-bold text-brand-800">
              {letter}
            </h2>
            <ul className="divide-y divide-ink-100">
              {(groups.get(letter) ?? []).map((calc) => (
                <li key={calc.slug}>
                  <Link
                    href={`/calculadora/${calc.slug}`}
                    className="group flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:gap-4"
                  >
                    <span className="text-[15px] font-semibold text-brand-700 group-hover:underline sm:w-[40%] sm:shrink-0">
                      {calc.title}
                    </span>
                    <span className="flex-1 text-[13px] leading-snug text-ink-500">
                      {calc.subtitle}
                    </span>
                    <span className="hidden shrink-0 text-[12px] text-ink-400 lg:block">
                      {calc.specialties[0]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-12 rounded-lg border border-ink-200 bg-white p-5">
        <h2 className="text-sm font-bold text-ink-900">Navegar por especialidade</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {specialties.map((specialty) => (
            <Link
              key={specialty.name}
              href={`/especialidades/${slugify(specialty.name)}`}
              className="rounded-full border border-ink-200 px-3 py-1.5 text-[13px] font-medium text-ink-700 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
            >
              {specialty.name}
              <span className="ml-1.5 text-ink-400">{specialty.count}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
