import type { Calculator, Field, Severity, Values } from '@/lib/types';
import { n, num } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'modo',
    kind: 'choice',
    label: 'Informar o ciclo cardíaco como',
    hint: 'A correção depende do intervalo RR. Você pode informá-lo diretamente ou deixar que ele seja derivado da frequência cardíaca.',
    options: [
      { label: 'Frequência cardíaca', value: 'fc' },
      { label: 'Intervalo RR', value: 'rr' },
    ],
  },
  {
    id: 'qt',
    kind: 'number',
    label: 'Intervalo QT medido',
    unit: 'ms',
    min: 200,
    max: 800,
    step: 1,
    placeholder: '400',
    normalRange: '350 a 450 ms',
    hint: 'Do início do QRS ao fim da onda T. Em papel a 25 mm/s, cada quadradinho de 1 mm vale 40 ms.',
    help: 'Meça em DII ou em V5/V6, na derivação com a onda T mais bem definida. Use o método da tangente: prolongue a porção descendente mais íngreme da onda T até cruzar a linha de base. Não inclua a onda U, exceto quando ela estiver fundida à onda T. Escolha o maior QT entre as derivações analisadas.',
  },
  {
    id: 'fc',
    kind: 'number',
    label: 'Frequência cardíaca',
    unit: 'bpm',
    min: 20,
    max: 250,
    step: 1,
    placeholder: '75',
    normalRange: '60 a 100 bpm',
    hint: 'O intervalo RR é calculado como 60 ÷ FC.',
    showIf: (values) => values.modo === 'fc',
  },
  {
    id: 'rr',
    kind: 'number',
    label: 'Intervalo RR',
    unit: 'ms',
    min: 200,
    max: 3000,
    step: 10,
    placeholder: '800',
    normalRange: '600 a 1000 ms',
    hint: 'Distância entre duas ondas R consecutivas. Em papel a 25 mm/s, cada quadrado grande de 5 mm vale 200 ms.',
    unitToggle: {
      alt: 's',
      toBase: (value) => value * 1000,
      fromBase: (value) => value / 1000,
    },
    showIf: (values) => values.modo === 'rr',
  },
  {
    id: 'sexo',
    kind: 'choice',
    label: 'Sexo',
    hint: 'Os limites de normalidade do QTc são diferentes entre homens e mulheres.',
    options: [
      { label: 'Masculino', value: 'M' },
      { label: 'Feminino', value: 'F' },
    ],
  },
];

/** Classificação do QTc por sexo (AHA/ACCF/HRS, 2009; Drew, 2010). */
function classificar(
  qtc: number,
  feminino: boolean,
): { rotulo: string; severidade: Severity; texto: string } {
  const limiteNormal = feminino ? 450 : 440;
  const limiteProlongado = feminino ? 460 : 450;

  if (qtc < 350) {
    return {
      rotulo: 'QTc encurtado',
      severidade: 'moderado',
      texto:
        'QTc abaixo de 350 ms. Considere erro de medida (onda T de baixa amplitude, taquicardia acentuada), hipercalcemia, hiperpotassemia, acidose, uso de digital ou hipertermia. QTc igual ou inferior a 330 ms é critério diagnóstico de síndrome do QT curto; entre 330 e 360 ms, o diagnóstico exige critérios adicionais, como história familiar de morte súbita ou parada cardíaca revertida.',
    };
  }
  if (qtc <= limiteNormal) {
    return {
      rotulo: 'QTc normal',
      severidade: 'baixo',
      texto: `QTc dentro da faixa de normalidade para o sexo ${feminino ? 'feminino' : 'masculino'} (até ${limiteNormal} ms).`,
    };
  }
  if (qtc < limiteProlongado) {
    return {
      rotulo: 'QTc limítrofe',
      severidade: 'moderado',
      texto: `QTc acima do valor de referência (${limiteNormal} ms) mas abaixo do limiar de prolongamento definido pela AHA/ACCF/HRS (${limiteProlongado} ms). Sem risco arrítmico relevante de forma isolada, mas merece atenção antes de introduzir fármaco que prolongue o QT.`,
    };
  }
  if (qtc < 480) {
    return {
      rotulo: 'QTc prolongado',
      severidade: 'moderado',
      texto: `QTc igual ou acima de ${limiteProlongado} ms, o limiar de prolongamento para o sexo ${feminino ? 'feminino' : 'masculino'} segundo a AHA/ACCF/HRS. O risco de torsades de pointes ainda é baixo, mas há pouca margem para novos fármacos que prolonguem o QT.`,
    };
  }
  if (qtc < 500) {
    return {
      rotulo: 'QTc prolongado: risco aumentado',
      severidade: 'alto',
      texto:
        'QTc entre 480 e 499 ms. Nessa faixa o risco de torsades de pointes já é significativo, e 480 ms é o limiar diagnóstico de síndrome do QT longo congênito em ECG repetidos na ausência de causa secundária.',
    };
  }
  return {
    rotulo: 'QTc muito prolongado: risco alto de torsades',
    severidade: 'critico',
    texto:
      'QTc de 500 ms ou mais. É o limiar clássico de alto risco para torsades de pointes: acima dele, cada 10 ms de aumento acrescenta cerca de 5% ao risco arrítmico. Exige ação imediata.',
  };
}

const calculator: Calculator = {
  slug: 'qtc',
  title: 'Intervalo QT corrigido (QTc)',
  shortTitle: 'QTc',
  subtitle:
    'Corrige o intervalo QT pela frequência cardíaca (Bazett e Fridericia) para estimar o risco de torsades de pointes e orientar o uso de fármacos que prolongam o QT.',
  specialties: ['Cardiologia', 'Clínica Médica'],
  kind: 'Fórmula',
  popular: true,
  keywords: [
    'qtc',
    'qt corrigido',
    'bazett',
    'fridericia',
    'framingham',
    'torsades',
    'torsades de pointes',
    'QT longo',
    'síndrome do QT longo',
    'eletrocardiograma',
    'ECG',
  ],

  whenToUse: [
    'Antes e depois de iniciar ou escalonar fármacos que prolongam o QT: antiarrítmicos (amiodarona, sotalol, quinidina), antipsicóticos (haloperidol endovenoso, ziprasidona, quetiapina), metadona, macrolídeos, quinolonas, antifúngicos azólicos, ondansetrona, antidepressivos tricíclicos e citalopram.',
    'Investigação de síncope, palpitações, parada cardíaca revertida ou história familiar de morte súbita, em busca de síndrome do QT longo.',
    'Distúrbios eletrolíticos (hipopotassemia, hipomagnesemia, hipocalcemia), bradicardia acentuada, hipotireoidismo, anorexia nervosa e intoxicações.',
    'A correção perde confiabilidade quando o QRS está alargado (bloqueio de ramo, ritmo de marca-passo, pré-excitação): nesses casos o QT reflete também o atraso de despolarização e o QTc superestima o risco.',
  ],

  whyUse:
    'O intervalo QT bruto varia com a frequência cardíaca e por isso não pode ser comparado entre ECGs nem usado como limiar de segurança. O QTc padroniza a medida para uma frequência de 60 bpm e é o parâmetro que as diretrizes usam para decidir sobre suspensão de fármacos e monitorização.',

  pearls: [
    'Bazett é a fórmula mais usada, mas é a que mais erra nos extremos: superestima o QTc na taquicardia, inflando falsos positivos acima de 100 bpm, e subestima na bradicardia, deixando passar prolongamentos reais abaixo de 60 bpm. Nesses extremos, prefira Fridericia ou Framingham, que constam nos detalhes do resultado.',
    'Na fibrilação atrial o intervalo RR muda a cada batimento. Meça o QT e o RR em pelo menos 5 a 10 ciclos consecutivos e use a média: corrigir um único batimento pode errar dezenas de milissegundos. Uma alternativa é medir no batimento cujo RR mais se aproxima de 1 segundo.',
    'Nunca aceite o QTc do laudo automático sem conferir. O algoritmo erra com onda T de baixa amplitude, onda U proeminente, T fundida com U, artefato e ritmo irregular. Meça manualmente pelo método da tangente na derivação com a melhor onda T.',
    'Com QRS alargado (bloqueio de ramo, marca-passo), use o QT modificado, subtraia do QT o excesso de duração do QRS, QTm = QT − (QRS − 100 ms), ou avalie o intervalo JT, antes de suspender medicamentos por um QTc falsamente alto.',
    'Corrija primeiro os eletrólitos: mantenha potássio acima de 4,0 mEq/L e magnésio acima de 2,0 mg/dL. Hipopotassemia e hipomagnesemia prolongam o QT e são a causa reversível mais frequente, muitas vezes atribuída erroneamente ao fármaco.',
    'Um aumento de 60 ms ou mais em relação ao QTc basal é sinal de alerta mesmo quando o valor absoluto ainda está abaixo de 500 ms: por isso vale a pena ter sempre um ECG antes de iniciar o fármaco.',
    'QTc normal em repouso não exclui síndrome do QT longo congênito: até um quarto dos portadores tem ECG de repouso normal. Se a suspeita for forte, avalie a resposta ao esforço, o Holter e o escore de Schwartz.',
    'Sotalol e a maioria dos antiarrítmicos da classe III causam torsades de pointes de forma dependente da bradicardia e das pausas; o risco é maior logo após a conversão de fibrilação atrial para ritmo sinusal.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const qt = n(values, 'qt');
    const usaFc = values.modo === 'fc';
    const fcInformada = n(values, 'fc');
    const rrInformado = n(values, 'rr');
    const feminino = values.sexo === 'F';

    const rrSegundos = usaFc
      ? fcInformada > 0
        ? 60 / fcInformada
        : 0
      : rrInformado > 0
        ? rrInformado / 1000
        : 0;

    if (qt <= 0 || rrSegundos <= 0) {
      return {
        value: '-',
        severity: 'info' as const,
        interpretation:
          'Informe um intervalo QT válido e uma frequência cardíaca (ou um intervalo RR) maior que zero.',
      };
    }

    const fc = 60 / rrSegundos;
    const bazett = qt / Math.sqrt(rrSegundos);
    const fridericia = qt / Math.cbrt(rrSegundos);
    const framingham = qt + 154 * (1 - rrSegundos);

    const qtc = Math.round(bazett);
    const { rotulo, severidade, texto } = classificar(qtc, feminino);

    const linhas: string[] = [texto];

    if (fc > 100) {
      linhas.push(
        `Com frequência de ${num(fc)} bpm, a fórmula de Bazett tende a superestimar o QTc. O valor por Fridericia (${num(fridericia)} ms) é mais confiável nesta faixa.`,
      );
    } else if (fc < 60) {
      linhas.push(
        `Com frequência de ${num(fc)} bpm, a fórmula de Bazett tende a subestimar o QTc. Compare com Fridericia (${num(fridericia)} ms) antes de concluir que o intervalo é normal.`,
      );
    }

    let nextSteps: string;
    if (qtc >= 500) {
      nextSteps =
        'Conduta imediata: suspenda ou substitua todo fármaco que prolongue o QT, consultando uma lista atualizada de risco (por exemplo, crediblemeds.org).\nCorrija potássio (alvo acima de 4,0 mEq/L), magnésio (acima de 2,0 mg/dL) e cálcio; considere sulfato de magnésio 1 a 2 g endovenoso mesmo com magnesemia normal.\nMantenha monitorização eletrocardiográfica contínua e trate bradicardia e pausas, que favorecem a torsades.\nEm torsades sustentada, faça sulfato de magnésio endovenoso e desfibrile se houver instabilidade; em torsades recorrente dependente de bradicardia, considere marca-passo temporário ou isoprenalina.';
    } else if (qtc >= 480) {
      nextSteps =
        'Revise toda a prescrição e retire os fármacos que prolongam o QT que puderem ser substituídos.\nCorrija distúrbios eletrolíticos e repita o ECG após a correção.\nSe houver necessidade de manter o fármaco, monitorize com ECG seriado e evite associar dois ou mais agentes de risco.\nNa ausência de causa secundária e com QTc igual ou acima de 480 ms em ECGs repetidos, investigue síndrome do QT longo congênito e avalie encaminhamento ao cardiologista.';
    } else if (qtc > (feminino ? 450 : 440)) {
      nextSteps =
        'Corrija potássio, magnésio e cálcio, e revise a prescrição em busca de agentes que prolongam o QT ou de interações que aumentem sua concentração (inibidores do CYP3A4, por exemplo).\nSe for iniciar um fármaco de risco, repita o ECG após 24 a 48 horas ou após atingir o estado de equilíbrio, e suspenda se o QTc ultrapassar 500 ms ou aumentar 60 ms em relação ao basal.';
    } else {
      nextSteps =
        'Intervalo dentro da faixa esperada. Se for iniciar um fármaco que prolonga o QT, guarde este valor como basal e repita o ECG após o início ou após aumento de dose.\nMantenha potássio e magnésio em faixas adequadas, sobretudo em uso de diurético.';
    }

    return {
      value: num(qtc),
      unit: 'ms',
      label: rotulo,
      severity: severidade,
      interpretation: linhas.join('\n'),
      details: [
        {
          label: 'QTc por Fridericia',
          value: `${num(fridericia)} ms`,
          hint: 'QT ÷ ∛RR: mais estável em taquicardia e bradicardia',
        },
        {
          label: 'QTc por Framingham',
          value: `${num(framingham)} ms`,
          hint: 'QT + 154 × (1 − RR): boa alternativa linear',
        },
        {
          label: 'Intervalo RR',
          value: `${num(rrSegundos * 1000)} ms (${num(rrSegundos, 2)} s)`,
        },
        {
          label: 'Frequência cardíaca',
          value: `${num(fc)} bpm`,
        },
        {
          label: 'Limites de referência',
          value: feminino
            ? 'Normal até 450 ms · prolongado ≥ 460 ms'
            : 'Normal até 440 ms · prolongado ≥ 450 ms',
          hint: 'AHA/ACCF/HRS 2009; ≥ 500 ms indica risco alto de torsades em ambos os sexos',
        },
      ],
      nextSteps,
    };
  },

  formula: `Intervalo RR em segundos = 60 ÷ frequência cardíaca (bpm)

Bazett (padrão):      QTc = QT ÷ √RR
Fridericia:           QTc = QT ÷ ∛RR
Framingham:           QTc = QT + 154 × (1 − RR)
Hodges:               QTc = QT + 1,75 × (FC − 60)

QT e QTc em milissegundos, RR em segundos.
Quando a frequência é de 60 bpm, RR = 1 s e QTc = QT em todas as fórmulas.

Limites de referência (AHA/ACCF/HRS, 2009):
· Homens: normal até 440 ms · prolongado ≥ 450 ms
· Mulheres: normal até 450 ms · prolongado ≥ 460 ms
· ≥ 480 ms: risco aumentado e limiar diagnóstico de QT longo congênito
· ≥ 500 ms: risco alto de torsades de pointes, em ambos os sexos
· ≤ 330 ms: critério diagnóstico de síndrome do QT curto`,

  evidence:
    'A correção de Bazett foi publicada em 1920, a partir de medidas em 39 indivíduos jovens e saudáveis, e a de Fridericia no mesmo ano, com metodologia semelhante. A limitação de Bazett é conhecida há décadas: a correção pela raiz quadrada é excessiva em frequências altas e insuficiente em frequências baixas, o que gera falsos positivos na taquicardia e falsos negativos na bradicardia. Em análise de mais de 6.600 pacientes hospitalizados, Vandenberk e colaboradores (2016) mostraram que as fórmulas de Fridericia e de Framingham foram as que melhor preveram mortalidade a longo prazo e as que menos dependeram da frequência cardíaca, e recomendaram substituir Bazett na monitorização de rotina. Bazett permanece como padrão de fato porque é o que os aparelhos de eletrocardiografia calculam e o que as bulas e os ensaios clínicos usam como referência. A declaração da American Heart Association e do American College of Cardiology sobre prevenção de torsades de pointes (Drew, 2010) consolidou os limiares de ação: QTc acima de 500 ms ou aumento de 60 ms ou mais em relação ao basal indicam revisão imediata da terapia.',

  creator: {
    name: 'Henry Cuthbert Bazett',
    bio: 'Fisiologista britânico radicado nos Estados Unidos, professor da Universidade da Pensilvânia. Publicou em 1920 a análise das relações temporais do eletrocardiograma de onde saiu a fórmula que leva seu nome.',
  },

  references: [
    {
      citation:
        'Bazett HC. An analysis of the time-relations of electrocardiograms. Heart. 1920;7:353-70.',
      primary: true,
    },
    {
      citation:
        'Fridericia LS. The duration of systole in an electrocardiogram in normal humans and in patients with heart disease. 1920. Ann Noninvasive Electrocardiol. 2003;8(4):343-51.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/14516292/',
    },
    {
      citation:
        'Rautaharju PM, Surawicz B, Gettes LS, et al. AHA/ACCF/HRS recommendations for the standardization and interpretation of the electrocardiogram: part IV: the ST segment, T and U waves, and the QT interval. J Am Coll Cardiol. 2009;53(11):982-91.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/19281931/',
    },
    {
      citation:
        'Drew BJ, Ackerman MJ, Funk M, et al. Prevention of torsade de pointes in hospital settings: a scientific statement from the American Heart Association and the American College of Cardiology Foundation. Circulation. 2010;121(8):1047-60.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/20142454/',
    },
    {
      citation:
        'Vandenberk B, Vandael E, Robyns T, et al. Which QT correction formulae to use for QT monitoring? J Am Heart Assoc. 2016;5(6):e003264.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/27317349/',
    },
  ],
};

export default calculator;
