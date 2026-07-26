import Link from 'next/link';
import { getSpecialties } from '@/data/registry';
import { slugify } from '@/lib/utils';

export default function SiteFooter() {
  const specialties = getSpecialties().slice(0, 12);

  return (
    <footer className="no-print mt-16 border-t border-ink-200 bg-brand-900 text-brand-100">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="text-lg font-bold text-white">
              Med<span className="text-brand-300">Cálculo</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-brand-200">
              Escores, regras de decisão e fórmulas médicas em português, com interpretação clínica
              e referências da literatura.
            </p>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-300">
              Navegar
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/calculadoras" className="inline-block py-1 hover:text-white hover:underline">
                  Todas as calculadoras
                </Link>
              </li>
              <li>
                <Link href="/especialidades" className="inline-block py-1 hover:text-white hover:underline">
                  Especialidades
                </Link>
              </li>
              <li>
                <Link href="/buscar" className="inline-block py-1 hover:text-white hover:underline">
                  Buscar
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="inline-block py-1 hover:text-white hover:underline">
                  Sobre o projeto
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-300">
              Especialidades
            </h2>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
              {specialties.map((specialty) => (
                <li key={specialty.name}>
                  <Link
                    href={`/especialidades/${slugify(specialty.name)}`}
                    className="inline-block py-1 hover:text-white hover:underline"
                  >
                    {specialty.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-brand-800 pt-6">
          <p className="text-xs leading-relaxed text-brand-300">
            <strong className="text-brand-200">Aviso importante:</strong> o MedCálculo é uma
            ferramenta de apoio à decisão destinada a profissionais de saúde. Os resultados não
            substituem a avaliação clínica individualizada, o julgamento do profissional
            assistente nem as diretrizes da instituição. Confira sempre os valores inseridos e as
            referências originais antes de tomar qualquer conduta.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-brand-300">
            Os instrumentos clínicos pertencem a seus autores e são implementados a partir dos
            artigos originais, citados em cada página. Nomes de escores e instituições aparecem de
            forma descritiva, sem vínculo ou endosso. Os textos deste site são originais.{' '}
            <Link href="/sobre" className="underline hover:text-white">
              Saiba mais
            </Link>
            .
          </p>
          <p className="mt-4 text-xs text-brand-400">
            © {new Date().getFullYear()} MedCálculo. Projeto educacional de código aberto, sob
            licença MIT.
          </p>
        </div>
      </div>
    </footer>
  );
}
