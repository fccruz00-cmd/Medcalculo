import type { Calculator, Field, Values } from '@/lib/types';
import { n, num } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'sexo',
    kind: 'choice',
    label: 'Sexo',
    hint: 'A fórmula de Devine usa bases diferentes para homens (50 kg) e mulheres (45,5 kg).',
    options: [
      { label: 'Masculino', value: 'M' },
      { label: 'Feminino', value: 'F' },
    ],
  },
  {
    id: 'altura',
    kind: 'number',
    label: 'Altura',
    unit: 'cm',
    min: 130,
    max: 220,
    step: 0.5,
    placeholder: '170',
    hint: 'Meça a altura com estadiômetro. Altura referida costuma ser superestimada, e o erro passa direto para o volume corrente.',
    unitToggle: {
      alt: 'm',
      toBase: (value) => value * 100,
      fromBase: (value) => value / 100,
    },
  },
  {
    id: 'peso',
    kind: 'number',
    label: 'Peso atual',
    unit: 'kg',
    min: 20,
    max: 400,
    step: 0.1,
    placeholder: '80',
    hint: 'Peso aferido. Necessário apenas para o peso ajustado e para o percentual do peso ideal.',
  },
];

const calculator: Calculator = {
  slug: 'peso-ideal',
  title: 'Peso ideal e peso ajustado',
  shortTitle: 'Peso ideal',
  subtitle:
    'Calcula o peso ideal pela fórmula de Devine, o peso predito para ventilação protetora e o peso ajustado usado no cálculo de doses.',
  specialties: ['Clínica Médica', 'Terapia Intensiva'],
  kind: 'Fórmula',
  keywords: [
    'peso ideal',
    'peso predito',
    'peso ajustado',
    'Devine',
    'IBW',
    'PBW',
    'ARDSNet',
    'volume corrente',
    'ventilação protetora',
    'ajuste de dose',
    'aminoglicosídeo',
  ],

  whenToUse: [
    'Ajuste de dose de fármacos cuja bula se baseia em peso ideal ou peso ajustado: aminoglicosídeos, digoxina, teofilina, alguns antifúngicos e quimioterápicos.',
    'Programação do volume corrente na ventilação mecânica: a estratégia protetora usa 6 mL/kg de peso predito pela altura.',
    'Avaliação nutricional, como referência para o percentual de adequação do peso.',
    'Não se aplica a menores de 18 anos, a gestantes, nem a pacientes com amputação de membro sem correção do segmento ausente. Em pessoas com menos de 152,4 cm de altura a fórmula extrapola abaixo do intervalo em que foi construída.',
  ],

  whyUse:
    'A fórmula de Devine virou o padrão de fato em farmacologia clínica e em terapia intensiva. Em ventilação mecânica, o peso predito derivado dela é o único denominador aceitável para programar o volume corrente: usar o peso real leva a hiperdistensão alveolar em pacientes com obesidade, já que o pulmão não cresce com a gordura corporal.',

  pearls: [
    'Na ventilação protetora, o volume corrente é calculado sobre o peso predito pela altura e pelo sexo: nunca sobre o peso real nem sobre o peso ajustado. Um paciente de 1,60 m com 140 kg recebe o mesmo volume corrente de outro de 1,60 m com 55 kg, porque o tamanho do pulmão depende da altura, não da adiposidade.',
    'A altura precisa ser medida, e não estimada de olho ou perguntada à família. Erro de 10 cm na altura muda o peso predito em cerca de 9 kg e o volume corrente em mais de 50 mL por ciclo: o suficiente para sair da faixa protetora.',
    'O peso ajustado (ideal + 0,4 × [atual − ideal]) só faz sentido quando o peso atual é maior que o ideal. Se o paciente está abaixo do peso ideal, use o peso real.',
    'O fator 0,4 do peso ajustado é uma convenção derivada de estudos com aminoglicosídeos; outros fármacos usam fatores diferentes (0,3 para alguns protocolos) ou simplesmente peso real. Sempre confira a referência do fármaco em questão em vez de aplicar 0,4 para tudo.',
    'Nem todo fármaco usa peso ideal. Heparinas de baixo peso molecular, propofol em indução e succinilcolina usam peso real; digoxina e aminoglicosídeos usam peso ideal ou ajustado; a enoxaparina em profilaxia tem esquemas específicos para obesidade.',
    'A fórmula de Devine nunca foi derivada de uma coorte epidemiológica: nasceu em 1974 como regra prática para calcular dose de gentamicina, sem validação formal contra composição corporal. Robinson, Miller e Hamwi propuseram equações concorrentes que dão resultados diferentes para a mesma altura.',
    'Peso ideal não é meta de emagrecimento. Para orientação nutricional, use as faixas de IMC, que já consideram a variabilidade de compleição.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const feminino = values.sexo === 'F';
    const alturaCm = n(values, 'altura');
    const pesoAtual = n(values, 'peso');

    if (alturaCm <= 0) {
      return {
        value: '-',
        severity: 'info' as const,
        interpretation: 'Informe uma altura válida para calcular o peso ideal.',
      };
    }

    const base = feminino ? 45.5 : 50;
    const polegadasAcimaDe5Pes = (alturaCm - 152.4) / 2.54;

    // Devine (1974): base + 2,3 kg por polegada acima de 152,4 cm.
    const idealBruto = base + 2.3 * polegadasAcimaDe5Pes;
    // Peso predito do protocolo ARDSNet: base + 0,91 kg por centímetro acima de 152,4 cm.
    const preditoBruto = base + 0.91 * (alturaCm - 152.4);

    const ideal = Math.max(idealBruto, 0);
    const predito = Math.max(preditoBruto, 0);

    if (!Number.isFinite(ideal) || ideal <= 0 || !Number.isFinite(predito) || predito <= 0) {
      return {
        value: '-',
        severity: 'info' as const,
        interpretation:
          'A fórmula de Devine não produz um valor utilizável nessa altura. Ela foi construída a partir de 152,4 cm (5 pés) e extrapola mal em estaturas muito baixas.',
      };
    }

    const excesso = pesoAtual - ideal;
    const ajustado = excesso > 0 ? ideal + 0.4 * excesso : pesoAtual;
    const percentualIdeal = (pesoAtual / ideal) * 100;

    const details = [
      {
        label: 'Peso predito (ARDSNet)',
        value: `${num(predito, 1)} kg`,
        hint: 'Denominador do volume corrente na ventilação mecânica',
      },
      {
        label: 'Volume corrente a 6 mL/kg',
        value: `${num(predito * 6, 0)} mL`,
        hint: 'Alvo da ventilação protetora',
      },
      {
        label: 'Faixa de volume corrente (4 a 8 mL/kg)',
        value: `${num(predito * 4, 0)} a ${num(predito * 8, 0)} mL`,
        hint: 'Protocolo ARDSNet: iniciar em 8 e reduzir para 6 mL/kg em até 4 horas',
      },
      {
        label: 'Peso ajustado',
        value: `${num(ajustado, 1)} kg`,
        hint:
          excesso > 0
            ? 'Peso ideal + 0,4 × (peso atual − peso ideal)'
            : 'Peso atual está abaixo do ideal: use o peso real',
      },
      {
        label: 'Percentual do peso ideal',
        value: `${num(percentualIdeal, 0)}%`,
        hint: 'Peso atual ÷ peso ideal',
      },
    ];

    let interpretation =
      `Peso ideal de ${num(ideal, 1)} kg pela fórmula de Devine e peso predito de ${num(predito, 1)} kg pela equação do protocolo ARDSNet. ` +
      `Para ventilação protetora, programe volume corrente de ${num(predito * 6, 0)} mL (6 mL/kg de peso predito).`;

    if (excesso > 0) {
      interpretation +=
        `\n\nO peso atual está ${num(excesso, 1)} kg acima do peso ideal. ` +
        `O peso ajustado de ${num(ajustado, 1)} kg é o que se usa para dose de aminoglicosídeos e de outros fármacos com distribuição parcial no tecido adiposo.`;
    } else {
      interpretation +=
        '\n\nO peso atual é igual ou inferior ao peso ideal, de modo que o peso ajustado não se aplica: use o peso real para o cálculo de dose.';
    }

    if (alturaCm < 152.4) {
      interpretation +=
        '\n\nAtenção: com altura abaixo de 152,4 cm a fórmula de Devine extrapola para fora do intervalo em que foi construída e tende a subestimar o peso ideal. Interprete com cautela e prefira o julgamento clínico no ajuste de dose.';
    }

    return {
      value: num(ideal, 1),
      unit: 'kg',
      label: 'Peso ideal (Devine)',
      severity: 'info' as const,
      interpretation,
      details,
      nextSteps:
        'Confirme a altura medida antes de programar o ventilador: é ela, e não o peso na balança, que define o volume corrente protetor.\nAo prescrever fármaco por peso, verifique na referência do medicamento qual peso usar: real, ideal ou ajustado.',
    };
  },

  formula: `Peso ideal - fórmula de Devine (1974):
Homens: 50,0 kg + 2,3 kg por polegada acima de 152,4 cm
Mulheres: 45,5 kg + 2,3 kg por polegada acima de 152,4 cm
Em centímetros: peso ideal = base + 2,3 × (altura − 152,4) ÷ 2,54

Peso predito - equação do protocolo ARDSNet:
Homens: 50,0 + 0,91 × (altura em cm − 152,4)
Mulheres: 45,5 + 0,91 × (altura em cm − 152,4)

Peso ajustado:
Peso ajustado = peso ideal + 0,4 × (peso atual − peso ideal)

Volume corrente protetor = 6 mL/kg de peso predito`,

  evidence:
    'A equação de Devine foi publicada em 1974 como regra prática para o cálculo da dose de gentamicina, sem coorte de derivação nem validação contra medidas de composição corporal: uma origem revisada em detalhe por Pai e Paloucek em 2000, que mostraram que as equações de peso ideal de Devine, Robinson, Miller e Hamwi são convenções construídas sobre tabelas de seguradoras, e não sobre dados fisiológicos. Apesar disso, o peso predito derivado dessa mesma lógica é o denominador usado no ensaio ARMA do ARDSNet, publicado em 2000, que randomizou 861 pacientes com lesão pulmonar aguda para volume corrente de 6 mL/kg contra 12 mL/kg de peso predito e foi interrompido precocemente por benefício: mortalidade hospitalar de 31,0% no grupo de baixo volume contra 39,8% no grupo tradicional. É desse ensaio que vem a prática atual de calcular o volume corrente sobre a altura e o sexo, e não sobre o peso real.',

  creator: {
    name: 'B. J. Devine',
    bio: 'Farmacêutico norte-americano que propôs a equação em 1974, em um artigo sobre a dose de gentamicina, para separar o peso magro do peso total no ajuste de antibióticos.',
  },

  references: [
    {
      citation:
        'Devine BJ. Gentamicin therapy. Drug Intell Clin Pharm. 1974;8(11):650-5.',
      primary: true,
    },
    {
      citation:
        'Pai MP, Paloucek FP. The origin of the "ideal" body weight equations. Ann Pharmacother. 2000;34(9):1066-9.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/10981254/',
    },
    {
      citation:
        'The Acute Respiratory Distress Syndrome Network. Ventilation with lower tidal volumes as compared with traditional tidal volumes for acute lung injury and the acute respiratory distress syndrome. N Engl J Med. 2000;342(18):1301-8.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/10793162/',
    },
  ],
};

export default calculator;
