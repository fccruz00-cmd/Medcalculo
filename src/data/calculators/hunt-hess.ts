import type { Calculator, Field, Values } from '@/lib/types';
import { n } from '@/lib/utils';

const ROMANOS: Record<number, string> = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };

/**
 * Mortalidade hospitalar (%) por grau de Hunt e Hess no SAH Outcomes Project
 * da Universidade Columbia: 1.200 pacientes, 1996 a 2009 (Lantigua, 2015).
 * Graus I e II foram analisados em conjunto no estudo original.
 */
const MORTALIDADE_HOSPITALAR: Record<number, number> = {
  1: 3,
  2: 3,
  3: 9,
  4: 24,
  5: 71,
};

const FIELDS: Field[] = [
  {
    id: 'grau',
    kind: 'choice',
    label: 'Quadro clínico na admissão',
    hint: 'Classifique após a estabilização inicial e após tratar hidrocefalia aguda, crises epilépticas e hipoxemia: não no momento exato do ictus.',
    layout: 'stack',
    options: [
      {
        label: 'Grau I: assintomático ou cefaleia leve e discreta rigidez de nuca',
        value: 1,
        badge: 'I',
      },
      {
        label: 'Grau II: cefaleia moderada a intensa e rigidez de nuca, sem déficit neurológico além de paralisia de nervo craniano',
        value: 2,
        badge: 'II',
        hint: 'A paralisia do III par por aneurisma de comunicante posterior não sobe o grau.',
      },
      {
        label: 'Grau III: sonolência, confusão mental ou déficit focal leve',
        value: 3,
        badge: 'III',
      },
      {
        label: 'Grau IV: estupor, hemiparesia moderada a grave, possível rigidez de descerebração precoce e distúrbios vegetativos',
        value: 4,
        badge: 'IV',
      },
      {
        label: 'Grau V: coma profundo, rigidez de descerebração, aparência moribunda',
        value: 5,
        badge: 'V',
      },
    ],
  },
  {
    id: 'modificador',
    kind: 'boolean',
    label: 'Doença sistêmica grave ou vasoespasmo grave à arteriografia',
    hint: 'Regra do artigo original: hipertensão arterial grave, diabetes, aterosclerose acentuada, doença pulmonar obstrutiva crônica ou vasoespasmo grave na arteriografia deslocam o paciente para o grau imediatamente pior.',
    optional: true,
    points: 1,
    labels: ['Não', 'Sim'],
  },
];

const calculator: Calculator = {
  slug: 'hunt-hess',
  title: 'Classificação de Hunt e Hess',
  shortTitle: 'Hunt e Hess',
  subtitle:
    'Gradua a gravidade clínica da hemorragia subaracnóidea aneurismática em cinco graus e estima o risco de óbito.',
  specialties: ['Neurologia', 'Terapia Intensiva', 'Emergência'],
  kind: 'Classificação',
  keywords: [
    'hunt hess',
    'hunt e hess',
    'hemorragia subaracnóidea',
    'HSA',
    'aneurisma cerebral',
    'aneurisma roto',
    'cefaleia súbita',
    'WFNS',
  ],

  whenToUse: [
    'Adultos com hemorragia subaracnóidea espontânea de origem aneurismática, para graduar a gravidade clínica na admissão e comunicar o caso de forma padronizada.',
    'Estratificação de risco e comparação de casuísticas em unidades neurovasculares e de terapia intensiva neurológica.',
    'Não se aplica a hemorragia subaracnóidea traumática, a hemorragia perimesencefálica não aneurismática (de prognóstico bem melhor) nem a hemorragia intraparenquimatosa: nesta última, use o escore ICH.',
    'Não deve ser usada para negar tratamento: mesmo os graus IV e V têm sobrevida e recuperação funcional relevantes com neurointensivismo e tratamento precoce do aneurisma.',
  ],

  whyUse:
    'É a graduação clínica mais difundida na hemorragia subaracnóidea, usada há mais de cinquenta anos como referência para prognóstico, comunicação entre equipes e comparação entre séries. Precisa apenas do exame neurológico à beira do leito, sem exame complementar.',

  pearls: [
    'Gradue depois da ressuscitação inicial. Muito paciente chega grau IV ou V por hidrocefalia aguda, crise epiléptica ou hipoxemia e melhora vários graus após derivação ventricular externa, controle de crise e correção respiratória: graduar antes disso rotula erroneamente o paciente como de mau prognóstico.',
    'A classificação é clínica e independe da tomografia. Para estimar o risco de vasoespasmo e isquemia cerebral tardia use a escala de Fisher ou a Fisher modificada, que graduam a quantidade e a distribuição do sangue no exame de imagem.',
    'Paralisia isolada de nervo craniano, tipicamente o III par no aneurisma de comunicante posterior, mantém o paciente no grau II. Confundir isso com "déficit focal" e classificar como grau III é erro frequente.',
    'A regra original de acrescentar um grau por doença sistêmica grave ou vasoespasmo arteriográfico é pouco aplicada na prática atual e quase nunca é relatada nos estudos. Se usar, deixe explícito no prontuário.',
    'A concordância entre observadores é apenas moderada, sobretudo entre os graus II e III. A escala da WFNS, baseada na escala de coma de Glasgow e na presença de déficit motor, é mais reprodutível e frequentemente registrada em paralelo.',
    'A mortalidade histórica citada para os graus IV e V vem de séries antigas, anteriores ao tratamento endovascular e ao neurointensivismo, e superestima bastante o risco atual. Evite tomar decisões de limitação terapêutica nas primeiras 48 a 72 horas com base apenas no grau de admissão.',
    'O grau não define mais o momento de tratar o aneurisma. As diretrizes atuais recomendam ocluir o aneurisma o mais precocemente possível, idealmente nas primeiras 24 a 72 horas, em todos os graus, para prevenir o ressangramento, que é a complicação mais letal da fase inicial.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const base = Math.min(5, Math.max(1, n(values, 'grau')));
    const modificador = n(values, 'modificador') > 0 ? 1 : 0;
    const grau = Math.min(5, base + modificador);
    const mortalidade = MORTALIDADE_HOSPITALAR[grau] ?? 71;

    let label: string;
    let severity: 'baixo' | 'moderado' | 'alto' | 'critico';
    let interpretation: string;
    let nextSteps: string;

    if (grau <= 2) {
      label = 'Bom grau clínico';
      severity = 'baixo';
      interpretation =
        'Hemorragia subaracnóidea de bom grau clínico: consciência preservada e ausência de déficit focal além de eventual paralisia de nervo craniano. É o grupo com melhor prognóstico funcional, desde que o aneurisma seja tratado antes de ressangrar.';
      nextSteps =
        'Confirme a fonte do sangramento com angiotomografia ou arteriografia digital e programe a oclusão do aneurisma (clipagem ou tratamento endovascular) nas primeiras 24 a 72 horas.\nInternação em unidade neurointensiva, com repouso, analgesia adequada e controle pressórico até a exclusão do aneurisma.\nInicie nimodipino oral 60 mg a cada 4 horas por 21 dias: reduz desfecho desfavorável por isquemia cerebral tardia.\nMonitore diariamente o exame neurológico, o sódio sérico e sinais de vasoespasmo entre o 4º e o 14º dia.';
    } else if (grau === 3) {
      label = 'Grau intermediário';
      severity = 'moderado';
      interpretation =
        'Há rebaixamento do nível de consciência (sonolência ou confusão) ou déficit focal leve. Prognóstico intermediário, com risco relevante de hidrocefalia e de isquemia cerebral tardia.';
      nextSteps =
        'Tomografia imediata para avaliar hidrocefalia aguda e hematoma associado: a derivação ventricular externa costuma melhorar o quadro clínico de forma expressiva.\nTratamento precoce do aneurisma e internação em unidade neurointensiva com monitorização neurológica horária.\nNimodipino oral por 21 dias, euvolemia e atenção à hiponatremia e à hipovolemia.\nReclassifique o paciente após as intervenções iniciais: a melhora do grau muda o prognóstico.';
    } else if (grau === 4) {
      label = 'Mau grau clínico';
      severity = 'alto';
      interpretation =
        'Estupor e déficit motor importante. Grupo de alto risco de complicações neurológicas e sistêmicas, mas com chance real de recuperação funcional quando tratado agressivamente.';
      nextSteps =
        'Avaliação neurocirúrgica imediata, com derivação ventricular externa se houver hidrocefalia e drenagem de hematoma quando indicada.\nProteção de via aérea e suporte em terapia intensiva neurológica; trate a hipertensão intracraniana.\nOclua o aneurisma precocemente: o ressangramento é a principal causa evitável de óbito nas primeiras horas.\nEvite prognóstico definitivo e limitações terapêuticas nas primeiras 48 a 72 horas: parte relevante desses pacientes melhora vários graus após as intervenções iniciais.';
    } else {
      label = 'Grau crítico';
      severity = 'critico';
      interpretation =
        'Coma profundo, rigidez de descerebração e aparência moribunda. É o grau de maior mortalidade, embora séries contemporâneas mostrem sobrevida e desfecho funcional favorável em uma parcela desses pacientes.';
      nextSteps =
        'Suporte avançado imediato: via aérea definitiva, estabilização hemodinâmica e tratamento da hipertensão intracraniana.\nDerivação ventricular externa precoce: a hidrocefalia aguda é causa frequente e reversível do coma nesse cenário; reavalie o grau depois do procedimento.\nSe houver melhora após as medidas iniciais, prossiga com o tratamento do aneurisma.\nDiscuta objetivos de cuidado com a família, mas adie decisões definitivas: o prognóstico só se define depois da resposta às intervenções das primeiras 48 a 72 horas.';
    }

    const details = [
      {
        label: 'Grau final',
        value: `Grau ${ROMANOS[grau] ?? ', '}`,
        hint: modificador ? `Grau ${ROMANOS[base]} com um grau acrescido pelo modificador` : undefined,
      },
      {
        label: 'Mortalidade hospitalar estimada',
        value: `${mortalidade}%`,
        hint: 'SAH Outcomes Project, Universidade Columbia: 1.200 pacientes, 1996 a 2009 (graus I e II analisados em conjunto)',
      },
      {
        label: 'Equivalente aproximado na escala WFNS',
        value:
          grau <= 2
            ? 'WFNS I a II (Glasgow 13 a 15, sem déficit motor)'
            : grau === 3
              ? 'WFNS III (Glasgow 14 a 13 com déficit)'
              : grau === 4
                ? 'WFNS IV (Glasgow 12 a 7)'
                : 'WFNS V (Glasgow 6 a 3)',
        hint: 'Correspondência aproximada; as escalas não são intercambiáveis',
      },
    ];

    return {
      value: `Grau ${ROMANOS[grau] ?? ', '}`,
      label,
      severity,
      interpretation,
      details,
      nextSteps,
    };
  },

  formula: `Grau clínico atribuído pelo exame neurológico:

I - Assintomático ou cefaleia leve e discreta rigidez de nuca.
II - Cefaleia moderada a intensa e rigidez de nuca, sem déficit neurológico além de paralisia de nervo craniano.
III - Sonolência, confusão mental ou déficit focal leve.
IV - Estupor, hemiparesia moderada a grave, possível rigidez de descerebração precoce e distúrbios vegetativos.
V - Coma profundo, rigidez de descerebração, aparência moribunda.

Modificador do artigo original: doença sistêmica grave (hipertensão arterial grave, diabetes, aterosclerose acentuada, doença pulmonar obstrutiva crônica) ou vasoespasmo grave na arteriografia deslocam o paciente para o grau imediatamente pior.`,

  evidence:
    'William Hunt e Robert Hess propuseram a classificação em 1968, no Ohio State University Hospital, ao analisar 275 pacientes com aneurisma intracraniano e relacionar o estado clínico na admissão ao risco cirúrgico e ao momento ideal da intervenção. A escala consolidou-se como a graduação clínica mais usada na hemorragia subaracnóidea, apesar de a concordância entre observadores ser apenas moderada: motivo pelo qual a World Federation of Neurological Surgeons propôs, em 1988, uma escala alternativa baseada na escala de coma de Glasgow e na presença de déficit motor. As estimativas de mortalidade apresentadas aqui vêm do SAH Outcomes Project da Universidade Columbia, que acompanhou 1.200 pacientes com hemorragia subaracnóidea aneurismática entre 1996 e 2009: a mortalidade hospitalar global foi de 18%, sendo 3% nos graus I e II, 9% no grau III, 24% no grau IV e 71% no grau V. Séries mais antigas, anteriores ao tratamento endovascular, ao nimodipino e ao neurointensivismo, relatavam mortalidade substancialmente maior nos graus altos.',

  creator: {
    name: 'William E. Hunt e Robert M. Hess',
    bio: 'Neurocirurgiões do Ohio State University Hospital, em Columbus, que publicaram a classificação em 1968 no Journal of Neurosurgery.',
  },

  references: [
    {
      citation:
        'Hunt WE, Hess RM. Surgical risk as related to time of intervention in the repair of intracranial aneurysms. J Neurosurg. 1968;28(1):14-20.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/5635959/',
      primary: true,
    },
    {
      citation:
        'Report of World Federation of Neurological Surgeons Committee on a Universal Subarachnoid Hemorrhage Grading Scale. J Neurosurg. 1988;68(6):985-6.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/3131498/',
    },
    {
      citation:
        'Lantigua H, Ortega-Gutierrez S, Schmidt JM, et al. Subarachnoid hemorrhage: who dies, and why? Crit Care. 2015;19:309.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/26330064/',
    },
    {
      citation:
        'Hoh BL, Ko NU, Amin-Hanjani S, et al. 2023 Guideline for the Management of Patients With Aneurysmal Subarachnoid Hemorrhage: A Guideline From the American Heart Association/American Stroke Association. Stroke. 2023;54(7):e314-e370.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/37212182/',
    },
  ],
};

export default calculator;
