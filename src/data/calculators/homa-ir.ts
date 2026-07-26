import type { Calculator, Field, Values } from '@/lib/types';
import { n, num } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'glicemia',
    kind: 'number',
    label: 'Glicemia de jejum',
    unit: 'mg/dL',
    min: 40,
    max: 400,
    step: 1,
    placeholder: '95',
    normalRange: '70 a 99 mg/dL',
    hint: 'Jejum de 8 a 12 horas, colhida na mesma amostra da insulina.',
    unitToggle: {
      alt: 'mmol/L',
      toBase: (value) => value * 18,
      fromBase: (value) => value / 18,
    },
  },
  {
    id: 'insulina',
    kind: 'number',
    label: 'Insulina de jejum',
    unit: 'µU/mL',
    min: 0.5,
    max: 100,
    step: 0.1,
    placeholder: '12',
    normalRange: '2 a 25 µU/mL',
    hint: 'µU/mL equivale a mUI/L: é a mesma unidade com outro nome. Para converter de pmol/L, divida por 6,0.',
    unitToggle: {
      alt: 'pmol/L',
      toBase: (value) => value / 6,
      fromBase: (value) => value * 6,
    },
  },
];

const calculator: Calculator = {
  slug: 'homa-ir',
  title: 'HOMA-IR',
  shortTitle: 'HOMA-IR',
  subtitle:
    'Estima a resistência à insulina a partir da glicemia e da insulina de jejum, com os pontos de corte do estudo brasileiro BRAMS.',
  specialties: ['Endocrinologia'],
  kind: 'Fórmula',
  keywords: [
    'HOMA',
    'HOMA-IR',
    'HOMA IR',
    'resistência à insulina',
    'resistência insulínica',
    'insulina de jejum',
    'HOMA-beta',
    'QUICKI',
    'síndrome metabólica',
    'BRAMS',
  ],

  whenToUse: [
    'Avaliação de resistência à insulina em adultos não diabéticos, sobretudo em pesquisa clínica e epidemiológica, que é o contexto em que o índice foi validado.',
    'Como dado auxiliar na investigação de síndrome metabólica, esteatose hepática metabólica, síndrome dos ovários policísticos e obesidade, sempre em conjunto com circunferência abdominal, pressão arterial, triglicerídeos e HDL.',
    'Acompanhamento da resposta a uma intervenção (perda de peso, exercício, metformina) em um mesmo indivíduo, comparando o índice com ele mesmo.',
    'Não se aplica a pacientes em uso de insulina exógena, a diabéticos com falência de célula beta, a gestantes nem a menores de 18 anos com os pontos de corte de adultos. Não serve para diagnosticar diabetes: o diagnóstico continua sendo feito por glicemia de jejum, HbA1c ou teste oral de tolerância à glicose.',
  ],

  whyUse:
    'É a alternativa prática ao clamp euglicêmico-hiperinsulinêmico, que é o padrão-ouro mas exige internação, infusão contínua e horas de coleta. O HOMA-IR precisa apenas de uma amostra de sangue em jejum e mostrou correlação de 0,88 com o clamp no estudo original de Matthews.',

  pearls: [
    'Não existe consenso sobre o ponto de corte. Na população brasileira, o estudo BRAMS (1.203 adultos de 18 a 78 anos) encontrou HOMA1-IR acima de 2,7 para identificar resistência à insulina e acima de 2,3 para identificar síndrome metabólica. Valores diferentes circulam na literatura (2,5 · 2,71 · 3,16 · 4,65) porque dependem da população, do ensaio de insulina e do desfecho escolhido: cite sempre a referência que está sendo usada.',
    'O ensaio de insulina não é padronizado entre laboratórios. Imunoensaios diferentes dão resultados que variam substancialmente, e há reação cruzada variável com pró-insulina. Comparar HOMA-IR de laboratórios diferentes, ou usar um ponto de corte derivado com outro método, é fonte previsível de erro.',
    'A precisão do índice é baixa em uma única medida: no artigo original, o coeficiente de variação foi de 31% para a estimativa de resistência à insulina. Os autores recomendam a média de três coletas com intervalo de cinco minutos, o que quase nunca é feito na prática.',
    'O HOMA-IR perde sentido em quem tem diabetes estabelecido: quando a célula beta falha, a insulina cai apesar da resistência persistir, e o índice pode ficar falsamente baixo. Em glicemias muito elevadas, prefira o HOMA2, o modelo computacional não linear, que corrige essa distorção.',
    'A insulina exógena é dosada pelo ensaio junto com a endógena em muitos kits, e o peptídeo C é o marcador adequado nesses pacientes. Em quem usa insulina, o HOMA-IR não é interpretável.',
    'Amostra hemolisada degrada a insulina por ação de proteases eritrocitárias e subestima o resultado. A amostra deve ser centrifugada e separada rapidamente.',
    'Nem a Sociedade Brasileira de Diabetes nem as diretrizes internacionais recomendam dosar insulina de jejum como rastreamento populacional: um HOMA-IR elevado em pessoa assintomática não muda a conduta, que continua sendo mudança de estilo de vida e rastreamento de diabetes por glicemia e HbA1c.',
    'O índice não é validado para diagnosticar "resistência à insulina" como doença isolada nem para indicar tratamento farmacológico: a metformina não tem indicação formal a partir de um valor de HOMA-IR.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const glicemia = n(values, 'glicemia');
    const insulina = n(values, 'insulina');

    if (glicemia <= 0 || insulina <= 0) {
      return {
        value: '-',
        severity: 'info' as const,
        interpretation: 'Informe valores válidos de glicemia e de insulina de jejum.',
      };
    }

    // HOMA1-IR na notação em mg/dL: equivale a (glicemia mmol/L × insulina) / 22,5.
    const homa = (glicemia * insulina) / 405;

    if (!Number.isFinite(homa)) {
      return {
        value: '-',
        severity: 'info' as const,
        interpretation: 'Não foi possível calcular o índice com os valores informados.',
      };
    }

    // HOMA-Beta: (20 × insulina) / (glicemia mmol/L − 3,5), reescrito para mg/dL.
    const denominadorBeta = glicemia - 63;
    const homaBeta = denominadorBeta > 0 ? (360 * insulina) / denominadorBeta : null;

    // QUICKI: 1 / (log10 insulina + log10 glicemia).
    const denominadorQuicki = Math.log10(insulina) + Math.log10(glicemia);
    const quicki = denominadorQuicki > 0 ? 1 / denominadorQuicki : null;

    let label: string;
    let severity: 'baixo' | 'moderado' | 'alto';
    let interpretation: string;
    let nextSteps: string;

    if (homa < 2.3) {
      label = 'Resistência à insulina improvável';
      severity = 'baixo';
      interpretation =
        'Índice abaixo de 2,3, ponto de corte do estudo BRAMS para síndrome metabólica em adultos brasileiros. A resistência à insulina é pouco provável.';
      nextSteps =
        'Não há indicação de repetir o exame de rotina.\nMantenha o rastreamento de diabetes pelos critérios habituais, glicemia de jejum e HbA1c, e a avaliação de risco cardiometabólico com circunferência abdominal, pressão arterial e perfil lipídico.';
    } else if (homa <= 2.7) {
      label = 'Faixa limítrofe';
      severity = 'moderado';
      interpretation =
        'Índice entre 2,3 e 2,7. Está acima do ponto de corte do BRAMS para síndrome metabólica (2,3), mas abaixo do ponto de corte para resistência à insulina (2,7). Zona de incerteza, em que o valor isolado não decide nada.';
      nextSteps =
        'Interprete junto com o quadro clínico: circunferência abdominal, pressão arterial, triglicerídeos, HDL, acantose nigricans e história familiar de diabetes.\nSe houver critérios de síndrome metabólica, o tratamento é o mesmo independentemente do índice: perda de peso, atividade física e controle dos fatores de risco.';
    } else {
      label = 'Resistência à insulina provável';
      severity = 'alto';
      interpretation =
        'Índice acima de 2,7, ponto de corte do estudo BRAMS para resistência à insulina em adultos brasileiros não diabéticos. O resultado sugere resistência à insulina, mas não faz diagnóstico de diabetes nem de síndrome metabólica.';
      nextSteps =
        'Rastreie diabetes com glicemia de jejum e HbA1c, e considere teste oral de tolerância à glicose quando houver dúvida.\nInvestigue as condições associadas: esteatose hepática metabólica, dislipidemia aterogênica, hipertensão, apneia obstrutiva do sono e, em mulheres, síndrome dos ovários policísticos.\nO tratamento é a mudança de estilo de vida com perda ponderal de 5% a 10%; a farmacoterapia segue as indicações formais de cada condição, e não o valor do índice.';
    }

    if (glicemia >= 126) {
      interpretation +=
        `\n\nAtenção: a glicemia de jejum de ${num(glicemia, 0)} mg/dL já está na faixa diagnóstica de diabetes (≥ 126 mg/dL), que exige confirmação. Nesse cenário o HOMA-IR perde acurácia, porque o modelo linear assume função de célula beta preservada: prefira o HOMA2.`;
    } else if (glicemia >= 100) {
      interpretation += `\n\nA glicemia de jejum de ${num(glicemia, 0)} mg/dL caracteriza glicemia de jejum alterada (100 a 125 mg/dL), o que reforça o risco cardiometabólico independentemente do índice.`;
    }

    const details = [
      {
        label: 'HOMA-Beta (função de célula beta)',
        value: homaBeta !== null ? `${num(homaBeta, 0)}%` : '-',
        hint:
          homaBeta !== null
            ? 'Referência do modelo original: 100% em adulto jovem normal'
            : 'Não calculável com glicemia igual ou inferior a 63 mg/dL',
      },
      {
        label: 'QUICKI',
        value: quicki !== null ? num(quicki, 3) : '-',
        hint: 'Índice alternativo; valores mais baixos indicam maior resistência (abaixo de 0,339 é sugestivo)',
      },
      {
        label: 'Ponto de corte para resistência à insulina',
        value: '> 2,7',
        hint: 'BRAMS, 1.203 adultos brasileiros não diabéticos (Geloneze, 2009)',
      },
      {
        label: 'Ponto de corte para síndrome metabólica',
        value: '> 2,3',
        hint: 'BRAMS: sensibilidade 76,8% e especificidade 66,7%',
      },
    ];

    return {
      value: num(homa, 2),
      label,
      severity,
      interpretation,
      details,
      nextSteps,
    };
  },

  formula: `HOMA-IR = glicemia de jejum (mg/dL) × insulina de jejum (µU/mL) ÷ 405

Notação original, em unidades do SI:
HOMA-IR = glicemia (mmol/L) × insulina (µU/mL) ÷ 22,5

O denominador 405 é simplesmente 22,5 × 18, já que 1 mmol/L de glicose = 18 mg/dL.

Índices derivados dos mesmos dois exames:
HOMA-Beta (%) = 360 × insulina (µU/mL) ÷ [glicemia (mg/dL) − 63]
QUICKI = 1 ÷ [log₁₀ insulina (µU/mL) + log₁₀ glicemia (mg/dL)]

Pontos de corte do estudo BRAMS, em adultos brasileiros:
> 2,7 - resistência à insulina
> 2,3 - síndrome metabólica`,

  evidence:
    'O modelo HOMA foi descrito por Matthews e colaboradores em 1985, a partir de um modelo matemático da retroalimentação entre glicose e insulina no estado de jejum. No artigo original, a estimativa de resistência à insulina correlacionou-se com o clamp euglicêmico com Rs = 0,88 (p < 0,0001) e a estimativa de função de célula beta correlacionou-se com o clamp hiperglicêmico com Rs = 0,61 (p < 0,01); os próprios autores registraram coeficientes de variação de 31% e 32%, respectivamente, e alertaram para a baixa precisão de uma medida isolada. Os pontos de corte usados aqui vêm do Brazilian Metabolic Syndrome Study (BRAMS), publicado por Geloneze e colaboradores em 2009, que avaliou 1.203 adultos brasileiros não diabéticos de 18 a 78 anos, com um subgrupo de referência de 297 indivíduos saudáveis, e definiu HOMA1-IR acima de 2,7 para resistência à insulina e acima de 2,3 para síndrome metabólica. Em 2004, Wallace, Levy e Matthews publicaram uma revisão sobre o uso e o abuso do modelo, apontando que o HOMA vinha sendo aplicado bem além do que a validação sustenta, sobretudo em populações com diabetes estabelecido, onde o modelo linear não se aplica.',

  creator: {
    name: 'David R. Matthews e Robert C. Turner',
    bio: 'Endocrinologistas da Universidade de Oxford. Turner foi um dos idealizadores do UKPDS; ambos assinam o artigo de 1985 que descreveu o modelo HOMA.',
  },

  updatedAt: '2026-07-26',

  references: [
    {
      citation:
        'Matthews DR, Hosker JP, Rudenski AS, Naylor BA, Treacher DF, Turner RC. Homeostasis model assessment: insulin resistance and beta-cell function from fasting plasma glucose and insulin concentrations in man. Diabetologia. 1985;28(7):412-9.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/3899825/',
      primary: true,
    },
    {
      citation:
        'Geloneze B, Vasques ACJ, Stabe CFC, et al. HOMA1-IR and HOMA2-IR indexes in identifying insulin resistance and metabolic syndrome: Brazilian Metabolic Syndrome Study (BRAMS). Arq Bras Endocrinol Metabol. 2009;53(2):281-7.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/19466221/',
    },
    {
      citation:
        'Wallace TM, Levy JC, Matthews DR. Use and abuse of HOMA modeling. Diabetes Care. 2004;27(6):1487-95.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/15161807/',
    },
    {
      citation:
        'Sacks DB, Arnold M, Bakris GL, et al. Guidelines and recommendations for laboratory analysis in the diagnosis and management of diabetes mellitus. Clin Chem. 2011;57(6):e1-e47.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/21617152/',
    },
  ],
};

export default calculator;
