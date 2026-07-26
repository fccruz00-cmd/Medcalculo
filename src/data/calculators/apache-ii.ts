import type { Calculator, Field, Values } from '@/lib/types';
import { n, num } from '@/lib/utils';

/**
 * Mortalidade hospitalar aproximada por faixa de pontuação, lida da coorte de
 * derivação de Knaus et al. (1985): 5.815 admissões em 13 UTIs norte-americanas.
 * A coluna cirúrgica vale para pós-operatórios; a clínica, para os demais.
 */
const MORTALIDADE: Array<{ ate: number; faixa: string; clinico: number; cirurgico: number }> = [
  { ate: 4, faixa: '0 a 4', clinico: 4, cirurgico: 1 },
  { ate: 9, faixa: '5 a 9', clinico: 8, cirurgico: 3 },
  { ate: 14, faixa: '10 a 14', clinico: 15, cirurgico: 6 },
  { ate: 19, faixa: '15 a 19', clinico: 25, cirurgico: 11 },
  { ate: 24, faixa: '20 a 24', clinico: 40, cirurgico: 29 },
  { ate: 29, faixa: '25 a 29', clinico: 55, cirurgico: 37 },
  { ate: 34, faixa: '30 a 34', clinico: 73, cirurgico: 71 },
  { ate: 71, faixa: '35 ou mais', clinico: 85, cirurgico: 88 },
];

function faixaMortalidade(pontos: number) {
  for (const item of MORTALIDADE) {
    if (pontos <= item.ate) return item;
  }
  return MORTALIDADE[MORTALIDADE.length - 1];
}

const FIELDS: Field[] = [
  {
    id: 'idade',
    kind: 'number',
    label: 'Idade',
    unit: 'anos',
    min: 16,
    max: 120,
    step: 1,
    hint: 'O APACHE II foi derivado em adultos. Pontos por idade: ≤ 44 = 0 · 45-54 = 2 · 55-64 = 3 · 65-74 = 5 · ≥ 75 = 6.',
  },
  {
    id: 'temperatura',
    kind: 'number',
    label: 'Temperatura central',
    unit: '°C',
    min: 25,
    max: 43,
    step: 0.1,
    normalRange: '36,0 a 38,4 °C',
    hint: 'Use o pior valor das primeiras 24 horas: o mais distante da faixa 36,0 a 38,4 °C. O artigo original usa temperatura retal.',
  },
  {
    id: 'pam',
    kind: 'number',
    label: 'Pressão arterial média',
    unit: 'mmHg',
    min: 20,
    max: 220,
    step: 1,
    normalRange: '70 a 109 mmHg',
    hint: 'PAM = (PAS + 2 × PAD) / 3. Use o pior valor das primeiras 24 horas.',
  },
  {
    id: 'fc',
    kind: 'number',
    label: 'Frequência cardíaca',
    unit: 'bpm',
    min: 20,
    max: 220,
    step: 1,
    normalRange: '70 a 109 bpm',
    hint: 'Resposta ventricular, no pior valor das primeiras 24 horas.',
  },
  {
    id: 'fr',
    kind: 'number',
    label: 'Frequência respiratória',
    unit: 'irpm',
    min: 0,
    max: 80,
    step: 1,
    normalRange: '12 a 24 irpm',
    hint: 'Espontânea ou em ventilação mecânica, no pior valor das primeiras 24 horas.',
  },
  {
    id: 'fio2',
    kind: 'number',
    label: 'FiO₂',
    unit: '%',
    min: 21,
    max: 100,
    step: 1,
    hint: 'Ar ambiente = 21%. Com FiO₂ ≥ 50% o escore usa a diferença alvéolo-arterial de oxigênio; abaixo disso, usa a PaO₂ diretamente.',
  },
  {
    id: 'pao2',
    kind: 'number',
    label: 'PaO₂ arterial',
    unit: 'mmHg',
    min: 20,
    max: 600,
    step: 1,
    normalRange: '80 a 100 mmHg',
    hint: 'Pior valor das primeiras 24 horas.',
  },
  {
    id: 'paco2',
    kind: 'number',
    label: 'PaCO₂ arterial',
    unit: 'mmHg',
    min: 10,
    max: 130,
    step: 1,
    normalRange: '35 a 45 mmHg',
    hint: 'Necessária apenas para calcular a diferença alvéolo-arterial, exigida quando a FiO₂ é de 50% ou mais.',
    showIf: (values) => typeof values.fio2 === 'number' && values.fio2 >= 50,
  },
  {
    id: 'ph',
    kind: 'number',
    label: 'pH arterial',
    min: 6.7,
    max: 7.9,
    step: 0.01,
    normalRange: '7,33 a 7,49',
    hint: 'Pior valor das primeiras 24 horas. Sem gasometria, o escore original permite substituir pelo bicarbonato sérico: veja a fórmula.',
  },
  {
    id: 'sodio',
    kind: 'number',
    label: 'Sódio sérico',
    unit: 'mEq/L',
    min: 100,
    max: 200,
    step: 1,
    normalRange: '130 a 149 mEq/L',
  },
  {
    id: 'potassio',
    kind: 'number',
    label: 'Potássio sérico',
    unit: 'mEq/L',
    min: 1,
    max: 10,
    step: 0.1,
    normalRange: '3,5 a 5,4 mEq/L',
  },
  {
    id: 'creatinina',
    kind: 'number',
    label: 'Creatinina sérica',
    unit: 'mg/dL',
    min: 0.1,
    max: 20,
    step: 0.01,
    normalRange: '0,6 a 1,4 mg/dL',
    hint: 'Pior valor das primeiras 24 horas.',
    unitToggle: {
      alt: 'µmol/L',
      toBase: (value) => value / 88.4,
      fromBase: (value) => value * 88.4,
    },
  },
  {
    id: 'ira',
    kind: 'choice',
    label: 'Insuficiência renal aguda?',
    hint: 'Se sim, os pontos da creatinina são dobrados, conforme o artigo original.',
    options: [
      { label: 'Não', value: 'nao' },
      { label: 'Sim', value: 'sim' },
    ],
  },
  {
    id: 'hematocrito',
    kind: 'number',
    label: 'Hematócrito',
    unit: '%',
    min: 10,
    max: 70,
    step: 0.1,
    normalRange: '30 a 45,9%',
  },
  {
    id: 'leucocitos',
    kind: 'number',
    label: 'Leucócitos totais',
    unit: '/mm³',
    min: 100,
    max: 100000,
    step: 100,
    normalRange: '3.000 a 14.900/mm³',
    hint: 'Como reportado no hemograma brasileiro. Exemplo: 22.000/mm³ corresponde a 22 ×10³/mm³ no artigo original.',
  },
  {
    id: 'glasgow',
    kind: 'number',
    label: 'Escala de coma de Glasgow',
    unit: 'pontos',
    min: 3,
    max: 15,
    step: 1,
    normalRange: '15',
    hint: 'A pontuação do item é 15 menos o Glasgow. Use o valor sem sedação sempre que possível.',
  },
  {
    id: 'tipo',
    kind: 'choice',
    layout: 'stack',
    label: 'Tipo de admissão',
    hint: 'Define os pontos de doença crônica e a coluna de mortalidade da coorte de derivação.',
    options: [
      { label: 'Clínica (não operatória)', value: 'clinico' },
      { label: 'Pós-operatório de cirurgia de emergência', value: 'emergencia' },
      { label: 'Pós-operatório de cirurgia eletiva', value: 'eletivo' },
    ],
  },
  {
    id: 'cronico',
    kind: 'choice',
    layout: 'stack',
    label: 'Insuficiência orgânica crônica grave ou imunossupressão?',
    help: 'Vale apenas se o quadro era evidente ANTES da internação atual. Fígado: cirrose comprovada por biópsia com hipertensão portal, episódios prévios de sangramento varicoso, encefalopatia ou coma hepático. Coração: classe funcional IV da NYHA. Pulmão: doença restritiva, obstrutiva ou vascular com limitação grave aos esforços, hipoxemia crônica, hipercapnia, policitemia secundária ou hipertensão pulmonar grave. Rim: diálise crônica. Imunossupressão: quimioterapia, radioterapia, corticoide em dose alta e prolongada, leucemia, linfoma ou aids.',
    options: [
      { label: 'Não', value: 'nao' },
      { label: 'Sim', value: 'sim' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Pontuação de cada variável fisiológica (0 a 4), conforme Knaus 1985 */
/* ------------------------------------------------------------------ */

function pontosTemperatura(t: number): number {
  if (t >= 41) return 4;
  if (t >= 39) return 3;
  if (t >= 38.5) return 1;
  if (t >= 36) return 0;
  if (t >= 34) return 1;
  if (t >= 32) return 2;
  if (t >= 30) return 3;
  return 4;
}

function pontosPam(p: number): number {
  if (p >= 160) return 4;
  if (p >= 130) return 3;
  if (p >= 110) return 2;
  if (p >= 70) return 0;
  if (p >= 50) return 2;
  return 4;
}

function pontosFc(f: number): number {
  if (f >= 180) return 4;
  if (f >= 140) return 3;
  if (f >= 110) return 2;
  if (f >= 70) return 0;
  if (f >= 55) return 2;
  if (f >= 40) return 3;
  return 4;
}

function pontosFr(f: number): number {
  if (f >= 50) return 4;
  if (f >= 35) return 3;
  if (f >= 25) return 1;
  if (f >= 12) return 0;
  if (f >= 10) return 1;
  if (f >= 6) return 2;
  return 4;
}

function pontosAaDO2(aa: number): number {
  if (aa >= 500) return 4;
  if (aa >= 350) return 3;
  if (aa >= 200) return 2;
  return 0;
}

function pontosPaO2(p: number): number {
  if (p > 70) return 0;
  if (p >= 61) return 1;
  if (p >= 55) return 3;
  return 4;
}

function pontosPh(p: number): number {
  if (p >= 7.7) return 4;
  if (p >= 7.6) return 3;
  if (p >= 7.5) return 1;
  if (p >= 7.33) return 0;
  if (p >= 7.25) return 2;
  if (p >= 7.15) return 3;
  return 4;
}

function pontosSodio(s: number): number {
  if (s >= 180) return 4;
  if (s >= 160) return 3;
  if (s >= 155) return 2;
  if (s >= 150) return 1;
  if (s >= 130) return 0;
  if (s >= 120) return 2;
  if (s >= 111) return 3;
  return 4;
}

function pontosPotassio(k: number): number {
  if (k >= 7) return 4;
  if (k >= 6) return 3;
  if (k >= 5.5) return 1;
  if (k >= 3.5) return 0;
  if (k >= 3) return 1;
  if (k >= 2.5) return 2;
  return 4;
}

function pontosCreatinina(c: number): number {
  if (c >= 3.5) return 4;
  if (c >= 2) return 3;
  if (c >= 1.5) return 2;
  if (c >= 0.6) return 0;
  return 2;
}

function pontosHematocrito(h: number): number {
  if (h >= 60) return 4;
  if (h >= 50) return 2;
  if (h >= 46) return 1;
  if (h >= 30) return 0;
  if (h >= 20) return 2;
  return 4;
}

/** Leucócitos em milhares por mm³ (o hemograma brasileiro reporta o valor absoluto). */
function pontosLeucocitos(milhares: number): number {
  if (milhares >= 40) return 4;
  if (milhares >= 20) return 2;
  if (milhares >= 15) return 1;
  if (milhares >= 3) return 0;
  if (milhares >= 1) return 2;
  return 4;
}

function pontosIdade(idade: number): number {
  if (idade >= 75) return 6;
  if (idade >= 65) return 5;
  if (idade >= 55) return 3;
  if (idade >= 45) return 2;
  return 0;
}

const calculator: Calculator = {
  slug: 'apache-ii',
  title: 'APACHE II: Acute Physiology and Chronic Health Evaluation II',
  shortTitle: 'APACHE II',
  subtitle:
    'Mede a gravidade da doença aguda na admissão em terapia intensiva e estima a mortalidade hospitalar a partir de 12 variáveis fisiológicas, idade e doença crônica.',
  specialties: ['Terapia Intensiva'],
  kind: 'Escore de risco',
  keywords: [
    'apache 2',
    'apache ii',
    'gravidade',
    'mortalidade',
    'UTI',
    'prognóstico',
    'knaus',
    'acute physiology',
  ],

  whenToUse: [
    'Adultos admitidos em terapia intensiva, usando os PIORES valores fisiológicos das primeiras 24 horas de internação na unidade.',
    'Para comparar a gravidade de casos entre unidades, calcular a razão de mortalidade padronizada e ajustar o risco basal em pesquisa clínica: é para isso que o escore foi construído.',
    'Não deve ser usado isoladamente para decidir sobre limitação terapêutica ou alocação de leitos em um paciente individual: o intervalo de confiança da estimativa individual é largo demais.',
    'Não é validado em menores de 16 anos, em grandes queimados, em pós-operatório de revascularização miocárdica isolada nem em pacientes que ficam menos de 8 horas na UTI.',
    'Foi derivado em 1985, antes da ventilação protetora, da ressuscitação precoce na sepse e das terapias renais contínuas: em coortes modernas ele tende a superestimar a mortalidade.',
  ],

  whyUse:
    'Continua sendo o escore de gravidade mais citado e mais compreendido da terapia intensiva, com boa discriminação e leitura imediata: um único número resume o desarranjo fisiológico agudo, a reserva do paciente e a idade. Serve especialmente para descrever e comparar populações de UTI.',

  pearls: [
    'Use os PIORES valores das primeiras 24 horas na UTI, não os da chegada. Calcular com os valores da admissão subestima sistematicamente o escore; calcular depois de 24 horas de tratamento bem-sucedido também o subestima.',
    'Os pontos da creatinina DOBRAM quando há insuficiência renal aguda: chegando a 8 pontos. Esse é o erro de cálculo mais frequente do APACHE II.',
    'A diferença alvéolo-arterial só é usada quando a FiO₂ é de 50% ou mais; abaixo disso vale a PaO₂ direta. Aqui a diferença alvéolo-arterial é calculada assumindo pressão barométrica de 760 mmHg (nível do mar). Em cidades de altitude, como Campos do Jordão ou Poços de Caldas, o valor real é menor e o escore fica superestimado.',
    'Sob sedação ou bloqueio neuromuscular, o Glasgow deve ser estimado como estaria sem a droga. Assinalar Glasgow 3 em paciente apenas sedado infla o escore em até 12 pontos.',
    'Doença crônica só pontua se a insuficiência orgânica era grave e evidente ANTES da internação. Hipertensão, diabetes e DPOC leve não contam.',
    'A pontuação da doença crônica depende do tipo de admissão: 5 pontos para admissão clínica ou pós-operatório de emergência, e apenas 2 pontos para pós-operatório eletivo.',
    'A estimativa oficial de mortalidade do artigo original não vem do escore isolado: exige a equação logística com o coeficiente do diagnóstico de admissão e o peso da cirurgia de emergência. As faixas apresentadas aqui são a leitura aproximada da curva da coorte de derivação, úteis como referência, não como probabilidade individual.',
    'Não confunda com o APACHE III e o IV, que usam variáveis e pesos diferentes e não são intercambiáveis com o II.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const idade = n(values, 'idade');
    const fio2 = n(values, 'fio2');
    const pao2 = n(values, 'pao2');
    const paco2 = n(values, 'paco2');
    const leucocitos = n(values, 'leucocitos');
    const glasgow = n(values, 'glasgow');
    const iraAguda = values.ira === 'sim';
    const tipo = values.tipo;
    const eletivo = tipo === 'eletivo';
    const cirurgico = tipo === 'eletivo' || tipo === 'emergencia';

    // Oxigenação: A-aDO₂ quando FiO₂ ≥ 50%, PaO₂ direta abaixo disso.
    const usaAaDO2 = fio2 >= 50;
    const aaDO2 = (fio2 / 100) * 713 - paco2 / 0.8 - pao2;
    const pontosOxigenacao = usaAaDO2 ? pontosAaDO2(aaDO2) : pontosPaO2(pao2);

    const pontosGlasgow = Math.max(0, Math.min(12, 15 - glasgow));
    const creatininaBase = pontosCreatinina(n(values, 'creatinina'));
    const pontosCreat = iraAguda ? creatininaBase * 2 : creatininaBase;

    const aps =
      pontosTemperatura(n(values, 'temperatura')) +
      pontosPam(n(values, 'pam')) +
      pontosFc(n(values, 'fc')) +
      pontosFr(n(values, 'fr')) +
      pontosOxigenacao +
      pontosPh(n(values, 'ph')) +
      pontosSodio(n(values, 'sodio')) +
      pontosPotassio(n(values, 'potassio')) +
      pontosCreat +
      pontosHematocrito(n(values, 'hematocrito')) +
      pontosLeucocitos(leucocitos / 1000) +
      pontosGlasgow;

    const pontosDaIdade = pontosIdade(idade);

    let pontosCronicos = 0;
    if (values.cronico === 'sim') {
      pontosCronicos = eletivo ? 2 : 5;
    }

    const total = aps + pontosDaIdade + pontosCronicos;
    const faixa = faixaMortalidade(total);
    const mortalidade = cirurgico ? faixa.cirurgico : faixa.clinico;

    let label: string;
    let severity: 'baixo' | 'moderado' | 'alto' | 'critico';
    let interpretation: string;
    let nextSteps: string;

    if (total <= 9) {
      label = 'Gravidade baixa';
      severity = 'baixo';
      interpretation =
        'Desarranjo fisiológico pequeno. Na coorte de derivação, essa faixa correspondeu a mortalidade hospitalar de um dígito.';
      nextSteps =
        'Reavalie diariamente a necessidade de permanência em terapia intensiva e planeje a alta da unidade assim que o suporte orgânico deixar de ser necessário.\nUse o escore para comparação de casuística, não para prognóstico individual.';
    } else if (total <= 19) {
      label = 'Gravidade moderada';
      severity = 'moderado';
      interpretation =
        'Desarranjo fisiológico moderado, com mortalidade hospitalar estimada entre 15% e 25% na coorte de derivação para admissões clínicas.';
      nextSteps =
        'Otimize o suporte de cada disfunção identificada e trate a causa de base com metas objetivas.\nAcompanhe a evolução com escores dinâmicos, como o SOFA diário: o APACHE II é uma fotografia das primeiras 24 horas e não deve ser recalculado como medida de resposta.';
    } else if (total <= 29) {
      label = 'Gravidade alta';
      severity = 'alto';
      interpretation =
        'Desarranjo fisiológico grave. Na coorte de derivação, admissões clínicas nessa faixa tiveram mortalidade hospitalar entre 40% e 55%.';
      nextSteps =
        'Suporte orgânico intensivo com reavaliação frequente das metas hemodinâmicas, ventilatórias e metabólicas.\nInicie conversas estruturadas com a família sobre prognóstico e metas de cuidado, mantendo o tratamento pleno.';
    } else {
      label = 'Gravidade muito alta';
      severity = 'critico';
      interpretation =
        'Desarranjo fisiológico extremo, com mortalidade hospitalar estimada acima de 70% na coorte de derivação.';
      nextSteps =
        'Suporte máximo com reavaliação horária e revisão sistemática de causas reversíveis.\nEnvolva a equipe de cuidados paliativos e estabeleça metas de cuidado explícitas com a família, reavaliadas diariamente.\nLembre que a estimativa é populacional: não use este número isoladamente para decidir sobre limitação terapêutica.';
    }

    return {
      value: total,
      unit: total === 1 ? 'ponto' : 'pontos',
      label,
      severity,
      interpretation,
      details: [
        {
          label: 'Mortalidade hospitalar estimada',
          value: `≈ ${num(mortalidade)}%`,
          hint: `Faixa de ${faixa.faixa} pontos, admissão ${cirurgico ? 'cirúrgica' : 'clínica'}, coorte de derivação de 5.815 pacientes (Knaus, 1985)`,
        },
        {
          label: 'Escore fisiológico agudo (APS)',
          value: `${num(aps)} de 60 pontos`,
          hint: iraAguda ? 'Pontos da creatinina dobrados por insuficiência renal aguda' : 'Soma das 12 variáveis fisiológicas',
        },
        {
          label: 'Pontos por idade',
          value: `${num(pontosDaIdade)} de 6 pontos`,
        },
        {
          label: 'Pontos por doença crônica',
          value: `${num(pontosCronicos)} de 5 pontos`,
          hint: values.cronico === 'sim'
            ? eletivo
              ? 'Pós-operatório eletivo: 2 pontos'
              : 'Admissão clínica ou cirurgia de emergência: 5 pontos'
            : 'Sem insuficiência orgânica crônica grave ou imunossupressão prévia',
        },
        {
          label: 'Item de oxigenação',
          value: usaAaDO2
            ? `A-aDO₂ ≈ ${num(Math.max(0, aaDO2))} mmHg → ${num(pontosOxigenacao)} ponto(s)`
            : `PaO₂ ${num(pao2)} mmHg → ${num(pontosOxigenacao)} ponto(s)`,
          hint: usaAaDO2
            ? 'FiO₂ ≥ 50%: usa a diferença alvéolo-arterial, calculada ao nível do mar'
            : 'FiO₂ < 50%: usa a PaO₂ diretamente',
        },
        {
          label: 'Item neurológico',
          value: `Glasgow ${num(glasgow)} → ${num(pontosGlasgow)} ponto(s)`,
          hint: '15 menos o Glasgow',
        },
      ],
      nextSteps,
    };
  },

  formula: `APACHE II = escore fisiológico agudo (APS) + pontos por idade + pontos por doença crônica
Variação total: 0 a 71 pontos.

ESCORE FISIOLÓGICO AGUDO - 0 a 4 pontos em cada variável, usando o PIOR valor das primeiras 24 h:

Temperatura (°C): ≥ 41 = 4 · 39-40,9 = 3 · 38,5-38,9 = 1 · 36-38,4 = 0 · 34-35,9 = 1 · 32-33,9 = 2 · 30-31,9 = 3 · ≤ 29,9 = 4
PAM (mmHg): ≥ 160 = 4 · 130-159 = 3 · 110-129 = 2 · 70-109 = 0 · 50-69 = 2 · ≤ 49 = 4
Frequência cardíaca: ≥ 180 = 4 · 140-179 = 3 · 110-139 = 2 · 70-109 = 0 · 55-69 = 2 · 40-54 = 3 · ≤ 39 = 4
Frequência respiratória: ≥ 50 = 4 · 35-49 = 3 · 25-34 = 1 · 12-24 = 0 · 10-11 = 1 · 6-9 = 2 · ≤ 5 = 4
Oxigenação - se FiO₂ ≥ 50%, use A-aDO₂: ≥ 500 = 4 · 350-499 = 3 · 200-349 = 2 · < 200 = 0
Oxigenação - se FiO₂ < 50%, use PaO₂ (mmHg): > 70 = 0 · 61-70 = 1 · 55-60 = 3 · < 55 = 4
pH arterial: ≥ 7,7 = 4 · 7,6-7,69 = 3 · 7,5-7,59 = 1 · 7,33-7,49 = 0 · 7,25-7,32 = 2 · 7,15-7,24 = 3 · < 7,15 = 4
Sódio (mEq/L): ≥ 180 = 4 · 160-179 = 3 · 155-159 = 2 · 150-154 = 1 · 130-149 = 0 · 120-129 = 2 · 111-119 = 3 · ≤ 110 = 4
Potássio (mEq/L): ≥ 7 = 4 · 6-6,9 = 3 · 5,5-5,9 = 1 · 3,5-5,4 = 0 · 3-3,4 = 1 · 2,5-2,9 = 2 · < 2,5 = 4
Creatinina (mg/dL): ≥ 3,5 = 4 · 2,0-3,4 = 3 · 1,5-1,9 = 2 · 0,6-1,4 = 0 · < 0,6 = 2 - DOBRE os pontos se houver insuficiência renal aguda
Hematócrito (%): ≥ 60 = 4 · 50-59,9 = 2 · 46-49,9 = 1 · 30-45,9 = 0 · 20-29,9 = 2 · < 20 = 4
Leucócitos (×10³/mm³): ≥ 40 = 4 · 20-39,9 = 2 · 15-19,9 = 1 · 3-14,9 = 0 · 1-2,9 = 2 · < 1 = 4
Neurológico: 15 menos o escore de coma de Glasgow

Sem gasometria, o artigo permite substituir o pH pelo bicarbonato sérico (mEq/L):
≥ 52 = 4 · 41-51,9 = 3 · 32-40,9 = 1 · 22-31,9 = 0 · 18-21,9 = 2 · 15-17,9 = 3 · < 15 = 4

IDADE: ≤ 44 = 0 · 45-54 = 2 · 55-64 = 3 · 65-74 = 5 · ≥ 75 = 6

DOENÇA CRÔNICA (insuficiência orgânica grave ou imunossupressão prévia):
admissão clínica ou pós-operatório de emergência = 5 · pós-operatório eletivo = 2

A-aDO₂ = FiO₂ × (760 − 47) − PaCO₂ / 0,8 − PaO₂, ao nível do mar.`,

  evidence:
    'O APACHE II foi publicado por Knaus e colaboradores em 1985, como simplificação do APACHE original de 1981, que tinha 34 variáveis fisiológicas. A coorte de derivação e validação reuniu 5.815 admissões consecutivas em 13 unidades de terapia intensiva norte-americanas. O escore correlacionou-se de forma monotônica com a mortalidade hospitalar, que subiu de menos de 5% nas faixas mais baixas para cerca de 85% acima de 34 pontos, e a discriminação foi melhor do que a de todos os sistemas então disponíveis. A estimativa formal de risco de morte do artigo usa uma equação logística que soma ao escore o coeficiente do diagnóstico principal de admissão e um peso para cirurgia de emergência: por isso dois pacientes com o mesmo APACHE II, um com cetoacidose e outro com sepse abdominal, têm prognósticos muito diferentes. Validações posteriores em coortes contemporâneas mostram calibração progressivamente pior, com superestimação da mortalidade, reflexo dos avanços no cuidado intensivo desde os anos 1980; a discriminação, porém, permanece razoável, com AUROC em torno de 0,80 na maioria das séries.',

  creator: {
    name: 'William A. Knaus',
    bio: 'Intensivista norte-americano, professor da Universidade da Virgínia, criador da família de escores APACHE e um dos fundadores da avaliação padronizada de gravidade em terapia intensiva.',
  },

  references: [
    {
      citation:
        'Knaus WA, Draper EA, Wagner DP, Zimmerman JE. APACHE II: a severity of disease classification system. Crit Care Med. 1985;13(10):818-29.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/3928249/',
      primary: true,
    },
    {
      citation:
        'Knaus WA, Zimmerman JE, Wagner DP, Draper EA, Lawrence DE. APACHE-acute physiology and chronic health evaluation: a physiologically based classification system. Crit Care Med. 1981;9(8):591-7.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/7261642/',
    },
    {
      citation:
        'Vincent JL, Moreno R. Clinical review: scoring systems in the critically ill. Crit Care. 2010;14(2):207.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/20392287/',
    },
  ],
};

export default calculator;
