import type { Calculator, Field, ResultDetail, Values } from '@/lib/types';
import { n, num } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'sodio',
    kind: 'number',
    label: 'Sódio sérico medido',
    unit: 'mEq/L',
    min: 100,
    max: 175,
    step: 1,
    normalRange: '135 a 145 mEq/L',
    hint: 'O valor que o laboratório informou, sem nenhuma correção.',
  },
  {
    id: 'glicemia',
    kind: 'number',
    label: 'Glicemia',
    unit: 'mg/dL',
    min: 40,
    max: 2000,
    step: 1,
    normalRange: '70 a 99 mg/dL em jejum',
    hint: 'Glicemia da mesma amostra do sódio.',
    unitToggle: {
      alt: 'mmol/L',
      toBase: (value) => value * 18,
      fromBase: (value) => value / 18,
    },
  },
];

/** Classificação do sódio corrigido. */
function classificar(sodio: number): {
  label: string;
  severity: 'info' | 'baixo' | 'moderado' | 'alto' | 'critico';
  texto: string;
} {
  if (sodio < 120) {
    return {
      label: 'Hiponatremia grave',
      severity: 'critico',
      texto:
        'Mesmo depois de descontar o efeito da hiperglicemia, o sódio permanece muito baixo. Há hiponatremia verdadeira e grave, com risco de edema cerebral, convulsão e herniação.',
    };
  }
  if (sodio < 130) {
    return {
      label: 'Hiponatremia moderada',
      severity: 'alto',
      texto:
        'Há hiponatremia verdadeira, moderada, independente da hiperglicemia. Ela precisa de investigação etiológica própria e não se resolverá apenas com o controle da glicemia.',
    };
  }
  if (sodio < 135) {
    return {
      label: 'Hiponatremia leve',
      severity: 'moderado',
      texto:
        'Hiponatremia leve remanescente após a correção pela glicemia. Investigue causas próprias de hiponatremia, sem atribuí-la inteiramente à hiperglicemia.',
    };
  }
  if (sodio <= 145) {
    return {
      label: 'Sódio corrigido normal',
      severity: 'baixo',
      texto:
        'O sódio corrigido está na faixa normal: a hiponatremia observada no exame é translocacional, causada pela própria hiperglicemia, e tende a se resolver à medida que a glicemia cai.',
    };
  }
  if (sodio <= 155) {
    return {
      label: 'Hipernatremia',
      severity: 'alto',
      texto:
        'O sódio corrigido está elevado, o que denuncia déficit de água livre mascarado pela hiperglicemia. É o padrão clássico do estado hiperglicêmico hiperosmolar e implica desidratação intracelular importante.',
    };
  }
  return {
    label: 'Hipernatremia grave',
    severity: 'critico',
    texto:
      'Sódio corrigido muito elevado, indicando déficit de água livre acentuado sob a hiperglicemia. Situação de alta mortalidade, típica do estado hiperglicêmico hiperosmolar.',
  };
}

const calculator: Calculator = {
  slug: 'sodio-corrigido',
  title: 'Sódio corrigido pela glicemia',
  shortTitle: 'Sódio corrigido',
  subtitle:
    'Estima qual seria o sódio sérico se a glicemia estivesse normal, separando a hiponatremia translocacional da hiperglicemia de uma hiponatremia verdadeira.',
  specialties: ['Nefrologia', 'Endocrinologia', 'Emergência'],
  kind: 'Fórmula',
  keywords: [
    'sódio corrigido',
    'hiponatremia',
    'hiperglicemia',
    'pseudo-hiponatremia',
    'cetoacidose diabética',
    'CAD',
    'estado hiperglicêmico hiperosmolar',
    'EHH',
    'Katz',
    'Hillier',
    'natremia',
  ],

  whenToUse: [
    'Todo paciente com hiperglicemia significativa (acima de 200 mg/dL, e obrigatoriamente acima de 400 mg/dL) e sódio sérico baixo ou limítrofe.',
    'Cetoacidose diabética e estado hiperglicêmico hiperosmolar, para decidir a composição da solução de reposição e acompanhar o déficit de água livre.',
    'Não é a ferramenta para pseudo-hiponatremia por hipertrigliceridemia ou hiperproteinemia: esse é um artefato de método laboratorial e não se corrige com fórmula alguma.',
    'Não se aplica quando a glicemia está normal: nesse caso o sódio medido já é o sódio verdadeiro.',
  ],

  whyUse:
    'Sem a correção, a hiponatremia da hiperglicemia pode ser tratada como se fosse hiponatremia hipotônica: com restrição hídrica ou salina hipertônica, , quando na verdade o paciente tem tonicidade elevada e precisa de água. A correção também revela o déficit de água livre escondido no estado hiperglicêmico hiperosmolar, em que o sódio medido parece normal e o corrigido está francamente alto.',

  pearls: [
    'Chamar isso de "pseudo-hiponatremia" é impreciso. A hiponatremia da hiperglicemia é real e translocacional: a glicose puxa água do intracelular e dilui o sódio, com tonicidade normal ou alta. Pseudo-hiponatremia de verdade é o artefato de medida causado por hipertrigliceridemia ou hiperproteinemia graves em aparelhos com eletrodo íon-seletivo indireto: nesse caso a tonicidade é normal e o sódio "verdadeiro" só aparece na medida direta.',
    'O fator 1,6 de Katz (1973) vem de um cálculo teórico de deslocamento de água, não de dados de pacientes. O fator 2,4 de Hillier (1999) foi obtido experimentalmente em apenas seis voluntários saudáveis com hiperglicemia induzida, e os próprios autores mostraram que a relação não é linear: acima de 400 mg/dL de glicemia o fator aproximado sobe para cerca de 4,0.',
    'Use o sódio corrigido para entender a fisiologia e escolher a solução, mas monitore o sódio MEDIDO durante o tratamento. Ele deve subir cerca de 1,6 a 2,4 mEq/L a cada 100 mg/dL de queda da glicemia; se não subir, há excesso de água livre sendo administrado e risco de edema cerebral, sobretudo em crianças e adolescentes com cetoacidose.',
    'Nunca indique salina hipertônica com base no sódio medido de um paciente hiperglicêmico. A tonicidade dele já está alta: o risco é de desidratação cerebral, não de edema por hipotonicidade.',
    'A hiperglicemia também causa diurese osmótica, com perda de água maior que a de sódio. Por isso, no estado hiperglicêmico hiperosmolar, o sódio corrigido frequentemente aparece acima de 150 mEq/L mesmo com o sódio medido normal.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const sodio = n(values, 'sodio');
    const glicemia = n(values, 'glicemia');

    // A correção só se aplica ao excesso de glicose acima de 100 mg/dL.
    const excesso = Math.max(0, glicemia - 100) / 100;
    const katz = sodio + 1.6 * excesso;
    const hillier = sodio + 2.4 * excesso;

    // Tonicidade (osmolalidade efetiva) usa o sódio MEDIDO, não o corrigido.
    const tonicidade = 2 * sodio + glicemia / 18;

    const { label, severity, texto } = classificar(katz);

    const details: ResultDetail[] = [
      {
        label: 'Sódio corrigido: fator 1,6 (Katz, 1973)',
        value: `${num(katz, 1)} mEq/L`,
        hint: 'Fator clássico, usado na maioria dos protocolos e livros-texto. É o valor exibido em destaque.',
      },
      {
        label: 'Sódio corrigido: fator 2,4 (Hillier, 1999)',
        value: `${num(hillier, 1)} mEq/L`,
        hint: 'Fator derivado experimentalmente, provavelmente mais fiel. Prefira-o quando a glicemia ultrapassa 400 mg/dL, situação em que a relação deixa de ser linear.',
      },
      {
        label: 'Queda de sódio atribuível à hiperglicemia',
        value: `${num(1.6 * excesso, 1)} a ${num(2.4 * excesso, 1)} mEq/L`,
      },
      {
        label: 'Osmolalidade efetiva (tonicidade)',
        value: `${num(tonicidade, 0)} mOsm/kg`,
        hint: '2 × sódio medido + glicemia/18. Faixa normal de 275 a 295 mOsm/kg. Acima de 320 mOsm/kg define o estado hiperglicêmico hiperosmolar quando há rebaixamento do sensório.',
      },
    ];

    let interpretation: string;
    let nextSteps: string;

    if (glicemia <= 110) {
      interpretation =
        'A glicemia está praticamente normal, então não há correção a fazer: o sódio medido já é o sódio verdadeiro. Interprete-o como qualquer outro sódio e investigue a natremia pelos critérios habituais.';
      nextSteps =
        'Se houver hiponatremia, siga a investigação padrão: osmolalidade sérica, osmolalidade e sódio urinários e avaliação do volume extracelular.';
    } else {
      interpretation = `${texto}\n\nO sódio medido é de ${num(sodio, 0)} mEq/L com glicemia de ${num(glicemia, 0)} mg/dL. Descontando o efeito osmótico da glicose, o sódio corrigido fica em ${num(katz, 1)} mEq/L pelo fator clássico de 1,6 e em ${num(hillier, 1)} mEq/L pelo fator de 2,4 de Hillier.`;

      if (katz > 145) {
        nextSteps =
          'Trate o déficit de água livre: após a expansão inicial com cristaloide isotônico para restaurar a perfusão, prossiga com solução hipotônica (salina a 0,45%) conforme o protocolo de cetoacidose ou de estado hiperglicêmico hiperosmolar.\nCorrija a hipertonicidade devagar, no máximo 10 a 12 mEq/L de sódio em 24 horas, para evitar edema cerebral.\nMonitore glicemia, sódio medido e potássio a cada 2 a 4 horas.';
      } else if (katz < 135) {
        nextSteps =
          'Há hiponatremia verdadeira além da hiperglicemia: investigue-a com osmolalidade sérica, sódio e osmolalidade urinários e avaliação clínica do volume extracelular.\nCorrija a hiperglicemia conforme o protocolo e acompanhe o sódio medido, que deve subir de 1,6 a 2,4 mEq/L a cada 100 mg/dL de queda da glicemia.\nEvite correção do sódio acima de 8 a 10 mEq/L em 24 horas pelo risco de síndrome de desmielinização osmótica.';
      } else {
        nextSteps =
          'A hiponatremia observada é explicada pela hiperglicemia e deve se resolver com o tratamento dela: não indique restrição hídrica nem salina hipertônica.\nMantenha a reposição volêmica e a insulinoterapia conforme o protocolo e monitore o sódio medido a cada 2 a 4 horas.\nSe o sódio medido não subir enquanto a glicemia cai, reveja a quantidade de água livre infundida.';
      }
    }

    return {
      value: num(katz, 1),
      unit: 'mEq/L',
      label: glicemia <= 110 ? 'Sem correção aplicável' : label,
      severity: glicemia <= 110 ? 'info' : severity,
      interpretation,
      details,
      nextSteps,
    };
  },

  formula: `Fator clássico (Katz, 1973):
Sódio corrigido = sódio medido + 1,6 × (glicemia − 100) ÷ 100

Fator de Hillier (1999):
Sódio corrigido = sódio medido + 2,4 × (glicemia − 100) ÷ 100

Glicemia em mg/dL. A correção só se aplica ao excesso acima de 100 mg/dL.

Osmolalidade efetiva (tonicidade) = 2 × sódio medido + glicemia ÷ 18`,

  evidence:
    'Em 1973, Michael Katz publicou no New England Journal of Medicine um cálculo teórico do deslocamento de água entre os compartimentos intra e extracelular provocado pela hiperglicemia, chegando a uma queda esperada de 1,6 mEq/L de sódio para cada 100 mg/dL de glicose acima do normal. Em 1999, Hillier, Abbott e Barrett testaram experimentalmente essa relação: em seis voluntários saudáveis submetidos a hiperglicemia induzida por infusão de glicose com somatostatina, a queda média observada foi de 2,4 mEq/L por 100 mg/dL, e a relação mostrou-se não linear, com fator aproximado de 4,0 quando a glicemia ultrapassava 400 mg/dL. Nenhum dos dois estudos foi feito em pacientes com cetoacidose diabética ou estado hiperglicêmico hiperosmolar, o que limita a exatidão dos dois fatores exatamente na população em que eles são mais usados. Por isso os dois valores são apresentados lado a lado.',

  creator: {
    name: 'Michael A. Katz e Teresa A. Hillier',
    bio: 'Katz derivou o fator 1,6 em 1973 a partir do cálculo dos deslocamentos de água entre compartimentos; Hillier e colaboradores mediram experimentalmente o fator 2,4 em 1999.',
  },

  updatedAt: '2026-07-26',

  references: [
    {
      citation:
        'Katz MA. Hyperglycemia-induced hyponatremia: calculation of expected serum sodium depression. N Engl J Med. 1973;289(16):843-4.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/4763428/',
      primary: true,
    },
    {
      citation:
        'Hillier TA, Abbott RD, Barrett EJ. Hyponatremia: evaluating the correction factor for hyperglycemia. Am J Med. 1999;106(4):399-403.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/10225241/',
    },
    {
      citation: 'Adrogué HJ, Madias NE. Hyponatremia. N Engl J Med. 2000;342(21):1581-9.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/10824078/',
    },
  ],
};

export default calculator;
