import type { Metadata } from 'next';
import Link from 'next/link';
import { allCalculators, getSpecialties } from '@/data/registry';

export const metadata: Metadata = {
  title: 'Sobre o projeto',
  description:
    'O que é o MedCálculo, como as calculadoras são construídas, quais são as fontes e quais são os limites da ferramenta.',
};

export default function AboutPage() {
  const specialties = getSpecialties();

  return (
    <div className="container-page py-8">
      <header className="max-w-3xl">
        <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">Sobre o MedCálculo</h1>
        <p className="mt-3 text-[17px] leading-relaxed text-ink-600">
          O MedCálculo reúne escores de risco, regras de decisão clínica e fórmulas médicas em
          português, com a interpretação do resultado, a conduta sugerida pela literatura e as
          referências originais de cada instrumento.
        </p>
      </header>

      <div className="mt-10 grid max-w-3xl gap-8">
        <Block title="Para quem é">
          <p>
            Para profissionais e estudantes da área da saúde. As calculadoras pressupõem
            conhecimento clínico: elas não fazem diagnóstico, não substituem exame físico e não
            interpretam o contexto do paciente. Os resultados devem ser lidos por quem sabe
            julgar se o instrumento se aplica àquele caso.
          </p>
        </Block>

        <Block title="Como cada calculadora é construída">
          <p>
            Toda calculadora parte do artigo de derivação original e, quando existem, dos estudos
            de validação externa e das diretrizes que a incorporaram. Cada página traz:
          </p>
          <ul className="mt-3 space-y-2">
            <ListItem title="Quando usar">
              A população em que o instrumento foi derivado e validado, e as situações em que ele
              não se aplica.
            </ListItem>
            <ListItem title="Pontos de atenção">
              As armadilhas conhecidas: os erros que o escore comete de forma previsível.
            </ListItem>
            <ListItem title="Fórmula">
              A pontuação item a item, para conferência.
            </ListItem>
            <ListItem title="Evidência">
              De onde vêm os números: coorte de derivação, tamanho da amostra e desempenho.
            </ListItem>
            <ListItem title="Referências">
              Citação completa com link para o PubMed.
            </ListItem>
          </ul>
        </Block>

        <Block title="Unidades e convenções">
          <p>
            As unidades seguem a prática laboratorial brasileira. Onde há divergência frequente
            com a literatura internacional: creatinina em mg/dL e µmol/L, ureia contra BUN,
            glicemia em mg/dL e mmol/L: o campo oferece a conversão ou explicita a equivalência
            na descrição. Vale conferir sempre a unidade do laudo antes de digitar.
          </p>
        </Block>

        <Block title="Limites">
          <p>
            Escores são ferramentas estatísticas derivadas de populações específicas. Aplicá-los
            fora dessa população reduz a acurácia, às vezes drasticamente. Nenhum resultado aqui
            deve ser usado como critério isolado de conduta, e discordância entre o escore e a
            impressão clínica costuma ser motivo para investigar mais, não para ignorar o exame.
          </p>
          <p className="mt-3">
            O conteúdo tem finalidade educacional e de apoio à decisão. A responsabilidade pela
            conduta é do profissional assistente.
          </p>
        </Block>

        <Block title="Propriedade intelectual">
          <p>
            <strong className="font-semibold text-ink-800">
              Os instrumentos clínicos são de seus autores.
            </strong>{' '}
            Escores, regras de decisão e fórmulas foram desenvolvidos e publicados por
            pesquisadores na literatura científica. Este projeto os implementa a partir dos artigos
            originais e cita a fonte primária em cada página. Os direitos sobre os instrumentos
            permanecem com quem os criou.
          </p>
          <p className="mt-3">
            <strong className="font-semibold text-ink-800">Os textos são originais.</strong>{' '}
            Descrições, interpretações, pontos de atenção e resumos de evidência foram escritos
            para este projeto a partir da literatura primária e das diretrizes citadas. Nada foi
            reproduzido de outra calculadora, aplicativo ou site. A pontuação de um escore é um
            fato científico publicado e pode ser reimplementada livremente; o que é protegido é a
            redação de quem o descreveu, e por isso a regra aqui é escrever sempre a partir da
            fonte primária.
          </p>
          <p className="mt-3">
            Nomes de escores, sociedades médicas e instituições pertencem a seus titulares e
            aparecem de forma descritiva, sem sugerir vínculo, endosso ou afiliação. Instrumentos
            com licenciamento restritivo, que exigem permissão, pagamento ou treinamento formal,
            não fazem parte deste catálogo. O código e os textos do projeto estão sob licença MIT.
          </p>
        </Block>

        <Block title="Privacidade">
          <p>
            Nenhum dado de paciente é coletado, transmitido ou armazenado. Todo cálculo acontece no
            seu navegador, e os favoritos ficam apenas no armazenamento local do próprio
            dispositivo. Não há cadastro, rastreamento nem anúncios.
          </p>
        </Block>

        <Block title="Catálogo">
          <p>
            São {allCalculators.length} calculadoras distribuídas em {specialties.length}{' '}
            especialidades. Veja a{' '}
            <Link href="/calculadoras" className="font-semibold text-brand-600 hover:underline">
              lista completa
            </Link>{' '}
            ou navegue{' '}
            <Link href="/especialidades" className="font-semibold text-brand-600 hover:underline">
              por especialidade
            </Link>
            .
          </p>
        </Block>
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-ink-900">{title}</h2>
      <div className="prose-clinic mt-2 text-[15px] text-ink-600">{children}</div>
    </section>
  );
}

function ListItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
      <span>
        <strong className="font-semibold text-ink-800">{title}.</strong> {children}
      </span>
    </li>
  );
}
