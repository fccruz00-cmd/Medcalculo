import type { Calculator, Field, Values } from '@/lib/types';
import { n, sumPoints } from '@/lib/utils';

const DOSE_PADRAO =
  'Uma dose padrão contém cerca de 14 g de álcool puro: a definição usada na validação do AUDIT-C. No Brasil equivale a: 1 lata de cerveja de 350 mL (5%), 1 long neck, 1 taça de vinho de 150 mL (12%) ou 1 dose de 45 mL de destilado (cachaça, vodca, uísque). Uma garrafa de cerveja de 600 mL vale cerca de 1,7 dose; uma garrafa de vinho de 750 mL, cerca de 5 doses.';

const FIELDS: Field[] = [
  {
    id: 'sexo',
    kind: 'choice',
    label: 'Sexo',
    hint: 'Define o ponto de corte: 4 pontos para homens e 3 pontos para mulheres.',
    options: [
      { label: 'Masculino', value: 'M' },
      { label: 'Feminino', value: 'F' },
    ],
  },
  {
    id: 'q1',
    kind: 'choice',
    layout: 'stack',
    label: '1. Com que frequência você consome bebidas alcoólicas?',
    hint: DOSE_PADRAO,
    options: [
      { label: 'Nunca', value: 0 },
      { label: 'Uma vez por mês ou menos', value: 1, badge: '+1' },
      { label: '2 a 4 vezes por mês', value: 2, badge: '+2' },
      { label: '2 a 3 vezes por semana', value: 3, badge: '+3' },
      { label: '4 ou mais vezes por semana', value: 4, badge: '+4' },
    ],
  },
  {
    id: 'q2',
    kind: 'choice',
    layout: 'stack',
    label:
      '2. Nos dias em que bebe, quantas doses você consome habitualmente?',
    hint: 'Considere o dia típico de consumo, não o dia de maior consumo.',
    showIf: (values) => values.q1 !== 0,
    options: [
      { label: '1 ou 2 doses', value: 0 },
      { label: '3 ou 4 doses', value: 1, badge: '+1' },
      { label: '5 ou 6 doses', value: 2, badge: '+2' },
      { label: '7 a 9 doses', value: 3, badge: '+3' },
      { label: '10 ou mais doses', value: 4, badge: '+4' },
    ],
  },
  {
    id: 'q3',
    kind: 'choice',
    layout: 'stack',
    label: '3. Com que frequência você consome 6 ou mais doses em uma única ocasião?',
    hint: 'Item de consumo excessivo episódico ("beber pesado episódico"). O AUDIT-C original usa o limiar de 6 doses para ambos os sexos; algumas adaptações usam 4 doses para mulheres, o que aumenta a sensibilidade.',
    showIf: (values) => values.q1 !== 0,
    options: [
      { label: 'Nunca', value: 0 },
      { label: 'Menos de uma vez por mês', value: 1, badge: '+1' },
      { label: 'Mensalmente', value: 2, badge: '+2' },
      { label: 'Semanalmente', value: 3, badge: '+3' },
      { label: 'Diariamente ou quase todos os dias', value: 4, badge: '+4' },
    ],
  },
];

const calculator: Calculator = {
  slug: 'audit-c',
  title: 'AUDIT-C: rastreio de uso de risco de álcool',
  shortTitle: 'AUDIT-C',
  subtitle:
    'Três perguntas sobre consumo de álcool que identificam beber de risco e provável transtorno por uso de álcool, com pontos de corte distintos por sexo.',
  specialties: ['Psiquiatria', 'Clínica Médica'],
  kind: 'Escore de risco',
  keywords: [
    'auditc',
    'audit c',
    'audit',
    'álcool',
    'alcoolismo',
    'etilismo',
    'rastreio de álcool',
    'uso nocivo',
    'dependência alcoólica',
    'beber pesado episódico',
  ],

  whenToUse: [
    'Rastreio de rotina do consumo de álcool em adultos na atenção primária e em ambulatórios gerais: foi derivado e validado em pacientes ambulatoriais do sistema de saúde de veteranos dos Estados Unidos, homens (Bush, 1998) e mulheres (Bradley, 2003).',
    'Antes de prescrever fármacos hepatotóxicos ou sedativos, na avaliação pré-operatória e na investigação de hipertensão, hepatopatia, pancreatite, arritmia, insônia e depressão de difícil controle.',
    'Identificação precoce de pacientes candidatos a intervenção breve, muito antes de haver dependência instalada.',
    'Não é instrumento diagnóstico: escore positivo indica avaliação adicional, e não transtorno por uso de álcool.',
    'Não se aplica bem a quem está em abstinência após tratamento: um paciente em remissão marca zero. Também não avalia sintomas de abstinência nem consequências do uso: para isso, use o AUDIT completo, de 10 itens.',
  ],

  whyUse:
    'São três perguntas em menos de um minuto, com desempenho igual ou superior ao do AUDIT completo para detectar consumo de risco (área sob a curva ROC de 0,891 contra 0,881 na coorte de derivação). Cabe em qualquer consulta e transforma o rastreio de álcool em rotina, não em exceção.',

  pearls: [
    'Os pontos de corte são diferentes por sexo: 4 pontos em homens e 3 pontos em mulheres. Aplicar o corte masculino em mulheres perde casos, porque o mesmo consumo produz alcoolemia maior no organismo feminino.',
    'A dose padrão é a fonte mais comum de erro. Aqui ela vale cerca de 14 g de álcool puro: 1 lata de cerveja, 1 taça de vinho ou 1 dose de destilado. A OMS, no manual do AUDIT, define a dose padrão como 10 g; ao usar tabelas internacionais, confira qual definição está em jogo. E lembre que o paciente costuma pensar em "copos" e em garrafas, não em doses: uma garrafa de 600 mL rende cerca de 1,7 dose, e não 2; converta sempre pelo volume e pelo teor alcoólico da bebida, nunca pelo número de recipientes.',
    'Um escore 4 obtido só por frequência e quantidade, sem nenhum episódio de consumo excessivo (item 3 zerado), é bem menos específico: por exemplo, quem bebe uma taça de vinho quase todo dia. Nesse padrão, avalie o contexto antes de rotular como uso de risco.',
    'Escore zero não significa ausência de problema com álcool: pacientes em abstinência após dependência, ou que omitem o consumo por vergonha ou por medo de consequências (perícia, trabalho, guarda de filhos), pontuam zero. Pergunte sobre consumo prévio e sobre tentativas de parar.',
    'Na gestação não existe consumo seguro: qualquer resposta positiva à pergunta 1 já justifica orientação e acompanhamento, independentemente do escore. Considere instrumentos específicos como o T-ACE ou o TWEAK.',
    'Em idosos, em pessoas de baixo peso e em hepatopatas, o mesmo número de doses causa mais dano; considere limiares mais baixos e não se prenda ao corte.',
    'Rastreio positivo pede uma intervenção, não só um registro no prontuário. A intervenção breve motivacional de 5 a 15 minutos é a conduta com melhor evidência em uso de risco sem dependência.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const pontos = sumPoints(FIELDS, values);
    const feminino = values.sexo === 'F';
    const corte = feminino ? 3 : 4;
    const positivo = pontos >= corte;
    const binge = n(values, 'q3') >= 1;
    const abstemio = n(values, 'q1') === 0;

    let label: string;
    let severity: 'baixo' | 'moderado' | 'alto' | 'critico';
    const linhas: string[] = [];
    let nextSteps: string;

    if (abstemio) {
      label = 'Rastreio negativo';
      severity = 'baixo';
      linhas.push(
        'O paciente relata não consumir bebidas alcoólicas. O rastreio é negativo por definição.',
      );
      linhas.push(
        'Atenção: quem está em abstinência após dependência também marca zero. Pergunte sobre consumo em anos anteriores e sobre tratamento prévio.',
      );
      nextSteps =
        'Nenhuma intervenção é necessária. Registre e repita o rastreio anualmente ou quando surgir situação clínica sugestiva.';
    } else if (!positivo) {
      label = 'Rastreio negativo';
      severity = 'baixo';
      linhas.push(
        `${pontos} pontos, abaixo do corte de ${corte} para ${feminino ? 'mulheres' : 'homens'}. Consumo compatível com beber de baixo risco.`,
      );
      if (binge) {
        linhas.push(
          'Ainda assim, há episódios de consumo excessivo (6 ou mais doses de uma vez). Esse padrão se associa a trauma, violência, intoxicação aguda e acidentes de trânsito mesmo quando o consumo médio é baixo.',
        );
      }
      nextSteps =
        'Reforce os limites de consumo de baixo risco: até 14 doses por semana e no máximo 4 por ocasião para homens; até 7 doses por semana e no máximo 3 por ocasião para mulheres, sempre com dias sem beber.\nRepita o rastreio anualmente.';
    } else if (pontos <= 7) {
      label = 'Rastreio positivo: uso de risco';
      severity = 'moderado';
      linhas.push(
        `${pontos} pontos, no ou acima do corte de ${corte} para ${feminino ? 'mulheres' : 'homens'}. Padrão compatível com consumo de risco ou nocivo.`,
      );
      linhas.push(
        'É um resultado de rastreio: indica avaliação adicional e intervenção breve, não fecha diagnóstico de transtorno por uso de álcool.',
      );
      nextSteps =
        'Faça uma intervenção breve motivacional de 5 a 15 minutos: devolva o resultado sem julgamento, relacione o consumo às queixas do paciente, informe os limites de baixo risco e pactue uma meta concreta de redução.\nAplique o AUDIT completo (10 itens) para avaliar sintomas de dependência e consequências do uso.\nSolicite exames de repercussão quando indicado (transaminases, gama-GT, VCM) e reavalie em 1 a 3 meses.';
    } else if (pontos <= 9) {
      label = 'Rastreio positivo: uso nocivo';
      severity = 'alto';
      linhas.push(
        `${pontos} pontos. Consumo elevado, com probabilidade substancial de transtorno por uso de álcool.`,
      );
      nextSteps =
        'Aplique o AUDIT completo e faça a avaliação diagnóstica formal pelos critérios do DSM-5 ou da CID-11.\nRastreie repercussões: hepatopatia, pancreatite, hipertensão, cardiomiopatia, neuropatia, desnutrição e depressão.\nOfereça intervenção motivacional estruturada, avalie risco de abstinência ao reduzir o consumo e considere encaminhamento ao CAPS-AD ou a serviço especializado.';
    } else {
      label = 'Rastreio positivo: provável dependência';
      severity = 'critico';
      linhas.push(
        `${pontos} pontos, próximo do máximo de 12. Consumo muito elevado, com alta probabilidade de dependência alcoólica.`,
      );
      nextSteps =
        'Avaliação diagnóstica completa e encaminhamento a serviço especializado (CAPS-AD ou ambulatório de dependência química).\nAvalie a necessidade de desintoxicação supervisionada: interrupção abrupta pode desencadear abstinência grave, convulsão e delirium tremens. Use a CIWA-Ar para acompanhar a abstinência.\nPrescreva tiamina, corrija eletrólitos e discuta farmacoterapia de manutenção, naltrexona, acamprosato ou dissulfiram, associada a abordagem psicossocial.';
    }

    if (binge && positivo) {
      linhas.push(
        'O item 3 é positivo: há consumo excessivo episódico, marcador independente de risco de trauma e de intoxicação aguda.',
      );
    }

    return {
      value: pontos,
      unit: pontos === 1 ? 'ponto' : 'pontos',
      label,
      severity,
      interpretation: linhas.join('\n'),
      details: [
        {
          label: 'Ponto de corte aplicado',
          value: `${corte} pontos`,
          hint: feminino
            ? 'Sexo feminino (Bradley, 2003): sensibilidade 81% e especificidade 86%'
            : 'Sexo masculino (Bush, 1998): sensibilidade 86% e especificidade 72% para beber pesado',
        },
        {
          label: 'Rastreio',
          value: positivo ? 'Positivo' : 'Negativo',
        },
        {
          label: 'Consumo excessivo episódico (item 3)',
          value: binge ? 'Presente' : 'Ausente',
          hint: '6 ou mais doses em uma única ocasião',
        },
        {
          label: 'Escore máximo possível',
          value: '12 pontos',
        },
      ],
      nextSteps,
    };
  },

  formula: `São as três primeiras perguntas do AUDIT, cada uma de 0 a 4 pontos (total 0 a 12):

1. Frequência de consumo
   Nunca = 0 · ≤ 1 vez/mês = 1 · 2 a 4 vezes/mês = 2 · 2 a 3 vezes/semana = 3 · ≥ 4 vezes/semana = 4

2. Doses em um dia típico de consumo
   1 ou 2 = 0 · 3 ou 4 = 1 · 5 ou 6 = 2 · 7 a 9 = 3 · ≥ 10 = 4

3. Frequência de 6 ou mais doses em uma ocasião
   Nunca = 0 · < 1 vez/mês = 1 · mensal = 2 · semanal = 3 · diário ou quase = 4

Pontos de corte para rastreio positivo:
· Homens: 4 pontos ou mais
· Mulheres: 3 pontos ou mais

Se a resposta à pergunta 1 for "nunca", o total é 0 e as perguntas 2 e 3 são dispensadas.

Dose padrão (cerca de 14 g de álcool puro):
1 lata de cerveja 350 mL · 1 taça de vinho 150 mL · 1 dose de destilado 45 mL
1 garrafa de cerveja 600 mL ≈ 1,7 dose · 1 garrafa de vinho 750 mL ≈ 5 doses`,

  evidence:
    'O AUDIT-C corresponde às três perguntas de consumo do AUDIT, questionário desenvolvido pela Organização Mundial da Saúde em 1989. Bush e colaboradores (1998) o validaram isoladamente em 243 homens atendidos em três ambulatórios gerais do sistema de saúde de veteranos dos Estados Unidos, usando entrevista telefônica estruturada como padrão de referência: a área sob a curva ROC para beber pesado foi de 0,891, superior à do AUDIT completo (0,881), e o corte de 4 pontos apresentou sensibilidade de 86% e especificidade de 72%. Bradley e colaboradores (2003) repetiram a validação em 393 mulheres do mesmo sistema, das quais 22,6% preenchiam critérios de consumo de risco ou de transtorno por uso de álcool: com o corte de 3 pontos, a sensibilidade foi de 81% e a especificidade de 86%, com área sob a curva de 0,91. Em estudo posterior na atenção primária (Bradley, 2007), a probabilidade de transtorno por uso de álcool cresceu de forma monotônica com o escore, sendo alta nas faixas de 8 a 12 pontos. O AUDIT completo foi validado em amostra urbana brasileira por Lima e colaboradores (2005), com boa validade concorrente e de construto.',

  creator: {
    name: 'Kristen Bush e Katharine A. Bradley',
    bio: 'Pesquisadoras do VA Puget Sound Health Care System e da Universidade de Washington, em Seattle, responsáveis pela validação do AUDIT-C em homens (1998) e em mulheres (2003). O AUDIT original foi desenvolvido por um grupo colaborativo da Organização Mundial da Saúde.',
  },

  updatedAt: '2026-07-26',

  references: [
    {
      citation:
        'Bush K, Kivlahan DR, McDonell MB, Fihn SD, Bradley KA. The AUDIT alcohol consumption questions (AUDIT-C): an effective brief screening test for problem drinking. Arch Intern Med. 1998;158(16):1789-95.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/9738608/',
      primary: true,
    },
    {
      citation:
        'Bradley KA, Bush KR, Epler AJ, et al. Two brief alcohol-screening tests from the Alcohol Use Disorders Identification Test (AUDIT): validation in a female Veterans Affairs patient population. Arch Intern Med. 2003;163(7):821-9.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/12695273/',
    },
    {
      citation:
        'Bradley KA, DeBenedetti AF, Volk RJ, Williams EC, Frank D, Kivlahan DR. AUDIT-C as a brief screen for alcohol misuse in primary care. Alcohol Clin Exp Res. 2007;31(7):1208-17.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/17451397/',
    },
    {
      citation:
        'Lima CT, Freire AC, Silva AP, Teixeira RM, Farrell M, Prince M. Concurrent and construct validity of the AUDIT in an urban Brazilian sample. Alcohol Alcohol. 2005;40(6):584-9.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/16143704/',
    },
  ],
};

export default calculator;
