import type { Calculator, Field, Values } from '@/lib/types';
import { sumPoints } from '@/lib/utils';

/**
 * Mortalidade hospitalar por faixa do SOFA INICIAL: Ferreira et al., JAMA 2001,
 * coorte prospectiva de 352 pacientes de UTI do Hospital Erasme (Bruxelas).
 *
 * É o escore inicial que o usuário calcula aqui, então é essa a tabela usada.
 * Não confundir com a tabela do SOFA MÁXIMO, que circula nos compêndios com
 * percentuais bem menores nas faixas altas (80% em 12 a 14 pontos, 89,7% acima
 * de 14) e vem da coorte de Vincent (1998).
 */
const MORTALIDADE: Array<{ ate: number; faixa: string; texto: string }> = [
  { ate: 1, faixa: '0 a 1', texto: '0%' },
  { ate: 3, faixa: '2 a 3', texto: '6,4%' },
  { ate: 5, faixa: '4 a 5', texto: '20,2%' },
  { ate: 7, faixa: '6 a 7', texto: '21,5%' },
  { ate: 9, faixa: '8 a 9', texto: '33,3%' },
  { ate: 11, faixa: '10 a 11', texto: '50,0%' },
  { ate: 24, faixa: '12 ou mais', texto: '95,2%' },
];

function mortalidade(pontos: number): { faixa: string; texto: string } {
  for (const item of MORTALIDADE) {
    if (pontos <= item.ate) return { faixa: item.faixa, texto: item.texto };
  }
  return { faixa: '12 ou mais', texto: '95,2%' };
}

const FIELDS: Field[] = [
  {
    id: 'respiratorio',
    kind: 'choice',
    layout: 'stack',
    label: 'Respiratório: relação PaO₂/FiO₂',
    hint: 'FiO₂ em fração decimal. Exemplo: PaO₂ 80 mmHg com FiO₂ 0,40 → 80 / 0,40 = 200 mmHg.',
    help: 'Suporte ventilatório significa ventilação mecânica invasiva ou não invasiva com pressão positiva (CPAP/BiPAP). Cateter nasal e máscara de Venturi não contam como suporte ventilatório para os níveis 3 e 4: nesses casos, a pontuação máxima é 2.',
    options: [
      { label: '≥ 400 mmHg', value: 0 },
      { label: '< 400 mmHg', value: 1, badge: '+1' },
      { label: '< 300 mmHg', value: 2, badge: '+2' },
      { label: '< 200 mmHg com suporte ventilatório', value: 3, badge: '+3' },
      { label: '< 100 mmHg com suporte ventilatório', value: 4, badge: '+4' },
    ],
  },
  {
    id: 'coagulacao',
    kind: 'choice',
    layout: 'stack',
    label: 'Coagulação: plaquetas',
    hint: 'Em milhares por microlitro (×10³/µL). Exemplo: 85.000/mm³ equivale a 85.',
    options: [
      { label: '≥ 150 ×10³/µL', value: 0 },
      { label: '< 150 ×10³/µL', value: 1, badge: '+1' },
      { label: '< 100 ×10³/µL', value: 2, badge: '+2' },
      { label: '< 50 ×10³/µL', value: 3, badge: '+3' },
      { label: '< 20 ×10³/µL', value: 4, badge: '+4' },
    ],
  },
  {
    id: 'hepatico',
    kind: 'choice',
    layout: 'stack',
    label: 'Hepático: bilirrubina total',
    hint: 'Em mg/dL, como reportado nos laboratórios brasileiros. Para converter de µmol/L, divida por 17,1.',
    options: [
      { label: '< 1,2 mg/dL', value: 0, hint: '< 20 µmol/L' },
      { label: '1,2 a 1,9 mg/dL', value: 1, badge: '+1', hint: '20 a 32 µmol/L' },
      { label: '2,0 a 5,9 mg/dL', value: 2, badge: '+2', hint: '33 a 101 µmol/L' },
      { label: '6,0 a 11,9 mg/dL', value: 3, badge: '+3', hint: '102 a 204 µmol/L' },
      { label: '≥ 12,0 mg/dL', value: 4, badge: '+4', hint: '> 204 µmol/L' },
    ],
  },
  {
    id: 'cardiovascular',
    kind: 'choice',
    layout: 'stack',
    label: 'Cardiovascular: PAM e vasopressores',
    hint: 'Doses em mcg/kg/min, mantidas por pelo menos 1 hora. PAM = (PAS + 2 × PAD) / 3.',
    help: 'A dobutamina pontua 2 em qualquer dose, porque no escore original ela marca disfunção cardiovascular tratada, independentemente da titulação. Quando houver mais de uma droga, use a que resultar na maior pontuação.',
    options: [
      { label: 'PAM ≥ 70 mmHg, sem vasopressor', value: 0 },
      { label: 'PAM < 70 mmHg, sem vasopressor', value: 1, badge: '+1' },
      {
        label: 'Dopamina ≤ 5 ou dobutamina em qualquer dose',
        value: 2,
        badge: '+2',
      },
      {
        label: 'Dopamina > 5, ou noradrenalina ≤ 0,1, ou adrenalina ≤ 0,1',
        value: 3,
        badge: '+3',
      },
      {
        label: 'Dopamina > 15, ou noradrenalina > 0,1, ou adrenalina > 0,1',
        value: 4,
        badge: '+4',
      },
    ],
  },
  {
    id: 'neurologico',
    kind: 'choice',
    layout: 'stack',
    label: 'Neurológico: escala de coma de Glasgow',
    hint: 'Use o valor sem sedação sempre que possível; sob sedação, registre o Glasgow estimado antes da droga ou o melhor valor do dia.',
    options: [
      { label: 'Glasgow 15', value: 0 },
      { label: 'Glasgow 13 a 14', value: 1, badge: '+1' },
      { label: 'Glasgow 10 a 12', value: 2, badge: '+2' },
      { label: 'Glasgow 6 a 9', value: 3, badge: '+3' },
      { label: 'Glasgow < 6', value: 4, badge: '+4' },
    ],
  },
  {
    id: 'renal',
    kind: 'choice',
    layout: 'stack',
    label: 'Renal: creatinina ou diurese',
    hint: 'Creatinina em mg/dL. Quando os dois critérios divergirem, use o que gerar mais pontos.',
    options: [
      { label: 'Creatinina < 1,2 mg/dL', value: 0, hint: '< 110 µmol/L' },
      { label: 'Creatinina 1,2 a 1,9 mg/dL', value: 1, badge: '+1', hint: '110 a 170 µmol/L' },
      { label: 'Creatinina 2,0 a 3,4 mg/dL', value: 2, badge: '+2', hint: '171 a 299 µmol/L' },
      {
        label: 'Creatinina 3,5 a 4,9 mg/dL ou diurese < 500 mL/dia',
        value: 3,
        badge: '+3',
        hint: '300 a 440 µmol/L',
      },
      {
        label: 'Creatinina ≥ 5,0 mg/dL ou diurese < 200 mL/dia',
        value: 4,
        badge: '+4',
        hint: '> 440 µmol/L',
      },
    ],
  },
];

/** Nome legível de cada sistema, para listar as disfunções no resultado. */
const SISTEMAS: Record<string, string> = {
  respiratorio: 'respiratório',
  coagulacao: 'coagulação',
  hepatico: 'hepático',
  cardiovascular: 'cardiovascular',
  neurologico: 'neurológico',
  renal: 'renal',
};

const calculator: Calculator = {
  slug: 'sofa',
  title: 'Escore SOFA: Sequential Organ Failure Assessment',
  shortTitle: 'SOFA',
  subtitle:
    'Quantifica a disfunção de seis sistemas orgânicos no paciente crítico, de 0 a 24 pontos, e sustenta a definição de sepse do Sepsis-3.',
  specialties: ['Terapia Intensiva'],
  kind: 'Escore de risco',
  popular: true,
  keywords: [
    'sequential organ failure assessment',
    'disfunção orgânica',
    'falência de órgãos',
    'sepse',
    'sepsis 3',
    'choque séptico',
    'UTI',
    'gravidade',
  ],

  whenToUse: [
    'Adultos internados em terapia intensiva, para quantificar e acompanhar a disfunção orgânica ao longo dos dias: o escore foi concebido para uso seriado, não apenas na admissão.',
    'Para operacionalizar a definição de sepse do Sepsis-3: infecção suspeita ou confirmada somada a um aumento agudo de 2 ou mais pontos no SOFA em relação ao basal.',
    'Como desfecho e como variável de ajuste em pesquisa clínica na terapia intensiva.',
    'Não foi criado para prever a mortalidade de um paciente individual nem para decidir alocação de recursos: seu propósito original é descrever morbidade, e não prognosticar.',
    'Não se aplica a crianças (use o pSOFA) nem substitui a avaliação clínica em pacientes fora da UTI, onde o qSOFA e escores de alerta precoce são mais práticos.',
  ],

  whyUse:
    'É a linguagem comum da terapia intensiva para descrever disfunção orgânica: simples, reprodutível, baseada em variáveis que já são coletadas de rotina e validada em milhares de pacientes. A variação do SOFA ao longo do tempo, sobretudo a piora nas primeiras 48 horas, prediz mortalidade melhor do que o valor isolado da admissão.',

  pearls: [
    'Assume-se que o paciente sem disfunção prévia conhecida tem SOFA basal igual a zero. Em quem já tem doença crônica de órgão (cirrose, doença renal crônica dialítica, DPOC avançada), o basal NÃO é zero: e o critério do Sepsis-3 exige a variação aguda de 2 pontos, não o valor absoluto.',
    'O item respiratório só chega a 3 ou 4 pontos com suporte ventilatório (ventilação invasiva ou não invasiva com pressão positiva). Uma PaO₂/FiO₂ de 90 em cateter nasal pontua no máximo 2 pelo escore original.',
    'O item cardiovascular usa doses em mcg/kg/min mantidas por pelo menos uma hora. Erro comum é lançar a dose em mL/h ou em mcg/min sem dividir pelo peso: 0,1 mcg/kg/min em um paciente de 70 kg equivale a 7 mcg/min.',
    'A dobutamina pontua 2 em qualquer dose, o que gera pontuação aparentemente alta em pacientes hemodinamicamente estáveis com disfunção sistólica.',
    'Sob sedação profunda ou bloqueio neuromuscular, o Glasgow perde validade. Registre o melhor valor estimado sem sedação; se isso não for possível, assinale a limitação, porque a superestimativa do item neurológico é a distorção mais frequente do SOFA em UTI.',
    'A versão original usa bilirrubina em µmol/L e creatinina em µmol/L. Aqui os limiares já estão convertidos para mg/dL: não reconverta.',
    'O critério de diurese (< 500 mL/dia para 3 pontos, < 200 mL/dia para 4) exige um período de 24 horas. Em paciente recém-admitido, use a creatinina.',
    'Existem duas tabelas de mortalidade do SOFA e elas não são intercambiáveis: a do SOFA INICIAL (a exibida aqui, de Ferreira, 2001) e a do SOFA MÁXIMO durante a internação, que aparece na maioria dos compêndios com percentuais bem menores nas faixas altas, 80% contra 95,2% na faixa de 12 a 14 pontos. Se o número que você viu em outro lugar não bate com o daqui, provavelmente é essa a razão.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const pontos = sumPoints(FIELDS, values);
    const risco = mortalidade(pontos);

    const disfuncoes = Object.keys(SISTEMAS).filter((id) => {
      const valor = values[id];
      return typeof valor === 'number' && valor >= 2;
    });

    const maiores = disfuncoes.map((id) => SISTEMAS[id]).join(', ');

    let label: string;
    let severity: 'baixo' | 'moderado' | 'alto' | 'critico';
    let interpretation: string;
    let nextSteps: string;

    if (pontos <= 3) {
      label = 'Disfunção orgânica leve';
      severity = 'baixo';
      interpretation =
        'Disfunção orgânica ausente ou leve. Na coorte de referência, escores iniciais nessa faixa associaram-se a mortalidade hospitalar de até cerca de 6%.';
      nextSteps =
        'Recalcule o SOFA diariamente: a tendência nas primeiras 48 a 72 horas informa mais que o valor da admissão.\nSe houver infecção suspeita, verifique se houve aumento agudo de 2 ou mais pontos em relação ao basal: é isso que define sepse pelo Sepsis-3.';
    } else if (pontos <= 7) {
      label = 'Disfunção orgânica moderada';
      severity = 'moderado';
      interpretation =
        'Disfunção orgânica moderada. Escores iniciais de 4 a 7 pontos associaram-se a mortalidade hospitalar em torno de 20% na coorte de referência.';
      nextSteps =
        'Otimize o suporte de cada órgão comprometido e revise o controle do foco infeccioso quando houver infecção.\nMonitorize a evolução do escore: um aumento do SOFA nas primeiras 48 horas eleva a mortalidade prevista para acima de 50%, enquanto a queda sinaliza resposta ao tratamento.';
    } else if (pontos <= 11) {
      label = 'Disfunção orgânica grave';
      severity = 'alto';
      interpretation =
        'Disfunção orgânica grave e multissistêmica. Na coorte de referência, a mortalidade hospitalar foi de cerca de 33% entre 8 e 9 pontos e de cerca de 50% entre 10 e 11 pontos.';
      nextSteps =
        'Reavalie continuamente a adequação do suporte: ventilação protetora, metas hemodinâmicas, indicação de terapia renal substitutiva e controle definitivo do foco.\nDiscuta com a família o prognóstico e as metas de cuidado, ainda dentro de um plano de tratamento pleno.';
    } else {
      label = 'Disfunção orgânica muito grave';
      severity = 'critico';
      interpretation =
        'Disfunção orgânica múltipla de altíssima gravidade. Na coorte de referência, escores iniciais de 12 pontos ou mais associaram-se a mortalidade hospitalar em torno de 95%.';
      nextSteps =
        'Suporte orgânico máximo com reavaliação horária das metas de perfusão, oxigenação e controle do foco.\nInclua a equipe de cuidados paliativos e estabeleça com a família metas de cuidado explícitas, com reavaliação diária da proporcionalidade do tratamento.';
    }

    return {
      value: pontos,
      unit: pontos === 1 ? 'ponto' : 'pontos',
      label,
      severity,
      interpretation,
      details: [
        {
          label: 'Mortalidade hospitalar estimada',
          value: risco.texto,
          hint: `SOFA inicial de ${risco.faixa} pontos: mortalidade hospitalar na coorte de 352 pacientes de UTI de Ferreira (2001)`,
        },
        {
          label: 'Sistemas com 2 ou mais pontos',
          value: disfuncoes.length > 0 ? `${disfuncoes.length}: ${maiores}` : 'Nenhum',
          hint: '2 pontos ou mais em um sistema costuma ser tratado como disfunção orgânica estabelecida',
        },
        {
          label: 'Critério de sepse (Sepsis-3)',
          value: 'Infecção + aumento agudo ≥ 2 pontos',
          hint: 'Compare com o SOFA basal do paciente, que não é zero em quem tem disfunção crônica de órgão',
        },
      ],
      nextSteps,
    };
  },

  formula: `Some 0 a 4 pontos em cada um dos seis sistemas (total de 0 a 24):

RESPIRATÓRIO - PaO₂/FiO₂ (mmHg)
≥ 400 = 0 · < 400 = 1 · < 300 = 2 · < 200 com suporte ventilatório = 3 · < 100 com suporte ventilatório = 4

COAGULAÇÃO - plaquetas (×10³/µL)
≥ 150 = 0 · < 150 = 1 · < 100 = 2 · < 50 = 3 · < 20 = 4

HEPÁTICO - bilirrubina total (mg/dL)
< 1,2 = 0 · 1,2-1,9 = 1 · 2,0-5,9 = 2 · 6,0-11,9 = 3 · ≥ 12,0 = 4

CARDIOVASCULAR - PAM e vasopressores (mcg/kg/min por ≥ 1 hora)
PAM ≥ 70 = 0 · PAM < 70 = 1 · dopamina ≤ 5 ou dobutamina em qualquer dose = 2 ·
dopamina > 5 ou noradrenalina ≤ 0,1 ou adrenalina ≤ 0,1 = 3 ·
dopamina > 15 ou noradrenalina > 0,1 ou adrenalina > 0,1 = 4

NEUROLÓGICO - escala de coma de Glasgow
15 = 0 · 13-14 = 1 · 10-12 = 2 · 6-9 = 3 · < 6 = 4

RENAL - creatinina (mg/dL) ou diurese
< 1,2 = 0 · 1,2-1,9 = 1 · 2,0-3,4 = 2 · 3,5-4,9 ou < 500 mL/dia = 3 · ≥ 5,0 ou < 200 mL/dia = 4`,

  evidence:
    'O SOFA foi proposto em 1994, na conferência de consenso da European Society of Intensive Care Medicine em Paris, e publicado por Vincent e colaboradores em 1996: inicialmente como Sepsis-related Organ Failure Assessment, depois renomeado Sequential Organ Failure Assessment ao ficar claro que descrevia disfunção orgânica de qualquer causa. A validação multicêntrica prospectiva (Vincent, 1998) incluiu 1.449 pacientes de 40 UTIs em 16 países e mostrou relação direta entre a pontuação de cada órgão e a mortalidade. Ferreira e colaboradores (2001) acompanharam 352 pacientes e demonstraram que o SOFA seriado prediz melhor que o valor isolado: um aumento do escore nas primeiras 48 horas associou-se a mortalidade de pelo menos 50%, enquanto a queda indicou mortalidade em torno de 27%; escores iniciais acima de 11 associaram-se a mortalidade superior a 90%. É dessa coorte que sai a tabela de mortalidade por faixa exibida nesta calculadora, sempre referida ao SOFA inicial: 0% de 0 a 1 ponto, 6,4% de 2 a 3, 20,2% de 4 a 5, 21,5% de 6 a 7, 33,3% de 8 a 9, 50% de 10 a 11 e 95,2% de 12 pontos em diante. A tabela do SOFA máximo, mais divulgada, é sistematicamente mais baixa nas faixas altas e não deve ser aplicada a um escore de admissão. Em 2016, a força-tarefa do Sepsis-3 adotou a variação aguda de 2 ou mais pontos no SOFA como critério operacional de sepse, com AUROC de 0,74 para mortalidade hospitalar entre pacientes de UTI com suspeita de infecção.',

  creator: {
    name: 'Jean-Louis Vincent',
    bio: 'Intensivista belga, professor da Université Libre de Bruxelles e do Hospital Erasme, um dos nomes mais influentes da medicina intensiva contemporânea e coordenador do grupo de trabalho que criou o SOFA.',
  },

  updatedAt: '2026-07-26',

  references: [
    {
      citation:
        'Vincent JL, Moreno R, Takala J, et al. The SOFA (Sepsis-related Organ Failure Assessment) score to describe organ dysfunction/failure. On behalf of the Working Group on Sepsis-Related Problems of the European Society of Intensive Care Medicine. Intensive Care Med. 1996;22(7):707-10.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/8844239/',
      primary: true,
    },
    {
      citation:
        'Vincent JL, de Mendonça A, Cantraine F, et al. Use of the SOFA score to assess the incidence of organ dysfunction/failure in intensive care units: results of a multicenter, prospective study. Crit Care Med. 1998;26(11):1793-800.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/9824069/',
    },
    {
      citation:
        'Ferreira FL, Bota DP, Bross A, Mélot C, Vincent JL. Serial evaluation of the SOFA score to predict outcome in critically ill patients. JAMA. 2001;286(14):1754-8.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/11594901/',
    },
    {
      citation:
        'Singer M, Deutschman CS, Seymour CW, et al. The Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3). JAMA. 2016;315(8):801-10.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/26903338/',
    },
  ],
};

export default calculator;
