import type { Calculator, Field, ResultDetail, Values } from '@/lib/types';
import { n, num } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'idade',
    kind: 'number',
    label: 'Idade',
    unit: 'anos',
    min: 18,
    max: 110,
    step: 1,
    hint: 'A equação foi derivada em adultos de 18 a 92 anos. Não use em crianças: nessa faixa etária use a fórmula de Schwartz.',
  },
  {
    id: 'sexo',
    kind: 'choice',
    label: 'Sexo',
    hint: 'O fator 0,85 do sexo feminino foi uma extrapolação dos autores: a coorte de derivação era composta apenas por homens.',
    options: [
      { label: 'Masculino', value: 'M' },
      { label: 'Feminino', value: 'F' },
    ],
  },
  {
    id: 'peso',
    kind: 'number',
    label: 'Peso corporal total',
    unit: 'kg',
    min: 20,
    max: 250,
    step: 0.1,
    hint: 'Use o peso seco (sem sobrecarga volêmica). Em obesidade, veja o clearance com peso ajustado nos detalhes do resultado.',
  },
  {
    id: 'creatinina',
    kind: 'number',
    label: 'Creatinina sérica',
    unit: 'mg/dL',
    min: 0.1,
    max: 25,
    step: 0.01,
    normalRange: '0,6 a 1,2 mg/dL',
    hint: 'Exige creatinina estável. Em lesão renal aguda, com creatinina subindo ou caindo, a fórmula não é válida.',
    unitToggle: {
      alt: 'µmol/L',
      toBase: (value) => value / 88.4,
      fromBase: (value) => value * 88.4,
    },
  },
  {
    id: 'altura',
    kind: 'number',
    label: 'Altura',
    unit: 'cm',
    min: 120,
    max: 220,
    step: 1,
    optional: true,
    hint: 'Opcional. Serve para calcular o peso ideal e o peso ajustado (úteis em obesidade) e a superfície corporal.',
  },
];

/** Lê um campo opcional, devolvendo null quando não preenchido. */
function opcional(values: Values, id: string): number | null {
  const value = values[id];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** Clearance de Cockcroft-Gault para um peso qualquer, em mL/min. */
function clearance(idade: number, peso: number, creatinina: number, feminino: boolean): number {
  const base = ((140 - idade) * peso) / (72 * creatinina);
  return base * (feminino ? 0.85 : 1);
}

const calculator: Calculator = {
  slug: 'cockcroft-gault',
  title: 'Clearance de creatinina: Cockcroft-Gault',
  shortTitle: 'Cockcroft-Gault',
  subtitle:
    'Estima o clearance de creatinina em mL/min a partir da idade, do peso e da creatinina sérica: a base de ajuste de dose usada pela maioria das bulas.',
  specialties: ['Nefrologia', 'Clínica Médica'],
  kind: 'Fórmula',
  popular: true,
  keywords: [
    'cockcroft',
    'gault',
    'clearance de creatinina',
    'ClCr',
    'CrCl',
    'ajuste de dose',
    'função renal',
    'posologia',
    'nefrotóxico',
  ],

  whenToUse: [
    'Ajuste de dose de medicamentos cuja bula ou cujo estudo pivotal usou o clearance de Cockcroft-Gault: é o caso dos anticoagulantes orais diretos, da vancomicina, dos aminoglicosídeos, de vários antivirais e da maioria dos antimicrobianos.',
    'Estimativa rápida da função renal em adultos com creatinina estável.',
    'Não use em lesão renal aguda, em gestantes, em crianças e adolescentes, nem em pacientes com massa muscular muito atípica (amputados, tetraplégicos, grandes queimados, sarcopenia acentuada, fisiculturistas).',
    'Para diagnosticar e estadiar doença renal crônica, prefira a CKD-EPI 2021: o Cockcroft-Gault não é a equação recomendada pelo KDIGO para essa finalidade.',
  ],

  whyUse:
    'Apesar de ter quase cinquenta anos e de ser menos exata que a CKD-EPI, a fórmula de Cockcroft-Gault continua sendo a referência regulatória: as faixas de ajuste posológico impressas em bula e usadas nos ensaios clínicos de registro foram definidas com ela. Trocar a equação na hora de ajustar dose pode reclassificar o paciente e levar a subdose ou a superdose.',

  pearls: [
    'O resultado sai em mL/min e NÃO é normalizado para 1,73 m² de superfície corporal. Comparar diretamente esse número com a TFG da CKD-EPI (mL/min/1,73 m²) é um erro frequente: em pessoas pequenas ou muito grandes os dois valores divergem bastante.',
    'A fórmula usa o peso corporal total, então superestima o clearance em obesos: um paciente com IMC 40 pode ter o clearance superestimado em 40% a 50%. Em obesidade, a prática mais aceita é usar o peso ajustado (peso ideal + 0,4 × excesso de peso), disponível nos detalhes do resultado quando a altura é informada.',
    'Em edema, ascite ou anasarca, use o peso seco estimado. O líquido retido não contribui para a produção de creatinina e infla o resultado.',
    'A coorte de derivação era composta exclusivamente por homens; o fator 0,85 para mulheres foi uma extrapolação teórica baseada na menor massa muscular, nunca validada no estudo original.',
    'A creatinina de 1976 era dosada por métodos de Jaffé não padronizados, que superestimam a creatinina verdadeira. Com a creatinina atual, rastreável ao IDMS, a mesma fórmula tende a devolver clearances um pouco mais altos que os originais.',
    'Não "arredonde" a creatinina do idoso para 1,0 mg/dL. Essa prática antiga não tem respaldo em evidência e leva a subdosagem sistemática de antimicrobianos.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const idade = n(values, 'idade');
    const peso = n(values, 'peso');
    const creatinina = n(values, 'creatinina');
    const feminino = values.sexo === 'F';
    const altura = opcional(values, 'altura');

    if (creatinina <= 0 || peso <= 0 || idade <= 0 || idade >= 140) {
      return {
        value: '-',
        severity: 'info' as const,
        interpretation: 'Informe idade, peso e creatinina sérica válidos para calcular o clearance.',
      };
    }

    const clcr = clearance(idade, peso, creatinina, feminino);
    const arredondado = Math.round(clcr);

    const details: ResultDetail[] = [];

    if (altura !== null && altura >= 140) {
      // Peso ideal de Devine (1974): 50 kg (homem) ou 45,5 kg (mulher)
      // mais 2,3 kg para cada polegada acima de 152,4 cm.
      const pesoIdeal = (feminino ? 45.5 : 50) + 0.91 * (altura - 152.4);
      const excesso = peso - pesoIdeal;
      const pesoAjustado = pesoIdeal + 0.4 * excesso;
      const imc = peso / Math.pow(altura / 100, 2);
      // Superfície corporal de Du Bois, para desnormalizar/normalizar comparações.
      const sc = 0.007184 * Math.pow(altura, 0.725) * Math.pow(peso, 0.425);

      details.push({
        label: 'Peso ideal (Devine)',
        value: `${num(pesoIdeal, 1)} kg`,
        hint: `Clearance com peso ideal: ${num(clearance(idade, pesoIdeal, creatinina, feminino), 0)} mL/min`,
      });

      if (excesso > 0.2 * pesoIdeal) {
        details.push({
          label: 'Peso ajustado (obesidade)',
          value: `${num(pesoAjustado, 1)} kg`,
          hint: `Clearance com peso ajustado: ${num(clearance(idade, pesoAjustado, creatinina, feminino), 0)} mL/min, preferível quando o peso total excede o ideal em mais de 20%`,
        });
      }

      details.push({
        label: 'IMC',
        value: `${num(imc, 1)} kg/m²`,
      });

      if (sc > 0) {
        details.push({
          label: 'Se normalizado para 1,73 m²',
          value: `${num((clcr * 1.73) / sc, 0)} mL/min/1,73 m²`,
          hint: `Apenas para comparar com a CKD-EPI. Superfície corporal de Du Bois: ${num(sc, 2)} m². Para ajuste de dose, use o valor principal em mL/min.`,
        });
      }
    }

    let label: string;
    let severity: 'baixo' | 'moderado' | 'alto' | 'critico';
    let interpretation: string;
    let nextSteps: string;

    if (arredondado >= 90) {
      label = 'Clearance preservado';
      severity = 'baixo';
      interpretation =
        'Clearance de creatinina dentro da faixa esperada para um adulto com função renal normal. Em geral não há necessidade de ajuste posológico por via renal.';
      nextSteps =
        'Mantenha as doses habituais dos medicamentos de eliminação renal.\nLembre que um clearance normal não exclui doença renal crônica: o diagnóstico exige albuminúria ou alteração estrutural persistente por mais de três meses.';
    } else if (arredondado >= 60) {
      label = 'Redução leve';
      severity = 'baixo';
      interpretation =
        'Redução leve do clearance. A maior parte dos fármacos não exige ajuste nessa faixa, mas alguns antimicrobianos e antivirais já reduzem a dose abaixo de 60 mL/min.';
      nextSteps =
        'Confira a bula de cada medicamento de eliminação renal.\nEvite anti-inflamatórios não esteroidais e revise a necessidade de contraste iodado.';
    } else if (arredondado >= 30) {
      label = 'Redução moderada';
      severity = 'moderado';
      interpretation =
        'Redução moderada do clearance. Essa é a faixa em que a maioria das bulas passa a exigir ajuste de dose ou de intervalo: inclusive para anticoagulantes orais diretos, antimicrobianos e antivirais.';
      nextSteps =
        'Revise a dose de todos os medicamentos de eliminação renal, com atenção a heparinas de baixo peso molecular, DOACs, metformina, gabapentinoides, colchicina e antimicrobianos.\nSuspenda anti-inflamatórios e evite nefrotóxicos.\nConsidere monitorização sérica quando disponível (vancomicina, aminoglicosídeos, digoxina).';
    } else if (arredondado >= 15) {
      label = 'Redução grave';
      severity = 'alto';
      interpretation =
        'Redução grave do clearance. Vários fármacos são formalmente contraindicados abaixo de 30 mL/min, entre eles a metformina e parte dos anticoagulantes orais diretos.';
      nextSteps =
        'Reveja individualmente cada prescrição: suspenda o que for contraindicado, ajuste dose e intervalo do que for mantido.\nEncaminhe ao nefrologista e evite contraste iodado e nefrotóxicos sempre que possível.';
    } else {
      label = 'Clearance muito baixo';
      severity = 'critico';
      interpretation =
        'Clearance compatível com falência renal. Praticamente todo fármaco de eliminação renal exige reavaliação, e vários estão contraindicados.';
      nextSteps =
        'Avaliação nefrológica imediata, incluindo indicação de terapia renal substitutiva.\nEm paciente já dialítico, ajuste as doses ao esquema de diálise e à remoção dialítica de cada fármaco: a fórmula de Cockcroft-Gault não descreve a depuração da diálise.';
    }

    return {
      value: num(arredondado),
      unit: 'mL/min',
      label,
      severity,
      interpretation,
      details,
      nextSteps,
    };
  },

  formula: `Clearance de creatinina (mL/min) = [(140 − idade) × peso (kg)] ÷ (72 × creatinina sérica em mg/dL)

Multiplique por 0,85 se o sexo for feminino.

Pesos alternativos (quando a altura é informada):
Peso ideal (Devine) = 50 kg (homem) ou 45,5 kg (mulher) + 0,91 × (altura em cm − 152,4)
Peso ajustado = peso ideal + 0,4 × (peso total − peso ideal)

O resultado é expresso em mL/min, sem normalização para superfície corporal.`,

  evidence:
    'A equação foi derivada por Donald Cockcroft e Henry Gault em 1976, a partir de 249 homens internados no Queen Mary Veterans Hospital, em Montreal, com idades entre 18 e 92 anos; a predição foi comparada à média de duas medidas de clearance de creatinina em urina de 24 horas em 236 deles. A correlação com o clearance medido foi de aproximadamente 0,83, melhor do que a obtida com a creatinina sérica isolada. O fator 0,85 para mulheres foi proposto por analogia com a menor excreção de creatinina feminina, sem validação na amostra. Estudos posteriores mostraram que a fórmula tende a superestimar a filtração em obesos e em pacientes com creatinina baixa, e que é menos exata do que a CKD-EPI para estimar a taxa de filtração glomerular. Ainda assim, as agências regulatórias e os ensaios clínicos de registro de fármacos continuaram usando o Cockcroft-Gault, o que faz dele a referência prática para ajuste posológico.',

  creator: {
    name: 'Donald W. Cockcroft e M. Henry Gault',
    bio: 'Médicos canadenses; Cockcroft, pneumologista, e Gault, nefrologista, publicaram a equação em 1976 quando trabalhavam no Royal Victoria Hospital e no Queen Mary Veterans Hospital, em Montreal.',
  },

  updatedAt: '2026-07-26',

  references: [
    {
      citation:
        'Cockcroft DW, Gault MH. Prediction of creatinine clearance from serum creatinine. Nephron. 1976;16(1):31-41.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/1244564/',
      primary: true,
    },
    {
      citation: 'Devine BJ. Gentamicin therapy. Drug Intell Clin Pharm. 1974;8(11):650-5.',
    },
    {
      citation:
        'Inker LA, Eneanya ND, Coresh J, et al. New Creatinine- and Cystatin C-Based Equations to Estimate GFR without Race. N Engl J Med. 2021;385(19):1737-49.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/34554658/',
    },
    {
      citation:
        'Kidney Disease: Improving Global Outcomes (KDIGO) CKD Work Group. KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease. Kidney Int. 2024;105(4S):S117-S314.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/38490803/',
    },
  ],
};

export default calculator;
