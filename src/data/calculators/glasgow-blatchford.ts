import type { Calculator, Field, Values } from '@/lib/types';
import { n, num } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'sexo',
    kind: 'choice',
    label: 'Sexo',
    hint: 'Os limiares de hemoglobina do escore são diferentes para homens e mulheres.',
    options: [
      { label: 'Masculino', value: 'M' },
      { label: 'Feminino', value: 'F' },
    ],
  },
  {
    id: 'ureia',
    kind: 'number',
    label: 'Ureia sérica',
    unit: 'mg/dL',
    min: 5,
    max: 400,
    step: 1,
    normalRange: '15 a 40 mg/dL',
    hint: 'Ureia, não BUN. O escore original usa mmol/L: os limiares de 6,5 · 8 · 10 · 25 mmol/L equivalem a 39 · 48 · 60 · 150 mg/dL. Se o seu laboratório informa BUN, multiplique por 2,14 para obter a ureia.',
    unitToggle: {
      alt: 'mmol/L',
      toBase: (value) => value * 6.006,
      fromBase: (value) => value / 6.006,
    },
  },
  {
    id: 'hemoglobina',
    kind: 'number',
    label: 'Hemoglobina',
    unit: 'g/dL',
    min: 3,
    max: 20,
    step: 0.1,
    normalRange: 'Homens 13 a 17 g/dL · Mulheres 12 a 16 g/dL',
    hint: 'Hemoglobina da admissão. Em sangramento agudo e volumoso, a hemodiluição ainda não ocorreu e o valor pode subestimar a perda.',
  },
  {
    id: 'pas',
    kind: 'number',
    label: 'Pressão arterial sistólica',
    unit: 'mmHg',
    min: 40,
    max: 260,
    step: 1,
    hint: 'Primeira aferição na chegada, antes da reposição volêmica.',
  },
  {
    id: 'fc',
    kind: 'number',
    label: 'Frequência cardíaca',
    unit: 'bpm',
    min: 30,
    max: 220,
    step: 1,
    hint: 'Pontua 1 quando é de 100 bpm ou mais.',
  },
  {
    id: 'melena',
    kind: 'boolean',
    label: 'Melena na apresentação',
    hint: 'Fezes enegrecidas, pastosas e fétidas: não confundir com fezes escurecidas por ferro oral ou bismuto.',
    points: 1,
  },
  {
    id: 'sincope',
    kind: 'boolean',
    label: 'Síncope na apresentação',
    hint: 'Perda transitória da consciência relacionada ao episódio de sangramento. Pré-síncope isolada não pontua.',
    points: 2,
  },
  {
    id: 'hepatopatia',
    kind: 'boolean',
    label: 'Doença hepática',
    hint: 'História conhecida ou evidência clínica e laboratorial de hepatopatia crônica.',
    points: 2,
  },
  {
    id: 'ic',
    kind: 'boolean',
    label: 'Insuficiência cardíaca',
    hint: 'História conhecida ou sinais clínicos/ecocardiográficos de insuficiência cardíaca.',
    points: 2,
  },
];

/** Pontos da ureia: limiares originais em mmol/L convertidos para mg/dL. */
function pontosUreia(ureia: number): number {
  if (ureia >= 150) return 6;
  if (ureia >= 60) return 4;
  if (ureia >= 48) return 3;
  if (ureia >= 39) return 2;
  return 0;
}

/** Pontos da hemoglobina, com limiares distintos por sexo. */
function pontosHemoglobina(hb: number, feminino: boolean): number {
  if (hb < 10) return 6;
  if (feminino) {
    if (hb < 12) return 1;
    return 0;
  }
  if (hb < 12) return 3;
  if (hb < 13) return 1;
  return 0;
}

/** Pontos da pressão arterial sistólica. */
function pontosPas(pas: number): number {
  if (pas < 90) return 3;
  if (pas < 100) return 2;
  if (pas < 110) return 1;
  return 0;
}

const calculator: Calculator = {
  slug: 'glasgow-blatchford',
  title: 'Escore de Glasgow-Blatchford',
  shortTitle: 'Glasgow-Blatchford',
  subtitle:
    'Estima, antes da endoscopia, a necessidade de intervenção na hemorragia digestiva alta e identifica os pacientes que podem ser manejados fora do hospital.',
  specialties: ['Gastroenterologia', 'Emergência', 'Clínica Médica'],
  kind: 'Escore de risco',
  popular: true,
  keywords: [
    'blatchford',
    'GBS',
    'glasgow blatchford',
    'hemorragia digestiva alta',
    'HDA',
    'hematêmese',
    'melena',
    'sangramento gastrointestinal',
    'endoscopia',
  ],

  whenToUse: [
    'Adultos que chegam ao pronto-socorro com hemorragia digestiva alta: hematêmese, vômitos em borra de café ou melena, , ANTES da endoscopia.',
    'Para decidir quem pode receber alta com endoscopia ambulatorial: escore 0, ou 0 a 1 pelas diretrizes europeias, identifica risco muito baixo de necessidade de intervenção ou óbito.',
    'Para priorizar quem precisa de reanimação agressiva, internação e endoscopia precoce.',
    'Não se aplica a hemorragia digestiva baixa nem a sangramento identificado apenas por pesquisa de sangue oculto.',
    'Não substitui o julgamento clínico em pacientes anticoagulados, com comorbidade descompensada ou sem condições sociais de retorno: o escore não inclui uso de anticoagulante.',
  ],

  whyUse:
    'É o único escore de hemorragia digestiva alta que usa apenas dados pré-endoscópicos e que foi construído para prever necessidade de intervenção (transfusão, terapêutica endoscópica, cirurgia ou radiologia intervencionista), e não mortalidade. Em estudo internacional prospectivo com mais de 3.000 pacientes, superou o Rockall clínico e o AIMS65 na identificação do grupo de risco muito baixo, com sensibilidade próxima de 99% no ponto de corte de 1: o que permite dispensar internação com segurança.',

  pearls: [
    'O escore usa UREIA, não BUN. Os limiares originais estão em mmol/L: 6,5 · 8 · 10 · 25 mmol/L, que correspondem a 39 · 48 · 60 · 150 mg/dL de ureia. Aplicar esses números diretamente ao BUN superestima grosseiramente o escore.',
    'A elevação da ureia na hemorragia digestiva alta vem da digestão do sangue no intestino delgado somada à hipoperfusão renal: é justamente o que o item captura. Ureia alta com creatinina normal reforça a origem alta do sangramento.',
    'A hemoglobina da chegada pode estar falsamente normal nas primeiras horas de um sangramento maciço, antes da hemodiluição. Um escore baixo em paciente com sangramento ativo evidente não autoriza alta.',
    'O escore NÃO contempla uso de anticoagulante, antiagregante ou hepatopatia com varizes conhecidas. Um paciente em varfarina ou com cirrose e varizes de alto risco pode ter escore baixo e mesmo assim exigir internação.',
    'Escore 0 exige simultaneamente: ureia abaixo de 39 mg/dL, hemoglobina normal para o sexo, PAS de 110 mmHg ou mais, FC abaixo de 100 bpm e ausência de melena, síncope, hepatopatia e insuficiência cardíaca. É uma combinação exigente: apenas 5% a 10% dos pacientes atendidos por hemorragia digestiva alta a preenchem.',
    'A diretriz europeia (ESGE 2021) usa o ponto de corte de 0 a 1 para manejo ambulatorial; o trabalho original usava 0. O corte mais frouxo aumenta o número de altas com perda mínima de sensibilidade.',
    'O escore prediz necessidade de intervenção, não mortalidade. Para estimar óbito e ressangramento, o Rockall completo (pós-endoscopia) e o AIMS65 são mais adequados.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const feminino = values.sexo === 'F';
    const ureia = n(values, 'ureia');
    const hb = n(values, 'hemoglobina');
    const pas = n(values, 'pas');
    const fc = n(values, 'fc');

    const pUreia = pontosUreia(ureia);
    const pHb = pontosHemoglobina(hb, feminino);
    const pPas = pontosPas(pas);
    const pFc = fc >= 100 ? 1 : 0;
    const pMelena = n(values, 'melena');
    const pSincope = n(values, 'sincope');
    const pHepato = n(values, 'hepatopatia');
    const pIc = n(values, 'ic');

    const pontos =
      pUreia + pHb + pPas + pFc + pMelena + pSincope + pHepato + pIc;

    let label: string;
    let severity: 'baixo' | 'moderado' | 'alto' | 'critico';
    let interpretation: string;
    let nextSteps: string;

    if (pontos === 0) {
      label = 'Risco muito baixo';
      severity = 'baixo';
      interpretation =
        'Escore 0: o grupo de menor risco descrito no estudo original. A probabilidade de necessitar transfusão, terapêutica endoscópica, cirurgia ou radiologia intervencionista, ou de morrer, é muito baixa.';
      nextSteps =
        'Considere alta do pronto-socorro com endoscopia digestiva alta ambulatorial precoce, desde que o paciente esteja hemodinamicamente estável, sem sangramento ativo, sem anticoagulação, com comorbidades compensadas e com condições de retornar.\nOriente sinais de alarme por escrito: hematêmese, melena recorrente, tontura ou desmaio exigem retorno imediato.\nSuspenda anti-inflamatórios e inicie inibidor de bomba de prótons oral.';
    } else if (pontos === 1) {
      label = 'Risco baixo';
      severity = 'baixo';
      interpretation =
        'Escore 1. A diretriz europeia (ESGE 2021) considera 0 a 1 como faixa de risco muito baixo, em que a endoscopia precoce e a internação podem ser dispensadas.';
      nextSteps =
        'Manejo ambulatorial é aceitável pela ESGE 2021, com endoscopia programada em regime eletivo, desde que a estabilidade clínica e o suporte social sejam adequados.\nSe houver anticoagulação, cirrose conhecida, comorbidade descompensada ou dificuldade de retorno, prefira observação hospitalar.';
    } else if (pontos <= 5) {
      label = 'Risco intermediário';
      severity = 'moderado';
      interpretation =
        'Risco intermediário de necessitar intervenção. A probabilidade de transfusão ou terapêutica endoscópica já é relevante e não permite alta direta.';
      nextSteps =
        'Interne ou mantenha em observação com acesso venoso calibroso, tipagem sanguínea e reserva de hemocomponentes.\nInicie inibidor de bomba de prótons endovenoso e programe endoscopia digestiva alta em até 24 horas.\nMeta transfusional restritiva: hemoglobina alvo de 7 a 9 g/dL, exceto em coronariopatia sintomática.';
    } else if (pontos <= 11) {
      label = 'Risco alto';
      severity = 'alto';
      interpretation =
        'Escore de 6 ou mais associa-se a mais de 50% de probabilidade de necessitar alguma intervenção: transfusão, terapêutica endoscópica, radiologia intervencionista ou cirurgia.';
      nextSteps =
        'Internação com reanimação volêmica guiada por metas, dois acessos calibrosos, reserva de concentrado de hemácias e correção de coagulopatia.\nInibidor de bomba de prótons endovenoso e endoscopia digestiva alta em até 24 horas, após estabilização.\nSe houver suspeita de sangramento varicoso: terlipressina ou octreotide, antibiótico profilático (ceftriaxona) e endoscopia em até 12 horas.';
    } else {
      label = 'Risco muito alto';
      severity = 'critico';
      interpretation =
        'Escore de 12 ou mais, próximo do máximo de 23 pontos. Indica sangramento grave com repercussão hemodinâmica e anemia importante, e alta probabilidade de necessitar múltiplas intervenções.';
      nextSteps =
        'Reanimação imediata, protocolo de transfusão maciça se houver instabilidade refratária e avaliação para leito de terapia intensiva.\nAcione a endoscopia de urgência e, em paralelo, a equipe de cirurgia e de radiologia intervencionista.\nProteja a via aérea antes da endoscopia se houver hematêmese volumosa ou rebaixamento do nível de consciência.';
    }

    return {
      value: pontos,
      unit: pontos === 1 ? 'ponto' : 'pontos',
      label,
      severity,
      interpretation,
      details: [
        {
          label: 'Pontos por variável',
          value: `Ureia ${pUreia} · Hb ${pHb} · PAS ${pPas} · FC ${pFc}`,
          hint: `Melena ${pMelena} · Síncope ${pSincope} · Hepatopatia ${pHepato} · IC ${pIc}`,
        },
        {
          label: 'Ureia informada',
          value: `${num(ureia)} mg/dL`,
          hint: `Equivale a ${num(ureia / 6.006, 1)} mmol/L`,
        },
        {
          label: 'Limiar de manejo ambulatorial',
          value: pontos <= 1 ? 'Preenchido (0 a 1)' : 'Não preenchido',
          hint: 'ESGE 2021: escore de 0 a 1 permite dispensar internação e endoscopia precoce',
        },
        {
          label: 'Escore máximo possível',
          value: '23 pontos',
        },
      ],
      nextSteps,
    };
  },

  formula: `Soma dos pontos (0 a 23):

UREIA (mg/dL) - os limiares originais estão em mmol/L
< 39 = 0 · 39 a 47 (6,5-7,9 mmol/L) = 2 · 48 a 59 (8,0-9,9) = 3 · 60 a 149 (10,0-24,9) = 4 · ≥ 150 (≥ 25) = 6

HEMOGLOBINA - HOMENS (g/dL)
≥ 13 = 0 · 12 a 12,9 = 1 · 10 a 11,9 = 3 · < 10 = 6

HEMOGLOBINA - MULHERES (g/dL)
≥ 12 = 0 · 10 a 11,9 = 1 · < 10 = 6

PRESSÃO ARTERIAL SISTÓLICA (mmHg)
≥ 110 = 0 · 100 a 109 = 1 · 90 a 99 = 2 · < 90 = 3

OUTROS MARCADORES
Frequência cardíaca ≥ 100 bpm = 1
Melena = 1
Síncope = 2
Doença hepática = 2
Insuficiência cardíaca = 2

INTERPRETAÇÃO
0 (ou 0 a 1, pela ESGE 2021) = risco muito baixo, manejo ambulatorial possível
≥ 6 = mais de 50% de probabilidade de necessitar intervenção`,

  evidence:
    'O escore foi derivado por Blatchford e colaboradores (Lancet, 2000) a partir de uma auditoria escocesa de cerca de 1.700 internações consecutivas por hemorragia digestiva alta, com validação prospectiva em uma amostra independente. O desfecho escolhido não foi mortalidade, e sim "necessidade de intervenção": transfusão, terapêutica endoscópica, cirurgia ou radiologia intervencionista. Stanley e colaboradores (Lancet, 2009) validaram o escore em 676 pacientes e conduziram uma fase prospectiva de implementação em que pacientes com escore 0 receberam alta direta do pronto-socorro para endoscopia ambulatorial: a proporção de internações caiu de 96% para 71% e nenhum paciente do grupo de baixo risco necessitou de intervenção ou morreu. No estudo internacional prospectivo de Stanley e colaboradores (BMJ, 2017), com 3.012 pacientes de seis países, o Glasgow-Blatchford foi o melhor escore para prever intervenção ou óbito (AUROC 0,86), superando o Rockall clínico, o Rockall completo e o AIMS65; no ponto de corte de 1 ou menos, a sensibilidade para o desfecho combinado foi de 98,6%. Com base nessa evidência, a ESGE (2021) recomenda o corte de 0 a 1 para manejo ambulatorial.',

  creator: {
    name: 'Oliver Blatchford',
    bio: 'Médico de saúde pública escocês, do Greater Glasgow Health Board, que derivou o escore a partir de auditoria populacional das internações por hemorragia digestiva alta na região oeste da Escócia.',
  },

  updatedAt: '2026-07-26',

  references: [
    {
      citation:
        'Blatchford O, Murray WR, Blatchford M. A risk score to predict need for treatment for upper-gastrointestinal haemorrhage. Lancet. 2000;356(9238):1318-21.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/11073021/',
      primary: true,
    },
    {
      citation:
        'Stanley AJ, Ashley D, Dalton HR, et al. Outpatient management of patients with low-risk upper-gastrointestinal haemorrhage: multicentre validation and prospective evaluation. Lancet. 2009;373(9657):42-7.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/19091393/',
    },
    {
      citation:
        'Stanley AJ, Laine L, Dalton HR, et al. Comparison of risk scoring systems for patients presenting with upper gastrointestinal bleeding: international multicentre prospective study. BMJ. 2017;356:i6432.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/28053181/',
    },
    {
      citation:
        'Gralnek IM, Stanley AJ, Morris AJ, et al. Endoscopic diagnosis and management of nonvariceal upper gastrointestinal hemorrhage (NVUGIH): European Society of Gastrointestinal Endoscopy (ESGE) Guideline, Update 2021. Endoscopy. 2021;53(3):300-32.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/33567467/',
    },
    {
      citation:
        'Barkun AN, Almadi M, Kuipers EJ, et al. Management of Nonvariceal Upper Gastrointestinal Bleeding: Guideline Recommendations From the International Consensus Group. Ann Intern Med. 2019;171(11):805-22.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/31634917/',
    },
  ],
};

export default calculator;
