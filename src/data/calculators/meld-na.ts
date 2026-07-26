import type { Calculator, Field, Values } from '@/lib/types';
import { n, num } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'creatinina',
    kind: 'number',
    label: 'Creatinina sérica',
    unit: 'mg/dL',
    min: 0.1,
    max: 20,
    step: 0.01,
    normalRange: '0,6 a 1,2 mg/dL',
    hint: 'Valores abaixo de 1,0 são elevados a 1,0 e valores acima de 4,0 são truncados em 4,0, conforme a regra oficial.',
    unitToggle: {
      alt: 'µmol/L',
      toBase: (value) => value / 88.4,
      fromBase: (value) => value * 88.4,
    },
  },
  {
    id: 'dialise',
    kind: 'boolean',
    label: 'Diálise nos últimos 7 dias',
    hint: 'Duas ou mais sessões de hemodiálise na última semana, ou 24 horas contínuas de hemodiafiltração/CVVHD. Nesse caso a creatinina é fixada em 4,0 mg/dL.',
    points: 1,
  },
  {
    id: 'bilirrubina',
    kind: 'number',
    label: 'Bilirrubina total',
    unit: 'mg/dL',
    min: 0.1,
    max: 60,
    step: 0.1,
    normalRange: '0,2 a 1,2 mg/dL',
    hint: 'Valores abaixo de 1,0 são elevados a 1,0. Para converter de µmol/L, divida por 17,1.',
    unitToggle: {
      alt: 'µmol/L',
      toBase: (value) => value / 17.1,
      fromBase: (value) => value * 17.1,
    },
  },
  {
    id: 'inr',
    kind: 'number',
    label: 'INR',
    min: 0.5,
    max: 12,
    step: 0.01,
    normalRange: '0,9 a 1,1',
    hint: 'Valores abaixo de 1,0 são elevados a 1,0. O resultado perde validade se o paciente estiver anticoagulado.',
  },
  {
    id: 'sodio',
    kind: 'number',
    label: 'Sódio sérico',
    unit: 'mEq/L',
    min: 100,
    max: 170,
    step: 1,
    normalRange: '135 a 145 mEq/L',
    hint: 'Limitado à faixa de 125 a 137 mEq/L no cálculo: fora dela o sódio não acrescenta informação prognóstica. mEq/L equivale a mmol/L.',
  },
];

/**
 * Mortalidade em 3 meses por faixa de MELD entre candidatos em lista de espera
 * de transplante hepático nos Estados Unidos: Wiesner et al., Gastroenterology
 * 2003, análise da coorte inicial de alocação por MELD da UNOS.
 */
const MORTALIDADE_3M: Array<{ ate: number; faixa: string; texto: string }> = [
  { ate: 9, faixa: '≤ 9', texto: '1,9%' },
  { ate: 19, faixa: '10 a 19', texto: '6,0%' },
  { ate: 29, faixa: '20 a 29', texto: '19,6%' },
  { ate: 39, faixa: '30 a 39', texto: '52,6%' },
  { ate: 40, faixa: '≥ 40', texto: '71,3%' },
];

function mortalidade(pontos: number): { faixa: string; texto: string } {
  for (const item of MORTALIDADE_3M) {
    if (pontos <= item.ate) return { faixa: item.faixa, texto: item.texto };
  }
  return { faixa: '≥ 40', texto: '71,3%' };
}

function limitar(valor: number, minimo: number, maximo: number): number {
  return Math.min(Math.max(valor, minimo), maximo);
}

const calculator: Calculator = {
  slug: 'meld-na',
  title: 'MELD-Na: Model for End-Stage Liver Disease com sódio',
  shortTitle: 'MELD-Na',
  subtitle:
    'Estima a mortalidade em 3 meses na doença hepática crônica avançada e é a base da priorização na fila de transplante de fígado.',
  specialties: ['Hepatologia', 'Gastroenterologia', 'Terapia Intensiva'],
  kind: 'Escore de risco',
  popular: true,
  keywords: [
    'meld',
    'meldna',
    'meld sodio',
    'transplante hepático',
    'cirrose',
    'doença hepática terminal',
    'fila de transplante',
    'hiponatremia',
    'end stage liver disease',
  ],

  whenToUse: [
    'Adultos (12 anos ou mais) com doença hepática crônica avançada, para estimar a mortalidade em 3 meses e definir a prioridade na fila de transplante hepático.',
    'Avaliação seriada do cirrótico ambulatorial: um MELD de 15 ou mais é o limiar clássico a partir do qual o benefício de sobrevida com o transplante supera o risco do procedimento.',
    'Estimativa de risco antes de TIPS e antes de cirurgia não hepática em cirróticos.',
    'Não se aplica a crianças menores de 12 anos: nessa faixa use o PELD.',
    'Não foi validado para insuficiência hepática aguda (hepatite fulminante) nem para hepatocarcinoma dentro dos critérios de Milão: essas condições recebem pontuação especial na fila, e não a calculada aqui.',
    'Perde acurácia em pacientes anticoagulados (INR artificialmente alto) e naqueles com creatinina não confiável por sarcopenia.',
  ],

  whyUse:
    'O MELD é inteiramente objetivo: três exames laboratoriais, , é contínuo em vez de categórico e discrimina mortalidade de curto prazo melhor que o Child-Pugh, o que permitiu substituir o critério de tempo em lista pelo critério de gravidade. O acréscimo do sódio corrige uma injustiça sistemática: cirróticos com hiponatremia dilucional morrem mais do que seu MELD isolado sugere, sobretudo na faixa de 11 a 30 pontos.',

  pearls: [
    'Os três laboratoriais têm piso de 1,0. Uma bilirrubina de 0,4 mg/dL entra como 1,0: não como 0,4, , porque o logaritmo de valores abaixo de 1 é negativo e distorceria o escore.',
    'A creatinina tem teto de 4,0 mg/dL, e o paciente em diálise (duas sessões na última semana ou 24 h de terapia contínua) recebe automaticamente 4,0. Sem essa regra, a diálise "melhoraria" artificialmente o MELD ao baixar a creatinina.',
    'O ajuste pelo sódio só é aplicado quando o MELD é maior que 11, e o sódio é truncado na faixa de 125 a 137 mEq/L. Abaixo de 125 o incremento deixa de crescer, o que evita que a hiponatremia grave sozinha domine o escore.',
    'INR sob varfarina ou outro anticoagulante invalida o cálculo: o escore fica superestimado sem qualquer piora da função hepática.',
    'Creatinina é um marcador ruim de função renal no cirrótico sarcopênico: uma creatinina "normal" pode acompanhar filtração glomerular muito reduzida, subestimando o MELD, sobretudo em mulheres.',
    'O escore não captura ascite refratária, encefalopatia recorrente, prurido intratável, síndrome hepatopulmonar nem colangite de repetição. Essas situações justificam pedido de pontuação especial ("MELD exception"), e não recálculo.',
    'A partir de 2023 o sistema americano adotou o MELD 3.0, que acrescenta sexo feminino e albumina e reduz a desvantagem histórica das mulheres na fila. Confira qual versão o seu programa de transplante utiliza.',
    'No Brasil, a alocação de fígado por gravidade usa o MELD desde 2006 (Portaria GM/MS nº 1.160/2006), com pontuação adicional para situações especiais previstas em norma. Confirme no regulamento vigente qual variante está em uso antes de aplicar o valor à fila.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const dialise = n(values, 'dialise') === 1;

    // Pisos e tetos oficiais: os três laboratoriais nunca entram abaixo de 1,0,
    // o que também protege os logaritmos de valores nulos ou negativos.
    const bilirrubina = Math.max(1, n(values, 'bilirrubina'));
    const inr = Math.max(1, n(values, 'inr'));
    const creatininaBruta = Math.max(1, n(values, 'creatinina'));
    const creatinina = dialise ? 4 : Math.min(creatininaBruta, 4);

    const bruto =
      10 *
      (0.957 * Math.log(creatinina) +
        0.378 * Math.log(bilirrubina) +
        1.12 * Math.log(inr) +
        0.643);

    if (!Number.isFinite(bruto)) {
      return {
        value: '-',
        interpretation: 'Informe valores laboratoriais válidos para calcular o escore.',
        severity: 'info' as const,
      };
    }

    const meld = limitar(Math.round(bruto), 6, 40);

    // O sódio só entra quando o MELD é maior que 11, e sempre truncado entre
    // 125 e 137 mEq/L: regra da política de alocação da UNOS.
    const sodioInformado = n(values, 'sodio');
    const sodio = limitar(sodioInformado > 0 ? sodioInformado : 137, 125, 137);

    const comSodio =
      meld > 11 ? meld + 1.32 * (137 - sodio) - 0.033 * meld * (137 - sodio) : meld;

    const meldNa = limitar(Math.round(comSodio), 6, 40);
    const risco = mortalidade(meldNa);

    let label: string;
    let severity: 'baixo' | 'moderado' | 'alto' | 'critico';
    let interpretation: string;
    let nextSteps: string;

    if (meldNa <= 9) {
      label = 'Mortalidade baixa em 3 meses';
      severity = 'baixo';
      interpretation =
        'Doença hepática compensada do ponto de vista laboratorial. Na coorte de lista de espera americana, a mortalidade em 3 meses nessa faixa foi de 1,9%.';
      nextSteps =
        'Acompanhamento ambulatorial com recálculo periódico do MELD-Na: a diretriz americana sugere reavaliação ao menos anual nessa faixa.\nMantenha o rastreamento semestral de hepatocarcinoma e o tratamento da causa de base.\nO transplante ainda não traz benefício de sobrevida: abaixo de 15 pontos, o risco do procedimento supera o da doença.';
    } else if (meldNa <= 19) {
      label = 'Mortalidade intermediária em 3 meses';
      severity = 'moderado';
      interpretation =
        'Mortalidade em 3 meses de aproximadamente 6,0% na coorte de referência. A faixa de 15 pontos é o limiar clássico a partir do qual o transplante passa a oferecer benefício de sobrevida.';
      nextSteps =
        'Encaminhe para avaliação em centro de transplante hepático, sobretudo com 15 pontos ou mais ou na presença de qualquer descompensação.\nRecalcule o escore a cada 1 a 3 meses e otimize o tratamento de ascite, encefalopatia e varizes.\nRevise se há indicação de pontuação especial por condições não capturadas pelo escore.';
    } else if (meldNa <= 29) {
      label = 'Mortalidade alta em 3 meses';
      severity = 'alto';
      interpretation =
        'Mortalidade em 3 meses de aproximadamente 19,6% na coorte de referência. Doença hepática avançada com prioridade relevante em lista.';
      nextSteps =
        'Avaliação em centro de transplante deve estar em curso; recalcule o MELD-Na com a periodicidade exigida pelo programa (em geral a cada 1 a 4 semanas nessa faixa).\nInvestigue e trate ativamente os gatilhos de deterioração: infecção, peritonite bacteriana espontânea, sangramento varicoso, lesão renal aguda e uso de nefrotóxicos.\nEvite anti-inflamatórios e aminoglicosídeos e reveja a indicação de betabloqueador na hipotensão.';
    } else {
      label = 'Mortalidade muito alta em 3 meses';
      severity = 'critico';
      interpretation =
        'Mortalidade em 3 meses de 52,6% na faixa de 30 a 39 pontos e de 71,3% com 40 pontos ou mais, na coorte de referência. Situação de altíssima prioridade.';
      nextSteps =
        'Contato imediato com o centro de transplante e recálculo do escore no intervalo mais curto previsto em protocolo.\nAvalie critérios de acute-on-chronic liver failure e a necessidade de terapia intensiva, terapia renal substitutiva e suporte hemodinâmico.\nSe houver contraindicação ao transplante, discuta metas de cuidado com o paciente e a família e envolva a equipe de cuidados paliativos.';
    }

    return {
      value: meldNa,
      unit: meldNa === 1 ? 'ponto' : 'pontos',
      label,
      severity,
      interpretation,
      details: [
        {
          label: 'MELD (sem o sódio)',
          value: `${meld} pontos`,
          hint: 'Escore de Kamath, com pisos de 1,0 e teto de 4,0 mg/dL para a creatinina',
        },
        {
          label: 'Efeito do sódio',
          value: meld > 11 ? `${meldNa - meld >= 0 ? '+' : ''}${meldNa - meld} pontos` : 'Não aplicado',
          hint:
            meld > 11
              ? `Sódio considerado no cálculo: ${num(sodio)} mEq/L (truncado entre 125 e 137)`
              : 'O ajuste pelo sódio só se aplica quando o MELD é maior que 11',
        },
        {
          label: 'Creatinina usada no cálculo',
          value: `${num(creatinina, 2)} mg/dL`,
          hint: dialise
            ? 'Fixada em 4,0 mg/dL por diálise nos últimos 7 dias'
            : 'Piso de 1,0 e teto de 4,0 mg/dL',
        },
        {
          label: 'Mortalidade em 3 meses',
          value: risco.texto,
          hint: `Faixa de MELD ${risco.faixa}: lista de espera da UNOS (Wiesner, 2003)`,
        },
      ],
      nextSteps,
    };
  },

  formula: `MELD = 10 × [0,957 × ln(creatinina) + 0,378 × ln(bilirrubina) + 1,120 × ln(INR) + 0,643]

Regras obrigatórias antes do cálculo:
· Creatinina, bilirrubina e INR menores que 1,0 são elevados a 1,0
· Creatinina maior que 4,0 mg/dL é truncada em 4,0
· Diálise (≥ 2 sessões em 7 dias ou 24 h de terapia contínua) → creatinina = 4,0
· Resultado arredondado e limitado à faixa de 6 a 40

Ajuste pelo sódio (aplicado apenas se MELD > 11):
MELD-Na = MELD + 1,32 × (137 − Na) − [0,033 × MELD × (137 − Na)]
Sódio truncado entre 125 e 137 mEq/L
Resultado final limitado à faixa de 6 a 40

Unidades: creatinina e bilirrubina em mg/dL; sódio em mEq/L (= mmol/L)`,

  evidence:
    'O modelo foi derivado por Malinchoc e colaboradores em 2000 para prever a sobrevida após TIPS, a partir de 231 pacientes da Mayo Clinic, e reformulado por Kamath e colaboradores em 2001 como escore geral de doença hepática terminal, validado em quatro coortes independentes de pacientes hospitalizados e ambulatoriais com cirrose, com estatística C entre 0,78 e 0,87 para mortalidade em 3 meses. Em 2002, a UNOS adotou o MELD para alocação de fígados nos Estados Unidos; Wiesner e colaboradores (2003) analisaram a coorte inicial de candidatos e descreveram a mortalidade em lista em 3 meses por faixa: 1,9% com MELD ≤ 9, 6,0% de 10 a 19, 19,6% de 20 a 29, 52,6% de 30 a 39 e 71,3% com 40 ou mais. Kim e colaboradores (NEJM, 2008) mostraram, em 6.769 candidatos em lista, que o sódio sérico era preditor independente de mortalidade e propuseram o MELD-Na, adotado pela UNOS em 2016; o ajuste altera a prioridade de uma minoria de candidatos, mas evita mortes em lista entre cirróticos hiponatrêmicos. Em 2021, Kim e colaboradores publicaram o MELD 3.0, que acrescenta sexo feminino e albumina e melhora discretamente a discriminação, implantado na alocação americana em 2023. No Brasil, o MELD é o critério de gravidade da fila hepática desde 2006.',

  creator: {
    name: 'Patrick S. Kamath e W. Ray Kim',
    bio: 'Hepatologistas da Mayo Clinic. Kamath liderou a transformação do modelo de sobrevida pós-TIPS no escore MELD, e Kim conduziu tanto a incorporação do sódio (MELD-Na) quanto o desenvolvimento do MELD 3.0.',
  },

  updatedAt: '2026-07-26',

  references: [
    {
      citation:
        'Kamath PS, Wiesner RH, Malinchoc M, et al. A model to predict survival in patients with end-stage liver disease. Hepatology. 2001;33(2):464-70.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/11172350/',
      primary: true,
    },
    {
      citation:
        'Malinchoc M, Kamath PS, Gordon FD, Peine CJ, Rank J, ter Borg PC. A model to predict poor survival in patients undergoing transjugular intrahepatic portosystemic shunts. Hepatology. 2000;31(4):864-71.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/10733541/',
    },
    {
      citation:
        'Kim WR, Biggins SW, Kremers WK, et al. Hyponatremia and mortality among patients on the liver-transplant waiting list. N Engl J Med. 2008;359(10):1018-26.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/18768945/',
    },
    {
      citation:
        'Wiesner R, Edwards E, Freeman R, et al. Model for end-stage liver disease (MELD) and allocation of donor livers. Gastroenterology. 2003;124(1):91-6.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/12512033/',
    },
    {
      citation:
        'Kim WR, Mannalithara A, Heimbach JK, et al. MELD 3.0: The Model for End-Stage Liver Disease Updated for the Modern Era. Gastroenterology. 2021;161(6):1887-95.e4.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/34481845/',
    },
    {
      citation:
        'Brasil. Ministério da Saúde. Portaria GM/MS nº 1.160, de 29 de maio de 2006. Modifica os critérios de distribuição de fígado de doadores cadáveres para transplante, implantando o critério de gravidade de estado clínico do paciente. Diário Oficial da União; 2006.',
    },
  ],
};

export default calculator;
