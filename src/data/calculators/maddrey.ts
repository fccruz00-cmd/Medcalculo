import type { Calculator, Field, Severity, Values } from '@/lib/types';
import { n, num } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'tp_paciente',
    kind: 'number',
    label: 'Tempo de protrombina do paciente',
    unit: 's',
    min: 8,
    max: 120,
    step: 0.1,
    hint: 'Tempo de protrombina em segundos, não INR nem atividade de protrombina em porcentagem.',
  },
  {
    id: 'tp_controle',
    kind: 'number',
    label: 'Tempo de protrombina do controle',
    unit: 's',
    min: 9,
    max: 20,
    step: 0.1,
    normalRange: '11 a 13,5 s na maioria dos laboratórios',
    hint: 'Valor do plasma controle informado no mesmo laudo. Depende do reagente e do lote: use sempre o controle do laboratório que fez o exame.',
  },
  {
    id: 'bilirrubina',
    kind: 'number',
    label: 'Bilirrubina total',
    unit: 'mg/dL',
    min: 0.2,
    max: 60,
    step: 0.1,
    normalRange: 'até 1,2 mg/dL',
    hint: 'Bilirrubina total sérica. Para converter de µmol/L, divida por 17,1.',
    unitToggle: {
      alt: 'µmol/L',
      toBase: (value) => value / 17.1,
      fromBase: (value) => value * 17.1,
    },
  },
];

const calculator: Calculator = {
  slug: 'maddrey',
  title: 'Função discriminante de Maddrey',
  shortTitle: 'Maddrey (DF)',
  subtitle:
    'Classifica a gravidade da hepatite alcoólica e identifica os pacientes que podem se beneficiar de corticoterapia.',
  specialties: ['Hepatologia'],
  kind: 'Fórmula',
  keywords: [
    'maddrey',
    'função discriminante',
    'discriminant function',
    'hepatite alcoólica',
    'doença hepática alcoólica',
    'corticoide',
    'prednisolona',
  ],

  whenToUse: [
    'Pacientes com hepatite alcoólica clinicamente definida: icterícia de início recente (nas últimas 8 semanas), consumo alcoólico intenso e persistente até poucas semanas antes, AST maior que ALT com AST habitualmente abaixo de 400 U/L e bilirrubina total acima de 3 mg/dL.',
    'Para decidir sobre corticoterapia: a função discriminante de 32 ou mais define a hepatite alcoólica grave, população em que os ensaios com corticoide foram conduzidos.',
    'Não se aplica a cirrose alcoólica descompensada sem hepatite alcoólica aguda, a hepatites virais, autoimune, medicamentosa nem à esteato-hepatite não alcoólica.',
    'Não use quando houver outra explicação para o alargamento do tempo de protrombina, como uso de varfarina ou coagulação intravascular disseminada.',
  ],

  whyUse:
    'É o critério histórico de gravidade da hepatite alcoólica e continua sendo o que define elegibilidade para corticoterapia na maioria dos protocolos e ensaios clínicos. Usa apenas dois exames disponíveis em qualquer serviço, tempo de protrombina e bilirrubina, e separa um grupo com mortalidade em 28 dias na casa dos 30 a 40% sem tratamento.',

  pearls: [
    'INR não entra na fórmula. A conta exige tempo de protrombina em segundos e o valor do controle do mesmo laudo; substituir por INR ou por atividade de protrombina em porcentagem produz um número sem qualquer validação.',
    'O tempo de protrombina do controle varia com o reagente e com o lote. O mesmo paciente pode ter funções discriminantes diferentes em laboratórios diferentes: essa é a principal fragilidade metodológica do índice e uma das razões pelas quais o MELD vem substituindo-o para estratificar gravidade.',
    'A função discriminante mede gravidade, não diagnóstico. Antes de aplicá-la, confirme o quadro de hepatite alcoólica e afaste ativamente infecção, sangramento digestivo, lesão renal aguda e hepatite viral: todos alteram a conduta e contraindicam ou adiam o corticoide.',
    'AST acima de 400 U/L ou relação AST/ALT abaixo de 1,5 devem fazer duvidar do diagnóstico de hepatite alcoólica e motivar busca por outra causa (isquêmica, medicamentosa, viral).',
    'Corticoide não se prescreve no escuro: reavalie a resposta no sétimo dia com o escore de Lille. Valor de 0,45 ou mais identifica o não respondedor, em quem manter o corticoide só acrescenta risco de infecção.',
    'O ensaio STOPAH (2015) mostrou benefício apenas marginal e restrito aos 28 dias, sem ganho de sobrevida em 90 dias ou em 1 ano. Trate a corticoterapia como medida de curto prazo; a abstinência alcoólica é a única intervenção que muda a história natural da doença.',
    'A abstinência, o suporte nutricional com aporte calórico e proteico adequados e a reposição de tiamina são tão importantes quanto a decisão sobre o corticoide, e frequentemente ficam esquecidos na prescrição.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const tpPaciente = n(values, 'tp_paciente');
    const tpControle = n(values, 'tp_controle');
    const bilirrubina = n(values, 'bilirrubina');

    if (tpPaciente <= 0 || tpControle <= 0 || bilirrubina < 0) {
      return {
        value: '-',
        severity: 'info' as Severity,
        interpretation:
          'Informe o tempo de protrombina do paciente e do controle em segundos e a bilirrubina total em mg/dL.',
      };
    }

    const delta = tpPaciente - tpControle;
    const df = 4.6 * delta + bilirrubina;
    const grave = df >= 32;

    let severity: Severity;
    let label: string;
    let interpretation: string;
    let nextSteps: string;

    if (!grave) {
      severity = 'baixo';
      label = 'Hepatite alcoólica não grave';
      interpretation =
        'Função discriminante abaixo de 32: hepatite alcoólica de gravidade leve a moderada. A mortalidade de curto prazo é baixa e os ensaios não mostraram benefício de corticoide nesse grupo: o risco de infecção supera o ganho esperado.';
      nextSteps =
        'Não há indicação de corticoide.\nO centro do tratamento é a abstinência alcoólica, com manejo ativo da síndrome de abstinência e encaminhamento para acompanhamento em saúde mental e dependência química.\nGaranta suporte nutricional com aporte calórico e proteico adequados (a restrição proteica não se justifica), reponha tiamina, ácido fólico e demais vitaminas do complexo B, e corrija distúrbios eletrolíticos.\nReavalie bilirrubina e tempo de protrombina em alguns dias: o quadro pode progredir e mudar de faixa.';
    } else {
      severity = 'alto';
      label = 'Hepatite alcoólica grave';
      interpretation =
        'Função discriminante de 32 ou mais define hepatite alcoólica grave, com mortalidade em 28 dias de cerca de 35% sem tratamento no ensaio de Carithers (1989). É a população em que a corticoterapia foi estudada.';
      nextSteps =
        'Avalie corticoterapia com prednisolona 40 mg por dia por 28 dias, desde que não haja contraindicação: infecção não controlada, sangramento digestivo ativo, lesão renal aguda ou síndrome hepatorrenal, pancreatite aguda e hepatite viral B ativa.\nAntes de iniciar, rastreie infecção de forma sistemática: a hepatite alcoólica grave cursa com infecção oculta em parcela importante dos casos.\nCalcule o escore de Lille no sétimo dia de corticoide: valor de 0,45 ou mais indica falta de resposta e a suspensão do corticoide.\nCalcule também o MELD, cada vez mais usado para estratificar gravidade e discutir transplante hepático precoce em casos selecionados de não respondedores.\nMantenha abstinência absoluta, suporte nutricional, reposição de tiamina e vigilância para encefalopatia, sangramento e lesão renal.';
    }

    const details = [
      {
        label: 'Prolongamento do tempo de protrombina',
        value: `${num(delta, 1)} s`,
        hint: 'Tempo do paciente menos o do controle',
      },
      {
        label: 'Corte de gravidade',
        value: '32',
        hint: 'Define hepatite alcoólica grave (Carithers, 1989)',
      },
    ];

    if (grave) {
      details.push({
        label: 'Mortalidade em 28 dias sem corticoide',
        value: 'cerca de 35%',
        hint: 'Braço placebo do ensaio de Carithers (1989), com 66 pacientes',
      });
    }

    return {
      value: num(df, 1),
      label,
      severity,
      interpretation,
      details,
      nextSteps,
    };
  },

  formula: `Função discriminante modificada:

DF = 4,6 × (TP do paciente − TP do controle, em segundos) + bilirrubina total (mg/dL)

Interpretação:
DF < 32 - hepatite alcoólica não grave; corticoide não indicado
DF ≥ 32 - hepatite alcoólica grave; avaliar prednisolona 40 mg/dia por 28 dias

Observação: o tempo de protrombina deve estar em segundos, com o valor do
controle do mesmo laudo. INR e atividade de protrombina em porcentagem não
podem ser usados na fórmula.`,

  evidence:
    'Maddrey e colaboradores descreveram a função discriminante em 1978, ao analisar um ensaio de corticoterapia na hepatite alcoólica, buscando um índice que separasse os pacientes com risco elevado de morte a curto prazo. A forma usada hoje é a função discriminante modificada, consagrada no ensaio multicêntrico de Carithers e colaboradores (1989), que randomizou 66 pacientes com função discriminante acima de 32 ou encefalopatia: a mortalidade em 28 dias foi de aproximadamente 35% no grupo placebo contra cerca de 6% no grupo tratado com metilprednisolona. O ensaio STOPAH (2015), com 1.103 pacientes, encontrou redução apenas limítrofe da mortalidade em 28 dias com prednisolona e nenhum benefício aos 90 dias ou em 1 ano, além de mais infecções graves: o que consolidou a prática de reavaliar a resposta no sétimo dia pelo escore de Lille e de suspender o corticoide nos não respondedores.',

  creator: {
    name: 'Willis C. Maddrey',
    bio: 'Hepatologista norte-americano, professor da University of Texas Southwestern Medical Center e uma das principais referências em doença hepática alcoólica.',
  },

  references: [
    {
      citation:
        'Maddrey WC, Boitnott JK, Bedine MS, Weber FL Jr, Mezey E, White RI Jr. Corticosteroid therapy of alcoholic hepatitis. Gastroenterology. 1978;75(2):193-9.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/352788/',
      primary: true,
    },
    {
      citation:
        'Carithers RL Jr, Herlong HF, Diehl AM, et al. Methylprednisolone therapy in patients with severe alcoholic hepatitis. A randomized multicenter trial. Ann Intern Med. 1989;110(9):685-90.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/2648927/',
    },
    {
      citation:
        'Thursz MR, Richardson P, Allison M, et al. Prednisolone or pentoxifylline for alcoholic hepatitis. N Engl J Med. 2015;372(17):1619-28.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/25901427/',
    },
    {
      citation:
        'Louvet A, Naveau S, Abdelnour M, et al. The Lille model: a new tool for therapeutic strategy in patients with severe alcoholic hepatitis treated with steroids. Hepatology. 2007;45(6):1348-54.',
    },
    {
      citation:
        'Crabb DW, Im GY, Szabo G, Mellinger JL, Lucey MR. Diagnosis and Treatment of Alcohol-Associated Liver Diseases: 2019 Practice Guidance from the American Association for the Study of Liver Diseases. Hepatology. 2020;71(1):306-33.',
    },
  ],
};

export default calculator;
