import type { Calculator, Field, Values } from '@/lib/types';
import { n, sumPoints } from '@/lib/utils';

/**
 * Sangramento maior por 100 pacientes-ano, conforme a coorte de derivação
 * (Euro Heart Survey on Atrial Fibrillation, Pisters et al., 2010).
 * Não houve pacientes com escore ≥ 6 na coorte, por isso a extrapolação.
 */
const SANGRAMENTO_ANO: Record<number, number> = {
  0: 1.13,
  1: 1.02,
  2: 1.88,
  3: 3.74,
  4: 8.7,
  5: 12.5,
};

const FIELDS: Field[] = [
  {
    id: 'hipertensao',
    kind: 'boolean',
    label: 'Hipertensão arterial não controlada',
    hint: 'Pressão arterial sistólica > 160 mmHg. Não basta ter o diagnóstico: o critério é o descontrole pressórico.',
    points: 1,
  },
  {
    id: 'renal',
    kind: 'boolean',
    label: 'Função renal alterada',
    hint: 'Diálise crônica, transplante renal ou creatinina ≥ 2,26 mg/dL (equivale a ≥ 200 µmol/L).',
    points: 1,
  },
  {
    id: 'hepatica',
    kind: 'boolean',
    label: 'Função hepática alterada',
    hint: 'Cirrose ou doença hepática crônica, ou bilirrubina > 2× o limite superior da normalidade associada a AST/ALT/fosfatase alcalina > 3× o limite superior.',
    points: 1,
  },
  {
    id: 'avc',
    kind: 'boolean',
    label: 'AVC prévio',
    hint: 'Sobretudo AVC isquêmico lacunar ou qualquer AVC hemorrágico prévio.',
    points: 1,
  },
  {
    id: 'sangramento',
    kind: 'boolean',
    label: 'Sangramento prévio ou predisposição a sangrar',
    hint: 'História de sangramento maior, anemia ou diátese hemorrágica (plaquetopenia, coagulopatia).',
    points: 1,
  },
  {
    id: 'inr',
    kind: 'boolean',
    label: 'INR lábil',
    hint: 'Aplica-se apenas a quem usa varfarina: INR instável, valores frequentemente elevados ou tempo na faixa terapêutica (TTR) < 60%. Marque "Não" para quem usa DOAC.',
    points: 1,
  },
  {
    id: 'idoso',
    kind: 'boolean',
    label: 'Idade > 65 anos',
    hint: 'Atenção: o corte do HAS-BLED é > 65 anos, diferente do CHA₂DS₂-VASc, que usa ≥ 65 anos.',
    points: 1,
  },
  {
    id: 'drogas',
    kind: 'boolean',
    label: 'Uso concomitante de antiagregante ou anti-inflamatório',
    hint: 'AAS, clopidogrel, ticagrelor, prasugrel ou AINE em uso regular junto com o anticoagulante.',
    points: 1,
  },
  {
    id: 'alcool',
    kind: 'boolean',
    label: 'Uso abusivo de álcool',
    hint: 'Oito ou mais doses por semana.',
    points: 1,
  },
];

/** Formata percentual no padrão brasileiro, com duas casas decimais. */
function pct(value: number): string {
  return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

const calculator: Calculator = {
  slug: 'has-bled',
  title: 'Escore HAS-BLED',
  shortTitle: 'HAS-BLED',
  subtitle:
    'Estima o risco de sangramento maior em um ano em pacientes com fibrilação atrial em anticoagulação oral e identifica os fatores de risco corrigíveis.',
  specialties: ['Cardiologia', 'Hematologia', 'Clínica Médica'],
  kind: 'Escore de risco',
  popular: true,
  keywords: [
    'hasbled',
    'has bled',
    'sangramento',
    'hemorragia',
    'fibrilação atrial',
    'FA',
    'anticoagulação',
    'varfarina',
    'DOAC',
  ],

  whenToUse: [
    'Pacientes com fibrilação atrial em uso de anticoagulante oral, ou com indicação de iniciá-lo, para dimensionar o risco de sangramento maior no primeiro ano.',
    'Como checklist de fatores de risco modificáveis: hipertensão descontrolada, INR lábil, antiagregantes e anti-inflamatórios desnecessários, abuso de álcool.',
    'Não serve para decidir se o paciente deve ou não ser anticoagulado, e não foi derivado para trombose venosa profunda, síndrome coronariana aguda nem para pacientes sem fibrilação atrial.',
  ],

  whyUse:
    'É o escore de sangramento mais estudado na fibrilação atrial e o único derivado especificamente em uma coorte de pacientes anticoagulados. Seu maior valor prático não é o número final, mas a lista de fatores modificáveis que ele expõe: cada item corrigido reduz o risco real do paciente sem retirar a proteção contra o AVC.',

  pearls: [
    'Escore alto NÃO contraindica a anticoagulação. Como o risco de AVC costuma crescer mais rápido que o de sangramento, quase sempre o benefício líquido permanece favorável. As diretrizes de 2024 da ESC são explícitas: escores de sangramento não devem ser usados para negar ou suspender o anticoagulante.',
    'Use o resultado como gatilho de ação: controlar a pressão, suspender AAS ou AINE sem indicação, tratar anemia, reduzir álcool, melhorar o TTR ou trocar varfarina por DOAC. Depois de corrigidos, recalcule.',
    'O item "INR lábil" só faz sentido em quem usa antagonista da vitamina K. Em pacientes com DOAC ele deve ser pontuado como ausente, o que reduz mecanicamente o escore em um ponto.',
    'Hipertensão aqui significa PAS > 160 mmHg não controlada, não simplesmente "é hipertenso". Marcar todo hipertenso infla o escore indevidamente.',
    'Os cortes de idade divergem entre escores: HAS-BLED usa idade > 65 anos, enquanto o CHA₂DS₂-VASc usa ≥ 65 e ≥ 75 anos. Não copie a resposta de um para o outro.',
    'A creatinina do critério renal está em µmol/L no artigo original (≥ 200 µmol/L). No laboratório brasileiro isso corresponde a ≥ 2,26 mg/dL: dividir por 88,4 é o passo que costuma ser esquecido.',
    'Nenhum paciente da coorte de derivação atingiu 6 pontos ou mais; acima de 5 as taxas são extrapolações e devem ser lidas apenas como "risco muito alto".',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const pontos = sumPoints(FIELDS, values);
    const risco = SANGRAMENTO_ANO[pontos];
    const riscoTexto = risco === undefined ? '> 12,50%' : pct(risco);

    // Fatores potencialmente corrigíveis marcados como presentes.
    const modificaveis: string[] = [];
    if (n(values, 'hipertensao') > 0) modificaveis.push('controlar a pressão arterial');
    if (n(values, 'inr') > 0) modificaveis.push('melhorar o tempo na faixa terapêutica ou trocar por DOAC');
    if (n(values, 'drogas') > 0) modificaveis.push('suspender antiagregante ou AINE sem indicação formal');
    if (n(values, 'alcool') > 0) modificaveis.push('reduzir o consumo de álcool');
    if (n(values, 'sangramento') > 0) modificaveis.push('investigar e tratar anemia ou fonte de sangramento');

    let label: string;
    let severity: 'baixo' | 'moderado' | 'alto';
    let interpretation: string;

    if (pontos <= 1) {
      label = 'Risco baixo';
      severity = 'baixo';
      interpretation =
        'Risco baixo de sangramento maior no primeiro ano de anticoagulação. Não há motivo para postergar ou reduzir o anticoagulante por causa do risco hemorrágico.';
    } else if (pontos === 2) {
      label = 'Risco intermediário';
      severity = 'moderado';
      interpretation =
        'Risco intermediário de sangramento maior. Mantenha a anticoagulação indicada e reforce o controle dos fatores modificáveis.';
    } else {
      label = 'Risco alto';
      severity = 'alto';
      interpretation =
        'Escore ≥ 3 caracteriza risco alto de sangramento maior. Isso não contraindica a anticoagulação: significa acompanhamento mais próximo e correção agressiva dos fatores modificáveis.';
    }

    const nextSteps =
      (modificaveis.length > 0
        ? `Fatores modificáveis identificados: ${modificaveis.join('; ')}.\n`
        : 'Nenhum dos fatores classicamente modificáveis foi marcado: o escore reflete sobretudo condições fixas.\n') +
      (pontos >= 3
        ? 'Reavalie o paciente em 4 semanas após o ajuste e depois a cada 3 meses, com hemograma e função renal.\nConfirme a indicação de anticoagulação pelo CHA₂DS₂-VASc: na maioria dos casos o benefício de prevenir o AVC supera o risco de sangramento.'
        : 'Reavalie o escore a cada 6 a 12 meses ou sempre que houver nova medicação, sangramento ou piora da função renal ou hepática.');

    return {
      value: pontos,
      unit: pontos === 1 ? 'ponto' : 'pontos',
      label,
      severity,
      interpretation,
      details: [
        {
          label: 'Sangramento maior estimado',
          value: `${riscoTexto} ao ano`,
          hint:
            risco === undefined
              ? 'Extrapolação: não houve pacientes com ≥ 6 pontos na coorte de derivação'
              : 'Por 100 pacientes-ano (Euro Heart Survey, Pisters 2010)',
        },
        {
          label: 'Fatores modificáveis presentes',
          value: `${modificaveis.length} de 5`,
          hint: 'Hipertensão descontrolada, INR lábil, antiagregante/AINE, álcool, anemia ou sangramento ativo',
        },
      ],
      nextSteps,
    };
  },

  formula: `Um ponto para cada critério presente (máximo 9):

H - Hipertensão não controlada (PAS > 160 mmHg): 1
A - Função renal alterada (diálise, transplante ou creatinina ≥ 2,26 mg/dL): 1
A - Função hepática alterada (cirrose ou bilirrubina > 2× LSN com transaminases/FA > 3× LSN): 1
S - AVC prévio (Stroke): 1
B - Sangramento prévio ou predisposição (Bleeding): 1
L - INR lábil (TTR < 60%): 1
E - Idade > 65 anos (Elderly): 1
D - Antiagregantes ou anti-inflamatórios (Drugs): 1
D - Abuso de álcool (Drinking): 1

Interpretação: 0 a 1 risco baixo · 2 risco intermediário · ≥ 3 risco alto`,

  evidence:
    'O HAS-BLED foi derivado por Pisters e colaboradores em 2010 a partir do Euro Heart Survey on Atrial Fibrillation, com 3.978 pacientes com fibrilação atrial acompanhados por um ano; 1,5% apresentou sangramento maior. As taxas por 100 pacientes-ano subiram de cerca de 1% nos escores 0 e 1 para 12,5% no escore 5, e o modelo teve estatística c em torno de 0,72 no subgrupo em uso de anticoagulante oral. Validações posteriores, incluindo a coorte sueca de fibrilação atrial e análises do estudo AMADEUS, confirmaram desempenho modesto porém consistente, geralmente superior ao de escores concorrentes como HEMORR₂HAGES e ATRIA. As diretrizes de 2024 da Sociedade Europeia de Cardiologia mantêm a avaliação do risco de sangramento como parte do cuidado, mas contraindicam formalmente o uso de escores de sangramento isolados para negar ou interromper a anticoagulação.',

  creator: {
    name: 'Ron Pisters e Gregory Y. H. Lip',
    bio: 'Cardiologistas do Maastricht University Medical Centre (Holanda) e da Universidade de Birmingham (Reino Unido), autores do escore a partir do Euro Heart Survey on Atrial Fibrillation.',
  },

  updatedAt: '2026-07-26',

  references: [
    {
      citation:
        'Pisters R, Lane DA, Nieuwlaat R, de Vos CB, Crijns HJGM, Lip GYH. A novel user-friendly score (HAS-BLED) to assess 1-year risk of major bleeding in patients with atrial fibrillation: the Euro Heart Survey. Chest. 2010;138(5):1093-100.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/20299623/',
      primary: true,
    },
    {
      citation:
        'Lip GYH, Frison L, Halperin JL, Lane DA. Comparative validation of a novel risk score for predicting bleeding risk in anticoagulated patients with atrial fibrillation: the HAS-BLED score. J Am Coll Cardiol. 2011;57(2):173-80.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/21111555/',
    },
    {
      citation:
        'Friberg L, Rosenqvist M, Lip GYH. Evaluation of risk stratification schemes for ischaemic stroke and bleeding in 182 678 patients with atrial fibrillation: the Swedish Atrial Fibrillation cohort study. Eur Heart J. 2012;33(12):1500-10.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/22246443/',
    },
    {
      citation:
        'Van Gelder IC, Rienstra M, Bunting KV, et al. 2024 ESC Guidelines for the management of atrial fibrillation developed in collaboration with the EACTS. Eur Heart J. 2024;45(36):3314-414.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/39210723/',
    },
  ],
};

export default calculator;
