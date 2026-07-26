import type { Calculator, Field, Values } from '@/lib/types';
import { n, num } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'peso',
    kind: 'number',
    label: 'Peso',
    unit: 'kg',
    min: 1,
    max: 300,
    step: 0.1,
    placeholder: '70',
    hint: 'Use o peso real aferido. Para quimioterapia em pacientes com obesidade, a ASCO recomenda o peso real, sem redução empírica de dose.',
  },
  {
    id: 'altura',
    kind: 'number',
    label: 'Altura',
    unit: 'cm',
    min: 40,
    max: 250,
    step: 0.5,
    placeholder: '170',
    unitToggle: {
      alt: 'm',
      toBase: (value) => value * 100,
      fromBase: (value) => value / 100,
    },
  },
  {
    id: 'debito',
    kind: 'number',
    label: 'Débito cardíaco',
    unit: 'L/min',
    min: 0.5,
    max: 15,
    step: 0.1,
    optional: true,
    normalRange: '4 a 8 L/min',
    hint: 'Opcional. Se informado, calculamos o índice cardíaco (débito cardíaco ÷ superfície corporal).',
  },
];

const calculator: Calculator = {
  slug: 'superficie-corporal',
  title: 'Superfície corporal',
  shortTitle: 'Superfície corporal',
  subtitle:
    'Calcula a área de superfície corporal pela fórmula de Mosteller, usada para dose de quimioterápicos e para o índice cardíaco.',
  specialties: ['Oncologia', 'Clínica Médica'],
  kind: 'Fórmula',
  keywords: [
    'superfície corporal',
    'área de superfície corporal',
    'ASC',
    'SC',
    'BSA',
    'Mosteller',
    'DuBois',
    'Du Bois',
    'quimioterapia',
    'índice cardíaco',
    'dose',
  ],

  whenToUse: [
    'Cálculo da dose de quimioterápicos e de outros fármacos prescritos por miligrama por metro quadrado.',
    'Cálculo do índice cardíaco a partir do débito cardíaco, na monitorização hemodinâmica.',
    'Desnormalização da taxa de filtração glomerular estimada: a TFG vem expressa por 1,73 m² e precisa ser multiplicada por superfície corporal ÷ 1,73 para ajuste de dose em pacientes com peso extremo.',
    'Cálculo de índices ecocardiográficos indexados, como o volume indexado do átrio esquerdo e a área valvar aórtica indexada.',
    'Não use para estimar a extensão de queimaduras: nesse caso o que se calcula é o percentual de superfície corporal queimada, pela regra dos nove ou pela tabela de Lund-Browder.',
  ],

  whyUse:
    'A fórmula de Mosteller é a mais usada na prática oncológica: dá para calcular de cabeça ou em qualquer calculadora simples, precisa apenas de peso e altura, e concorda com as fórmulas clássicas de DuBois e Haycock dentro da margem de erro do próprio método em adultos de porte médio.',

  pearls: [
    'Mosteller e DuBois divergem principalmente nos extremos. A fórmula de DuBois foi derivada em apenas 9 indivíduos, um deles uma criança, e tende a subestimar a superfície corporal em pacientes com obesidade: diferenças de 3% a 5% em relação à Mosteller são comuns. Padronize uma fórmula no serviço e mantenha-a, porque trocar de fórmula entre ciclos muda a dose.',
    'Limitar arbitrariamente a superfície corporal em 2,0 m² ("capping") em pacientes com obesidade não é recomendado: a diretriz da ASCO orienta usar o peso real e a dose plena, porque a redução empírica está associada a subdosagem e a pior desfecho oncológico, sem redução consistente de toxicidade.',
    'Nem toda dose oncológica sai da superfície corporal. A carboplatina é dosada pela fórmula de Calvert (dose = AUC × [TFG + 25]), e vários fármacos têm teto absoluto independentemente da superfície: vincristina costuma ser limitada a 2 mg por dose e a bleomicina tem dose cumulativa máxima.',
    'Erros de digitação de peso ou de altura propagam-se diretamente para a dose do citotóxico. Confira a superfície corporal contra o valor do ciclo anterior: variação maior que 10% quase sempre é erro de registro, não mudança real do paciente.',
    'Recalcule a superfície corporal a cada ciclo em pacientes que perdem peso, e não apenas no primeiro atendimento.',
    'A superfície corporal média do adulto brasileiro fica em torno de 1,7 m². O valor de 1,73 m² usado para normalizar a taxa de filtração glomerular vem da média de adultos jovens norte-americanos da década de 1920 e não é uma meta clínica.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const peso = n(values, 'peso');
    const alturaCm = n(values, 'altura');
    const debitoBruto = values.debito;
    const debito = typeof debitoBruto === 'number' ? debitoBruto : null;

    if (peso <= 0 || alturaCm <= 0) {
      return {
        value: '-',
        severity: 'info' as const,
        interpretation: 'Informe um peso e uma altura válidos para calcular a superfície corporal.',
      };
    }

    // Mosteller (1987): raiz quadrada de (altura em cm × peso em kg ÷ 3600).
    const mosteller = Math.sqrt((alturaCm * peso) / 3600);

    // DuBois & DuBois (1916).
    const dubois = 0.007184 * Math.pow(alturaCm, 0.725) * Math.pow(peso, 0.425);

    // Haycock (1978), validada de lactentes a adultos.
    const haycock = 0.024265 * Math.pow(alturaCm, 0.3964) * Math.pow(peso, 0.5378);

    if (!Number.isFinite(mosteller) || mosteller <= 0) {
      return {
        value: '-',
        severity: 'info' as const,
        interpretation: 'Não foi possível calcular a superfície corporal com os valores informados.',
      };
    }

    const details = [
      {
        label: 'DuBois e DuBois (1916)',
        value: `${num(dubois, 2)} m²`,
        hint: '0,007184 × altura^0,725 × peso^0,425',
      },
      {
        label: 'Haycock (1978)',
        value: `${num(haycock, 2)} m²`,
        hint: 'Validada de lactentes a adultos',
      },
      {
        label: 'Fator de desnormalização da TFG',
        value: `× ${num(mosteller / 1.73, 2)}`,
        hint: 'Multiplique a TFG em mL/min/1,73 m² por este fator para obter mL/min do paciente',
      },
    ];

    let interpretation =
      `Superfície corporal de ${num(mosteller, 2)} m² pela fórmula de Mosteller. ` +
      'Multiplique este valor pela dose prescrita em mg/m² para obter a dose absoluta do paciente.';

    if (debito !== null && debito > 0) {
      const indiceCardiaco = debito / mosteller;
      details.push({
        label: 'Índice cardíaco',
        value: `${num(indiceCardiaco, 2)} L/min/m²`,
        hint: 'Faixa de normalidade: 2,5 a 4,0 L/min/m²',
      });
      if (indiceCardiaco < 2.2) {
        interpretation +=
          `\n\nÍndice cardíaco de ${num(indiceCardiaco, 2)} L/min/m², abaixo de 2,2: faixa compatível com baixo débito. ` +
          'Correlacione com lactato, saturação venosa central e perfusão periférica antes de concluir por choque cardiogênico.';
      } else if (indiceCardiaco < 2.5) {
        interpretation +=
          `\n\nÍndice cardíaco de ${num(indiceCardiaco, 2)} L/min/m², abaixo da faixa de normalidade (2,5 a 4,0 L/min/m²) mas ainda acima do corte clássico de 2,2 para baixo débito: valor limítrofe. ` +
          'Não trate como normal: reavalie lactato, saturação venosa central, diurese e perfusão periférica antes de considerar o débito suficiente.';
      } else if (indiceCardiaco <= 4) {
        interpretation += `\n\nÍndice cardíaco de ${num(indiceCardiaco, 2)} L/min/m², dentro da faixa de normalidade (2,5 a 4,0 L/min/m²).`;
      } else {
        interpretation +=
          `\n\nÍndice cardíaco de ${num(indiceCardiaco, 2)} L/min/m², acima de 4,0: padrão hiperdinâmico, ` +
          'que ocorre em sepse, anemia grave, hipertireoidismo, cirrose e gestação.';
      }
    }

    return {
      value: num(mosteller, 2),
      unit: 'm²',
      label: 'Fórmula de Mosteller',
      severity: 'info' as const,
      interpretation,
      details,
      nextSteps:
        'Confira o peso e a altura no prontuário antes de prescrever quimioterápico e compare a superfície corporal com a do ciclo anterior.\nLembre-se de que a carboplatina é dosada pela fórmula de Calvert, e não por superfície corporal, e de que alguns fármacos têm dose máxima absoluta.',
    };
  },

  formula: `Mosteller (fórmula principal):
SC (m²) = √( altura (cm) × peso (kg) ÷ 3600 )

DuBois e DuBois:
SC (m²) = 0,007184 × altura (cm)^0,725 × peso (kg)^0,425

Haycock:
SC (m²) = 0,024265 × altura (cm)^0,3964 × peso (kg)^0,5378

Índice cardíaco = débito cardíaco (L/min) ÷ SC (m²)
TFG absoluta (mL/min) = TFG (mL/min/1,73 m²) × SC ÷ 1,73`,

  evidence:
    'A fórmula de DuBois e DuBois, publicada em 1916, foi construída a partir de medidas diretas de superfície corporal em apenas nove indivíduos, oito adultos e uma criança, envolvidos em moldes de papel, e dominou a prática clínica por décadas. Em 1978, Haycock e colaboradores publicaram um método geométrico validado de lactentes a adultos, corrigindo o desempenho ruim das fórmulas antigas em crianças pequenas. Em 1987, Mosteller propôs em uma carta ao New England Journal of Medicine a simplificação que leva seu nome, mostrando concordância estreita com as fórmulas anteriores e a vantagem de poder ser calculada mentalmente. Nenhuma das fórmulas foi validada contra desfecho clínico: todas são aproximações geométricas, e a variabilidade farmacocinética entre pacientes com a mesma superfície corporal continua grande, motivo pelo qual a dose por metro quadrado é uma convenção prática, não uma medida de exposição.',

  creator: {
    name: 'R. D. Mosteller',
    bio: 'Autor da simplificação publicada em 1987 no New England Journal of Medicine, hoje a fórmula de superfície corporal mais usada em oncologia.',
  },

  updatedAt: '2026-07-26',

  references: [
    {
      citation:
        'Mosteller RD. Simplified calculation of body-surface area. N Engl J Med. 1987;317(17):1098.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/3657876/',
      primary: true,
    },
    {
      citation:
        'Du Bois D, Du Bois EF. A formula to estimate the approximate surface area if height and weight be known. 1916. Nutrition. 1989;5(5):303-11; discussion 312-3.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/2520314/',
    },
    {
      citation:
        'Haycock GB, Schwartz GJ, Wisotsky DH. Geometric method for measuring body surface area: a height-weight formula validated in infants, children, and adults. J Pediatr. 1978;93(1):62-6.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/650346/',
    },
    {
      citation:
        'Griggs JJ, Mangu PB, Anderson H, et al. Appropriate chemotherapy dosing for obese adult patients with cancer: American Society of Clinical Oncology clinical practice guideline. J Clin Oncol. 2012;30(13):1553-61.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/22473167/',
    },
  ],
};

export default calculator;
