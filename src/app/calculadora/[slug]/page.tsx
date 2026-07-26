import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { allCalculators, getCalculator, getRelated } from '@/data/registry';
import CalculatorRunner from '@/components/calculator/CalculatorRunner';
import FavoriteButton from '@/components/FavoriteButton';
import { AlertIcon, BookIcon, ChevronRightIcon, InfoIcon } from '@/components/icons';
import { slugify } from '@/lib/utils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return allCalculators.map((calc) => ({ slug: calc.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const calc = getCalculator(slug);
  if (!calc) return { title: 'Calculadora não encontrada' };

  return {
    title: calc.title,
    description: calc.subtitle,
    keywords: [calc.title, ...(calc.keywords ?? []), ...calc.specialties],
    openGraph: { title: calc.title, description: calc.subtitle, type: 'article' },
  };
}

export default async function CalculatorPage({ params }: PageProps) {
  const { slug } = await params;
  const calc = getCalculator(slug);
  if (!calc) notFound();

  const related = getRelated(calc);

  // Dados estruturados: ajudam os buscadores a entender que a página descreve
  // um instrumento clínico, e não um artigo qualquer.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: calc.title,
    description: calc.subtitle,
    inLanguage: 'pt-BR',
    audience: { '@type': 'MedicalAudience', audienceType: 'Profissional de saúde' },
    about: {
      '@type': 'MedicalRiskScore',
      name: calc.title,
      description: calc.subtitle,
    },
    citation: calc.references.map((reference) => reference.citation),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // O conteúdo vem do catálogo do próprio projeto, não de entrada do usuário.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs calc={calc} />

      <div className="container-page grid gap-8 pb-12 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">
          {/* Cabeçalho */}
          <header className="py-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-ink-200 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-ink-700 uppercase">
                {calc.kind}
              </span>
              {calc.specialties.map((specialty) => (
                <Link
                  key={specialty}
                  href={`/especialidades/${slugify(specialty)}`}
                  className="rounded bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 hover:bg-brand-100"
                >
                  {specialty}
                </Link>
              ))}
            </div>

            <div className="mt-3 flex items-start justify-between gap-4">
              <h1 className="text-2xl leading-tight font-bold text-ink-900 sm:text-3xl">
                {calc.title}
              </h1>
              <FavoriteButton slug={calc.slug} />
            </div>

            <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-ink-600">
              {calc.subtitle}
            </p>
          </header>

          {/* Quando usar / Por que usar */}
          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            <Disclosure title="Quando usar" icon={<InfoIcon className="h-4 w-4" />} defaultOpen>
              <ul className="space-y-2">
                {calc.whenToUse.map((item, index) => (
                  <li key={index} className="flex gap-2 text-[14px] leading-relaxed text-ink-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Disclosure>

            {calc.whyUse && (
              <Disclosure title="Por que usar" icon={<InfoIcon className="h-4 w-4" />} defaultOpen>
                <p className="text-[14px] leading-relaxed text-ink-700">{calc.whyUse}</p>
              </Disclosure>
            )}
          </div>

          {/* A calculadora */}
          <CalculatorRunner slug={calc.slug} />

          {/* Armadilhas */}
          {calc.pearls && calc.pearls.length > 0 && (
            <section className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-5">
              <h2 className="flex items-center gap-2 text-sm font-bold tracking-wide text-amber-900 uppercase">
                <AlertIcon className="h-4 w-4" />
                Pontos de atenção e armadilhas
              </h2>
              <ul className="mt-3 space-y-2.5">
                {calc.pearls.map((pearl, index) => (
                  <li key={index} className="flex gap-2.5 text-[14px] leading-relaxed text-amber-900">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    <span>{pearl}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Fórmula */}
          {calc.formula && (
            <Section title="Fórmula e pontuação">
              <pre className="overflow-x-auto rounded-md border border-ink-200 bg-ink-50 p-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-ink-800">
                {calc.formula}
              </pre>
            </Section>
          )}

          {/* Evidência */}
          {calc.evidence && (
            <Section title="Evidência">
              <div className="prose-clinic text-[15px] text-ink-700">
                {calc.evidence.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </Section>
          )}

          {/* Criador */}
          {calc.creator && (
            <Section title="Sobre o criador">
              <p className="text-[15px] font-semibold text-ink-900">{calc.creator.name}</p>
              {calc.creator.bio && (
                <p className="mt-1.5 text-[15px] leading-relaxed text-ink-600">{calc.creator.bio}</p>
              )}
            </Section>
          )}

          {/* Referências */}
          <Section title="Referências">
            <ol className="space-y-3">
              {calc.references.map((reference, index) => (
                <li key={index} className="flex gap-3 text-[14px] leading-relaxed text-ink-600">
                  <span className="mt-0.5 shrink-0 font-bold text-ink-300 tabular-nums">
                    {index + 1}.
                  </span>
                  <span>
                    {reference.url ? (
                      <a
                        href={reference.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-700 hover:underline"
                      >
                        {reference.citation}
                      </a>
                    ) : (
                      reference.citation
                    )}
                    {reference.primary && (
                      <span className="ml-2 rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-brand-700 uppercase">
                        estudo original
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </Section>

          <p className="mt-8 rounded-md border border-ink-200 bg-white p-4 text-[13px] leading-relaxed text-ink-500">
            <strong className="text-ink-700">Aviso:</strong> este resultado é uma estimativa
            baseada na literatura citada e não substitui a avaliação clínica individualizada.
            Confira os valores inseridos e considere o contexto completo do paciente antes de
            qualquer conduta.
          </p>
        </div>

        {/* Barra lateral */}
        {related.length > 0 && (
          <aside className="no-print lg:pt-24">
            <h2 className="flex items-center gap-2 text-xs font-bold tracking-wider text-ink-500 uppercase">
              <BookIcon className="h-4 w-4" />
              Relacionadas
            </h2>
            <ul className="mt-3 space-y-1">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/calculadora/${item.slug}`}
                    className="group flex items-start gap-1.5 rounded-md px-2.5 py-2 hover:bg-white"
                  >
                    <ChevronRightIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-300 group-hover:text-brand-500" />
                    <span className="text-[13px] leading-snug font-medium text-ink-700 group-hover:text-brand-700">
                      {item.shortTitle ?? item.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </>
  );
}

function Breadcrumbs({ calc }: { calc: { title: string; specialties: string[] } }) {
  const specialty = calc.specialties[0];
  return (
    <nav
      aria-label="Trilha de navegação"
      className="no-print border-b border-ink-200 bg-white"
    >
      <div className="container-page flex items-center gap-1.5 overflow-x-auto py-2.5 text-[13px] whitespace-nowrap text-ink-500">
        <Link href="/" className="hover:text-brand-700 hover:underline">
          Início
        </Link>
        <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-ink-300" />
        <Link href="/calculadoras" className="hover:text-brand-700 hover:underline">
          Calculadoras
        </Link>
        {specialty && (
          <>
            <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-ink-300" />
            <Link
              href={`/especialidades/${slugify(specialty)}`}
              className="hover:text-brand-700 hover:underline"
            >
              {specialty}
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 border-b border-ink-200 pb-2 text-lg font-bold text-ink-900">{title}</h2>
      {children}
    </section>
  );
}

/** Bloco recolhível baseado em <details>, sem JavaScript. */
function Disclosure({
  title,
  icon,
  defaultOpen,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={defaultOpen} className="card group overflow-hidden">
      <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-bold text-brand-800 hover:bg-brand-50">
        {icon}
        {title}
        <ChevronRightIcon className="ml-auto h-4 w-4 text-ink-400 transition-transform group-open:rotate-90" />
      </summary>
      <div className="border-t border-ink-100 px-4 py-3.5">{children}</div>
    </details>
  );
}
