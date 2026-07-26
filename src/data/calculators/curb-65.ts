import type { Calculator, Field, Values } from '@/lib/types';
import { sumPoints } from '@/lib/utils';

/**
 * Mortalidade em 30 dias (%) por pontuação: coorte de validação externa de
 * Aujesky et al., Am J Med 2005 (3.181 pacientes), que relatou os escores 4 e 5
 * em uma única classe (4-5 = 27,8%). Não são os números da coorte de derivação
 * de Lim (2003), sistematicamente mais altos (0,7 / 3,2 / 13 / 17 / 41,5 / 57).
 */
const MORTALIDADE_30D: Record<number, number> = {
  0: 0.6,
  1: 2.7,
  2: 6.8,
  3: 14.0,
  4: 27.8,
  5: 27.8,
};

const FIELDS: Field[] = [
  {
    id: 'confusao',
    kind: 'boolean',
    label: 'Confusão mental',
    hint: 'Desorientação em tempo, espaço ou pessoa, ou rebaixamento agudo do nível de consciência em relação ao basal.',
    points: 1,
  },
  {
    id: 'ureia',
    kind: 'boolean',
    label: 'Ureia > 43 mg/dL',
    hint: 'Equivale a ureia > 7 mmol/L ou BUN > 20 mg/dL. Atenção: laboratórios brasileiros costumam dosar ureia, e não BUN.',
    points: 1,
  },
  {
    id: 'fr',
    kind: 'boolean',
    label: 'Frequência respiratória ≥ 30 irpm',
    points: 1,
  },
  {
    id: 'pa',
    kind: 'boolean',
    label: 'PAS < 90 mmHg ou PAD ≤ 60 mmHg',
    hint: 'Basta um dos dois critérios de pressão arterial.',
    points: 1,
  },
  {
    id: 'idade',
    kind: 'boolean',
    label: 'Idade ≥ 65 anos',
    points: 1,
  },
];

const calculator: Calculator = {
  slug: 'curb-65',
  title: 'CURB-65: gravidade da pneumonia adquirida na comunidade',
  shortTitle: 'CURB-65',
  subtitle:
    'Estima a mortalidade em 30 dias na pneumonia adquirida na comunidade e apoia a decisão entre tratamento ambulatorial e internação.',
  specialties: ['Pneumologia', 'Emergência', 'Infectologia', 'Clínica Médica'],
  kind: 'Regra de decisão',
  popular: true,
  keywords: [
    'curb65',
    'pneumonia',
    'PAC',
    'pneumonia adquirida na comunidade',
    'internação',
    'gravidade',
  ],

  whenToUse: [
    'Adultos com diagnóstico de pneumonia adquirida na comunidade, confirmado clinicamente e por imagem.',
    'No pronto-socorro, para apoiar a decisão sobre local de tratamento: domicílio, enfermaria ou terapia intensiva.',
  ],

  whyUse:
    'É rápido, usa apenas cinco variáveis à beira do leito e tem desempenho semelhante ao do PSI/PORT para identificar pacientes de baixo risco que podem ser tratados em casa com segurança, evitando internações desnecessárias.',

  pearls: [
    'O escore prediz mortalidade, não necessidade de internação. Fatores sociais, hipoxemia, descompensação de comorbidades, intolerância à via oral e derrame pleural volumoso podem justificar internação mesmo com CURB-65 baixo.',
    'Sempre associe a oximetria de pulso: saturação abaixo de 92% em ar ambiente indica internação independentemente do escore.',
    'O PSI/PORT é mais sensível para identificar pacientes de baixo risco, mas exige 20 variáveis; o CURB-65 é preferido pela praticidade.',
    'A versão CRB-65 dispensa a ureia e pode ser usada na atenção primária, sem exames laboratoriais.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const pontos = sumPoints(FIELDS, values);
    const mortalidade = MORTALIDADE_30D[pontos] ?? 27.8;

    let label: string;
    let severity: 'baixo' | 'moderado' | 'alto' | 'critico';
    let interpretation: string;
    let nextSteps: string;

    if (pontos <= 1) {
      label = 'Risco baixo';
      severity = 'baixo';
      interpretation =
        'Grupo de baixo risco de mortalidade. Em geral pode ser tratado em regime ambulatorial.';
      nextSteps =
        'Tratamento ambulatorial com antibiótico oral, desde que haja boa saturação em ar ambiente, tolerância à via oral, suporte social adequado e possibilidade de reavaliação.\nReavalie em 48 a 72 horas ou antes, se houver piora.';
    } else if (pontos === 2) {
      label = 'Risco intermediário';
      severity = 'moderado';
      interpretation =
        'Risco intermediário de mortalidade. Considere internação hospitalar ou tratamento ambulatorial supervisionado com reavaliação precoce.';
      nextSteps =
        'Internação em enfermaria ou observação em unidade de curta permanência, com antibioticoterapia conforme protocolo institucional.\nSe optar por tratamento domiciliar, garanta reavaliação em 24 a 48 horas.';
    } else if (pontos === 3) {
      label = 'Risco alto';
      severity = 'alto';
      interpretation =
        'Pneumonia grave, com mortalidade substancial em 30 dias. Internação hospitalar está indicada.';
      nextSteps =
        'Interne o paciente e inicie antibioticoterapia endovenosa precocemente. Avalie a necessidade de suporte em terapia intensiva, sobretudo se houver hipoxemia, instabilidade hemodinâmica ou acometimento multilobar.';
    } else {
      label = 'Risco muito alto';
      severity = 'critico';
      interpretation =
        'Pneumonia de alta gravidade. Internação hospitalar obrigatória, com avaliação imediata para terapia intensiva.';
      nextSteps =
        'Interne com avaliação imediata da terapia intensiva. Inicie antibiótico endovenoso na primeira hora, colha culturas e lactato e reavalie critérios de sepse e de ventilação mecânica.';
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
          value: `${mortalidade.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`,
          hint: 'Coorte de validação externa de Aujesky (2005), com 3.181 pacientes; escores 4 e 5 foram relatados juntos',
        },
        {
          label: 'Local de tratamento sugerido',
          value: pontos <= 1 ? 'Ambulatorial' : pontos === 2 ? 'Enfermaria' : 'Internação, avaliar UTI',
        },
      ],
      nextSteps,
    };
  },

  formula: `Um ponto para cada critério presente (máximo 5):

C - Confusão mental
U - Ureia > 43 mg/dL (> 7 mmol/L; BUN > 20 mg/dL)
R - Frequência respiratória ≥ 30 irpm
B - PAS < 90 mmHg ou PAD ≤ 60 mmHg
65 - Idade ≥ 65 anos`,

  evidence:
    'O CURB-65 foi derivado por Lim e colaboradores em 2003, a partir de três coortes prospectivas de pneumonia adquirida na comunidade no Reino Unido, Holanda e Nova Zelândia, somando 1.068 pacientes; ali a mortalidade em 30 dias subiu de 0,7% no escore 0 para 41,5% no escore 4 e 57% no escore 5. Os percentuais exibidos nesta calculadora, porém, vêm da coorte de validação externa de Aujesky e colaboradores (2005), com 3.181 pacientes, em que a mortalidade foi de 0,6% no escore 0, 14,0% no escore 3 e 27,8% nos escores 4 e 5 reunidos: uma calibração mais baixa que a da coorte original, o que ilustra por que o escore ordena bem o risco mas não deve ser lido como probabilidade absoluta. Metanálises posteriores mostraram desempenho discriminatório semelhante ao do PSI/PORT para mortalidade, com a vantagem prática de exigir apenas cinco variáveis. As diretrizes da American Thoracic Society e da Infectious Diseases Society of America de 2019 recomendam o uso de escores de gravidade em conjunto com o julgamento clínico, e não como substitutos dele.',

  creator: {
    name: 'W. S. Lim',
    bio: 'Pneumologista britânico do Nottingham University Hospitals NHS Trust, coordenador das diretrizes de pneumonia da British Thoracic Society.',
  },

  updatedAt: '2026-07-26',

  references: [
    {
      citation:
        'Lim WS, van der Eerden MM, Laing R, et al. Defining community acquired pneumonia severity on presentation to hospital: an international derivation and validation study. Thorax. 2003;58(5):377-82.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/12728155/',
      primary: true,
    },
    {
      citation:
        'Aujesky D, Auble TE, Yealy DM, et al. Prospective comparison of three validated prediction rules for prognosis in community-acquired pneumonia. Am J Med. 2005;118(4):384-92.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/15808136/',
    },
    {
      citation:
        'Metlay JP, Waterer GW, Long AC, et al. Diagnosis and Treatment of Adults with Community-acquired Pneumonia. An Official Clinical Practice Guideline of the American Thoracic Society and Infectious Diseases Society of America. Am J Respir Crit Care Med. 2019;200(7):e45-e67.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/31573350/',
    },
    {
      citation:
        'Chalmers JD, Singanayagam A, Akram AR, et al. Severity assessment tools for predicting mortality in hospitalised patients with community-acquired pneumonia. Systematic review and meta-analysis. Thorax. 2010;65(10):878-83.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/20729231/',
    },
  ],
};

export default calculator;
