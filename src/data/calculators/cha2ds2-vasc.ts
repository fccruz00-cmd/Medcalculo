import type { Calculator, Field, Values } from '@/lib/types';
import { n, sumPoints } from '@/lib/utils';

/** Risco anual de AVC (%) por pontuação: coorte sueca de Friberg (2012). */
const RISCO_ANUAL_AVC: Record<number, number> = {
  0: 0.2,
  1: 0.6,
  2: 2.2,
  3: 3.2,
  4: 4.8,
  5: 7.2,
  6: 9.7,
  7: 11.2,
  8: 10.8,
  9: 12.2,
};

const FIELDS: Field[] = [
  {
    id: 'idade',
    kind: 'choice',
    label: 'Idade',
    options: [
      { label: 'Menos de 65 anos', value: 0 },
      { label: '65 a 74 anos', value: 1, badge: '+1' },
      { label: '75 anos ou mais', value: 2, badge: '+2' },
    ],
  },
  {
    id: 'sexo',
    kind: 'choice',
    label: 'Sexo',
    options: [
      { label: 'Masculino', value: 0 },
      { label: 'Feminino', value: 1, badge: '+1' },
    ],
  },
  {
    id: 'icc',
    kind: 'boolean',
    label: 'Insuficiência cardíaca congestiva',
    hint: 'História de IC ou disfunção sistólica de ventrículo esquerdo (FEVE ≤ 40%).',
    points: 1,
  },
  {
    id: 'hipertensao',
    kind: 'boolean',
    label: 'Hipertensão arterial',
    hint: 'Diagnóstico prévio ou em uso de anti-hipertensivo.',
    points: 1,
  },
  {
    id: 'diabetes',
    kind: 'boolean',
    label: 'Diabetes mellitus',
    hint: 'Em uso de hipoglicemiante oral, insulina ou glicemia de jejum > 125 mg/dL.',
    points: 1,
  },
  {
    id: 'avc',
    kind: 'boolean',
    label: 'AVC, AIT ou tromboembolismo prévio',
    points: 2,
  },
  {
    id: 'vascular',
    kind: 'boolean',
    label: 'Doença vascular',
    hint: 'Infarto do miocárdio prévio, doença arterial periférica ou placa aórtica complexa.',
    points: 1,
  },
];

/** Formata percentual no padrão brasileiro, com uma casa decimal. */
function pct(value: number): string {
  return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

const calculator: Calculator = {
  slug: 'cha2ds2-vasc',
  title: 'Escore CHA₂DS₂-VASc',
  shortTitle: 'CHA₂DS₂-VASc',
  subtitle:
    'Estima o risco anual de AVC em pacientes com fibrilação atrial não valvar e orienta a anticoagulação.',
  specialties: ['Cardiologia', 'Clínica Médica', 'Neurologia'],
  kind: 'Escore de risco',
  popular: true,
  keywords: [
    'chads vasc',
    'chadsvasc',
    'fibrilação atrial',
    'FA',
    'anticoagulação',
    'AVC',
    'acidente vascular cerebral',
    'tromboembolismo',
  ],

  whenToUse: [
    'Pacientes com fibrilação atrial ou flutter atrial não valvar, para decidir sobre anticoagulação oral.',
    'Reavaliação periódica de pacientes já em acompanhamento, já que o escore aumenta com a idade e com novas comorbidades.',
    'Não se aplica a estenose mitral moderada a grave nem a prótese valvar mecânica: nesses casos a anticoagulação está indicada independentemente do escore.',
  ],

  whyUse:
    'O CHA₂DS₂-VASc substituiu o CHADS₂ por identificar melhor os pacientes de risco verdadeiramente baixo, que não se beneficiam da anticoagulação. É o escore recomendado pelas diretrizes europeias e brasileiras para essa decisão.',

  pearls: [
    'Sexo feminino isolado (escore 1 apenas por ser mulher) não indica anticoagulação: funciona como modificador de risco, não como fator independente.',
    'O escore estima risco de AVC, não risco de sangramento. Avalie o HAS-BLED em paralelo, lembrando que sangramento elevado raramente contraindica a anticoagulação: serve para corrigir fatores modificáveis.',
    'Doença vascular inclui infarto prévio, doença arterial periférica e placa aórtica complexa.',
    'Em FA valvar (estenose mitral reumática moderada ou grave e prótese mecânica), anticoagule com varfarina independentemente do CHA₂DS₂-VASc: os DOACs são contraindicados.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const pontos = sumPoints(FIELDS, values);
    const feminino = n(values, 'sexo') === 1;
    const risco = RISCO_ANUAL_AVC[pontos] ?? 12.2;

    // Nas diretrizes o limiar é 2 em homens e 3 em mulheres, porque o ponto
    // do sexo feminino sozinho não caracteriza risco elevado.
    const limiarIndicado = feminino ? 3 : 2;
    const limiarConsiderar = feminino ? 2 : 1;

    let label: string;
    let severity: 'baixo' | 'moderado' | 'alto';
    let nextSteps: string;

    if (pontos >= limiarIndicado) {
      label = 'Anticoagulação recomendada';
      severity = pontos >= 4 ? 'alto' : 'moderado';
      nextSteps =
        'Anticoagulação oral está recomendada (classe I). Prefira um DOAC, apixabana, rivaroxabana, edoxabana ou dabigatrana, em vez de varfarina, exceto em estenose mitral moderada a grave, prótese valvar mecânica ou clearance de creatinina muito reduzido.\nAvalie o risco de sangramento com o HAS-BLED para corrigir fatores modificáveis, não para contraindicar o tratamento.';
    } else if (pontos >= limiarConsiderar) {
      label = 'Considerar anticoagulação';
      severity = 'moderado';
      nextSteps =
        'Anticoagulação oral pode ser considerada (classe IIa), pesando preferência do paciente, risco de sangramento e presença de outros modificadores de risco não incluídos no escore.\nSe optar por não anticoagular, reavalie o escore periodicamente: ele tende a aumentar com o tempo.';
    } else {
      label = 'Anticoagulação não indicada';
      severity = 'baixo';
      nextSteps =
        'Não há indicação de anticoagulação nem de antiagregação para prevenção de AVC. O AAS isolado não é recomendado nesse cenário.\nReavalie o escore a cada ano ou quando surgir nova comorbidade.';
    }

    const soFeminino = feminino && pontos === 1;

    return {
      value: pontos,
      unit: pontos === 1 ? 'ponto' : 'pontos',
      label,
      severity,
      interpretation: soFeminino
        ? 'O único ponto vem do sexo feminino, que isoladamente não caracteriza risco elevado. Na prática, o risco equivale ao de um homem com escore 0.'
        : `Risco estimado de AVC de aproximadamente ${pct(risco)} ao ano sem anticoagulação.`,
      details: [
        {
          label: 'Risco anual de AVC',
          value: pct(risco),
          hint: 'Sem anticoagulação (Friberg, 2012)',
        },
        {
          label: 'Limiar para indicação',
          value: `${limiarIndicado} pontos`,
          hint: feminino ? 'Sexo feminino' : 'Sexo masculino',
        },
      ],
      nextSteps,
    };
  },

  formula: `Soma dos pontos (máximo 9):

C - Insuficiência cardíaca congestiva / disfunção de VE: 1
H - Hipertensão arterial: 1
A₂ - Idade ≥ 75 anos: 2
D - Diabetes mellitus: 1
S₂ - AVC, AIT ou tromboembolismo prévio: 2
V - Doença vascular: 1
A - Idade 65 a 74 anos: 1
Sc - Sexo feminino: 1`,

  evidence:
    'O escore foi proposto por Lip e colaboradores em 2010, a partir da coorte Euro Heart Survey, com o objetivo de refinar a estratificação dos pacientes classificados como de risco baixo ou intermediário pelo CHADS₂. As taxas anuais de AVC usadas aqui vêm da validação de Friberg e colaboradores no registro nacional sueco de fibrilação atrial. Validações posteriores confirmaram o bom valor preditivo negativo do escore: homens com 0 ponto têm risco anual de AVC inferior a 1%, abaixo do limiar em que o benefício da anticoagulação supera o risco de sangramento.',

  creator: {
    name: 'Gregory Y. H. Lip',
    bio: 'Cardiologista britânico, professor da Universidade de Liverpool e uma das principais referências mundiais em fibrilação atrial e tromboembolismo.',
  },

  references: [
    {
      citation:
        'Lip GYH, Nieuwlaat R, Pisters R, Lane DA, Crijns HJGM. Refining clinical risk stratification for predicting stroke and thromboembolism in atrial fibrillation using a novel risk factor-based approach: the Euro Heart Survey on Atrial Fibrillation. Chest. 2010;137(2):263-72.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/19762550/',
      primary: true,
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
    {
      citation:
        'Magalhães LP, Figueiredo MJO, Cintra FD, et al. II Diretrizes Brasileiras de Fibrilação Atrial. Arq Bras Cardiol. 2016;106(4 Supl 2):1-22.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/27167175/',
    },
  ],
};

export default calculator;
