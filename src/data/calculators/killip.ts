import type { Calculator, Field, Values } from '@/lib/types';
import { n } from '@/lib/utils';

interface ClasseKillip {
  romano: string;
  titulo: string;
  mortalidade: number;
  severity: 'baixo' | 'moderado' | 'alto' | 'critico';
  interpretacao: string;
  conduta: string;
}

/**
 * Mortalidade hospitalar da coorte original de Killip e Kimball (1967),
 * 250 pacientes admitidos em unidade coronariana antes da era da reperfusão.
 */
const CLASSES: Record<number, ClasseKillip> = {
  1: {
    romano: 'I',
    titulo: 'Sem sinais de insuficiência cardíaca',
    mortalidade: 6,
    severity: 'baixo',
    interpretacao:
      'Ausência de congestão pulmonar e de sinais de baixo débito. É o grupo de melhor prognóstico do infarto agudo do miocárdio.',
    conduta:
      'Conduza a reperfusão conforme o tipo de infarto: angioplastia primária ou fibrinólise no IAM com supra, estratégia invasiva conforme o risco no IAM sem supra.\nMonitorização contínua nas primeiras 24 a 48 horas, terapia antitrombótica, betabloqueador, IECA ou BRA e estatina de alta potência quando não houver contraindicação.\nReclassifique o Killip a cada reavaliação: a classe pode piorar nas primeiras horas.',
  },
  2: {
    romano: 'II',
    titulo: 'Congestão pulmonar leve a moderada',
    mortalidade: 17,
    severity: 'moderado',
    interpretacao:
      'Estertores em menos da metade dos campos pulmonares, terceira bulha (B3) ou turgência jugular. Indica disfunção ventricular esquerda com congestão, sem edema agudo.',
    conduta:
      'Reperfusão sem atraso e internação em unidade coronariana.\nDiurético de alça endovenoso e oxigenoterapia guiada por oximetria; considere nitrato se a pressão arterial permitir e não houver infarto de ventrículo direito nem uso recente de inibidor de fosfodiesterase.\nEcocardiograma precoce para quantificar a fração de ejeção e procurar complicação mecânica.\nIntroduza IECA ou BRA e betabloqueador quando o paciente estiver compensado: betabloqueador não deve ser iniciado na vigência de congestão descompensada.',
  },
  3: {
    romano: 'III',
    titulo: 'Edema agudo de pulmão',
    mortalidade: 38,
    severity: 'alto',
    interpretacao:
      'Estertores em mais da metade dos campos pulmonares, com franco edema agudo de pulmão. Traduz disfunção ventricular esquerda grave.',
    conduta:
      'Reperfusão imediata e internação em unidade coronariana.\nVentilação não invasiva com pressão positiva, diurético de alça endovenoso e vasodilatador (nitroglicerina) se a pressão arterial sistólica permitir.\nEcocardiograma imediato para descartar complicação mecânica: insuficiência mitral aguda por ruptura de músculo papilar e comunicação interventricular se apresentam assim.\nPreparar via aérea e considerar suporte hemodinâmico se houver evolução para choque.',
  },
  4: {
    romano: 'IV',
    titulo: 'Choque cardiogênico',
    mortalidade: 81,
    severity: 'critico',
    interpretacao:
      'Hipotensão (PAS < 90 mmHg) com sinais de hipoperfusão: oligúria, extremidades frias, cianose, sudorese, confusão mental. É a apresentação de maior mortalidade do infarto agudo.',
    conduta:
      'Revascularização de urgência é o único tratamento que comprovadamente reduz mortalidade nesse cenário: encaminhe ao cateterismo imediatamente, independentemente do tempo de evolução.\nSuporte hemodinâmico com noradrenalina como vasopressor de escolha; associe inotrópico conforme a resposta. Considere suporte circulatório mecânico em centros que dispõem dele.\nEcocardiograma imediato para excluir complicação mecânica e infarto de ventrículo direito, que muda a estratégia volêmica.\nAvalie ventilação mecânica precoce e monitorização invasiva.',
  },
};

const FIELDS: Field[] = [
  {
    id: 'classe',
    kind: 'choice',
    label: 'Achados do exame físico',
    hint: 'Classifique pelo pior achado presente no momento da avaliação.',
    help: 'A classificação é puramente clínica, feita à beira do leito com ausculta pulmonar e cardíaca, medida da pressão arterial e avaliação de perfusão periférica. Não depende de exames complementares.',
    layout: 'stack',
    options: [
      {
        label: 'Classe I: sem sinais de insuficiência cardíaca',
        value: 1,
        hint: 'Ausculta pulmonar limpa, sem B3 e sem turgência jugular.',
      },
      {
        label: 'Classe II: estertores em menos de 50% dos campos, B3 ou turgência jugular',
        value: 2,
        hint: 'Congestão pulmonar leve a moderada.',
      },
      {
        label: 'Classe III: estertores em mais de 50% dos campos (edema agudo de pulmão)',
        value: 3,
        hint: 'Franco edema agudo de pulmão.',
      },
      {
        label: 'Classe IV: choque cardiogênico',
        value: 4,
        hint: 'PAS < 90 mmHg com sinais de hipoperfusão: oligúria, extremidades frias, cianose, sudorese.',
      },
    ],
  },
];

const calculator: Calculator = {
  slug: 'killip',
  title: 'Classificação de Killip',
  shortTitle: 'Killip',
  subtitle:
    'Classifica a gravidade da insuficiência cardíaca no infarto agudo do miocárdio a partir do exame físico e estima a mortalidade hospitalar.',
  specialties: ['Cardiologia', 'Emergência', 'Terapia Intensiva'],
  kind: 'Classificação',
  keywords: [
    'killip',
    'killip kimball',
    'infarto',
    'IAM',
    'insuficiência cardíaca',
    'choque cardiogênico',
    'edema agudo de pulmão',
    'mortalidade',
  ],

  whenToUse: [
    'Pacientes com infarto agudo do miocárdio, na admissão e a cada reavaliação clínica, para estimar prognóstico e definir a intensidade do suporte.',
    'Como variável de entrada de escores prognósticos: a classe de Killip é um dos oito componentes do escore GRACE e integra também o TIMI para IAM com supradesnivelamento de ST.',
    'Não se aplica a insuficiência cardíaca crônica descompensada fora do contexto de infarto, nem a congestão pulmonar de causa não cardíaca (pneumonia, SDRA, sobrecarga volêmica em doença renal).',
  ],

  whyUse:
    'É a estratificação prognóstica mais rápida disponível no infarto: exige apenas estetoscópio e esfigmomanômetro, leva menos de um minuto e separa grupos com mortalidade que vai de cerca de 6% a mais de 80%. Sobreviveu quase sessenta anos porque continua prevendo desfecho mesmo depois da introdução da trombólise e da angioplastia primária.',

  pearls: [
    'A classificação é feita à beira do leito, pelo exame físico. Não use raio-X de tórax, BNP, ecocardiograma nem cateter de artéria pulmonar para definir a classe: isso descaracteriza o instrumento e invalida a comparação com a literatura.',
    'Classifique pelo pior achado presente. Um paciente hipotenso e mal perfundido é classe IV mesmo que a ausculta pulmonar esteja limpa: é o caso típico do infarto de ventrículo direito.',
    'A classe muda com o tempo e com o tratamento. Registre a classe da admissão (é ela que entra no GRACE e nos estudos) e reavalie separadamente ao longo da internação.',
    'As mortalidades exibidas vêm da coorte original de 1967, anterior à reperfusão, à angioplastia e à terapia neuro-hormonal moderna. Nos registros contemporâneos, as taxas absolutas são substancialmente menores em todas as classes, mas o gradiente entre elas permanece.',
    'Killip III e IV obrigam a procurar complicação mecânica: ruptura de músculo papilar com insuficiência mitral aguda, comunicação interventricular e ruptura de parede livre se apresentam como edema agudo ou choque súbito. O ecocardiograma é imediato, não eletivo.',
    'Não confunda com a classificação de Forrester, que é hemodinâmica (índice cardíaco e pressão de oclusão da artéria pulmonar). Killip é clínica; Forrester exige cateter de artéria pulmonar.',
    'Em Killip IV, a reperfusão mecânica de urgência mantém benefício mesmo com apresentação tardia: o limite de tempo que se aplica à fibrinólise não se aplica ao cateterismo no choque cardiogênico.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const classe = n(values, 'classe');
    const dados = CLASSES[classe];

    if (!dados) {
      return {
        value: '-',
        severity: 'info' as const,
        interpretation: 'Selecione a classe de Killip correspondente ao exame físico do paciente.',
      };
    }

    return {
      value: `Killip ${dados.romano}`,
      label: dados.titulo,
      severity: dados.severity,
      interpretation: dados.interpretacao,
      details: [
        {
          label: 'Mortalidade hospitalar',
          value: `${dados.mortalidade}%`,
          hint: 'Coorte original de 250 pacientes, era pré-reperfusão (Killip e Kimball, 1967)',
        },
        {
          label: 'Nível de cuidado sugerido',
          value:
            classe === 1
              ? 'Unidade coronariana, monitorização'
              : classe === 2
                ? 'Unidade coronariana com suporte diurético'
                : classe === 3
                  ? 'Unidade coronariana, suporte ventilatório'
                  : 'Terapia intensiva, suporte hemodinâmico',
        },
      ],
      nextSteps: dados.conduta,
    };
  },

  formula: `Classificação clínica no infarto agudo do miocárdio, com a mortalidade hospitalar da coorte original (Killip e Kimball, 1967):

Classe I - sem sinais de insuficiência cardíaca: mortalidade 6%
Classe II - estertores em menos de 50% dos campos pulmonares, B3 ou turgência jugular: mortalidade 17%
Classe III - estertores em mais de 50% dos campos pulmonares (edema agudo de pulmão): mortalidade 38%
Classe IV - choque cardiogênico (PAS < 90 mmHg com hipoperfusão): mortalidade 81%`,

  evidence:
    'Thomas Killip e John Kimball descreveram a classificação em 1967, a partir dos 250 primeiros pacientes tratados na unidade coronariana do New York Hospital ao longo de dois anos. A mortalidade hospitalar foi de 6% na classe I, 17% na classe II, 38% na classe III e 81% na classe IV, em uma época sem trombólise, sem angioplastia e sem betabloqueadores ou inibidores da enzima conversora. Décadas depois, análises de grandes registros e ensaios da era da reperfusão confirmaram que a classe de Killip permanece um preditor independente de mortalidade em 30 dias e em 1 ano, com taxas absolutas bem menores que as originais. Por esse desempenho e pela simplicidade, a classe de Killip foi incorporada como variável do escore GRACE e do escore TIMI para IAM com supradesnivelamento de ST, e é registrada rotineiramente nas diretrizes brasileiras e internacionais de infarto.',

  creator: {
    name: 'Thomas Killip III e John T. Kimball',
    bio: 'Cardiologistas do New York Hospital-Cornell Medical Center, pioneiros na organização das unidades coronarianas nos anos 1960.',
  },

  updatedAt: '2026-07-26',

  references: [
    {
      citation:
        'Killip T 3rd, Kimball JT. Treatment of myocardial infarction in a coronary care unit. A two year experience with 250 patients. Am J Cardiol. 1967;20(4):457-64.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/6059183/',
      primary: true,
    },
    {
      citation:
        'Granger CB, Goldberg RJ, Dabbous O, et al. Predictors of hospital mortality in the Global Registry of Acute Coronary Events. Arch Intern Med. 2003;163(19):2345-53.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/14581255/',
    },
    {
      citation:
        'Hochman JS, Sleeper LA, Webb JG, et al. Early revascularization in acute myocardial infarction complicated by cardiogenic shock (SHOCK Trial). N Engl J Med. 1999;341(9):625-34.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/10460813/',
    },
    {
      citation:
        'Nicolau JC, Feitosa Filho GS, Petriz JL, et al. Diretrizes da Sociedade Brasileira de Cardiologia sobre Angina Instável e Infarto Agudo do Miocárdio sem Supradesnível do Segmento ST: 2021. Arq Bras Cardiol. 2021;117(1):181-264.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/34320090/',
    },
  ],
};

export default calculator;
