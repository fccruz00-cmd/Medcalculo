import type { Calculator, Field, Values } from '@/lib/types';
import { n } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'modo',
    kind: 'choice',
    label: 'Como você quer informar a datação?',
    layout: 'stack',
    options: [
      {
        label: 'Pela DUM: dias decorridos desde a última menstruação',
        value: 'dum',
        hint: 'Regra de Naegele.',
      },
      {
        label: 'Por uma idade gestacional já conhecida (semanas e dias)',
        value: 'ig',
        hint: 'Use quando a datação vier do ultrassom de primeiro trimestre.',
      },
    ],
  },
  {
    id: 'diasDum',
    kind: 'number',
    label: 'Dias decorridos desde o primeiro dia da última menstruação',
    unit: 'dias',
    min: 0,
    max: 320,
    step: 1,
    placeholder: 'Ex.: 168',
    hint: 'Conte do primeiro dia do sangramento da DUM até hoje. Referências úteis: 70 dias = 10 semanas · 140 dias = 20 semanas · 280 dias = 40 semanas.',
    showIf: (values) => values.modo === 'dum',
  },
  {
    id: 'ciclo',
    kind: 'number',
    label: 'Duração habitual do ciclo menstrual',
    unit: 'dias',
    min: 20,
    max: 45,
    step: 1,
    optional: true,
    normalRange: '28 dias',
    hint: 'Deixe em branco para assumir 28 dias. Ciclos mais longos atrasam a ovulação e reduzem a idade gestacional real (correção de Naegele modificada).',
    showIf: (values) => values.modo === 'dum',
  },
  {
    id: 'semanas',
    kind: 'number',
    label: 'Idade gestacional conhecida: semanas completas',
    unit: 'semanas',
    min: 0,
    max: 44,
    step: 1,
    placeholder: 'Ex.: 24',
    showIf: (values) => values.modo === 'ig',
  },
  {
    id: 'dias',
    kind: 'number',
    label: 'Idade gestacional conhecida: dias adicionais',
    unit: 'dias',
    min: 0,
    max: 6,
    step: 1,
    placeholder: 'Ex.: 3',
    hint: 'De 0 a 6 dias. Uma idade gestacional de 24s3d corresponde a 24 semanas e 3 dias.',
    showIf: (values) => values.modo === 'ig',
  },
];

/** Marcos em dias de gestação, contados a partir da DUM. */
const DIAS_DPP = 280; // 40 semanas exatas

interface Faixa {
  rotulo: string;
  severity: 'info' | 'baixo' | 'moderado' | 'alto';
  interpretacao: string;
  conduta: string;
}

function classificar(igDias: number): Faixa {
  if (igDias < 154) {
    return {
      rotulo: 'Antes do limite de viabilidade',
      severity: 'info',
      interpretacao:
        'Gestação abaixo de 22 semanas. Perda gestacional nessa faixa é classificada como abortamento na maior parte dos protocolos brasileiros; o limite de viabilidade varia conforme os recursos do serviço.',
      conduta:
        'Pré-natal de rotina, com ultrassom de primeiro trimestre entre 11 e 13 semanas e 6 dias (translucência nucal e datação) e ultrassom morfológico de segundo trimestre entre 20 e 24 semanas.\nRastreamentos do primeiro trimestre, suplementação de ácido fólico e atualização vacinal conforme o calendário da gestante.',
    };
  }
  if (igDias < 196) {
    return {
      rotulo: 'Periviabilidade / pré-termo extremo',
      severity: 'info',
      interpretacao:
        'Entre 22 e 27 semanas e 6 dias. Um parto nesta faixa seria classificado como pré-termo extremo, com morbimortalidade neonatal muito elevada.',
      conduta:
        'Se houver risco iminente de parto: corticoide antenatal (betametasona 12 mg por via intramuscular, duas doses com intervalo de 24 horas, ou dexametasona 6 mg a cada 12 horas em quatro doses), sulfato de magnésio para neuroproteção fetal e transferência para serviço com UTI neonatal.\nDiscussão franca com a família sobre prognóstico e conduta na sala de parto.',
    };
  }
  if (igDias < 224) {
    return {
      rotulo: 'Muito pré-termo',
      severity: 'info',
      interpretacao:
        'Entre 28 e 31 semanas e 6 dias. Um parto nesta faixa seria classificado como muito pré-termo.',
      conduta:
        'Em ameaça de parto pré-termo: corticoide antenatal, sulfato de magnésio para neuroproteção (indicado abaixo de 32 semanas) e tocólise por até 48 horas apenas para viabilizar o corticoide e a transferência.\nAvalie causa da prematuridade e mantenha vigilância do crescimento fetal.',
    };
  }
  if (igDias < 259) {
    return {
      rotulo: 'Pré-termo moderado a tardio',
      severity: 'info',
      interpretacao:
        'Entre 32 e 36 semanas e 6 dias. Um parto nesta faixa seria classificado como pré-termo moderado (32 a 33s6d) ou tardio (34 a 36s6d).',
      conduta:
        'Corticoide antenatal permanece indicado até 34 semanas; entre 34 e 36 semanas e 6 dias o benefício é menor e a decisão é individualizada.\nEntre 36 semanas e 37 semanas e 6 dias, colha a pesquisa de estreptococo do grupo B (swab vaginal e retal).\nEvite antecipar o parto sem indicação materna ou fetal formal.',
    };
  }
  if (igDias < 273) {
    return {
      rotulo: 'Termo precoce',
      severity: 'info',
      interpretacao:
        'Entre 37 e 38 semanas e 6 dias: o que o ACOG chama de "termo precoce". Recém-nascidos nesta faixa ainda têm mais desconforto respiratório, hipoglicemia e necessidade de UTI neonatal do que os nascidos a partir de 39 semanas.',
      conduta:
        'Não indique cesárea eletiva nem indução sem indicação médica antes de 39 semanas completas.\nPré-natal habitual, com avaliação de apresentação fetal e planejamento da via de parto.',
    };
  }
  if (igDias < 287) {
    return {
      rotulo: 'Termo completo',
      severity: 'baixo',
      interpretacao:
        'Entre 39 e 40 semanas e 6 dias: a janela de melhor desfecho neonatal. É o período em que um parto eletivo indicado deve, preferencialmente, ser programado.',
      conduta:
        'Acompanhamento habitual, com consultas semanais e orientação sobre sinais de trabalho de parto.\nSe houver indicação de resolução, esta é a faixa preferencial. Avalie o índice de Bishop antes de indicar indução.',
    };
  }
  if (igDias < 294) {
    return {
      rotulo: 'Termo tardio',
      severity: 'moderado',
      interpretacao:
        'Entre 41 e 41 semanas e 6 dias. A partir de 41 semanas aumentam a morbidade perinatal, a incidência de mecônio, de macrossomia e de oligoâmnio.',
      conduta:
        'Intensifique a vigilância do bem-estar fetal (cardiotocografia e avaliação do líquido amniótico duas vezes por semana).\nA indução do parto a partir de 41 semanas completas reduz mortalidade perinatal e cesáreas em comparação com a conduta expectante: programe a resolução, avaliando o índice de Bishop e a necessidade de preparo cervical.',
    };
  }
  return {
    rotulo: 'Pós-termo',
    severity: 'alto',
    interpretacao:
      'Gestação com 42 semanas ou mais: pós-termo. Há aumento do risco de óbito fetal, síndrome de aspiração meconial, macrossomia, distocia e insuficiência placentária.',
    conduta:
      'Resolução da gestação indicada. Programe indução ou cesárea conforme a apresentação, o índice de Bishop e a vitalidade fetal.\nReconfirme a datação antes de agir: gestação "pós-termo" por DUM incerta é uma das causas mais comuns de indução desnecessária.',
  };
}

function trimestre(igDias: number): string {
  if (igDias < 98) return '1º trimestre (até 13s6d)';
  if (igDias < 196) return '2º trimestre (14s0d a 27s6d)';
  return '3º trimestre (a partir de 28s0d)';
}

function porExtenso(total: number): string {
  const semanas = Math.floor(total / 7);
  const dias = total % 7;
  const s = `${semanas} ${semanas === 1 ? 'semana' : 'semanas'}`;
  if (dias === 0) return s;
  return `${s} e ${dias} ${dias === 1 ? 'dia' : 'dias'}`;
}

const calculator: Calculator = {
  slug: 'idade-gestacional-dpp',
  title: 'Idade gestacional e data provável do parto',
  shortTitle: 'IG e DPP',
  subtitle:
    'Calcula a idade gestacional em semanas e dias e quanto falta para a data provável do parto pela regra de Naegele.',
  specialties: ['Obstetrícia'],
  kind: 'Fórmula',
  popular: true,
  keywords: [
    'idade gestacional',
    'IG',
    'DPP',
    'data provável do parto',
    'regra de Naegele',
    'Naegele',
    'DUM',
    'última menstruação',
    'gestação',
    'pré-natal',
    'datação',
  ],

  whenToUse: [
    'Toda gestante em pré-natal, para estabelecer a idade gestacional e a data provável do parto: a informação que ancora praticamente todas as decisões obstétricas.',
    'Gestantes com ciclos menstruais regulares e DUM confiável. Nessas, a regra de Naegele tem desempenho razoável; nas demais, a datação deve vir do ultrassom.',
    'Não use a DUM isoladamente quando os ciclos são irregulares, quando houve uso de contraceptivo hormonal nos três meses anteriores, quando houve sangramento no primeiro trimestre confundido com menstruação ou quando a paciente não sabe informar a data.',
    'Não se aplica a gestações por fertilização in vitro, cuja datação usa a data da transferência e a idade do embrião.',
  ],

  whyUse:
    'A idade gestacional define o limite de viabilidade, a janela do corticoide antenatal, o momento do rastreamento morfológico, o diagnóstico de prematuridade e de pós-termo e o momento seguro para programar o parto. Errar a datação em uma ou duas semanas muda condutas inteiras: daí a importância de estabelecer a "melhor data provável do parto" cedo e não mudá-la depois.',

  pearls: [
    'A regra de Naegele assume ciclo regular de 28 dias com ovulação no 14º dia. Em ciclo de 35 dias, a idade gestacional real é cerca de 7 dias menor que a calculada pela DUM: este cálculo aplica essa correção quando você informa a duração do ciclo.',
    'O ultrassom de primeiro trimestre, com medida do comprimento cabeça-nádega entre 7 e 13 semanas e 6 dias, é o padrão-ouro da datação, com erro de apenas 5 a 7 dias. Quanto mais tarde o exame, pior a precisão: no terceiro trimestre o erro chega a 3 semanas.',
    'Redate pela ultrassonografia quando a diferença em relação à DUM exceder os limites do ACOG: mais de 5 dias até 8s6d; mais de 7 dias entre 9s0d e 15s6d; mais de 10 dias entre 16s0d e 21s6d; mais de 14 dias entre 22s0d e 27s6d; mais de 21 dias a partir de 28s0d.',
    'Uma vez definida a melhor data provável do parto, ela não deve ser alterada por ultrassons posteriores. Cada "redatação" tardia gera diagnósticos falsos de restrição de crescimento ou de pós-termo.',
    'Idade gestacional conta-se a partir do primeiro dia da DUM, não da concepção. A idade concepcional (embrionária) é aproximadamente 2 semanas menor: confusão frequente em laudos de embriologia e em cálculos feitos por leigos.',
    'Escreve-se sempre semanas completas mais dias (por exemplo, 34s3d). "34 semanas e meia" não existe em obstetrícia.',
    'Menos de 5% das gestantes dá à luz exatamente na data provável do parto. A DPP é o centro de uma distribuição, não uma previsão.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const modo = values.modo === 'ig' ? 'ig' : 'dum';

    let igDias: number;
    let ajusteCiclo = 0;
    let ciclo = 28;

    if (modo === 'ig') {
      igDias = Math.round(n(values, 'semanas')) * 7 + Math.round(n(values, 'dias'));
    } else {
      const bruto = values.ciclo;
      ciclo =
        typeof bruto === 'number' && Number.isFinite(bruto) && bruto >= 20 && bruto <= 45
          ? Math.round(bruto)
          : 28;
      ajusteCiclo = ciclo - 28;
      igDias = Math.round(n(values, 'diasDum')) - ajusteCiclo;
    }

    if (!Number.isFinite(igDias) || igDias < 0) {
      return {
        value: '-',
        severity: 'info' as const,
        interpretation:
          'Os dados informados resultam em idade gestacional negativa. Revise os dias decorridos desde a DUM e a duração do ciclo menstrual.',
      };
    }

    const semanas = Math.floor(igDias / 7);
    const dias = igDias % 7;
    const faixa = classificar(igDias);
    const restante = DIAS_DPP - igDias;

    const details = [
      { label: 'Idade gestacional', value: porExtenso(igDias) },
      { label: 'Total em dias de gestação', value: `${igDias} ${igDias === 1 ? 'dia' : 'dias'}` },
      { label: 'Trimestre', value: trimestre(igDias) },
      {
        label: 'Data provável do parto (40s0d)',
        value:
          restante > 0
            ? `daqui a ${restante} ${restante === 1 ? 'dia' : 'dias'}`
            : restante === 0
              ? 'hoje'
              : `há ${-restante} ${-restante === 1 ? 'dia' : 'dias'}`,
        hint: 'Some (ou subtraia) esse número de dias à data de hoje para obter a data no calendário.',
      },
    ];

    if (ajusteCiclo !== 0) {
      details.push({
        label: 'Correção pelo ciclo menstrual',
        value:
          ajusteCiclo > 0
            ? `Ciclo de ${ciclo} dias: idade gestacional reduzida em ${ajusteCiclo} ${ajusteCiclo === 1 ? 'dia' : 'dias'}`
            : `Ciclo de ${ciclo} dias: idade gestacional aumentada em ${-ajusteCiclo} ${-ajusteCiclo === 1 ? 'dia' : 'dias'}`,
        hint: 'A DPP se desloca no mesmo sentido da correção.',
      });
    }

    return {
      value: `${semanas}s ${dias}d`,
      label: faixa.rotulo,
      severity: faixa.severity,
      interpretation: `${porExtenso(igDias)} de gestação. ${faixa.interpretacao}`,
      details,
      nextSteps: faixa.conduta,
    };
  },

  formula: `Regra de Naegele:

DPP = DUM − 3 meses + 7 dias + 1 ano

O que equivale a somar 280 dias (40 semanas) ao primeiro dia da última
menstruação. Exemplo: DUM em 10/03/2025 → DPP em 17/12/2025.

Idade gestacional = dias decorridos desde a DUM
  semanas = parte inteira de (dias ÷ 7)
  dias    = resto da divisão por 7

Correção para ciclos diferentes de 28 dias (Naegele modificada):
  idade gestacional real = dias desde a DUM − (duração do ciclo − 28)
  DPP = DUM + 280 dias + (duração do ciclo − 28)

Marcos em dias de gestação:
154 = 22s0d · 196 = 28s0d · 259 = 37s0d · 273 = 39s0d · 280 = 40s0d · 294 = 42s0d

Classificação do ACOG:
Pré-termo - antes de 37s0d
Termo precoce - 37s0d a 38s6d
Termo completo - 39s0d a 40s6d
Termo tardio - 41s0d a 41s6d
Pós-termo - 42s0d ou mais`,

  evidence:
    'A regra de Naegele, atribuída ao obstetra alemão Franz Karl Naegele no início do século XIX, permanece o método de datação por DUM em uso, mas depende de premissas frequentemente falsas: ciclo de 28 dias, ovulação no 14º dia e recordação exata da data. O padrão-ouro atual é a biometria fetal precoce. Robinson e Fleming (1975) estabeleceram a curva do comprimento cabeça-nádega, ainda hoje a base das tabelas de datação do primeiro trimestre, com erro em torno de 5 dias. Savitz e colaboradores (2002) mostraram, em coorte de gestantes norte-americanas, que a datação pela DUM tende a superestimar a idade gestacional em relação ao ultrassom, com efeito direto sobre as taxas de pós-termo e de prematuridade relatadas. O Committee Opinion nº 700 do ACOG consolidou a conduta atual: estabelecer uma única "melhor data provável do parto" o mais cedo possível, combinando DUM e ultrassom precoce, e não alterá-la em exames posteriores.',

  creator: {
    name: 'Franz Karl Naegele',
    bio: 'Obstetra alemão, professor em Heidelberg. A regra que leva seu nome foi divulgada em seu tratado de obstetrícia de 1812 e é usada até hoje para estimar a data provável do parto.',
  },

  updatedAt: '2026-07-26',

  references: [
    {
      citation:
        'American College of Obstetricians and Gynecologists. Committee Opinion No. 700: Methods for Estimating the Due Date. Obstet Gynecol. 2017;129(5):e150-e154.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/28426621/',
      primary: true,
    },
    {
      citation:
        'Robinson HP, Fleming JE. A critical evaluation of sonar "crown-rump length" measurements. Br J Obstet Gynaecol. 1975;82(9):702-10.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/1182090/',
    },
    {
      citation:
        'Savitz DA, Terry JW Jr, Dole N, Thorp JM Jr, Siega-Riz AM, Herring AH. Comparison of pregnancy dating by last menstrual period, ultrasound scanning, and their combination. Am J Obstet Gynecol. 2002;187(6):1660-6.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/12501080/',
    },
  ],
};

export default calculator;
