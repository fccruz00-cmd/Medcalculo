import type { Calculator, Field, Values } from '@/lib/types';
import { n, num } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'calcio',
    kind: 'number',
    label: 'Cálcio total sérico',
    unit: 'mg/dL',
    min: 3,
    max: 20,
    step: 0.1,
    placeholder: '8,2',
    normalRange: '8,5 a 10,5 mg/dL',
    hint: 'Cálcio total, não iônico. Para converter de mmol/L, multiplique por 4 (1 mmol/L ≈ 4,0 mg/dL).',
    unitToggle: {
      alt: 'mmol/L',
      toBase: (value) => value * 4.008,
      fromBase: (value) => value / 4.008,
    },
  },
  {
    id: 'albumina',
    kind: 'number',
    label: 'Albumina sérica',
    unit: 'g/dL',
    min: 0.5,
    max: 6,
    step: 0.1,
    placeholder: '2,5',
    normalRange: '3,5 a 5,0 g/dL',
    hint: 'Colhida na mesma amostra do cálcio. Para converter de g/L, divida por 10 (35 g/L = 3,5 g/dL).',
    unitToggle: {
      alt: 'g/L',
      toBase: (value) => value / 10,
      fromBase: (value) => value * 10,
    },
  },
];

interface Faixa {
  label: string;
  severity: 'baixo' | 'moderado' | 'alto' | 'critico';
  interpretation: string;
  nextSteps: string;
}

function classificar(ca: number): Faixa {
  if (ca < 7) {
    return {
      label: 'Hipocalcemia grave',
      severity: 'critico',
      interpretation:
        'Hipocalcemia grave (cálcio corrigido abaixo de 7,0 mg/dL). Risco de tetania, laringoespasmo, convulsão e prolongamento do intervalo QT com arritmia ventricular.',
      nextSteps:
        'Confirme com cálcio iônico e faça eletrocardiograma para avaliar o intervalo QT.\nSe houver sintomas (parestesias, tetania, Chvostek ou Trousseau positivos, convulsão, arritmia), reponha cálcio endovenoso: gluconato de cálcio 10% diluído, em acesso seguro, com monitorização cardíaca.\nDose magnésio: a hipomagnesemia causa hipocalcemia refratária e precisa ser corrigida antes.\nSolicite fósforo, PTH, 25-OH-vitamina D, função renal e revise histórico de tireoidectomia ou paratireoidectomia.',
    };
  }
  if (ca < 8) {
    return {
      label: 'Hipocalcemia moderada',
      severity: 'alto',
      interpretation:
        'Hipocalcemia moderada (cálcio corrigido entre 7,0 e 7,9 mg/dL). Pode cursar com parestesias periorais e de extremidades, câimbras e irritabilidade neuromuscular.',
      nextSteps:
        'Confirme com cálcio iônico e pesquise sinais de Chvostek e de Trousseau.\nInvestigue a causa: hipoparatireoidismo pós-cirúrgico, deficiência de vitamina D, doença renal crônica, hipomagnesemia, pancreatite aguda, rabdomiólise e síndrome de lise tumoral.\nCorrija o magnésio e inicie reposição de cálcio, por via oral se assintomático.',
    };
  }
  if (ca < 8.5) {
    return {
      label: 'Hipocalcemia leve',
      severity: 'moderado',
      interpretation:
        'Hipocalcemia leve (cálcio corrigido entre 8,0 e 8,4 mg/dL). Costuma ser assintomática.',
      nextSteps:
        'Repita o exame com cálcio iônico e dose magnésio, fósforo, PTH, 25-OH-vitamina D e creatinina.\nRevise medicamentos que reduzem o cálcio: bisfosfonatos, denosumabe, inibidores de bomba de prótons associados a má absorção, foscarnete, cinacalcete e transfusão maciça com citrato.',
    };
  }
  if (ca <= 10.5) {
    return {
      label: 'Cálcio normal',
      severity: 'baixo',
      interpretation:
        'Cálcio corrigido dentro da faixa de referência (8,5 a 10,5 mg/dL). Se o cálcio total medido estava baixo, a redução é atribuível à hipoalbuminemia e não a distúrbio verdadeiro do metabolismo do cálcio.',
      nextSteps:
        'Nenhuma conduta específica quanto ao cálcio.\nInvestigue a causa da hipoalbuminemia quando presente: desnutrição, síndrome nefrótica, hepatopatia, enteropatia perdedora de proteína ou inflamação sistêmica.',
    };
  }
  if (ca < 12) {
    return {
      label: 'Hipercalcemia leve',
      severity: 'moderado',
      interpretation:
        'Hipercalcemia leve (cálcio corrigido entre 10,6 e 11,9 mg/dL). Em geral assintomática e descoberta em exame de rotina. A causa mais frequente no ambulatório é o hiperparatireoidismo primário.',
      nextSteps:
        'Confirme com nova dosagem e cálcio iônico. Solicite PTH: PTH elevado ou inapropriadamente normal aponta hiperparatireoidismo primário; PTH suprimido obriga a investigar neoplasia, com PTHrP, 25-OH e 1,25-di-hidroxivitamina D, eletroforese de proteínas e imagem.\nRevise medicamentos: tiazídicos, lítio, vitamina D e carbonato de cálcio em excesso.\nOriente hidratação adequada e evite depleção de volume.',
    };
  }
  if (ca < 14) {
    return {
      label: 'Hipercalcemia moderada',
      severity: 'alto',
      interpretation:
        'Hipercalcemia moderada (cálcio corrigido entre 12,0 e 13,9 mg/dL). Costuma haver poliúria, desidratação, constipação, náusea e alteração do estado mental.',
      nextSteps:
        'Inicie hidratação com soro fisiológico e reavalie a volemia com frequência.\nDose PTH para separar hipercalcemia mediada por paratormônio da hipercalcemia da malignidade.\nConsidere bisfosfonato endovenoso (ácido zoledrônico) quando a causa for neoplásica, lembrando que o efeito máximo só ocorre em 2 a 4 dias.\nSuspenda cálcio, vitamina D, tiazídico e lítio.',
    };
  }
  return {
    label: 'Hipercalcemia grave',
    severity: 'critico',
    interpretation:
      'Hipercalcemia grave (cálcio corrigido de 14,0 mg/dL ou mais), com risco de rebaixamento do nível de consciência, coma, lesão renal aguda e arritmia. É uma emergência metabólica.',
    nextSteps:
      'Hidratação vigorosa com soro fisiológico, monitorização e correção de distúrbios eletrolíticos associados.\nAssocie bisfosfonato endovenoso e considere calcitonina nas primeiras 24 a 48 horas para queda rápida do cálcio, enquanto o bisfosfonato não age.\nDiálise está indicada em insuficiência renal, insuficiência cardíaca ou hipercalcemia refratária.\nDiuréticos de alça não devem ser usados para tratar a hipercalcemia: reserve-os para sobrecarga volêmica.',
  };
}

const calculator: Calculator = {
  slug: 'calcio-corrigido',
  title: 'Cálcio corrigido pela albumina',
  shortTitle: 'Cálcio corrigido',
  subtitle:
    'Corrige o cálcio total sérico pela albumina, evitando o diagnóstico falso de hipocalcemia em pacientes hipoalbuminêmicos.',
  specialties: ['Endocrinologia', 'Nefrologia', 'Clínica Médica'],
  kind: 'Fórmula',
  popular: true,
  keywords: [
    'cálcio corrigido',
    'cálcio ajustado',
    'hipocalcemia',
    'hipercalcemia',
    'albumina',
    'hipoalbuminemia',
    'Payne',
    'cálcio iônico',
  ],

  whenToUse: [
    'Interpretação do cálcio total em pacientes com hipoalbuminemia: desnutrição, cirrose, síndrome nefrótica, sepse, internação prolongada.',
    'Triagem de hipercalcemia da malignidade, em que a albumina costuma estar baixa e o cálcio total subestima o cálcio biologicamente ativo.',
    'Quando o cálcio iônico não está disponível ou a coleta adequada (anaeróbia, com processamento rápido) não é viável.',
    'Não substitui o cálcio iônico em pacientes críticos, em doença renal crônica avançada, em transfusão maciça, em circulação extracorpórea nem em distúrbios do equilíbrio ácido-base: nesses cenários dose o cálcio iônico.',
  ],

  whyUse:
    'Cerca de 40% a 45% do cálcio circulante está ligado a proteínas, principalmente à albumina. Sem a correção, quase todo paciente internado com albumina baixa parece ter hipocalcemia, e o cálcio total normal em um paciente com albumina de 2,0 g/dL pode esconder hipercalcemia verdadeira: situação clássica na neoplasia avançada.',

  pearls: [
    'A correção é uma estimativa grosseira. Ladenson e colaboradores testaram treze algoritmos de correção contra o cálcio iônico medido e nenhum deles classificou o estado do cálcio melhor do que o valor total sem correção. Sempre que a decisão clínica depender do resultado, peça o cálcio iônico.',
    'Em doença renal crônica a fórmula tem desempenho especialmente ruim: superestima a prevalência de hipercalcemia e classifica mal os pacientes em relação ao cálcio iônico, entre outros motivos pela acidose metabólica e pela elevação de outras proteínas ligantes. O KDIGO recomenda basear as decisões sobre distúrbio mineral e ósseo no cálcio iônico ou no cálcio total sem correção, e não no corrigido.',
    'A fórmula não capta o efeito do pH. Alcalose aguda, hiperventilação, vômitos, bicarbonato, aumenta a ligação do cálcio à albumina e reduz o cálcio iônico sem alterar o cálcio total: o paciente pode ter tetania com cálcio total e corrigido normais.',
    'Com albumina abaixo de 2,0 g/dL a extrapolação linear perde acurácia, justamente onde a correção seria mais necessária.',
    'A equação de Payne foi derivada em um único laboratório britânico, a partir de 200 amostras e com um método específico de dosagem de albumina (verde de bromocresol). O coeficiente de 0,8 mg/dL por g/dL usado hoje é uma convenção que herda essa limitação: não é universal, e laboratórios que usam púrpura de bromocresol dão valores de albumina sistematicamente menores, exagerando a correção.',
    'Mieloma múltiplo é armadilha dupla: a paraproteína pode ligar cálcio e elevar o cálcio total sem hipercalcemia verdadeira, ao mesmo tempo em que a doença causa hipercalcemia real por lesão óssea. Nesses pacientes, o cálcio iônico é obrigatório.',
    'Garrote prolongado e punção difícil hemoconcentram a amostra e elevam falsamente albumina e cálcio. Amostra colhida em tubo com EDTA ou citrato quela o cálcio e produz hipocalcemia artefatual grave.',
    'Hipocalcemia refratária quase sempre é hipomagnesemia não corrigida: o magnésio baixo bloqueia a secreção e a ação do PTH.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const calcio = n(values, 'calcio');
    const albumina = n(values, 'albumina');

    if (calcio <= 0 || albumina <= 0) {
      return {
        value: '-',
        severity: 'info' as const,
        interpretation: 'Informe valores válidos de cálcio total e de albumina.',
      };
    }

    const corrigido = calcio + 0.8 * (4 - albumina);
    const ajuste = corrigido - calcio;

    if (!Number.isFinite(corrigido)) {
      return {
        value: '-',
        severity: 'info' as const,
        interpretation: 'Não foi possível calcular o cálcio corrigido com os valores informados.',
      };
    }

    const faixa = classificar(corrigido);

    let interpretation = faixa.interpretation;

    if (albumina < 2) {
      interpretation +=
        '\n\nAtenção: com albumina abaixo de 2,0 g/dL a correção linear de Payne perde acurácia. Solicite cálcio iônico antes de tomar qualquer decisão terapêutica.';
    } else if (albumina >= 3.5 && albumina <= 5) {
      interpretation +=
        '\n\nA albumina está dentro da faixa de referência, de modo que a correção altera pouco o resultado: o cálcio total já era representativo.';
    }

    return {
      value: num(corrigido, 1),
      unit: 'mg/dL',
      label: faixa.label,
      severity: faixa.severity,
      interpretation,
      details: [
        {
          label: 'Cálcio total medido',
          value: `${num(calcio, 1)} mg/dL`,
          hint: 'Valor bruto do laboratório',
        },
        {
          label: 'Ajuste aplicado',
          value: `${ajuste >= 0 ? '+' : '−'}${num(Math.abs(ajuste), 1)} mg/dL`,
          hint: '0,8 × (4,0 − albumina)',
        },
        {
          label: 'Cálcio corrigido em mmol/L',
          value: `${num(corrigido / 4.008, 2)} mmol/L`,
          hint: 'Unidade usada na literatura internacional',
        },
        {
          label: 'Faixa de referência',
          value: '8,5 a 10,5 mg/dL',
          hint: 'Cálcio iônico de referência: 4,6 a 5,3 mg/dL (1,15 a 1,33 mmol/L)',
        },
      ],
      nextSteps: faixa.nextSteps,
    };
  },

  formula: `Cálcio corrigido (mg/dL) = cálcio total (mg/dL) + 0,8 × [4,0 − albumina (g/dL)]

Mesma equação em unidades do SI (convenção de 0,02 mmol/L por g/L):
Cálcio corrigido (mmol/L) = cálcio total (mmol/L) + 0,02 × [40 − albumina (g/L)]

A equação publicada por Payne em 1973 era mais inclinada:
cálcio ajustado = cálcio − albumina + 4,0 (cálcio em mg/100 mL, albumina em
g/100 mL), ou seja, 1,0 mg/dL por g/dL (≈ 0,025 mmol/L por g/L). O fator 0,8
usado aqui é a convenção corrente, adotada depois e mais difundida na prática.

Conversões:
Cálcio: 1 mmol/L ≈ 4,0 mg/dL
Albumina: 1 g/dL = 10 g/L

Faixas do cálcio corrigido:
< 7,0 hipocalcemia grave · 7,0 a 7,9 moderada · 8,0 a 8,4 leve
8,5 a 10,5 normal
10,6 a 11,9 hipercalcemia leve · 12,0 a 13,9 moderada · ≥ 14,0 grave`,

  evidence:
    'A fórmula vem do trabalho de Payne e colaboradores publicado no British Medical Journal em 1973, que analisou 200 amostras consecutivas com ampla variação das proteínas séricas e derivou por regressão a correção do cálcio total em função da albumina e das proteínas totais, com o objetivo de reduzir a classificação errada de pacientes com proteínas séricas anormais. Cinco anos depois, Ladenson e colaboradores compararam treze algoritmos de correção contra o cálcio iônico medido diretamente em 459 amostras e concluíram que nenhum deles avaliava adequadamente o cálcio livre, resultado repetido por estudos posteriores. Na coorte NephroTest, de pacientes com doença renal crônica, Gauci e colaboradores mostraram que o cálcio corrigido pela albumina classificava incorretamente o estado do cálcio em uma proporção relevante dos pacientes, com tendência a superestimar a hipercalcemia. A conclusão prática é consistente: a correção é útil como triagem à beira do leito, mas o cálcio iônico é o exame de referência.',

  creator: {
    name: 'R. B. Payne',
    bio: 'Bioquímico clínico britânico da Universidade de Leeds, autor do estudo de 1973 que derivou a correção do cálcio pela albumina.',
  },

  references: [
    {
      citation:
        'Payne RB, Little AJ, Williams RB, Milner JR. Interpretation of serum calcium in patients with abnormal serum proteins. Br Med J. 1973;4(5893):643-6.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/4758544/',
      primary: true,
    },
    {
      citation:
        'Ladenson JH, Lewis JW, Boyd JC. Failure of total calcium corrected for protein, albumin, and pH to correctly assess free calcium status. J Clin Endocrinol Metab. 1978;46(6):986-93.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/45478/',
    },
    {
      citation:
        'Gauci C, Moranne O, Fouqueray B, et al. Pitfalls of measuring total blood calcium in patients with CKD. J Am Soc Nephrol. 2008;19(8):1592-8.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/18400941/',
    },
    {
      citation:
        'El-Hajj Fuleihan G, Clines GA, Hu MI, et al. Treatment of hypercalcemia of malignancy in adults: an Endocrine Society clinical practice guideline. J Clin Endocrinol Metab. 2023;108(3):507-28.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/36545746/',
    },
  ],
};

export default calculator;
