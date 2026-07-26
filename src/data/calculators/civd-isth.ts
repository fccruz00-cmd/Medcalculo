import type { Calculator, Field, Values } from '@/lib/types';
import { sumPoints } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'doenca_base',
    kind: 'choice',
    label: 'Existe doença de base sabidamente associada à CIVD?',
    hint: 'Sepse, trauma grave, grande queimado, complicações obstétricas (descolamento prematuro de placenta, embolia de líquido amniótico, pré-eclâmpsia grave), neoplasias: em especial leucemia promielocítica aguda, , anomalias vasculares volumosas, reações tóxicas ou imunológicas graves e insuficiência hepática aguda.',
    layout: 'stack',
    options: [
      { label: 'Sim: há condição de base compatível', value: 'sim' },
      { label: 'Não', value: 'nao', hint: 'Sem doença de base, o algoritmo da ISTH não deve ser aplicado.' },
    ],
  },
  {
    id: 'plaquetas',
    kind: 'choice',
    label: 'Contagem de plaquetas',
    hint: 'Equivalência internacional: 100.000/mm³ = 100 × 10⁹/L.',
    options: [
      { label: '> 100.000/mm³', value: 0 },
      { label: '50.000 a 100.000/mm³', value: 1, badge: '+1' },
      { label: '< 50.000/mm³', value: 2, badge: '+2' },
    ],
  },
  {
    id: 'ddimero',
    kind: 'choice',
    label: 'Marcador de degradação de fibrina (D-dímero ou PDF)',
    hint: 'A ISTH não fixou pontos de corte numéricos. Convenção prática: sem aumento = dentro da referência do laboratório; aumento moderado = acima do limite superior e até cerca de 5 vezes esse limite; aumento acentuado = acima de 5 vezes. Padronize o critério com o seu laboratório.',
    layout: 'stack',
    options: [
      { label: 'Sem aumento', value: 0 },
      { label: 'Aumento moderado', value: 2, badge: '+2' },
      { label: 'Aumento acentuado', value: 3, badge: '+3' },
    ],
  },
  {
    id: 'tp',
    kind: 'choice',
    label: 'Prolongamento do tempo de protrombina (TP)',
    hint: 'Segundos acima do limite superior da referência do laboratório: não use o RNI/INR nem a atividade de protrombina em porcentagem.',
    options: [
      { label: '< 3 segundos', value: 0 },
      { label: '≥ 3 e < 6 segundos', value: 1, badge: '+1' },
      { label: '≥ 6 segundos', value: 2, badge: '+2' },
    ],
  },
  {
    id: 'fibrinogenio',
    kind: 'choice',
    label: 'Fibrinogênio',
    hint: '100 mg/dL equivale a 1,0 g/L. Faixa de referência habitual: 200 a 400 mg/dL.',
    options: [
      { label: '≥ 100 mg/dL', value: 0 },
      { label: '< 100 mg/dL', value: 1, badge: '+1' },
    ],
  },
];

const calculator: Calculator = {
  slug: 'civd-isth',
  title: 'Escore de CIVD da ISTH: coagulação intravascular disseminada manifesta',
  shortTitle: 'Escore de CIVD (ISTH)',
  subtitle:
    'Aplica os critérios da International Society on Thrombosis and Haemostasis para o diagnóstico de coagulação intravascular disseminada manifesta em pacientes com doença de base compatível.',
  specialties: ['Hematologia', 'Terapia Intensiva', 'Emergência'],
  kind: 'Critérios diagnósticos',
  keywords: [
    'civd',
    'CID',
    'coagulação intravascular disseminada',
    'ISTH',
    'coagulopatia',
    'D-dímero',
    'fibrinogênio',
    'plaquetopenia',
    'sepse',
    'coagulopatia de consumo',
  ],

  whenToUse: [
    'Pacientes com doença de base reconhecidamente associada à CIVD, sepse, trauma grave, complicações obstétricas, neoplasias, grandes queimaduras, que apresentam plaquetopenia, sangramento, trombose ou alargamento dos tempos de coagulação.',
    'Acompanhamento diário na terapia intensiva: a CIVD é um processo dinâmico, e o escore foi construído para ser repetido.',
    'Não aplique o escore sem doença de base compatível: o algoritmo da ISTH começa justamente por essa pergunta.',
    'Cuidado em cirrose e em gestação: as faixas de plaquetas, TP e fibrinogênio desses grupos são diferentes e a ISTH propôs escores específicos.',
  ],

  whyUse:
    'A CIVD não tem exame confirmatório isolado. O escore da ISTH transformou o julgamento de especialistas em um algoritmo reprodutível, com exames disponíveis em qualquer hospital, e na validação prospectiva de Bakhtiari alcançou sensibilidade de 91% e especificidade de 97% em relação à opinião de especialistas.',

  pearls: [
    'O fibrinogênio é proteína de fase aguda: na sepse ele pode estar normal ou alto mesmo com consumo intenso, e por isso raramente marca ponto. Um fibrinogênio normal não afasta CIVD: a queda seriada é mais informativa que um valor isolado.',
    'A ausência de pontos de corte numéricos para o D-dímero é a maior fonte de variabilidade do escore. Defina com o seu laboratório o que será "aumento moderado" e "aumento acentuado" e mantenha o mesmo critério nas medidas seriadas do mesmo paciente.',
    'O TP entra em segundos de prolongamento em relação ao limite superior do laboratório, e não como RNI. Muitos laboratórios brasileiros liberam apenas RNI e atividade de protrombina em porcentagem: peça o tempo em segundos e o valor do controle.',
    'Um escore abaixo de 5 não exclui CIVD; segundo a própria ISTH, sugere CIVD não manifesta e obriga a repetir os exames em 1 a 2 dias. O escore isolado, em um único momento, tem pouca sensibilidade nas fases iniciais.',
    'Na cirrose, a plaquetopenia do hiperesplenismo e o TP alargado da insuficiência hepática elevam o escore sem que haja CIVD. A ISTH publicou uma versão modificada para disfunção hepática: não aplique a padrão sem crítica.',
    'Na gestação o fibrinogênio fisiológico chega a 400 a 600 mg/dL, de modo que uma queda para 250 mg/dL já é grave e não pontua. Use o escore obstétrico específico da ISTH nesse cenário.',
    'O escore diagnostica, não orienta transfusão. A decisão de transfundir depende de sangramento ativo ou de procedimento invasivo programado, e não da pontuação.',
    'Em pacientes sépticos, o escore de coagulopatia induzida por sepse (SIC) da ISTH identifica a coagulopatia mais precocemente, usando plaquetas, RNI e SOFA. Muitos pacientes com SIC ainda não preenchem critérios de CIVD manifesta.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const pontos = sumPoints(FIELDS, values);
    const semDoencaBase = values.doenca_base === 'nao';

    if (semDoencaBase) {
      return {
        value: pontos,
        unit: pontos === 1 ? 'ponto' : 'pontos',
        label: 'Algoritmo não aplicável',
        severity: 'info' as const,
        interpretation:
          'O algoritmo da ISTH exige, como primeiro passo, a presença de uma doença de base reconhecidamente associada à CIVD. Sem ela, a pontuação não pode ser interpretada como diagnóstico de coagulação intravascular disseminada.',
        details: [
          { label: 'Pontuação laboratorial', value: `${pontos} de 8` },
          { label: 'Critério de entrada', value: 'Ausente' },
        ],
        nextSteps:
          'Reveja o diagnóstico de base. Alterações semelhantes ocorrem em hepatopatia crônica, microangiopatias trombóticas (púrpura trombocitopênica trombótica, síndrome hemolítico-urêmica), síndrome antifosfolípide catastrófica, HELLP, deficiência de vitamina K e uso de anticoagulantes.\nSe uma condição associada à CIVD for identificada depois, refaça os exames e aplique o escore novamente.',
      };
    }

    let label: string;
    let severity: 'baixo' | 'moderado' | 'critico';
    let interpretation: string;
    let nextSteps: string;

    if (pontos >= 5) {
      label = 'Compatível com CIVD manifesta';
      severity = 'critico';
      interpretation =
        'Escore ≥ 5: compatível com coagulação intravascular disseminada manifesta. Na validação prospectiva de Bakhtiari, em terapia intensiva, esse critério teve sensibilidade de 91% e especificidade de 97% em relação à opinião de especialistas, e cada ponto adicional associou-se a razão de chances de 1,25 para mortalidade em 28 dias.';
      nextSteps =
        'O tratamento decisivo é o da doença de base: antibiótico e controle de foco na sepse, esvaziamento uterino nas causas obstétricas, ácido transretinoico na leucemia promielocítica aguda.\nRepita o escore diariamente para acompanhar a evolução.\nTransfunda de acordo com o sangramento, não com o escore: plaquetas se houver sangramento ativo ou procedimento invasivo com contagem abaixo de 50.000/mm³ (ou abaixo de 20.000/mm³ no paciente sem sangramento e com risco alto); plasma fresco congelado 15 a 25 mL/kg no sangramento com TP ou TTPa prolongados; crioprecipitado ou concentrado de fibrinogênio quando o fibrinogênio estiver abaixo de 100 a 150 mg/dL com sangramento.\nHeparina em dose terapêutica quando predomina a trombose (púrpura fulminante, tromboembolismo). No paciente sem sangramento, mantenha ao menos a tromboprofilaxia.\nAntifibrinolíticos são em geral contraindicados, exceto em estados de hiperfibrinólise como a leucemia promielocítica aguda.';
    } else if (pontos >= 3) {
      label = 'Não compatível com CIVD manifesta';
      severity = 'moderado';
      interpretation =
        'Escore < 5: os critérios de CIVD manifesta não estão preenchidos, mas há alteração laboratorial relevante. Segundo a ISTH, esse resultado sugere CIVD não manifesta e não permite excluir o diagnóstico.';
      nextSteps =
        'Repita plaquetas, TP, fibrinogênio e D-dímero em 1 a 2 dias, ou antes se houver piora clínica.\nTrate a doença de base e reavalie a tendência dos exames, que é mais informativa que qualquer valor isolado.\nMantenha tromboprofilaxia se não houver sangramento nem contraindicação.';
    } else {
      label = 'Não compatível com CIVD manifesta';
      severity = 'baixo';
      interpretation =
        'Escore < 5: os critérios de CIVD manifesta não estão preenchidos e as alterações da coagulação são discretas. Ainda assim, um único escore baixo não exclui CIVD em evolução.';
      nextSteps =
        'Repita os exames em 1 a 2 dias enquanto a doença de base estiver ativa.\nInvestigue outras causas para as alterações encontradas, se houver.\nMantenha tromboprofilaxia se não houver sangramento nem contraindicação.';
    }

    return {
      value: pontos,
      unit: pontos === 1 ? 'ponto' : 'pontos',
      label,
      severity,
      interpretation,
      details: [
        { label: 'Corte diagnóstico', value: '≥ 5 pontos (máximo 8)' },
        {
          label: 'Reavaliação recomendada',
          value: pontos >= 5 ? 'Diária' : 'Em 1 a 2 dias',
          hint: 'Recomendação do próprio consenso da ISTH (Taylor, 2001)',
        },
      ],
      nextSteps,
    };
  },

  formula: `Passo 1 - o paciente tem doença de base sabidamente associada à CIVD? Se não, não aplique o escore.

Passo 2 - some os pontos dos exames (máximo 8):

Plaquetas
> 100.000/mm³ = 0 · 50.000 a 100.000/mm³ = 1 · < 50.000/mm³ = 2

Marcador de degradação de fibrina (D-dímero ou PDF)
sem aumento = 0 · aumento moderado = 2 · aumento acentuado = 3

Prolongamento do TP
< 3 s = 0 · ≥ 3 e < 6 s = 1 · ≥ 6 s = 2

Fibrinogênio
≥ 100 mg/dL (1,0 g/L) = 0 · < 100 mg/dL = 1

Passo 3 - interprete:
≥ 5 pontos = compatível com CIVD manifesta; repita o escore diariamente.
< 5 pontos = sugestivo de CIVD não manifesta; repita em 1 a 2 dias.`,

  evidence:
    'O escore foi proposto em 2001 pelo Subcomitê Científico de CIVD da International Society on Thrombosis and Haemostasis, coordenado por Fletcher Taylor, a partir da revisão de séries de pacientes e do consenso de especialistas, com a proposta explícita de separar a CIVD manifesta da não manifesta. A validação prospectiva foi feita por Bakhtiari e colaboradores em 217 pacientes consecutivos de terapia intensiva com suspeita clínica de CIVD, com 660 amostras analisadas: a prevalência de CIVD foi de 34%, a sensibilidade do escore foi de 91% e a especificidade, 97%, tendo como padrão de referência a opinião de especialistas; cada ponto a mais no escore correspondeu a uma razão de chances de 1,25 para mortalidade em 28 dias. As diretrizes do British Committee for Standards in Haematology, publicadas por Levi e colaboradores em 2009, adotam o escore e reforçam que o tratamento da doença de base é a medida central, com transfusões guiadas pelo sangramento e não pelos exames.',

  creator: {
    name: 'Fletcher B. Taylor Jr. e o Subcomitê de CIVD da ISTH',
    bio: 'Grupo de trabalho da International Society on Thrombosis and Haemostasis que padronizou a definição e os critérios laboratoriais de coagulação intravascular disseminada em 2001.',
  },

  updatedAt: '2026-07-26',

  references: [
    {
      citation:
        'Taylor FB Jr, Toh CH, Hoots WK, Wada H, Levi M; Scientific Subcommittee on Disseminated Intravascular Coagulation (DIC) of the International Society on Thrombosis and Haemostasis (ISTH). Towards definition, clinical and laboratory criteria, and a scoring system for disseminated intravascular coagulation. Thromb Haemost. 2001;86(5):1327-30.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/11816725/',
      primary: true,
    },
    {
      citation:
        'Bakhtiari K, Meijers JC, de Jonge E, Levi M. Prospective validation of the International Society of Thrombosis and Haemostasis scoring system for disseminated intravascular coagulation. Crit Care Med. 2004;32(12):2416-21.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/15599145/',
    },
    {
      citation:
        'Levi M, Toh CH, Thachil J, Watson HG. Guidelines for the diagnosis and management of disseminated intravascular coagulation. British Committee for Standards in Haematology. Br J Haematol. 2009;145(1):24-33.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/19222477/',
    },
  ],
};

export default calculator;
