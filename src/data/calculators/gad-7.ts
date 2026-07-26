import type { Calculator, Field, Option, Severity, Values } from '@/lib/types';
import { n, sumPoints } from '@/lib/utils';

/** As quatro respostas do GAD-7. O valor da opção é a própria pontuação. */
const OPCOES: Option[] = [
  { label: 'Nenhuma vez', value: 0 },
  { label: 'Vários dias', value: 1, badge: '+1' },
  { label: 'Mais da metade dos dias', value: 2, badge: '+2' },
  { label: 'Quase todos os dias', value: 3, badge: '+3' },
];

const FIELDS: Field[] = [
  {
    id: 'q1',
    kind: 'choice',
    layout: 'stack',
    label: '1. Sentir-se nervoso(a), ansioso(a) ou muito tenso(a)',
    hint: 'Considere as últimas 2 semanas em todos os sete itens.',
    help: 'Junto com o item 2, forma o GAD-2, usado como triagem ultrarrápida (corte de 3 pontos).',
    options: OPCOES,
  },
  {
    id: 'q2',
    kind: 'choice',
    layout: 'stack',
    label: '2. Não ser capaz de impedir ou de controlar as preocupações',
    options: OPCOES,
  },
  {
    id: 'q3',
    kind: 'choice',
    layout: 'stack',
    label: '3. Preocupar-se muito com diversas coisas',
    options: OPCOES,
  },
  {
    id: 'q4',
    kind: 'choice',
    layout: 'stack',
    label: '4. Dificuldade para relaxar',
    options: OPCOES,
  },
  {
    id: 'q5',
    kind: 'choice',
    layout: 'stack',
    label: '5. Ficar tão agitado(a) que se torna difícil permanecer sentado(a)',
    options: OPCOES,
  },
  {
    id: 'q6',
    kind: 'choice',
    layout: 'stack',
    label: '6. Ficar facilmente aborrecido(a) ou irritado(a)',
    options: OPCOES,
  },
  {
    id: 'q7',
    kind: 'choice',
    layout: 'stack',
    label: '7. Sentir medo como se algo terrível fosse acontecer',
    options: OPCOES,
  },
];

/** Faixas de gravidade do GAD-7 (Spitzer, 2006). */
function faixa(pontos: number): { rotulo: string; severidade: Severity } {
  if (pontos <= 4) return { rotulo: 'Ansiedade mínima', severidade: 'info' };
  if (pontos <= 9) return { rotulo: 'Ansiedade leve', severidade: 'baixo' };
  if (pontos <= 14) return { rotulo: 'Ansiedade moderada', severidade: 'moderado' };
  return { rotulo: 'Ansiedade grave', severidade: 'alto' };
}

const calculator: Calculator = {
  slug: 'gad-7',
  title: 'GAD-7: escala de ansiedade generalizada',
  shortTitle: 'GAD-7',
  subtitle:
    'Rastreia transtorno de ansiedade generalizada e gradua a gravidade dos sintomas ansiosos das últimas duas semanas, com sete itens autoaplicáveis.',
  specialties: ['Psiquiatria', 'Clínica Médica'],
  kind: 'Escala',
  popular: true,
  keywords: [
    'gad7',
    'gad 7',
    'generalized anxiety disorder',
    'ansiedade',
    'TAG',
    'transtorno de ansiedade generalizada',
    'rastreio de ansiedade',
    'gad-2',
  ],

  whenToUse: [
    'Rastreio de transtorno de ansiedade generalizada em adultos na atenção primária: população em que a escala foi derivada e validada.',
    'Graduação da gravidade e acompanhamento longitudinal da resposta ao tratamento, repetindo a escala a cada 2 a 4 semanas.',
    'Triagem ampla de transtornos de ansiedade: o corte de 10 também tem desempenho razoável para transtorno de pânico, fobia social e transtorno de estresse pós-traumático, embora com sensibilidade menor.',
    'Não é instrumento diagnóstico e não foi validado em crianças e adolescentes nem como medida de gravidade em transtorno obsessivo-compulsivo.',
  ],

  whyUse:
    'São sete itens respondidos em cerca de dois minutos, com estrutura idêntica à do PHQ-9: a mesma folha costuma trazer as duas escalas, o que permite rastrear depressão e ansiedade na mesma consulta. É a escala de ansiedade mais usada na atenção primária no mundo e é de uso livre.',

  pearls: [
    'A escala é dimensional, não diagnóstica: ela mede intensidade de sintomas ansiosos, não identifica qual transtorno. Um escore alto pode vir de pânico, fobia social, TEPT, transtorno de adaptação ou de ansiedade secundária a doença clínica.',
    'Ansiedade secundária é a armadilha mais frequente: hipertireoidismo, uso de corticoide, abuso de cafeína, abstinência de álcool ou de benzodiazepínico, feocromocitoma e arritmias produzem escores altos. Investigue antes de rotular como transtorno primário.',
    'Ansiedade e depressão coexistem na maior parte dos casos. Aplique o PHQ-9 junto: tratar apenas um dos dois costuma resultar em resposta parcial.',
    'O item 5 (agitação, dificuldade de permanecer sentado) é frequentemente confundido com acatisia por antipsicótico ou por inibidor seletivo da recaptação de serotonina. Pergunte quando o sintoma começou em relação ao medicamento.',
    'Um GAD-7 de 10 pontos ou mais indica avaliação clínica adicional, não início automático de medicação. Nas faixas leve e moderada, intervenção psicológica isolada tem eficácia comparável à farmacológica.',
    'A oitava pergunta do formulário, sobre o quanto os sintomas dificultam a vida, NÃO entra no escore: ela mede prejuízo funcional e deve ser considerada à parte na decisão de tratar.',
    'O GAD-2 (itens 1 e 2, 0 a 6 pontos) serve como triagem: com 3 pontos ou mais, aplique o GAD-7 completo.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const pontos = sumPoints(FIELDS, values);
    const { rotulo, severidade } = faixa(pontos);
    const gad2 = n(values, 'q1') + n(values, 'q2');

    const linhas: string[] = [`${rotulo} (${pontos} de 21 pontos).`];

    if (pontos >= 10) {
      linhas.push(
        'O escore atinge o corte de 10 pontos usado para rastreio, que na validação original teve sensibilidade de 89% e especificidade de 82% para transtorno de ansiedade generalizada. É indicação de avaliação diagnóstica, não de diagnóstico fechado.',
      );
    } else {
      linhas.push(
        'O escore está abaixo do corte de 10 pontos usado para rastreio de transtorno de ansiedade generalizada. Isso não exclui outros transtornos ansiosos, especialmente pânico e fobia social, em que a sensibilidade da escala é menor.',
      );
    }

    if (gad2 >= 3 && pontos < 10) {
      linhas.push(
        'O GAD-2 é positivo (3 pontos ou mais) apesar do total abaixo de 10: mantenha atenção clínica e reavalie.',
      );
    }

    let nextSteps: string;
    if (pontos <= 4) {
      nextSteps =
        'Nenhuma intervenção específica é indicada com base no escore. Repita o rastreio se houver nova queixa ou prejuízo funcional.';
    } else if (pontos <= 9) {
      nextSteps =
        'Conduta de baixa intensidade: psicoeducação sobre ansiedade, higiene do sono, redução de cafeína e álcool, atividade física regular e técnicas de autoajuda guiada.\nReavalie em 4 semanas com nova aplicação da escala.';
    } else if (pontos <= 14) {
      nextSteps =
        'Confirme o diagnóstico por entrevista clínica, investigando causas clínicas e uso de substâncias.\nOfereça terapia cognitivo-comportamental e/ou inibidor seletivo da recaptação de serotonina ou de serotonina e noradrenalina, começando com dose baixa pelo risco de piora inicial da ansiedade.\nEvite benzodiazepínico como tratamento de manutenção; se usado, restrinja a poucas semanas.';
    } else {
      nextSteps =
        'Ansiedade grave, com prejuízo funcional habitualmente importante. Inicie tratamento farmacológico associado a psicoterapia estruturada e considere encaminhamento ao psiquiatra.\nRastreie depressão comórbida, risco de suicídio e uso de álcool ou de outras substâncias.\nReavalie em 2 a 4 semanas e ajuste a dose até a remissão (GAD-7 abaixo de 5).';
    }

    return {
      value: pontos,
      unit: pontos === 1 ? 'ponto' : 'pontos',
      label: rotulo,
      severity: severidade,
      interpretation: linhas.join('\n'),
      details: [
        {
          label: 'Rastreio (corte ≥ 10)',
          value: pontos >= 10 ? 'Positivo' : 'Negativo',
          hint: 'Sensibilidade 89% e especificidade 82% para TAG (Spitzer, 2006)',
        },
        {
          label: 'GAD-2 (itens 1 e 2)',
          value: `${gad2} de 6 pontos`,
          hint: 'Corte de triagem: 3 pontos',
        },
        {
          label: 'Faixa de gravidade',
          value: `${rotulo} (0-4 mínima · 5-9 leve · 10-14 moderada · 15-21 grave)`,
        },
      ],
      nextSteps,
    };
  },

  formula: `Sete itens, cada um pontuado pela frequência nas últimas 2 semanas:

Nenhuma vez = 0
Vários dias = 1
Mais da metade dos dias = 2
Quase todos os dias = 3

Total = soma dos sete itens (0 a 21)

Faixas de gravidade:
0 a 4 - mínima
5 a 9 - leve
10 a 14 - moderada
15 a 21 - grave

Corte de rastreio: 10 pontos.
GAD-2 = itens 1 + 2 (0 a 6), com corte de 3 pontos.`,

  evidence:
    'O GAD-7 foi derivado e validado por Spitzer, Kroenke, Williams e Löwe em 2006, em 2.740 pacientes de 15 serviços de atenção primária nos Estados Unidos, com subamostra de 965 pacientes reavaliados por entrevista telefônica conduzida por profissionais de saúde mental como padrão de referência. O corte de 10 pontos apresentou sensibilidade de 89% e especificidade de 82% para transtorno de ansiedade generalizada, com consistência interna (alfa de Cronbach) de 0,92. No estudo de Kroenke e colaboradores de 2007, o mesmo corte manteve desempenho útil para outros transtornos ansiosos, com sensibilidade menor: cerca de 74% para transtorno de pânico, 72% para fobia social e 66% para transtorno de estresse pós-traumático. A metanálise diagnóstica de Plummer e colaboradores (2016) confirmou o corte de 10 para o GAD-7 e o de 3 para o GAD-2. Existe versão brasileira com estrutura fatorial e confiabilidade adequadas descrita por Moreno e colaboradores (2016).',

  creator: {
    name: 'Robert L. Spitzer, Kurt Kroenke, Janet B. W. Williams e Bernd Löwe',
    bio: 'Mesmo grupo que desenvolveu o PRIME-MD e o Patient Health Questionnaire, ao qual o GAD-7 é habitualmente anexado. O instrumento é de uso livre.',
  },

  references: [
    {
      citation:
        'Spitzer RL, Kroenke K, Williams JBW, Löwe B. A brief measure for assessing generalized anxiety disorder: the GAD-7. Arch Intern Med. 2006;166(10):1092-7.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/16717171/',
      primary: true,
    },
    {
      citation:
        'Kroenke K, Spitzer RL, Williams JBW, Monahan PO, Löwe B. Anxiety disorders in primary care: prevalence, impairment, comorbidity, and detection. Ann Intern Med. 2007;146(5):317-25.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/17339617/',
    },
    {
      citation:
        'Plummer F, Manea L, Trepel D, McMillan D. Screening for anxiety disorders with the GAD-7 and GAD-2: a systematic review and diagnostic metaanalysis. Gen Hosp Psychiatry. 2016;39:24-31.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/26719105/',
    },
    {
      citation:
        'Moreno AL, DeSousa DA, Souza AMFLP, et al. Factor structure, reliability, and item parameters of the Brazilian-Portuguese version of the GAD-7 questionnaire. Temas Psicol. 2016;24(1):367-76.',
    },
  ],
};

export default calculator;
