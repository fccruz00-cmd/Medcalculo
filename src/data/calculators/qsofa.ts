import type { Calculator, Field, Values } from '@/lib/types';
import { sumPoints } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'infeccao',
    kind: 'choice',
    label: 'Há infecção suspeita ou confirmada?',
    hint: 'O qSOFA só foi validado em pacientes com suspeita de infecção: definida no estudo original como coleta de hemocultura somada à prescrição de antimicrobiano.',
    options: [
      { label: 'Sim', value: 'sim' },
      { label: 'Não', value: 'nao' },
    ],
  },
  {
    id: 'fr',
    kind: 'boolean',
    label: 'Frequência respiratória ≥ 22 irpm',
    hint: 'Conte a frequência por um minuto inteiro, sem o paciente perceber. Taquipneia é o item mais precoce e o mais frequentemente subnotificado.',
    points: 1,
  },
  {
    id: 'mental',
    kind: 'boolean',
    label: 'Alteração do estado mental (Glasgow < 15)',
    hint: 'Qualquer redução em relação ao basal: desorientação, sonolência, agitação ou resposta verbal confusa. Em idosos com demência, compare com o estado habitual relatado pelo cuidador.',
    points: 1,
  },
  {
    id: 'pas',
    kind: 'boolean',
    label: 'Pressão arterial sistólica ≤ 100 mmHg',
    hint: 'Atenção: o limiar do qSOFA é 100 mmHg, e não 90 mmHg como nos critérios de choque.',
    points: 1,
  },
];

const calculator: Calculator = {
  slug: 'qsofa',
  title: 'qSOFA: quick SOFA',
  shortTitle: 'qSOFA',
  subtitle:
    'Rastreia, à beira do leito e sem exames, o risco de desfecho desfavorável em adultos com suspeita de infecção fora da terapia intensiva.',
  specialties: ['Terapia Intensiva', 'Emergência'],
  kind: 'Escore de risco',
  popular: true,
  keywords: [
    'q sofa',
    'quick sofa',
    'sepsis 3',
    'sepse',
    'sepsis',
    'choque séptico',
    'infecção',
    'triagem',
    'rastreio',
  ],

  whenToUse: [
    'Adultos com infecção suspeita ou confirmada atendidos fora da UTI: pronto-socorro, enfermaria ou atendimento pré-hospitalar, , para identificar rapidamente quem tem risco elevado de morte ou de internação prolongada em terapia intensiva.',
    'Como sinalizador para acelerar a investigação de disfunção orgânica (lactato, gasometria, função renal e hepática) e o cálculo do SOFA completo.',
    'Não se aplica dentro da UTI, onde o desempenho do qSOFA é claramente inferior ao do SOFA, nem em crianças, gestantes ou pacientes sem suspeita de infecção.',
    'Não é critério diagnóstico de sepse: a definição do Sepsis-3 exige infecção suspeita mais aumento agudo de 2 ou mais pontos no SOFA.',
  ],

  whyUse:
    'Usa apenas três variáveis obtidas em segundos, sem nenhum exame laboratorial, e no estudo de derivação teve desempenho preditivo superior ao do SIRS e ao do próprio SOFA para mortalidade hospitalar em pacientes fora da UTI. Serve para levantar a suspeita e disparar a investigação, não para fechar diagnóstico.',

  pearls: [
    'A sensibilidade é baixa: em torno de 60% para mortalidade hospitalar em metanálises, contra cerca de 85% dos critérios de SIRS. Um qSOFA de 0 ou 1 NÃO exclui sepse: boa parte dos pacientes que morrem de infecção tem qSOFA abaixo de 2 na admissão.',
    'A Surviving Sepsis Campaign de 2021 recomenda explicitamente NÃO usar o qSOFA isolado como ferramenta única de triagem de sepse, em comparação com SIRS, NEWS ou MEWS (recomendação forte). Ele deve compor um protocolo, nunca substituí-lo.',
    'O qSOFA foi desenhado como preditor de prognóstico, não como teste diagnóstico. Escore 0 com infecção grave evidente ainda exige antibiótico e ressuscitação imediatos.',
    'O limiar de pressão é 100 mmHg (e não 90 mmHg). Em hipertensos crônicos, uma PAS de 105 mmHg já pode representar hipoperfusão significativa e não pontua.',
    'Alteração do estado mental é qualquer Glasgow abaixo de 15 em relação ao basal: sedação, uso de opioides e delirium hipoativo geram tanto falso-positivo quanto interpretação equivocada.',
    'O escore não incorpora lactato, temperatura, saturação nem comorbidades. Hipoxemia e lactato elevado devem escalonar a conduta independentemente do qSOFA.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const pontos = sumPoints(FIELDS, values);
    const semInfeccao = values.infeccao === 'nao';

    let label: string;
    let severity: 'baixo' | 'moderado' | 'alto';
    let interpretation: string;
    let nextSteps: string;

    if (pontos >= 2) {
      label = 'Risco elevado';
      severity = 'alto';
      interpretation =
        'qSOFA positivo (2 ou mais pontos). Na população de derivação, esses pacientes tiveram mortalidade hospitalar 3 a 14 vezes maior do que os pacientes com qSOFA abaixo de 2, com risco também maior de internação prolongada em UTI.\nO escore indica alta probabilidade de disfunção orgânica em curso e deve disparar avaliação imediata.';
      nextSteps =
        'Avalie disfunção orgânica sem demora: lactato arterial, gasometria, hemograma, creatinina, bilirrubina, coagulograma e cálculo do SOFA completo.\nColha duas hemoculturas e culturas do foco suspeito e inicie antimicrobiano de amplo espectro na primeira hora.\nSe houver hipotensão ou lactato acima de 2 mmol/L, inicie cristaloide 30 mL/kg e reavalie a perfusão; considere vasopressor precoce e acione a terapia intensiva.';
    } else if (pontos === 1) {
      label = 'Risco intermediário';
      severity = 'moderado';
      interpretation =
        'Um critério presente. O qSOFA isolado não classifica o paciente como de alto risco, mas a sensibilidade do escore é baixa e um único critério em paciente com infecção merece vigilância ativa.';
      nextSteps =
        'Mantenha reavaliação frequente dos sinais vitais e do nível de consciência, com nova aferição em 1 a 2 horas.\nSolicite lactato e exames de função orgânica se houver qualquer sinal de gravidade: hipoxemia, oligúria, pele mosqueada, tempo de enchimento capilar prolongado.\nNão retarde o antimicrobiano quando a suspeita de infecção bacteriana for forte.';
    } else {
      label = 'Risco baixo pelo qSOFA';
      severity = 'baixo';
      interpretation =
        'Nenhum critério presente. Esse resultado NÃO exclui sepse: a sensibilidade do qSOFA para mortalidade fica em torno de 60%, e parte relevante dos pacientes que evoluem para óbito por infecção tem qSOFA 0 ou 1 na chegada.\nO valor preditivo negativo do escore é insuficiente para dispensar avaliação clínica.';
      nextSteps =
        'Mantenha a investigação e o tratamento guiados pelo quadro clínico e pelo protocolo institucional de sepse, que deve usar critérios mais sensíveis (SIRS, NEWS2 ou MEWS).\nReavalie os sinais vitais periodicamente: o qSOFA pode positivar em poucas horas.';
    }

    if (semInfeccao) {
      interpretation = `Sem suspeita de infecção, o qSOFA não se aplica: ele foi derivado e validado apenas em pacientes com infecção suspeita ou confirmada. Use o resultado apenas como leitura descritiva dos sinais vitais.\n\n${interpretation}`;
    }

    return {
      value: pontos,
      unit: pontos === 1 ? 'ponto' : 'pontos',
      label: semInfeccao ? 'Fora da população de validação' : label,
      severity: semInfeccao ? 'info' : severity,
      interpretation,
      details: [
        {
          label: 'qSOFA positivo (≥ 2)',
          value: pontos >= 2 ? 'Sim' : 'Não',
        },
        {
          label: 'Mortalidade hospitalar',
          value: pontos >= 2 ? '≈ 24%' : '≈ 3%',
          hint: 'Coorte prospectiva de pronto-socorro, 879 pacientes com suspeita de infecção (Freund, 2017)',
        },
      ],
      nextSteps,
    };
  },

  formula: `Um ponto para cada critério presente (0 a 3):

Frequência respiratória ≥ 22 irpm - 1
Alteração do estado mental (Glasgow < 15) - 1
Pressão arterial sistólica ≤ 100 mmHg - 1

qSOFA ≥ 2 = risco elevado de morte hospitalar ou de permanência prolongada em UTI.

Atenção: o qSOFA não define sepse. Pelo Sepsis-3, sepse = infecção suspeita + aumento agudo ≥ 2 pontos no SOFA.`,

  evidence:
    'O qSOFA nasceu da força-tarefa do Sepsis-3, publicada por Seymour e colaboradores em 2016. Os autores analisaram 1,3 milhão de registros eletrônicos de 12 hospitais da rede UPMC (coorte de derivação, 148.907 encontros com suspeita de infecção) e validaram os achados em quatro bases externas, somando mais de 700 mil encontros. Entre os pacientes atendidos FORA da UTI, a área sob a curva ROC para mortalidade hospitalar foi de 0,81 para o qSOFA, 0,79 para o SOFA e 0,76 para os critérios de SIRS. Dentro da UTI a ordem se inverte: o SOFA teve AUROC de 0,74, contra 0,66 do qSOFA. Na coorte prospectiva francesa de Freund e colaboradores (2017), com 879 pacientes de pronto-socorro com suspeita de infecção, a mortalidade hospitalar foi de 24% com qSOFA ≥ 2 e de 3% com qSOFA < 2, mas a sensibilidade ficou em 70%, deixando escapar parte considerável dos óbitos. Por essa limitação de sensibilidade, a Surviving Sepsis Campaign de 2021 passou a recomendar contra o uso do qSOFA como instrumento único de triagem.',

  creator: {
    name: 'Christopher W. Seymour e a força-tarefa do Sepsis-3',
    bio: 'Intensivista e emergencista da Universidade de Pittsburgh, autor principal do artigo de derivação do qSOFA dentro da terceira definição internacional de sepse e choque séptico.',
  },

  references: [
    {
      citation:
        'Seymour CW, Liu VX, Iwashyna TJ, et al. Assessment of Clinical Criteria for Sepsis: For the Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3). JAMA. 2016;315(8):762-74.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/26903335/',
      primary: true,
    },
    {
      citation:
        'Singer M, Deutschman CS, Seymour CW, et al. The Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3). JAMA. 2016;315(8):801-10.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/26903338/',
    },
    {
      citation:
        'Freund Y, Lemachatti N, Krastinova E, et al. Prognostic Accuracy of Sepsis-3 Criteria for In-Hospital Mortality Among Patients With Suspected Infection Presenting to the Emergency Department. JAMA. 2017;317(3):301-8.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/28114554/',
    },
    {
      citation:
        'Evans L, Rhodes A, Alhazzani W, et al. Surviving Sepsis Campaign: International Guidelines for Management of Sepsis and Septic Shock 2021. Crit Care Med. 2021;49(11):e1063-e1143.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/34605781/',
    },
  ],
};

export default calculator;
