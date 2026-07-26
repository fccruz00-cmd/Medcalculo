import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBySpecialty, getSpecialties } from '@/data/registry';
import type { Specialty } from '@/lib/types';
import CalculatorCard from '@/components/CalculatorCard';
import { ChevronRightIcon, SpecialtyIcon } from '@/components/icons';
import { slugify } from '@/lib/utils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Resolve o slug da URL de volta para o nome da especialidade. */
function resolveSpecialty(slug: string): Specialty | undefined {
  return getSpecialties().find((item) => slugify(item.name) === slug)?.name;
}

export function generateStaticParams() {
  return getSpecialties().map((specialty) => ({ slug: slugify(specialty.name) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const specialty = resolveSpecialty(slug);
  if (!specialty) return { title: 'Especialidade não encontrada' };

  return {
    title: `Calculadoras de ${specialty}`,
    description: `Escores, regras de decisão e fórmulas de ${specialty}, em português, com interpretação clínica e referências.`,
  };
}

export default async function SpecialtyPage({ params }: PageProps) {
  const { slug } = await params;
  const specialty = resolveSpecialty(slug);
  if (!specialty) notFound();

  const calculators = getBySpecialty(specialty);
  const others = getSpecialties().filter((item) => item.name !== specialty);

  return (
    <div className="container-page py-8">
      <nav aria-label="Trilha de navegação" className="flex items-center gap-1.5 text-[13px] text-ink-500">
        <Link href="/" className="hover:text-brand-700 hover:underline">
          Início
        </Link>
        <ChevronRightIcon className="h-3.5 w-3.5 text-ink-300" />
        <Link href="/especialidades" className="hover:text-brand-700 hover:underline">
          Especialidades
        </Link>
      </nav>

      <header className="mt-4 flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <SpecialtyIcon specialty={specialty} className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">{specialty}</h1>
          <p className="mt-1 text-[15px] text-ink-600">
            {calculators.length} {calculators.length === 1 ? 'calculadora' : 'calculadoras'}{' '}
            disponíveis
          </p>
        </div>
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {calculators.map((calc) => (
          <CalculatorCard key={calc.slug} calc={calc} />
        ))}
      </div>

      <section className="mt-12 border-t border-ink-200 pt-6">
        <h2 className="text-sm font-bold text-ink-900">Outras especialidades</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {others.map((item) => (
            <Link
              key={item.name}
              href={`/especialidades/${slugify(item.name)}`}
              className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-[13px] font-medium text-ink-700 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
            >
              {item.name}
              <span className="ml-1.5 text-ink-400">{item.count}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
