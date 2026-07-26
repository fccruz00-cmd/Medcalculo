import type { Metadata } from 'next';
import Link from 'next/link';
import { getBySpecialty, getSpecialties } from '@/data/registry';
import { SpecialtyIcon } from '@/components/icons';
import { slugify } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Especialidades',
  description:
    'Escores e calculadoras médicas organizados por especialidade: cardiologia, emergência, nefrologia, neurologia e mais.',
};

export default function SpecialtiesPage() {
  const specialties = getSpecialties();

  return (
    <div className="container-page py-8">
      <header>
        <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">Especialidades</h1>
        <p className="mt-2 text-[15px] text-ink-600">
          Escolha uma área para ver os instrumentos disponíveis.
        </p>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {specialties.map((specialty) => {
          const examples = getBySpecialty(specialty.name).slice(0, 4);
          return (
            <section key={specialty.name} className="card flex flex-col p-5">
              <Link
                href={`/especialidades/${slugify(specialty.name)}`}
                className="group flex items-center gap-3"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600 group-hover:bg-brand-100">
                  <SpecialtyIcon specialty={specialty.name} className="h-6 w-6" />
                </span>
                <span>
                  <span className="block font-bold text-ink-900 group-hover:text-brand-700 group-hover:underline">
                    {specialty.name}
                  </span>
                  <span className="block text-[12px] text-ink-400">
                    {specialty.count} {specialty.count === 1 ? 'calculadora' : 'calculadoras'}
                  </span>
                </span>
              </Link>

              <ul className="mt-4 flex-1 space-y-1.5 border-t border-ink-100 pt-3">
                {examples.map((calc) => (
                  <li key={calc.slug}>
                    <Link
                      href={`/calculadora/${calc.slug}`}
                      className="block truncate text-[13px] text-ink-600 hover:text-brand-700 hover:underline"
                    >
                      {calc.shortTitle ?? calc.title}
                    </Link>
                  </li>
                ))}
              </ul>

              {specialty.count > examples.length && (
                <Link
                  href={`/especialidades/${slugify(specialty.name)}`}
                  className="mt-3 text-[13px] font-semibold text-brand-600 hover:underline"
                >
                  + {specialty.count - examples.length} outras
                </Link>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
