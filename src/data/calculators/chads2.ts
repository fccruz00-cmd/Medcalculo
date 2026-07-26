import type { Calculator, Field, Values } from '@/lib/types';
import { sumPoints } from '@/lib/utils';

/**
 * Taxa ajustada de AVC por 100 pacientes-ano, em pacientes NÃO anticoagulados.
 * Coorte de derivação: National Registry of Atrial Fibrillation (Gage, 2001).
 */
const AVC_ANO: Record<number, number> = {
  0: 1.9,
  1: 2.8,
  2: 4.0,
  3: 5.9,
  4: 8.5,
  5: 12.5,
  6: 18.2,
};

const FIELDS: Field[] = [
  {
    id: 'icc',
    kind: 'boolean',
    label: 'Insuficiência cardíaca congestiva (C)',
    hint: 'História de insuficiência cardíaca, incluindo episódio recente de descompensação.',
    points: 1,
  },
  {
    id: 'hipertensao',
    kind: 'boolean',
    label: 'Hipertensão arterial (H)',
    hint: 'Diagnóstico prévio de hipertensão, mesmo controlada com medicação.',
    points: 1,
  },
  {
    id: 'idade',
    kind: 'boolean',
    label: 'Idade ≥ 75 anos (A)',
    points: 1,
  },
  {
    id: 'diabetes',
    kind: 'boolean',
    label: 'Diabetes mellitus (D)',
    hint: 'Em uso de hipoglicemiante oral, insulina ou com diagnóstico estabelecido.',
    points: 1,
  },
  {
    id: 'avc',
    kind: 'boolean',
    label: 'AVC ou AIT prévio (S₂)',
    hint: 'Acidente vascular cerebral ou ataque isquêmico transitório em qualquer momento da vida. Vale 2 pontos.',
    points: 2,
  },
];

const calculator: Calculator = {
  slug: 'chads2',
  title: 'Escore CHADS₂',
  shortTitle: 'CHADS₂',
  subtitle:
    'Estima o risco anual de AVC na fibrilação atrial não valvar. É a versão anterior ao CHA₂DS₂-VASc, hoje preferido pelas diretrizes.',
  specialties: ['Cardiologia', 'Clínica Médica', 'Neurologia'],
  kind: 'Escore de risco',
  keywords: [
    'chads',
    'chads2',
    'fibrilação atrial',
    'FA',
    'AVC',
    'acidente vascular cerebral',
    'anticoagulação',
    'tromboembolismo',
  ],

  whenToUse: [
    'Pacientes com fibrilação atrial não valvar, quando é preciso interpretar um escore CHADS₂ registrado em prontuário, protocolo antigo ou critério de inclusão de estudo clínico.',
    'Como referência histórica: os grandes ensaios dos anticoagulantes de ação direta (RE-LY, ROCKET-AF, ARISTOTLE) usaram o CHADS₂ para definir elegibilidade, e os resultados desses estudos são lidos por faixa de CHADS₂.',
    'Para decisão clínica atual sobre anticoagulação, prefira o CHA₂DS₂-VASc: é o escore recomendado pelas diretrizes brasileiras, europeias e norte-americanas.',
    'Não se aplica a fibrilação atrial valvar (estenose mitral moderada a grave ou prótese valvar mecânica), em que a anticoagulação com varfarina está indicada independentemente de escore.',
  ],

  whyUse:
    'O CHADS₂ foi o primeiro escore simples e amplamente validado para estimar risco de AVC na fibrilação atrial, e continua sendo a linguagem de boa parte da literatura dos anos 2000 e dos ensaios que aprovaram os DOACs. Conhecê-lo é necessário para ler esses estudos, mesmo que a decisão de anticoagular hoje seja tomada pelo CHA₂DS₂-VASc.',

  pearls: [
    'Por que foi substituído: o CHADS₂ classifica como risco "baixo" (0 ponto) pacientes cuja taxa de AVC ainda é de cerca de 1,9% ao ano, acima do limiar em que a anticoagulação já traz benefício líquido. Ou seja, seu valor preditivo negativo é insuficiente.',
    'Segunda razão da substituição: o escore ignora fatores de risco reconhecidos; doença vascular (infarto prévio, doença arterial periférica, placa aórtica complexa), idade entre 65 e 74 anos e sexo feminino. O CHA₂DS₂-VASc incorpora os três.',
    'Terceira razão: o CHADS₂ concentra a maioria dos pacientes na faixa intermediária de 1 a 2 pontos, justamente aquela em que a decisão é difícil, sem oferecer discriminação adicional.',
    'Idade pontua apenas a partir de 75 anos. Um paciente de 70 anos sem outras comorbidades tem CHADS₂ 0: e CHA₂DS₂-VASc 1, ou 2 se for mulher.',
    'As taxas exibidas vêm de uma coorte de beneficiários do Medicare com 65 a 95 anos que NÃO recebiam varfarina. Elas não representam o risco de quem já está anticoagulado.',
    'A letra S do CHADS₂ vale 2 pontos, como no CHA₂DS₂-VASc, mas o A do CHADS₂ vale 1 ponto (idade ≥ 75), enquanto no CHA₂DS₂-VASc o A₂ vale 2. Somar os dois escores pela mesma régua é erro frequente.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const pontos = sumPoints(FIELDS, values);
    const risco = AVC_ANO[pontos] ?? 18.2;

    let label: string;
    let severity: 'baixo' | 'moderado' | 'alto';
    let interpretation: string;

    if (pontos === 0) {
      label = 'Risco baixo (pela classificação original)';
      severity = 'baixo';
      interpretation =
        'Pela classificação original o risco é baixo, mas a taxa de AVC de cerca de 1,9% ao ano já é relevante. É exatamente essa limitação que motivou a criação do CHA₂DS₂-VASc: recalcule por lá antes de decidir não anticoagular.';
    } else if (pontos <= 2) {
      label = 'Risco intermediário';
      severity = 'moderado';
      interpretation =
        'Risco intermediário na classificação original. Nessa faixa o CHADS₂ discrimina mal: a maioria dos pacientes cai aqui, , e o CHA₂DS₂-VASc separa melhor quem realmente se beneficia da anticoagulação.';
    } else {
      label = 'Risco alto';
      severity = 'alto';
      interpretation =
        'Risco alto de AVC. Nessa faixa, a indicação de anticoagulação oral é consensual e o CHA₂DS₂-VASc correspondente será igual ou maior.';
    }

    return {
      value: pontos,
      unit: pontos === 1 ? 'ponto' : 'pontos',
      label,
      severity,
      interpretation,
      details: [
        {
          label: 'Risco anual de AVC',
          value: `${risco.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`,
          hint: 'Por 100 pacientes-ano, sem anticoagulação (NRAF, Gage 2001)',
        },
        {
          label: 'Classificação original',
          value: pontos === 0 ? 'Baixo' : pontos <= 2 ? 'Intermediário' : 'Alto',
          hint: 'Estratificação proposta no artigo de 2001',
        },
      ],
      nextSteps:
        'Recalcule o CHA₂DS₂-VASc antes de definir a conduta: ele é o escore recomendado pelas diretrizes atuais e reclassifica parte dos pacientes com CHADS₂ 0 ou 1.\n' +
        (pontos >= 2
          ? 'Com CHADS₂ ≥ 2 a anticoagulação oral está indicada; prefira um DOAC, exceto em estenose mitral moderada a grave, prótese mecânica ou clearance de creatinina muito reduzido.'
          : 'Com CHADS₂ 0 ou 1, a decisão depende dos fatores adicionais do CHA₂DS₂-VASc: doença vascular, idade entre 65 e 74 anos e sexo feminino.') +
        '\nAvalie em paralelo o risco de sangramento pelo HAS-BLED, para corrigir fatores modificáveis, e não para contraindicar a anticoagulação.',
    };
  },

  formula: `Soma dos pontos (máximo 6):

C - Insuficiência cardíaca congestiva: 1
H - Hipertensão arterial: 1
A - Idade ≥ 75 anos: 1
D - Diabetes mellitus: 1
S₂ - AVC ou AIT prévio: 2

Taxa ajustada de AVC por 100 pacientes-ano, sem anticoagulação (NRAF, 2001):
0 - 1,9% · 1 - 2,8% · 2 - 4,0% · 3 - 5,9% · 4 - 8,5% · 5 - 12,5% · 6 - 18,2%`,

  evidence:
    'O CHADS₂ foi criado por Gage e colaboradores em 2001, combinando elementos dos critérios do AFI (Atrial Fibrillation Investigators) e do SPAF (Stroke Prevention in Atrial Fibrillation). Foi validado no National Registry of Atrial Fibrillation, com 1.733 beneficiários do Medicare de 65 a 95 anos com fibrilação atrial não reumática, que receberam alta hospitalar sem prescrição de varfarina. A taxa ajustada de AVC subiu de 1,9 por 100 pacientes-ano com escore 0 para 18,2 com escore 6, e o escore discriminou melhor que os esquemas do AFI e do SPAF (estatística c em torno de 0,82 no modelo original, embora validações externas posteriores tenham encontrado valores mais modestos, em torno de 0,6 a 0,7). Em 2010, Lip e colaboradores propuseram o CHA₂DS₂-VASc justamente para corrigir a principal fraqueza do CHADS₂: a incapacidade de identificar com segurança os pacientes de risco verdadeiramente baixo. Desde então, as diretrizes europeias, norte-americanas e brasileiras adotam o CHA₂DS₂-VASc como escore de escolha.',

  creator: {
    name: 'Brian F. Gage',
    bio: 'Internista e pesquisador da Washington University School of Medicine, em St. Louis, dedicado à epidemiologia da anticoagulação e da fibrilação atrial.',
  },

  references: [
    {
      citation:
        'Gage BF, Waterman AD, Shannon W, Boechler M, Rich MW, Radford MJ. Validation of clinical classification schemes for predicting stroke: results from the National Registry of Atrial Fibrillation. JAMA. 2001;285(22):2864-70.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/11401607/',
      primary: true,
    },
    {
      citation:
        'Lip GYH, Nieuwlaat R, Pisters R, Lane DA, Crijns HJGM. Refining clinical risk stratification for predicting stroke and thromboembolism in atrial fibrillation using a novel risk factor-based approach: the Euro Heart Survey on Atrial Fibrillation. Chest. 2010;137(2):263-72.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/19762550/',
    },
    {
      citation:
        'Olesen JB, Lip GYH, Hansen ML, et al. Validation of risk stratification schemes for predicting stroke and thromboembolism in patients with atrial fibrillation: nationwide cohort study. BMJ. 2011;342:d124.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/21282258/',
    },
    {
      citation:
        'Magalhães LP, Figueiredo MJO, Cintra FD, et al. II Diretrizes Brasileiras de Fibrilação Atrial. Arq Bras Cardiol. 2016;106(4 Supl 2):1-22.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/27167175/',
    },
  ],
};

export default calculator;
