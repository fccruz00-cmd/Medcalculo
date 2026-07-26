import type { Calculator, Field, Values } from '@/lib/types';
import { sumPoints } from '@/lib/utils';

/**
 * Mortalidade em 30 dias (%) por pontuação: coorte de derivação de Hemphill
 * e colaboradores (152 pacientes, San Francisco General Hospital, 2001).
 * Nenhum paciente da coorte teve escore 6; o valor é uma extrapolação.
 */
const MORTALIDADE_30D: Record<number, number> = {
  0: 0,
  1: 13,
  2: 26,
  3: 72,
  4: 97,
  5: 100,
  6: 100,
};

const FIELDS: Field[] = [
  {
    id: 'glasgow',
    kind: 'choice',
    label: 'Escala de coma de Glasgow',
    hint: 'Use o Glasgow da avaliação inicial, antes de sedação e intubação sempre que possível.',
    layout: 'stack',
    options: [
      { label: '13 a 15', value: 0, badge: '0' },
      { label: '5 a 12', value: 1, badge: '+1' },
      { label: '3 a 4', value: 2, badge: '+2' },
    ],
  },
  {
    id: 'volume',
    kind: 'boolean',
    label: 'Volume do hematoma ≥ 30 mL',
    hint: 'Estime pelo método ABC/2 na tomografia inicial: (A × B × C) / 2, com A = maior diâmetro do hematoma no corte de maior área, B = maior diâmetro perpendicular a A, C = número de cortes em que o hematoma aparece multiplicado pela espessura do corte, tudo em centímetros. O resultado sai em mililitros.',
    points: 1,
  },
  {
    id: 'ivh',
    kind: 'boolean',
    label: 'Hemorragia intraventricular',
    hint: 'Qualquer quantidade de sangue nos ventrículos na tomografia inicial.',
    points: 1,
  },
  {
    id: 'infratentorial',
    kind: 'boolean',
    label: 'Origem infratentorial',
    hint: 'Hematoma com origem em tronco encefálico ou cerebelo.',
    points: 1,
  },
  {
    id: 'idade',
    kind: 'boolean',
    label: 'Idade ≥ 80 anos',
    points: 1,
  },
];

const calculator: Calculator = {
  slug: 'escore-ich',
  title: 'Escore ICH para hemorragia intracerebral',
  shortTitle: 'Escore ICH',
  subtitle:
    'Estima a mortalidade em 30 dias na hemorragia intraparenquimatosa espontânea a partir de cinco variáveis da admissão.',
  specialties: ['Neurologia', 'Terapia Intensiva', 'Emergência'],
  kind: 'Escore de risco',
  keywords: [
    'ich score',
    'escore ich',
    'hemorragia intracerebral',
    'hemorragia intraparenquimatosa',
    'AVC hemorrágico',
    'hematoma intracerebral',
    'ABC/2',
    'Hemphill',
  ],

  whenToUse: [
    'Adultos com hemorragia intraparenquimatosa espontânea, na admissão, para estratificar a gravidade e padronizar a comunicação entre equipes.',
    'Comparação de casuísticas, estratificação em protocolos assistenciais e critério de inclusão em estudos.',
    'Não se aplica a hemorragia traumática, a hemorragia subaracnóidea (use Hunt e Hess ou WFNS), a hematoma subdural ou extradural, nem a transformação hemorrágica de infarto isquêmico.',
    'Não foi feito para prever desfecho funcional nem para orientar decisões individuais de limitação terapêutica.',
  ],

  whyUse:
    'Reúne em cinco variáveis disponíveis na primeira hora, Glasgow, volume do hematoma, sangue intraventricular, topografia e idade, a maior parte da informação prognóstica da hemorragia intracerebral. É simples, reprodutível e amplamente validado em populações diversas.',

  pearls: [
    'O maior risco do escore é a profecia autorrealizável: a mortalidade elevada dos escores altos reflete, em parte, decisões precoces de não reanimar e de limitar suporte. O próprio grupo de Hemphill mostrou que a taxa institucional de ordens de não reanimar nas primeiras 24 horas prediz mortalidade de forma independente do caso. As diretrizes recomendam adiar novas ordens de limitação terapêutica para além das primeiras 24 a 48 horas.',
    'O ABC/2 assume um hematoma elipsoide. Em hematomas irregulares, multilobulados ou lobares extensos ele superestima o volume, e em hematomas com formato irregular pode errar em mais de 30%: quando a decisão depender do volume, prefira a volumetria semiautomática.',
    'Use o Glasgow da chegada, antes de sedação, bloqueio neuromuscular e intubação. Pontuar depois da sequência rápida infla o escore artificialmente.',
    'O escore prevê mortalidade, não incapacidade. Para estimar independência funcional em 90 dias existe o escore FUNC, com variáveis parcialmente diferentes.',
    'Mortalidade de 100% nos escores 5 e 6 vem de números muito pequenos: na coorte de derivação havia apenas 6 pacientes com escore 5 e nenhum com escore 6. Trate esses extremos como estimativa imprecisa.',
    'O escore foi derivado antes das estratégias atuais de controle intensivo da pressão arterial, de reversão rápida de anticoagulação e de evacuação minimamente invasiva; séries recentes tendem a mostrar mortalidade menor que a original para o mesmo escore, sobretudo em pacientes jovens.',
    'Volume e Glasgow são medidos na admissão, mas a expansão do hematoma nas primeiras horas é frequente. Repita a tomografia diante de qualquer deterioração: o escore inicial não captura essa evolução.',
    'A idade entra apenas com o corte de 80 anos: um paciente de 79 anos não pontua nesse item, o que não significa que a idade não pese no prognóstico.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const pontos = sumPoints(FIELDS, values);
    const mortalidade = MORTALIDADE_30D[pontos] ?? 100;

    let label: string;
    let severity: 'baixo' | 'moderado' | 'alto' | 'critico';
    let interpretation: string;
    let nextSteps: string;

    if (pontos === 0) {
      label = 'Risco baixo';
      severity = 'baixo';
      interpretation =
        'Nenhum dos preditores independentes de mortalidade está presente. Na coorte de derivação, todos os 26 pacientes com escore 0 sobreviveram em 30 dias.';
      nextSteps =
        'Internação em unidade de AVC ou terapia intensiva neurológica com monitorização neurológica seriada.\nControle da pressão arterial sistólica para cerca de 140 mmHg (evitando quedas abruptas), reversão imediata de anticoagulação se houver, controle glicêmico e prevenção de febre.\nRepita a tomografia em 6 a 24 horas ou diante de qualquer piora: a expansão do hematoma ocorre sobretudo nas primeiras horas.';
    } else if (pontos <= 2) {
      label = 'Risco moderado';
      severity = 'moderado';
      interpretation =
        'Mortalidade intermediária em 30 dias na coorte de derivação. A maioria desses pacientes sobrevive, e o esforço terapêutico pleno é claramente justificado.';
      nextSteps =
        'Terapia intensiva neurológica com controle pressórico precoce, reversão de coagulopatia guiada pelo agente em uso e vigilância de deterioração.\nAvalie hidrocefalia e necessidade de derivação ventricular externa quando houver hemorragia intraventricular.\nProfilaxia de trombose venosa com compressão pneumática desde a admissão e heparina profilática após 24 a 48 horas com hematoma estável.\nNão institua ordens de limitação terapêutica nas primeiras 24 a 48 horas.';
    } else if (pontos === 3) {
      label = 'Risco alto';
      severity = 'alto';
      interpretation =
        'Mortalidade elevada em 30 dias na coorte de derivação, mas com sobreviventes em proporção relevante. O escore isolado não deve determinar a intensidade do cuidado.';
      nextSteps =
        'Suporte intensivo pleno, com proteção de via aérea, controle da hipertensão intracraniana e discussão neurocirúrgica precoce: hematoma cerebelar com mais de 3 cm, compressão de tronco ou hidrocefalia têm indicação de cirurgia.\nMantenha esforço terapêutico completo nas primeiras 48 horas e reavalie o prognóstico com base na evolução, não apenas no escore de admissão.\nComunique a gravidade à família, sem prognóstico definitivo precoce.';
    } else {
      label = 'Risco muito alto';
      severity = 'critico';
      interpretation =
        'Mortalidade muito elevada em 30 dias na coorte de derivação. Lembre que esses percentuais derivam de poucos pacientes e de uma época em que a limitação precoce de suporte era frequente: o número não equivale a um prognóstico individual definitivo.';
      nextSteps =
        'Suporte intensivo imediato e avaliação neurocirúrgica urgente: hematoma cerebelar volumoso, hidrocefalia obstrutiva e efeito de massa com deterioração são situações cirúrgicas.\nEvite decisões definitivas de limitação de suporte nas primeiras 24 a 48 horas; a evidência mostra que ordens precoces de não reanimar pioram o desfecho de forma independente da gravidade.\nEnvolva a família em decisão compartilhada, com reavaliações programadas, e considere a equipe de cuidados paliativos em paralelo ao suporte pleno.';
    }

    return {
      value: pontos,
      unit: pontos === 1 ? 'ponto' : 'pontos',
      label,
      severity,
      interpretation,
      details: [
        {
          label: 'Mortalidade em 30 dias',
          value: `${mortalidade}%`,
          hint:
            pontos >= 5
              ? 'Coorte de derivação (Hemphill, 2001): apenas 6 pacientes com escore 5 e nenhum com escore 6'
              : 'Coorte de derivação: 152 pacientes, San Francisco General Hospital (Hemphill, 2001)',
        },
        { label: 'Escore máximo possível', value: '6 pontos' },
      ],
      nextSteps,
    };
  },

  formula: `Soma dos pontos (máximo 6):

Escala de coma de Glasgow
  3 a 4: 2
  5 a 12: 1
  13 a 15: 0
Volume do hematoma ≥ 30 mL: 1
Hemorragia intraventricular: 1
Origem infratentorial: 1
Idade ≥ 80 anos: 1

Volume pelo método ABC/2 (Kothari, 1996):
volume (mL) = (A × B × C) / 2, com medidas em centímetros
A = maior diâmetro do hematoma no corte de maior área
B = maior diâmetro perpendicular a A, no mesmo corte
C = número de cortes com hematoma × espessura do corte

Mortalidade em 30 dias na coorte de derivação:
0 → 0% · 1 → 13% · 2 → 26% · 3 → 72% · 4 → 97% · 5 → 100%`,

  evidence:
    'O escore foi derivado por Hemphill e colaboradores em 2001, a partir de 152 pacientes com hemorragia intracerebral espontânea atendidos no San Francisco General Hospital. Cinco variáveis mostraram associação independente com mortalidade em 30 dias na análise multivariada: escala de coma de Glasgow, idade de 80 anos ou mais, origem infratentorial, volume do hematoma de 30 cm³ ou mais e presença de hemorragia intraventricular. A mortalidade em 30 dias subiu de 0% no escore 0 para 13%, 26%, 72% e 97% nos escores 1 a 4; todos os 6 pacientes com escore 5 morreram, e nenhum paciente da coorte teve escore 6. O escore foi validado prospectivamente em coortes independentes e também para desfecho funcional em 12 meses, mantendo boa calibração. O mesmo grupo demonstrou, em 2004, que a taxa com que cada hospital emite ordens precoces de não reanimar prediz de forma independente a mortalidade por hemorragia intracerebral, evidência que sustenta a recomendação das diretrizes da American Heart Association de 2022 de adiar novas ordens de limitação terapêutica para além das primeiras 24 a 48 horas.',

  creator: {
    name: 'J. Claude Hemphill III',
    bio: 'Neurologista intensivista da Universidade da Califórnia em São Francisco, referência em neurointensivismo e em prognóstico da hemorragia intracerebral.',
  },

  updatedAt: '2026-07-26',

  references: [
    {
      citation:
        'Hemphill JC 3rd, Bonovich DC, Besmertis L, Manley GT, Johnston SC. The ICH score: a simple, reliable grading scale for intracerebral hemorrhage. Stroke. 2001;32(4):891-7.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/11283388/',
      primary: true,
    },
    {
      citation:
        'Kothari RU, Brott T, Broderick JP, et al. The ABCs of measuring intracerebral hemorrhage volumes. Stroke. 1996;27(8):1304-5.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/8711791/',
    },
    {
      citation:
        'Hemphill JC 3rd, Newman J, Zhao S, Johnston SC. Hospital usage of early do-not-resuscitate orders and outcome after intracerebral hemorrhage. Stroke. 2004;35(5):1130-4.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/15044768/',
    },
    {
      citation:
        'Greenberg SM, Ziai WC, Cordonnier C, et al. 2022 Guideline for the Management of Patients With Spontaneous Intracerebral Hemorrhage: A Guideline From the American Heart Association/American Stroke Association. Stroke. 2022;53(7):e282-e361.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/35579034/',
    },
  ],
};

export default calculator;
