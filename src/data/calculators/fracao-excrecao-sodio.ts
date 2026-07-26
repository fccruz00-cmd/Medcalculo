import type { Calculator, Field, ResultDetail, Values } from '@/lib/types';
import { n, num } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'naUrinario',
    kind: 'number',
    label: 'Sódio urinário',
    unit: 'mEq/L',
    min: 1,
    max: 300,
    step: 1,
    hint: 'Amostra isolada de urina (spot), colhida idealmente antes de qualquer diurético.',
  },
  {
    id: 'naPlasmatico',
    kind: 'number',
    label: 'Sódio plasmático',
    unit: 'mEq/L',
    min: 100,
    max: 180,
    step: 1,
    normalRange: '135 a 145 mEq/L',
    hint: 'Colhido o mais próximo possível da amostra de urina.',
  },
  {
    id: 'crUrinaria',
    kind: 'number',
    label: 'Creatinina urinária',
    unit: 'mg/dL',
    min: 5,
    max: 500,
    step: 1,
    hint: 'Da mesma amostra isolada de urina. Cuidado: alguns laboratórios liberam em g/L; 1 g/L equivale a 100 mg/dL.',
  },
  {
    id: 'crPlasmatica',
    kind: 'number',
    label: 'Creatinina plasmática',
    unit: 'mg/dL',
    min: 0.2,
    max: 25,
    step: 0.01,
    normalRange: '0,6 a 1,2 mg/dL',
    unitToggle: {
      alt: 'µmol/L',
      toBase: (value) => value / 88.4,
      fromBase: (value) => value * 88.4,
    },
  },
  {
    id: 'ureiaUrinaria',
    kind: 'number',
    label: 'Ureia urinária',
    unit: 'mg/dL',
    min: 100,
    max: 6000,
    step: 10,
    optional: true,
    hint: 'Opcional, para calcular a fração de excreção de ureia (FEUreia). Use a MESMA unidade da ureia plasmática: como a razão é entre urina e plasma, tanto faz ureia ou BUN, desde que as duas sejam do mesmo tipo.',
  },
  {
    id: 'ureiaPlasmatica',
    kind: 'number',
    label: 'Ureia plasmática',
    unit: 'mg/dL',
    min: 5,
    max: 500,
    step: 1,
    optional: true,
    normalRange: '15 a 40 mg/dL',
    hint: 'Opcional, para a FEUreia. Laboratórios brasileiros dosam ureia; se o seu serviço informa BUN, use BUN nos dois campos.',
  },
];

/** Lê um campo opcional, devolvendo null quando não preenchido. */
function opcional(values: Values, id: string): number | null {
  const value = values[id];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

const calculator: Calculator = {
  slug: 'fracao-excrecao-sodio',
  title: 'Fração de excreção de sódio (FENa)',
  shortTitle: 'FENa',
  subtitle:
    'Estima a fração do sódio filtrado que é excretada na urina para diferenciar a lesão renal aguda pré-renal da necrose tubular aguda.',
  specialties: ['Nefrologia', 'Terapia Intensiva'],
  kind: 'Fórmula',
  keywords: [
    'FENa',
    'fração de excreção de sódio',
    'FEUreia',
    'FEU',
    'lesão renal aguda',
    'LRA',
    'IRA',
    'pré-renal',
    'necrose tubular aguda',
    'NTA',
    'oligúria',
  ],

  whenToUse: [
    'Lesão renal aguda oligúrica de causa indefinida, para apoiar a distinção entre hipoperfusão renal (pré-renal) e necrose tubular aguda.',
    'Antes do uso de diuréticos: a FENa perde a validade depois de qualquer dose de furosemida, tiazídico, manitol ou inibidor de SGLT2. Nesses casos, use a FEUreia.',
    'Não use em doença renal crônica avançada com natriurese basal elevada, em lesão renal aguda não oligúrica, em nefropatia perdedora de sal nem quando o paciente vem recebendo grandes volumes de cristaloide.',
    'Não use como teste isolado: é um dado a mais na avaliação clínica de volemia, história de exposição a nefrotóxicos e sedimento urinário.',
  ],

  whyUse:
    'A FENa é mais discriminante que o sódio urinário isolado porque corrige a excreção de sódio pela reabsorção de água, usando a creatinina como referência. Quando o rim está hipoperfundido mas íntegro, ele retém sódio avidamente e a fração excretada cai abaixo de 1%; quando o túbulo está lesado, ele perde essa capacidade e a fração ultrapassa 2%.',

  pearls: [
    'Diurético invalida o exame. Uma única dose de furosemida nas horas anteriores força a natriurese e eleva a FENa mesmo em quadro pré-renal puro: nessa situação use a FEUreia, cujo transporte proximal é menos afetado pelos diuréticos de alça.',
    'FENa abaixo de 1% NÃO é sinônimo de hipovolemia. Também ocorre em nefropatia por contraste, rabdomiólise e outras nefropatias pigmentares, glomerulonefrite aguda, obstrução urinária de instalação recente, síndrome hepatorrenal e síndrome cardiorrenal: em várias delas o volume intravascular está normal ou aumentado.',
    'FENa acima de 1% em quadro pré-renal também acontece: doença renal crônica de base, uso de diuréticos, insuficiência adrenal, bicarbonatúria (na qual o sódio é obrigatoriamente excretado com o bicarbonato) e reposição volêmica prévia.',
    'A regra foi derivada em pacientes oligúricos. Em lesão renal aguda não oligúrica ela discrimina muito mal, porque a necrose tubular aguda não oligúrica costuma cursar com FENa baixa.',
    'Confira a unidade da creatinina urinária. Muitos laboratórios brasileiros liberam em g/L; usar 1,2 g/L como se fosse 1,2 mg/dL multiplica a FENa por cem.',
    'A FEUreia não é infalível: os pontos de corte variam entre estudos (menos de 35% para pré-renal, mais de 50% a 65% para necrose tubular aguda) e alguns trabalhos mostraram desempenho apenas modesto em pacientes de terapia intensiva com múltiplas causas de lesão renal.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const naU = n(values, 'naUrinario');
    const naP = n(values, 'naPlasmatico');
    const crU = n(values, 'crUrinaria');
    const crP = n(values, 'crPlasmatica');
    const ureiaU = opcional(values, 'ureiaUrinaria');
    const ureiaP = opcional(values, 'ureiaPlasmatica');

    const denominador = naP * crU;
    if (denominador <= 0 || naU <= 0 || crP <= 0) {
      return {
        value: '-',
        severity: 'info' as const,
        interpretation:
          'Informe sódio e creatinina do plasma e da urina com valores maiores que zero para calcular a fração de excreção.',
      };
    }

    const fena = ((naU * crP) / denominador) * 100;

    const details: ResultDetail[] = [
      {
        label: 'Sódio urinário isolado',
        value: `${num(naU, 0)} mEq/L`,
        hint: 'Abaixo de 20 mEq/L sugere retenção ávida de sódio (pré-renal); acima de 40 mEq/L sugere lesão tubular. É menos discriminante que a FENa.',
      },
      {
        label: 'Razão creatinina urinária/plasmática',
        value: num(crU / crP, 1),
        hint: 'Acima de 40 sugere reabsorção ávida de água, compatível com quadro pré-renal.',
      },
    ];

    let feureiaTexto = '';
    if (ureiaU !== null && ureiaP !== null && ureiaP > 0 && ureiaU > 0) {
      const feureia = ((ureiaU * crP) / (ureiaP * crU)) * 100;
      details.push({
        label: 'Fração de excreção de ureia (FEUreia)',
        value: `${num(feureia, 1)}%`,
        hint: 'Menos de 35% sugere quadro pré-renal; mais de 50% a 65% sugere necrose tubular aguda. É a alternativa preferida quando o paciente recebeu diurético.',
      });

      if (feureia < 35) {
        feureiaTexto =
          'A FEUreia abaixo de 35% reforça a hipótese pré-renal e é o parâmetro a valorizar caso o paciente tenha recebido diurético.';
      } else if (feureia > 50) {
        feureiaTexto =
          'A FEUreia acima de 50% aponta para necrose tubular aguda e mantém a leitura mesmo em paciente que recebeu diurético.';
      } else {
        feureiaTexto =
          'A FEUreia entre 35% e 50% fica na zona indeterminada e não desempata o diagnóstico.';
      }
    }

    let label: string;
    let severity: 'moderado' | 'alto';
    let interpretation: string;
    let nextSteps: string;

    if (fena < 1) {
      label = 'Padrão pré-renal';
      severity = 'moderado';
      interpretation =
        'Fração de excreção de sódio abaixo de 1%: o túbulo está reabsorvendo sódio avidamente, padrão de lesão renal aguda pré-renal. Lembre que esse mesmo padrão aparece na nefropatia por contraste, na rabdomiólise, na glomerulonefrite aguda, na obstrução urinária recente e nas síndromes hepatorrenal e cardiorrenal: nem sempre significa hipovolemia.';
      nextSteps =
        'Avalie a volemia à beira do leito e por ultrassom, revise as perdas e as drogas em uso.\nSe houver hipovolemia, faça prova de volume com cristaloide e reavalie o débito urinário e a creatinina.\nSe o paciente estiver congesto, considere síndrome cardiorrenal ou hepatorrenal: nesses casos expandir volume piora o quadro.\nSuspenda anti-inflamatórios, inibidores da enzima conversora, bloqueadores do receptor de angiotensina e nefrotóxicos enquanto durar a lesão aguda.';
    } else if (fena <= 2) {
      label = 'Faixa indeterminada';
      severity = 'moderado';
      interpretation =
        'Fração de excreção de sódio entre 1% e 2%, faixa em que o exame não discrimina pré-renal de necrose tubular aguda. Ocorre com frequência em quadros mistos, em pacientes que já receberam volume ou diurético e em portadores de doença renal crônica.';
      nextSteps =
        'Decida pela clínica: história de hipoperfusão ou de exposição a nefrotóxico, exame do volume extracelular e, sobretudo, sedimento urinário; cilindros granulosos pigmentados e células epiteliais tubulares apontam para necrose tubular aguda.\nSe o paciente recebeu diurético, calcule a FEUreia.\nRepita a avaliação após otimizar a perfusão.';
    } else {
      label = 'Padrão de necrose tubular aguda';
      severity = 'alto';
      interpretation =
        'Fração de excreção de sódio acima de 2%: o túbulo perdeu a capacidade de reabsorver sódio, padrão de necrose tubular aguda. Antes de fechar o diagnóstico, exclua uso de diurético, doença renal crônica de base, reposição volêmica recente e bicarbonatúria, que elevam a FENa mesmo sem lesão tubular.';
      nextSteps =
        'Confirme com o sedimento urinário (cilindros granulosos pigmentados, células epiteliais tubulares) e reveja a exposição a nefrotóxicos, contraste, hipotensão prolongada e sepse.\nSuspenda nefrotóxicos, otimize a perfusão renal e evite tanto a hipovolemia quanto a sobrecarga.\nNão há benefício em usar diurético para "converter" a necrose tubular aguda oligúrica; ele só serve para controlar volume.\nMonitore potássio, bicarbonato, ureia e volume para indicação de terapia renal substitutiva.';
    }

    if (feureiaTexto) {
      interpretation = `${interpretation}\n\n${feureiaTexto}`;
    }

    return {
      value: num(fena, 2),
      unit: '%',
      label,
      severity,
      interpretation,
      details,
      nextSteps,
    };
  },

  formula: `FENa (%) = [(sódio urinário × creatinina plasmática) ÷ (sódio plasmático × creatinina urinária)] × 100

Interpretação clássica:
FENa < 1% - padrão pré-renal
FENa 1% a 2% - indeterminado
FENa > 2% - necrose tubular aguda

FEUreia (%) = [(ureia urinária × creatinina plasmática) ÷ (ureia plasmática × creatinina urinária)] × 100

FEUreia < 35% - padrão pré-renal
FEUreia > 50% a 65% - necrose tubular aguda

Sódio e creatinina podem estar em qualquer unidade, desde que a mesma unidade seja usada na urina e no plasma - a razão cancela as unidades. O mesmo vale para ureia e BUN.`,

  evidence:
    'A fração de excreção de sódio foi proposta por Carlos Espinel em 1976, em uma série pequena de pacientes com insuficiência renal aguda na qual todos os casos pré-renais tiveram FENa abaixo de 1% e todos os casos de necrose tubular aguda ficaram acima de 3%. Miller e colaboradores validaram o índice em 1978, em estudo prospectivo com 102 pacientes com insuficiência renal aguda: a FENa foi o melhor entre os índices urinários testados, com sensibilidade e especificidade superiores às do sódio urinário isolado e da razão ureia/creatinina, ainda que a distinção falhasse em subgrupos específicos. Em 2002, Carvounis e colaboradores mostraram, em 102 pacientes, que a fração de excreção de ureia mantinha boa acurácia para identificar o quadro pré-renal em pacientes que estavam usando diuréticos, situação em que a FENa perde a validade: resultado que consolidou a FEUreia como alternativa nesse cenário, embora estudos posteriores em terapia intensiva tenham encontrado desempenho mais modesto.',

  creator: {
    name: 'Carlos H. Espinel',
    bio: 'Nefrologista que descreveu o teste da fração de excreção de sódio em 1976, no JAMA, como método para diferenciar as causas de insuficiência renal aguda.',
  },

  references: [
    {
      citation:
        'Espinel CH. The FENa test. Use in the differential diagnosis of acute renal failure. JAMA. 1976;236(6):579-81.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/947239/',
      primary: true,
    },
    {
      citation:
        'Miller TR, Anderson RJ, Linas SL, et al. Urinary diagnostic indices in acute renal failure: a prospective study. Ann Intern Med. 1978;89(1):47-50.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/666184/',
    },
    {
      citation:
        'Carvounis CP, Nisar S, Guro-Razuman S. Significance of the fractional excretion of urea in the differential diagnosis of acute renal failure. Kidney Int. 2002;62(6):2223-9.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/12427149/',
    },
    {
      citation:
        'Kidney Disease: Improving Global Outcomes (KDIGO) Acute Kidney Injury Work Group. KDIGO Clinical Practice Guideline for Acute Kidney Injury. Kidney Int Suppl. 2012;2(1):1-138.',
    },
  ],
};

export default calculator;
