import Link from 'next/link';
import { allCalculators, buildSearchIndex, getPopular, getSpecialties } from '@/data/registry';
import CalculatorCard from '@/components/CalculatorCard';
import HeaderSearch from '@/components/HeaderSearch';
import { SpecialtyIcon } from '@/components/icons';
import { slugify } from '@/lib/utils';

export default function HomePage() {
  const index = buildSearchIndex();
  const popular = getPopular(9);
  const specialties = getSpecialties();
  const recentes = allCalculators.slice(0, 8);

  return (
    <>
      {/* Bloco de destaque com a busca */}
      <section className="bg-brand-800 bg-gradient-to-b from-brand-800 to-brand-900">
        <div className="container-page py-14 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl leading-tight font-bold text-white sm:text-4xl">
              Calculadoras e escores médicos em português
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[17px] leading-relaxed text-brand-100">
              Escores de risco, regras de decisão e fórmulas validadas, com interpretação clínica,
              conduta sugerida e as referências originais. Feito para quem decide à beira do leito.
            </p>

            <div className="mx-auto mt-8 max-w-2xl">
              <HeaderSearch index={index} variant="hero" />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-brand-200">
              <span>
                <strong className="text-white">{allCalculators.length}</strong> calculadoras
              </span>
              <span>
                <strong className="text-white">{specialties.length}</strong> especialidades
              </span>
              <span>Sem cadastro · Sem anúncios</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mais usadas */}
      {popular.length > 0 && (
        <section className="container-page py-12">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-xl font-bold text-ink-900">Mais usadas</h2>
            <Link
              href="/calculadoras"
              className="text-sm font-semibold text-brand-600 hover:text-brand-800 hover:underline"
            >
              Ver todas
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((calc) => (
              <CalculatorCard key={calc.slug} calc={calc} />
            ))}
          </div>
        </section>
      )}

      {/* Especialidades */}
      <section className="border-y border-ink-200 bg-white py-12">
        <div className="container-page">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-xl font-bold text-ink-900">Navegar por especialidade</h2>
            <Link
              href="/especialidades"
              className="text-sm font-semibold text-brand-600 hover:text-brand-800 hover:underline"
            >
              Ver todas
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {specialties.map((specialty) => (
              <Link
                key={specialty.name}
                href={`/especialidades/${slugify(specialty.name)}`}
                className="group flex items-center gap-3 rounded-lg border border-ink-200 p-3.5 transition-all hover:border-brand-400 hover:bg-brand-50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600 group-hover:bg-brand-100">
                  <SpecialtyIcon specialty={specialty.name} className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold text-ink-800 group-hover:text-brand-800">
                    {specialty.name}
                  </span>
                  <span className="block text-[12px] text-ink-400">
                    {specialty.count}{' '}
                    {specialty.count === 1 ? 'calculadora' : 'calculadoras'}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Catálogo recente */}
      <section className="container-page py-12">
        <h2 className="text-xl font-bold text-ink-900">Explorar o catálogo</h2>
        <p className="mt-1 text-sm text-ink-500">
          Uma amostra do acervo. Use a busca para chegar direto ao que precisa.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {recentes.map((calc) => (
            <CalculatorCard key={calc.slug} calc={calc} variant="compact" />
          ))}
        </div>
      </section>

      {/* Aviso */}
      <section className="container-page pb-12">
        <div className="rounded-lg border border-ink-200 bg-white p-6">
          <h2 className="text-base font-bold text-ink-900">Como usar com segurança</h2>
          <div className="mt-3 grid gap-5 sm:grid-cols-3">
            <Feature title="Confira a indicação">
              Todo instrumento tem uma população para a qual foi derivado. A seção “Quando usar”
              descreve em quem o resultado é válido.
            </Feature>
            <Feature title="Leia as armadilhas">
              Escores erram de formas previsíveis. A seção de pontos de atenção reúne as limitações
              que mais causam erro na prática.
            </Feature>
            <Feature title="Decida com julgamento clínico">
              O resultado é uma estimativa populacional. A decisão continua sendo do profissional
              que examina o paciente.
            </Feature>
          </div>
        </div>
      </section>
    </>
  );
}

function Feature({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[14px] font-semibold text-brand-700">{title}</h3>
      <p className="mt-1 text-[13px] leading-relaxed text-ink-600">{children}</p>
    </div>
  );
}
