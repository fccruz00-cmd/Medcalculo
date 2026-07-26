import type { Calculator, Field, Severity, Values } from '@/lib/types';
import { n, num } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'ast',
    kind: 'number',
    label: 'AST (TGO)',
    unit: 'U/L',
    min: 5,
    max: 2000,
    step: 1,
    hint: 'Aspartato aminotransferase sérica. Use um valor de rotina, fora de surto de atividade inflamatória.',
  },
  {
    id: 'lsn',
    kind: 'number',
    label: 'Limite superior da normalidade do AST no laboratório',
    unit: 'U/L',
    min: 15,
    max: 60,
    step: 1,
    hint: 'Está no próprio laudo. Costuma ficar entre 34 e 40 U/L; muitos laboratórios usam valores diferentes para homens e mulheres (cerca de 32 U/L para mulheres).',
    help: 'O APRI compara o AST com o limite superior da normalidade do método usado pelo laboratório. Adotar 40 U/L quando o laudo informa 34 U/L reduz o índice em cerca de 15% e pode deslocar o paciente de faixa. Sempre copie o valor do laudo que gerou o AST.',
  },
  {
    id: 'plaquetas',
    kind: 'number',
    label: 'Contagem de plaquetas',
    unit: '×10⁹/L',
    min: 10,
    max: 800,
    step: 1,
    normalRange: '150 a 450 ×10⁹/L',
    hint: 'Equivale a mil/mm³: uma contagem de 150.000/mm³ corresponde a 150 nesta unidade. Use o botão de unidade para digitar direto em /mm³.',
    unitToggle: {
      alt: '/mm³',
      toBase: (value) => value / 1000,
      fromBase: (value) => value * 1000,
    },
  },
];

/** Leitura do índice para fibrose significativa (METAVIR F2 a F4). */
function fibrose(apri: number): string {
  if (apri <= 0.5) return 'Fibrose significativa improvável';
  if (apri < 1.5) return 'Indeterminado';
  return 'Fibrose significativa provável';
}

/** Leitura do índice para cirrose (METAVIR F4). */
function cirrose(apri: number): string {
  if (apri <= 1) return 'Cirrose improvável';
  if (apri <= 2) return 'Indeterminado';
  return 'Cirrose provável';
}

const calculator: Calculator = {
  slug: 'apri',
  title: 'APRI: índice AST/plaquetas',
  shortTitle: 'APRI',
  subtitle:
    'Estima de forma não invasiva a probabilidade de fibrose hepática significativa e de cirrose a partir do AST e da contagem de plaquetas.',
  specialties: ['Hepatologia', 'Gastroenterologia'],
  kind: 'Fórmula',
  keywords: [
    'apri',
    'ast plaquetas',
    'fibrose hepática',
    'cirrose',
    'hepatite C',
    'hepatite B',
    'biópsia hepática',
    'elastografia',
  ],

  whenToUse: [
    'Adultos com hepatopatia crônica, sobretudo hepatite C, para estimar o grau de fibrose sem biópsia.',
    'Em serviços sem acesso a elastografia hepática ou a painéis proprietários de fibrose, como triagem inicial e como critério de encaminhamento.',
    'Foi derivado e validado em pacientes com hepatite C crônica; o desempenho é mais modesto na hepatite B e na doença hepática gordurosa associada à disfunção metabólica.',
    'Não se aplica a hepatite aguda, hepatite alcoólica aguda, colestase aguda, plaquetopenia de outra causa nem a pacientes em uso recente de antiviral que já normalizou as transaminases.',
  ],

  whyUse:
    'Usa dois exames que praticamente todo paciente hepatopata já tem em mãos e não custa nada. Serve bem para os dois extremos: valores baixos afastam fibrose avançada com boa segurança e valores altos identificam quem precisa entrar em rastreamento de varizes e de carcinoma hepatocelular, poupando biópsias.',

  pearls: [
    'A maior parte dos pacientes cai na zona indeterminada, entre 0,5 e 1,5: nessa faixa o índice não decide nada e é preciso elastografia, outro painel de fibrose ou biópsia.',
    'Qualquer coisa que eleve o AST infla o índice sem que haja mais fibrose: surto de atividade inflamatória, ingestão alcoólica recente, lesão muscular, exercício extenuante, rabdomiólise, hemólise e estatinas. Colha o exame em situação estável.',
    'Qualquer coisa que reduza as plaquetas também infla o índice: púrpura trombocitopênica imune, dengue, esquistossomose com hipertensão portal não cirrótica, hiperesplenismo de outra causa, quimioterapia, uso de heparina e mielodisplasia.',
    'O limite superior da normalidade do AST é do laboratório, não um número universal. O valor está no denominador: adotar 40 U/L quando o laudo usa 34 U/L reduz o índice em cerca de 15%, e usar 34 U/L quando o laudo informa 40 U/L o infla em quase 20%.',
    'O índice não substitui a elastografia hepática onde ela existir, e nenhum método não invasivo dispensa a avaliação clínica: sinais de hipertensão portal, esplenomegalia e alteração de imagem valem mais que o número isolado.',
    'Depois do tratamento antiviral da hepatite C, o AST cai rapidamente e o APRI despenca sem que a fibrose tenha regredido na mesma velocidade. Não use o índice para reestadiar precocemente o paciente curado, nem para suspender o rastreamento de carcinoma hepatocelular em quem já tinha cirrose.',
    'Atenção às unidades das plaquetas: a fórmula pede a contagem em ×10⁹/L (equivalente a mil/mm³). Digitar 150.000 em vez de 150 produz um índice mil vezes menor.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const ast = n(values, 'ast');
    const lsn = n(values, 'lsn');
    const plaquetas = n(values, 'plaquetas');

    if (ast <= 0 || lsn <= 0 || plaquetas <= 0) {
      return {
        value: '-',
        severity: 'info' as Severity,
        interpretation:
          'Informe o AST, o limite superior da normalidade do AST no laboratório e a contagem de plaquetas em ×10⁹/L (mil/mm³).',
      };
    }

    const razao = ast / lsn;
    const apri = (razao / plaquetas) * 100;

    let label: string;
    let severity: Severity;
    let interpretation: string;
    let nextSteps: string;

    if (apri <= 0.5) {
      label = 'Fibrose significativa improvável';
      severity = 'baixo';
      interpretation =
        'Índice abaixo de 0,5: fibrose significativa (METAVIR F2 a F4) improvável. Nessa faixa o valor preditivo negativo é alto e a chance de cirrose é muito baixa.';
      nextSteps =
        'Em geral não há necessidade de biópsia hepática nem de rastreamento de varizes.\nMantenha o tratamento da doença de base, oriente abstinência alcoólica e controle dos fatores metabólicos.\nRepita a avaliação da fibrose periodicamente, conforme a atividade da doença: o índice é uma fotografia, não um estadiamento definitivo.';
    } else if (apri < 1.5) {
      label = 'Zona indeterminada';
      severity = 'moderado';
      interpretation =
        'Índice entre 0,5 e 1,5: zona indeterminada, em que o APRI não discrimina com segurança entre fibrose leve e avançada. É a faixa em que cai a maior parte dos pacientes.';
      nextSteps =
        'Complemente com elastografia hepática transitória quando disponível, ou com outro método não invasivo, como o FIB-4.\nSe a definição do estágio mudar a conduta e os métodos não invasivos permanecerem discordantes ou inconclusivos, considere biópsia hepática.\nBusque sinais indiretos de hipertensão portal: esplenomegalia, circulação colateral e alterações na ultrassonografia.';
    } else if (apri <= 2) {
      label = 'Fibrose significativa provável';
      severity = 'alto';
      interpretation =
        'Índice acima de 1,5: fibrose significativa provável, com boa especificidade nessa faixa. A cirrose ainda não pode ser afirmada nem descartada com segurança.';
      nextSteps =
        'Confirme o estágio com elastografia hepática ou outro método não invasivo antes de decidir sobre rastreamentos.\nTrate a doença de base com prioridade e reforce abstinência alcoólica, vacinação para hepatites A e B e controle metabólico.\nEncaminhe ao hepatologista para definir a necessidade de rastreamento de varizes esofágicas e de carcinoma hepatocelular.';
    } else {
      label = 'Cirrose provável';
      severity = 'alto';
      interpretation =
        'Índice acima de 2,0: alta especificidade para cirrose. É o corte adotado pela Organização Mundial da Saúde para presumir cirrose em serviços sem elastografia.';
      nextSteps =
        'Conduza o paciente como portador de cirrose até prova em contrário: rastreamento de carcinoma hepatocelular com ultrassonografia a cada 6 meses e endoscopia digestiva alta para pesquisa de varizes esofágicas, conforme os critérios vigentes.\nPriorize o tratamento da causa (antiviral, abstinência alcoólica, controle metabólico) e evite medicamentos hepatotóxicos e anti-inflamatórios.\nEncaminhe ao hepatologista e avalie a presença de descompensação: ascite, encefalopatia, icterícia e sangramento varicoso.';
    }

    return {
      value: num(apri, 2),
      label,
      severity,
      interpretation,
      details: [
        { label: 'Fibrose significativa (F2 a F4)', value: fibrose(apri), hint: 'Cortes de 0,5 e 1,5' },
        { label: 'Cirrose (F4)', value: cirrose(apri), hint: 'Cortes de 1,0 e 2,0' },
        {
          label: 'AST em múltiplos do limite superior',
          value: `${num(razao, 2)} ×`,
        },
      ],
      nextSteps,
    };
  },

  formula: `APRI = [ (AST ÷ limite superior da normalidade do AST) ÷ plaquetas (×10⁹/L) ] × 100

Plaquetas em ×10⁹/L equivalem a mil/mm³ (150.000/mm³ = 150).

Fibrose significativa (METAVIR F2 a F4):
≤ 0,5 - improvável · 0,5 a 1,5 - indeterminado · ≥ 1,5 - provável

Cirrose (METAVIR F4):
≤ 1,0 - improvável · 1,0 a 2,0 - indeterminado · > 2,0 - provável

Exemplo: AST 80 U/L, limite superior 40 U/L e plaquetas 150 ×10⁹/L
→ (80/40) ÷ 150 × 100 = 1,33`,

  evidence:
    'O APRI foi derivado por Wai e colaboradores em 2003, em 270 pacientes com hepatite C crônica submetidos a biópsia hepática, divididos em um conjunto de treinamento e um de validação. As áreas sob a curva ROC foram de aproximadamente 0,80 para fibrose significativa e 0,89 para cirrose. Os autores propuseram cortes duplos, escolhidos para maximizar valor preditivo negativo na extremidade baixa e valor preditivo positivo na alta: 0,5 e 1,5 para fibrose significativa, 1,0 e 2,0 para cirrose. Metanálises posteriores em hepatite C confirmaram um desempenho moderado, com o inconveniente de deixar boa parte dos pacientes na faixa indeterminada. A Organização Mundial da Saúde adotou o corte de 2,0 como indicativo de cirrose em contextos de recursos limitados, e o Ministério da Saúde inclui métodos não invasivos como o APRI e o FIB-4 no estadiamento da hepatite C quando a elastografia não está disponível.',

  creator: {
    name: 'Chun-Tao Wai',
    bio: 'Hepatologista de Singapura; desenvolveu o índice durante estágio de pesquisa na University of Michigan, com o objetivo de reduzir a necessidade de biópsia hepática na hepatite C crônica.',
  },

  references: [
    {
      citation:
        'Wai CT, Greenson JK, Fontana RJ, et al. A simple noninvasive index can predict both significant fibrosis and cirrhosis in patients with chronic hepatitis C. Hepatology. 2003;38(2):518-26.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/12883497/',
      primary: true,
    },
    {
      citation:
        'Lin ZH, Xin YN, Dong QJ, et al. Performance of the aspartate aminotransferase-to-platelet ratio index for the staging of hepatitis C-related fibrosis: an updated meta-analysis. Hepatology. 2011;53(3):726-36.',
    },
    {
      citation:
        'World Health Organization. Guidelines for the prevention, care and treatment of persons with chronic hepatitis B infection. Geneva: World Health Organization; 2015.',
    },
    {
      citation:
        'Ministério da Saúde (Brasil), Secretaria de Vigilância em Saúde. Protocolo Clínico e Diretrizes Terapêuticas para Hepatite C e Coinfecções. Brasília: Ministério da Saúde; 2019.',
    },
  ],
};

export default calculator;
