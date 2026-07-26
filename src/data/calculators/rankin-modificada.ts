import type { Calculator, Field, Values } from '@/lib/types';
import { n } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'grau',
    kind: 'choice',
    label: 'Grau de incapacidade',
    hint: 'Escolha o grau que descreve o estado atual do paciente, considerando o conjunto das atividades da vida diária: e não apenas o déficit neurológico isolado.',
    layout: 'stack',
    options: [
      {
        label: '0: Sem sintomas',
        value: 0,
        badge: '0',
        hint: 'Nenhum sintoma residual atribuível ao evento.',
      },
      {
        label: '1: Sem incapacidade significativa, apesar dos sintomas',
        value: 1,
        badge: '1',
        hint: 'Mantém todas as atividades e responsabilidades habituais, mesmo com algum sintoma residual.',
      },
      {
        label: '2: Incapacidade leve',
        value: 2,
        badge: '2',
        hint: 'Não consegue realizar todas as atividades prévias, mas cuida dos próprios assuntos sem ajuda.',
      },
      {
        label: '3: Incapacidade moderada',
        value: 3,
        badge: '3',
        hint: 'Precisa de alguma ajuda, mas caminha sem assistência de outra pessoa (bengala ou andador são permitidos).',
      },
      {
        label: '4: Incapacidade moderadamente grave',
        value: 4,
        badge: '4',
        hint: 'Não caminha sem ajuda de outra pessoa e não atende às próprias necessidades corporais sem assistência.',
      },
      {
        label: '5: Incapacidade grave',
        value: 5,
        badge: '5',
        hint: 'Acamado, incontinente, exigindo cuidados de enfermagem e atenção constantes.',
      },
      { label: '6: Óbito', value: 6, badge: '6' },
    ],
  },
];

const DESCRICAO: Record<number, string> = {
  0: 'Sem sintomas',
  1: 'Sem incapacidade significativa',
  2: 'Incapacidade leve',
  3: 'Incapacidade moderada',
  4: 'Incapacidade moderadamente grave',
  5: 'Incapacidade grave',
  6: 'Óbito',
};

const calculator: Calculator = {
  slug: 'rankin-modificada',
  title: 'Escala de Rankin modificada',
  shortTitle: 'Rankin modificada (mRS)',
  subtitle:
    'Gradua o nível global de incapacidade após um acidente vascular cerebral, de 0 (sem sintomas) a 6 (óbito).',
  specialties: ['Neurologia'],
  kind: 'Escala',
  keywords: [
    'rankin',
    'mRS',
    'escala de rankin modificada',
    'incapacidade',
    'desfecho funcional',
    'AVC',
    'acidente vascular cerebral',
    'prognóstico',
  ],

  whenToUse: [
    'Medida de desfecho funcional após AVC isquêmico ou hemorrágico, tipicamente aplicada em 90 dias: é o desfecho primário da maioria dos ensaios de trombólise e trombectomia.',
    'Registro do estado funcional prévio (mRS basal) na admissão do AVC agudo: muitos protocolos de trombectomia exigem mRS prévio de 0 a 1 ou 0 a 2.',
    'Acompanhamento ambulatorial e planejamento de reabilitação, comparando o grau atual com o basal.',
    'Também é usada em hemorragia subaracnóidea, trombose venosa cerebral e outras doenças neurológicas com incapacidade global, embora tenha sido concebida para o AVC.',
    'Não serve para quantificar o déficit neurológico agudo: para isso use a NIHSS. E não é sensível a mudanças pequenas: é uma escala grosseira, de sete níveis.',
  ],

  whyUse:
    'A mRS resume em um único número o que realmente importa para o paciente: se ele voltou a fazer o que fazia, se é independente e se precisa de outra pessoa. Por isso virou o desfecho padrão dos ensaios clínicos em AVC e a linguagem comum entre neurologia, reabilitação e pesquisa.',

  pearls: [
    'A fronteira entre 2 e 3 é a mais decisiva e a que mais gera discordância: o grau 3 exige ajuda de outra pessoa em alguma atividade instrumental (finanças, compras, medicações), mas o paciente continua caminhando sozinho. Se ele resolve os próprios assuntos sem ajuda, é 2, por mais sintomas que tenha.',
    'A fronteira entre 3 e 4 é a marcha: grau 3 caminha sem assistência de outra pessoa; bengala, muleta e andador não descaracterizam. Grau 4 precisa de outra pessoa para caminhar ou para as necessidades corporais.',
    '"Desfecho favorável" não tem definição única. Os ensaios de trombólise usaram mRS 0 a 1; os de trombectomia e a maioria dos estudos atuais usam mRS 0 a 2 (independência funcional). Diga sempre qual corte está usando.',
    'Compare sempre com o mRS prévio. Um paciente que já vivia com mRS 3 e voltou a mRS 3 recuperou seu basal: chamá-lo de "desfecho desfavorável" é um erro comum de leitura.',
    'A escala mede incapacidade global, não déficit focal: comorbidades, artrose, DPOC e demência entram na conta. Um paciente pode ter NIHSS 1 e mRS 4 por causa de outra doença.',
    'A concordância entre observadores é apenas moderada quando a escala é aplicada de forma livre. Use o formato de entrevista estruturada (mRS-SI), validado por Wilson e colaboradores, que eleva o kappa de forma consistente.',
    'A versão brasileira validada por Cincura e colaboradores mostrou que a adaptação cultural e a entrevista estruturada são justamente o que garante a confiabilidade em português.',
    'O grau 5 exige cuidados de enfermagem contínuos e incontinência; não use 5 apenas porque o paciente está acamado no hospital na fase aguda.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const grau = n(values, 'grau');
    const descricao = DESCRICAO[grau] ?? '-';

    let label: string;
    let severity: 'baixo' | 'moderado' | 'alto' | 'critico';
    let interpretation: string;
    let nextSteps: string;

    if (grau <= 1) {
      label = 'Desfecho excelente';
      severity = 'baixo';
      interpretation =
        'Paciente sem incapacidade relevante: retomou as atividades e responsabilidades habituais. É a faixa usada como "desfecho excelente" (mRS 0 a 1) nos ensaios de trombólise.';
      nextSteps =
        'Concentre o cuidado na prevenção secundária: definição etiológica, antiagregação ou anticoagulação conforme a causa, estatina, controle de pressão, glicemia e tabagismo.\nOriente retorno gradual às atividades, inclusive dirigir e trabalhar, conforme avaliação individual.';
    } else if (grau === 2) {
      label = 'Independente';
      severity = 'baixo';
      interpretation =
        'Há limitação em parte das atividades prévias, mas o paciente cuida dos próprios assuntos sem ajuda de terceiros. Está dentro da faixa de independência funcional (mRS 0 a 2), o desfecho favorável usado nos ensaios de trombectomia.';
      nextSteps =
        'Mantenha reabilitação dirigida às limitações residuais: fisioterapia, terapia ocupacional e fonoaudiologia conforme o déficit.\nReavalie humor e cognição: depressão pós-AVC e déficit cognitivo são causas frequentes de perda funcional tardia.\nPrevenção secundária plena e reavaliação periódica do grau funcional.';
    } else if (grau === 3) {
      label = 'Incapacidade moderada';
      severity = 'moderado';
      interpretation =
        'O paciente caminha sem assistência de outra pessoa, mas depende de ajuda para parte das atividades instrumentais. Fora da faixa de independência funcional.';
      nextSteps =
        'Programa estruturado de reabilitação multiprofissional, com metas funcionais definidas.\nAvalie a rede de suporte domiciliar, adaptações ambientais e risco de queda.\nRastreie depressão, dor no ombro hemiplégico, espasticidade e disfagia.';
    } else if (grau === 4) {
      label = 'Incapacidade moderadamente grave';
      severity = 'alto';
      interpretation =
        'Dependência para deambular e para as necessidades corporais. O cuidado passa a exigir um cuidador disponível na maior parte do dia.';
      nextSteps =
        'Reabilitação intensiva quando houver potencial funcional, com foco em transferências, controle de tronco e prevenção de complicações.\nPrevenção ativa de lesão por pressão, broncoaspiração, trombose venosa e contraturas.\nCapacite e apoie o cuidador; avalie necessidade de suporte social e de dispositivos de auxílio.';
    } else if (grau === 5) {
      label = 'Incapacidade grave';
      severity = 'critico';
      interpretation =
        'Paciente acamado, incontinente, dependente de cuidados de enfermagem contínuos. Alta carga de complicações clínicas e de sobrecarga do cuidador.';
      nextSteps =
        'Cuidado centrado em conforto, prevenção de complicações e qualidade de vida: manejo de disfagia e via de alimentação, prevenção de lesão por pressão e de pneumonia aspirativa.\nDiscuta objetivos de cuidado com a família e considere a equipe de cuidados paliativos.\nAvalie e apoie formalmente o cuidador: a sobrecarga nessa faixa é regra, não exceção.';
    } else {
      label = 'Óbito';
      severity = 'critico';
      interpretation =
        'Grau 6 corresponde a óbito. Nos ensaios clínicos, é analisado junto com os demais graus na distribuição ordinal da escala (análise de shift).';
      nextSteps =
        'Nenhuma conduta clínica se aplica. Em pesquisa, mantenha o grau 6 na análise ordinal: excluir os óbitos enviesa a comparação entre os grupos.';
    }

    const faixa =
      grau === 6 ? 'Óbito' : grau <= 2 ? 'Independência funcional (0 a 2)' : 'Dependência (3 a 5)';

    return {
      value: grau,
      unit: 'de 6',
      label,
      severity,
      interpretation,
      details: [
        { label: 'Grau', value: `${grau}: ${descricao}` },
        {
          label: 'Classificação usual de desfecho',
          value: faixa,
          hint: 'Desfecho favorável costuma ser definido como mRS 0 a 2',
        },
        {
          label: 'Deambulação',
          value: grau <= 3 ? 'Caminha sem assistência de outra pessoa' : grau <= 5 ? 'Depende de outra pessoa' : '-',
        },
      ],
      nextSteps,
    };
  },

  formula: `Grau único, de 0 a 6:

0 - Sem sintomas.
1 - Nenhuma incapacidade significativa apesar dos sintomas: mantém todas as atividades e responsabilidades habituais.
2 - Incapacidade leve: incapaz de realizar todas as atividades prévias, mas cuida dos próprios assuntos sem ajuda.
3 - Incapacidade moderada: requer alguma ajuda, mas caminha sem assistência de outra pessoa.
4 - Incapacidade moderadamente grave: incapaz de caminhar sem ajuda e de atender às próprias necessidades corporais sem assistência.
5 - Incapacidade grave: acamado, incontinente, exigindo cuidados de enfermagem e atenção constantes.
6 - Óbito.

Cortes usuais:
mRS 0 a 1 - desfecho excelente
mRS 0 a 2 - independência funcional (desfecho favorável)
mRS 3 a 5 - dependência`,

  evidence:
    'A escala original foi descrita por John Rankin em 1957, no Stobhill Hospital, em Glasgow, ao acompanhar o prognóstico de pacientes com mais de 60 anos após acidente vascular cerebral. A versão modificada em uso hoje, com o grau 0 e a redação atual dos graus 1 a 5, foi consolidada por van Swieten e colaboradores em 1988, em um estudo de concordância entre observadores em pacientes com AVC. Banks e Marotta, em revisão sistemática de 2007, reuniram as evidências de validade e confiabilidade que sustentam seu uso como desfecho em ensaios clínicos, mostrando correlação consistente com volume do infarto, NIHSS, índice de Barthel e medidas de qualidade de vida. Wilson e colaboradores demonstraram em 2002 que uma entrevista estruturada aumenta substancialmente a concordância entre avaliadores. No Brasil, Cincura e colaboradores publicaram em 2009 a validação da versão em português, junto com a NIHSS e o índice de Barthel, reforçando o papel da adaptação cultural e da entrevista estruturada na confiabilidade da medida.',

  creator: {
    name: 'John Rankin; modificada por J. C. van Swieten e colaboradores',
    bio: 'Rankin descreveu a escala em 1957 no Stobhill Hospital, em Glasgow. O grupo de van Swieten, em Roterdã, publicou em 1988 a versão modificada de sete níveis usada até hoje.',
  },

  references: [
    {
      citation:
        'Rankin J. Cerebral vascular accidents in patients over the age of 60. II. Prognosis. Scott Med J. 1957;2(5):200-15.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/13432835/',
      primary: true,
    },
    {
      citation:
        'van Swieten JC, Koudstaal PJ, Visser MC, Schouten HJ, van Gijn J. Interobserver agreement for the assessment of handicap in stroke patients. Stroke. 1988;19(5):604-7.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/3363593/',
    },
    {
      citation:
        'Wilson JTL, Hareendran A, Grant M, et al. Improving the assessment of outcomes in stroke: use of a structured interview to assign grades on the modified Rankin Scale. Stroke. 2002;33(9):2243-6.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/12215594/',
    },
    {
      citation:
        'Banks JL, Marotta CA. Outcomes validity and reliability of the modified Rankin scale: implications for stroke clinical trials: a literature review and synthesis. Stroke. 2007;38(3):1091-6.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/17272767/',
    },
    {
      citation:
        'Cincura C, Pontes-Neto OM, Neville IS, et al. Validation of the National Institutes of Health Stroke Scale, modified Rankin Scale and Barthel Index in Brazil: the role of cultural adaptation and structured interviewing. Cerebrovasc Dis. 2009;27(2):119-22.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/19039215/',
    },
  ],
};

export default calculator;
