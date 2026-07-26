import type { Calculator, Field, Values } from '@/lib/types';
import { sumPoints } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'momento',
    kind: 'choice',
    label: 'Momento da avaliação',
    hint: 'O escore é registrado no 1º e no 5º minuto de vida. Quando o de 5 minutos é menor que 7, repita a cada 5 minutos até os 20 minutos.',
    options: [
      { label: '1º minuto', value: 'min1' },
      { label: '5º minuto', value: 'min5' },
      { label: '10 minutos ou mais', value: 'min10' },
    ],
  },
  {
    id: 'fc',
    kind: 'choice',
    label: 'Frequência cardíaca',
    hint: 'Ausculte o precórdio por 6 segundos e multiplique por 10, ou use o monitor cardíaco.',
    options: [
      { label: 'Ausente', value: 0 },
      { label: 'Menor que 100 bpm', value: 1, badge: '+1' },
      { label: '100 bpm ou mais', value: 2, badge: '+2' },
    ],
  },
  {
    id: 'respiracao',
    kind: 'choice',
    label: 'Esforço respiratório',
    layout: 'stack',
    options: [
      { label: 'Ausente (apneia)', value: 0 },
      { label: 'Respiração fraca, irregular ou gemente', value: 1, badge: '+1' },
      { label: 'Choro forte, respiração regular', value: 2, badge: '+2' },
    ],
  },
  {
    id: 'tonus',
    kind: 'choice',
    label: 'Tônus muscular',
    layout: 'stack',
    options: [
      { label: 'Flácido', value: 0 },
      { label: 'Alguma flexão das extremidades', value: 1, badge: '+1' },
      { label: 'Movimentação ativa, flexão completa', value: 2, badge: '+2' },
    ],
  },
  {
    id: 'irritabilidade',
    kind: 'choice',
    label: 'Irritabilidade reflexa',
    hint: 'Resposta à aspiração das vias aéreas com sonda ou à estimulação da planta do pé.',
    layout: 'stack',
    options: [
      { label: 'Sem resposta', value: 0 },
      { label: 'Careta ou movimento discreto', value: 1, badge: '+1' },
      { label: 'Tosse, espirro, choro vigoroso ou retirada ativa', value: 2, badge: '+2' },
    ],
  },
  {
    id: 'cor',
    kind: 'choice',
    label: 'Cor da pele',
    layout: 'stack',
    options: [
      { label: 'Cianose central ou palidez generalizada', value: 0 },
      { label: 'Corpo rosado com extremidades cianóticas (acrocianose)', value: 1, badge: '+1' },
      { label: 'Totalmente rosado', value: 2, badge: '+2' },
    ],
  },
];

const ROTULO_MOMENTO: Record<string, string> = {
  min1: '1º minuto',
  min5: '5º minuto',
  min10: '10 minutos ou mais',
};

const calculator: Calculator = {
  slug: 'apgar',
  title: 'Escore de Apgar',
  shortTitle: 'Apgar',
  subtitle:
    'Avalia de forma padronizada a vitalidade do recém-nascido no 1º e no 5º minuto de vida a partir de cinco sinais clínicos.',
  specialties: ['Pediatria', 'Obstetrícia', 'Emergência'],
  kind: 'Escala',
  popular: true,
  keywords: [
    'apgar',
    'boletim de apgar',
    'índice de apgar',
    'recém-nascido',
    'RN',
    'neonatal',
    'vitalidade',
    'sala de parto',
    'asfixia perinatal',
    'reanimação neonatal',
  ],

  whenToUse: [
    'Avaliação sistemática de todo recém-nascido, vivo, no 1º e no 5º minuto de vida: independentemente da idade gestacional ou da via de parto.',
    'Reavaliações a cada 5 minutos, até os 20 minutos de vida, sempre que o escore de 5 minutos for menor que 7.',
    'Não serve para decidir o início da reanimação neonatal: a decisão de ventilar depende da avaliação da respiração e da frequência cardíaca nos primeiros 30 a 60 segundos, muito antes do primeiro Apgar.',
    'Não é critério diagnóstico de asfixia perinatal nem instrumento de prognóstico neurológico individual.',
  ],

  whyUse:
    'Criado por Virginia Apgar em 1953, é a linguagem comum universal para descrever a condição do recém-nascido nos primeiros minutos e a resposta às manobras realizadas. O escore de 5 minutos mantém, mesmo hoje, forte associação populacional com mortalidade neonatal: associação mais robusta, inclusive, do que a do pH de artéria umbilical.',

  pearls: [
    'O Apgar não indica reanimação. Esperar o escore do 1º minuto para iniciar a ventilação com pressão positiva atrasa a única intervenção que muda desfecho. Ventile quando o recém-nascido está apneico, com respiração irregular ou com frequência cardíaca abaixo de 100 bpm ao final dos primeiros 60 segundos.',
    'Apgar baixo isolado não é asfixia perinatal. O consenso da AAP e do ACOG exige, além do escore de 0 a 3 persistindo além dos 5 minutos, acidemia metabólica em sangue de cordão (pH < 7,0 e déficit de base ≥ 12 mmol/L), encefalopatia neonatal e disfunção de múltiplos órgãos.',
    'Prematuros pontuam menos por imaturidade neuromuscular, mesmo bem oxigenados: tônus e irritabilidade reflexa são naturalmente baixos. Interpretar isso como asfixia é erro frequente.',
    'Anestesia e sedação materna, sulfato de magnésio, infecção, malformações e doenças neuromusculares deprimem o escore sem que haja hipóxia.',
    'O item cor é o mais subjetivo e o menos útil: quase nenhum recém-nascido está totalmente rosado no 1º minuto, e acrocianose é normal. Não use a cor para titular oxigênio: use a oximetria pré-ductal (mão direita), com as metas de saturação por minuto de vida.',
    'Em recém-nascido intubado ou em ventilação com pressão positiva, o item respiração não pode ser pontuado da forma convencional. Registre também as intervenções em curso (formato de Apgar ampliado, recomendado pela AAP).',
    'O valor preditivo individual é baixo: a maioria das crianças com paralisia cerebral teve Apgar normal e a grande maioria dos recém-nascidos com Apgar baixo não desenvolve sequela neurológica.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const pontos = sumPoints(FIELDS, values);
    const momento = typeof values.momento === 'string' ? values.momento : 'min1';
    const rotuloMomento = ROTULO_MOMENTO[momento] ?? '1º minuto';
    const cincoOuMais = momento === 'min5' || momento === 'min10';

    let label: string;
    let severity: 'baixo' | 'alto' | 'critico';
    let interpretation: string;
    let nextSteps: string;

    if (pontos >= 7) {
      label = 'Boa vitalidade';
      severity = 'baixo';
      interpretation =
        'Recém-nascido com boa vitalidade. Escore de 7 a 10 é considerado normal e traduz adaptação adequada à vida extrauterina.';
      nextSteps =
        'Mantenha o contato pele a pele com a mãe, o clampeamento oportuno do cordão e a amamentação na primeira hora.\nSeque, aqueça e monitorize respiração, tônus e cor. Registre também o escore do 5º minuto.';
    } else if (pontos >= 4) {
      label = 'Depressão moderada';
      severity = 'alto';
      interpretation =
        'Recém-nascido moderadamente deprimido. O escore descreve a condição atual e a resposta às manobras já realizadas: não substitui a avaliação contínua da respiração e da frequência cardíaca.';
      nextSteps =
        'Revise os passos iniciais: posicionamento da via aérea, secagem, aquecimento e estímulo tátil.\nSe a respiração for ausente ou irregular, ou a frequência cardíaca estiver abaixo de 100 bpm, inicie ventilação com pressão positiva imediatamente e monitorize com oximetria e monitor cardíaco.';
    } else {
      label = 'Depressão grave';
      severity = 'critico';
      interpretation =
        'Recém-nascido gravemente deprimido. Situação de reanimação em curso: o escore documenta a gravidade, mas a conduta é ditada pela frequência cardíaca e pela ventilação, reavaliadas a cada 30 segundos.';
      nextSteps =
        'Ventilação com pressão positiva eficaz é a prioridade absoluta. Se a frequência cardíaca permanecer abaixo de 60 bpm apesar de ventilação adequada por 30 segundos (de preferência com via aérea avançada), inicie massagem cardíaca coordenada 3:1 e considere adrenalina e expansão volêmica.\nColha gasometria de cordão, avalie critérios de encefalopatia hipóxico-isquêmica e considere hipotermia terapêutica em recém-nascido com 35 semanas ou mais nas primeiras 6 horas.';
    }

    if (cincoOuMais && pontos < 7) {
      interpretation +=
        '\nEscore menor que 7 no 5º minuto: mantenha a reanimação e repita a avaliação a cada 5 minutos, até os 20 minutos de vida.';
    }
    if (momento === 'min1' && pontos < 7) {
      interpretation +=
        '\nNo 1º minuto, escores baixos são frequentes e têm pouco valor prognóstico isolado. O escore do 5º minuto é o que carrega informação sobre desfecho.';
    }

    const details = [
      { label: 'Momento', value: rotuloMomento },
      {
        label: 'Faixa do escore',
        value: pontos >= 7 ? '7 a 10: normal' : pontos >= 4 ? '4 a 6: depressão moderada' : '0 a 3: depressão grave',
      },
    ];

    if (cincoOuMais) {
      details.push({
        label: 'Mortalidade neonatal em RN a termo',
        value:
          pontos >= 7
            ? '0,2 por 1.000 nascidos vivos'
            : pontos >= 4
              ? 'Intermediária, entre as duas faixas extremas'
              : '244 por 1.000 nascidos vivos',
      });
    }

    return {
      value: pontos,
      unit: pontos === 1 ? 'ponto' : 'pontos',
      label,
      severity,
      interpretation,
      details,
      nextSteps,
    };
  },

  formula: `Cinco itens, de 0 a 2 pontos cada - total de 0 a 10:

Frequência cardíaca - ausente (0) · < 100 bpm (1) · ≥ 100 bpm (2)
Esforço respiratório - ausente (0) · fraco, irregular ou gemente (1) · choro forte e regular (2)
Tônus muscular - flácido (0) · alguma flexão (1) · movimentação ativa (2)
Irritabilidade reflexa - sem resposta (0) · careta (1) · tosse, espirro ou choro (2)
Cor - cianose central ou palidez (0) · acrocianose (1) · totalmente rosado (2)

Interpretação:
7 a 10 - boa vitalidade
4 a 6 - depressão moderada
0 a 3 - depressão grave

Registre no 1º e no 5º minuto. Se o escore de 5 minutos for menor que 7,
repita a cada 5 minutos até os 20 minutos de vida.`,

  evidence:
    'Virginia Apgar propôs o escore em 1953, no Curr Res Anesth Analg, como método simples e reprodutível de avaliar o recém-nascido no primeiro minuto de vida e de comparar os efeitos das práticas obstétricas e anestésicas da época. A validade prognóstica moderna foi demonstrada por Casey e colaboradores em coorte retrospectiva de 151.891 recém-nascidos únicos, sem malformações, com 26 semanas ou mais, no Parkland Hospital (Dallas), entre 1988 e 1998: entre os 132.228 recém-nascidos a termo, a mortalidade neonatal foi de 244 por 1.000 quando o Apgar de 5 minutos foi de 0 a 3, contra 0,2 por 1.000 quando foi de 7 a 10; entre os 13.399 pré-termo (26 a 36 semanas), as taxas foram de 315 e 5 por 1.000. Nessa mesma coorte, o Apgar de 5 minutos previu a morte neonatal melhor que o pH de artéria umbilical ≤ 7,0. A declaração conjunta da American Academy of Pediatrics e do American College of Obstetricians and Gynecologists reforça que o escore não deve ser usado isoladamente para diagnosticar asfixia, prever desfecho neurológico individual ou orientar a reanimação.',

  creator: {
    name: 'Virginia Apgar',
    bio: 'Anestesiologista norte-americana do Columbia-Presbyterian Medical Center, em Nova York. Publicou o escore em 1953 e é considerada uma das fundadoras da neonatologia moderna.',
  },

  references: [
    {
      citation:
        'Apgar V. A proposal for a new method of evaluation of the newborn infant. Curr Res Anesth Analg. 1953;32(4):260-7.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/13083014/',
      primary: true,
    },
    {
      citation:
        'Casey BM, McIntire DD, Leveno KJ. The continuing value of the Apgar score for the assessment of newborn infants. N Engl J Med. 2001;344(7):467-71.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/11172187/',
    },
    {
      citation:
        'American Academy of Pediatrics Committee on Fetus and Newborn; American College of Obstetricians and Gynecologists Committee on Obstetric Practice. The Apgar Score. Pediatrics. 2015;136(4):819-22.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/26416932/',
    },
    {
      citation:
        'Sociedade Brasileira de Pediatria. Programa de Reanimação Neonatal: diretrizes para a reanimação do recém-nascido em sala de parto. Rio de Janeiro: SBP; 2022.',
    },
  ],
};

export default calculator;
