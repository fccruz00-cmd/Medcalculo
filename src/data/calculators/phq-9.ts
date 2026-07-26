import type { Calculator, Field, Option, Severity, Values } from '@/lib/types';
import { n, sumPoints } from '@/lib/utils';

/** As quatro respostas do PHQ-9. O valor da opção é a própria pontuação. */
const OPCOES: Option[] = [
  { label: 'Nenhuma vez', value: 0 },
  { label: 'Vários dias', value: 1, badge: '+1' },
  { label: 'Mais da metade dos dias', value: 2, badge: '+2' },
  { label: 'Quase todos os dias', value: 3, badge: '+3' },
];

const FIELDS: Field[] = [
  {
    id: 'q1',
    kind: 'choice',
    layout: 'stack',
    label: '1. Pouco interesse ou pouco prazer em fazer as coisas',
    hint: 'Considere as últimas 2 semanas em todos os nove itens.',
    help: 'Item de anedonia. Junto com o item 2, forma o PHQ-2, usado como rastreio ultrarrápido.',
    options: OPCOES,
  },
  {
    id: 'q2',
    kind: 'choice',
    layout: 'stack',
    label: '2. Se sentir para baixo, deprimido(a) ou sem perspectiva',
    options: OPCOES,
  },
  {
    id: 'q3',
    kind: 'choice',
    layout: 'stack',
    label:
      '3. Dificuldade para pegar no sono ou permanecer dormindo, ou dormir mais do que de costume',
    options: OPCOES,
  },
  {
    id: 'q4',
    kind: 'choice',
    layout: 'stack',
    label: '4. Se sentir cansado(a) ou com pouca energia',
    options: OPCOES,
  },
  {
    id: 'q5',
    kind: 'choice',
    layout: 'stack',
    label: '5. Falta de apetite ou comer demais',
    options: OPCOES,
  },
  {
    id: 'q6',
    kind: 'choice',
    layout: 'stack',
    label:
      '6. Se sentir mal consigo mesmo(a), ou achar que é um fracasso, ou que decepcionou sua família ou você mesmo(a)',
    options: OPCOES,
  },
  {
    id: 'q7',
    kind: 'choice',
    layout: 'stack',
    label:
      '7. Dificuldade para se concentrar nas coisas, como ler o jornal ou assistir à televisão',
    options: OPCOES,
  },
  {
    id: 'q8',
    kind: 'choice',
    layout: 'stack',
    label:
      '8. Lentidão para se movimentar ou falar a ponto de outras pessoas perceberem; ou o oposto, estar tão agitado(a) que fica andando de um lado para o outro muito mais que de costume',
    options: OPCOES,
  },
  {
    id: 'q9',
    kind: 'choice',
    layout: 'stack',
    label: '9. Pensar em se ferir de alguma maneira ou que seria melhor estar morto(a)',
    hint: 'Qualquer resposta diferente de "nenhuma vez" exige avaliação de risco de suicídio na mesma consulta.',
    options: OPCOES,
  },
];

/** Faixas de gravidade do PHQ-9 (Kroenke, 2001). */
function faixa(pontos: number): { rotulo: string; severidade: Severity } {
  if (pontos <= 4) return { rotulo: 'Depressão mínima ou ausente', severidade: 'info' };
  if (pontos <= 9) return { rotulo: 'Depressão leve', severidade: 'baixo' };
  if (pontos <= 14) return { rotulo: 'Depressão moderada', severidade: 'moderado' };
  if (pontos <= 19) return { rotulo: 'Depressão moderadamente grave', severidade: 'alto' };
  return { rotulo: 'Depressão grave', severidade: 'critico' };
}

const calculator: Calculator = {
  slug: 'phq-9',
  title: 'PHQ-9: questionário de saúde do paciente',
  shortTitle: 'PHQ-9',
  subtitle:
    'Rastreia depressão e gradua a gravidade dos sintomas depressivos nas últimas duas semanas, com nove itens autoaplicáveis.',
  specialties: ['Psiquiatria', 'Clínica Médica'],
  kind: 'Escala',
  popular: true,
  keywords: [
    'phq9',
    'phq 9',
    'patient health questionnaire',
    'depressão',
    'rastreio de depressão',
    'humor',
    'transtorno depressivo maior',
    'ideação suicida',
    'phq-2',
  ],

  whenToUse: [
    'Rastreio de depressão em adultos na atenção primária, em ambulatórios de especialidade e em pacientes com doença crônica: população em que o instrumento foi derivado e validado.',
    'Graduação inicial da gravidade e acompanhamento longitudinal da resposta ao tratamento, repetindo o questionário a cada 2 a 4 semanas.',
    'Não é instrumento diagnóstico: um escore alto indica necessidade de entrevista clínica, não fecha o diagnóstico de transtorno depressivo maior.',
    'Não foi validado como escala de gravidade em menores de 18 anos (use o PHQ-A) nem em pacientes com rebaixamento cognitivo importante, que não conseguem responder de forma confiável.',
  ],

  whyUse:
    'É breve, gratuito, autoaplicável e seus nove itens correspondem diretamente aos nove critérios de transtorno depressivo maior do DSM. Serve ao mesmo tempo como rastreio (corte ≥ 10), como medida de gravidade e como escala de acompanhamento: a mesma ferramenta cobre as três funções, o que quase nenhum outro instrumento faz.',

  pearls: [
    'O item 9 (pensar em se ferir ou que seria melhor estar morto) exige avaliação de risco de suicídio na mesma consulta, qualquer que seja o total. Um PHQ-9 de 6 pontos com item 9 positivo é mais urgente que um de 18 pontos com item 9 zerado.',
    'Os itens somáticos, sono, apetite, energia e concentração, inflam o escore em pacientes com câncer, insuficiência cardíaca, doença renal crônica, hipotireoidismo, apneia do sono e anemia. Nesses casos, o corte de 10 perde especificidade e o escore alto pode refletir a doença de base.',
    'O PHQ-9 não distingue depressão unipolar de depressão bipolar. Antes de iniciar antidepressivo, pergunte ativamente sobre episódios prévios de mania ou hipomania: o risco de virada maníaca é real.',
    'A décima pergunta do formulário original, sobre o quanto os sintomas atrapalham a vida, NÃO entra no escore. Ela serve para avaliar o prejuízo funcional e deve ser feita, mas não somada.',
    'Uma redução de 5 pontos costuma ser adotada como diferença minimamente importante; a meta de tratamento é o escore abaixo de 5 (remissão), não apenas a queda percentual.',
    'O PHQ-2 (apenas os itens 1 e 2, 0 a 6 pontos) funciona como triagem: com 3 pontos ou mais, aplique o PHQ-9 completo. Com PHQ-2 abaixo de 3, o rastreio pode ser encerrado na maioria dos contextos.',
    'Escores muito altos obtidos em situação de ganho secundário (perícia, afastamento, processo) devem ser lidos com cautela: o instrumento é autorrelato puro e não tem escala de validade.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const pontos = sumPoints(FIELDS, values);
    const { rotulo, severidade } = faixa(pontos);

    const item9 = n(values, 'q9');
    const phq2 = n(values, 'q1') + n(values, 'q2');

    // Algoritmo diagnóstico do PHQ-9: contam os itens 1 a 8 com resposta ≥ 2
    // ("mais da metade dos dias") e o item 9 com qualquer resposta ≥ 1.
    const cardinais = ['q1', 'q2'].filter((id) => n(values, id) >= 2).length;
    const acessorios = ['q3', 'q4', 'q5', 'q6', 'q7', 'q8'].filter((id) => n(values, id) >= 2).length;
    const criterios = cardinais + acessorios + (item9 >= 1 ? 1 : 0);
    const algoritmoPositivo = criterios >= 5 && cardinais >= 1;

    const severity: Severity = item9 >= 1 && severidade !== 'critico' ? 'alto' : severidade;

    const linhas: string[] = [`${rotulo} (${pontos} de 27 pontos).`];

    if (pontos >= 10) {
      linhas.push(
        'O escore está acima do corte de 10 pontos, que na validação original teve sensibilidade e especificidade de 88% para transtorno depressivo maior. Confirme o diagnóstico por entrevista clínica.',
      );
    } else {
      linhas.push(
        'O escore está abaixo do corte de 10 pontos usado para rastreio de transtorno depressivo maior. Isso não exclui depressão: reavalie se houver prejuízo funcional, queixa persistente ou discordância com o exame clínico.',
      );
    }

    linhas.push(
      algoritmoPositivo
        ? 'O padrão de respostas preenche o algoritmo diagnóstico do PHQ-9 para provável episódio depressivo maior (5 ou mais sintomas presentes em mais da metade dos dias, incluindo humor deprimido ou anedonia).'
        : 'O padrão de respostas não preenche o algoritmo diagnóstico do PHQ-9 para episódio depressivo maior.',
    );

    if (item9 >= 1) {
      linhas.push(
        'ATENÇÃO: o item 9 é positivo. Interrompa a pontuação e faça agora a avaliação de risco de suicídio: ideação, planejamento, intenção, meios disponíveis, tentativas prévias e rede de apoio.',
      );
    }

    let nextSteps: string;
    if (pontos <= 4) {
      nextSteps =
        'Nenhuma intervenção específica para depressão é necessária com base no escore. Mantenha o acompanhamento habitual e repita o rastreio se surgirem queixas.';
    } else if (pontos <= 9) {
      nextSteps =
        'Conduta expectante com apoio: psicoeducação, higiene do sono, atividade física e reavaliação em 2 a 4 semanas com novo PHQ-9.\nInvestigue causas clínicas e uso de substâncias antes de rotular como depressão.';
    } else if (pontos <= 14) {
      nextSteps =
        'Confirme o diagnóstico por entrevista clínica e ofereça tratamento: psicoterapia estruturada (terapia cognitivo-comportamental ou interpessoal), antidepressivo, ou ambos.\nReavalie com novo PHQ-9 em 4 semanas; espere queda de pelo menos 5 pontos como sinal de resposta.';
    } else if (pontos <= 19) {
      nextSteps =
        'Inicie tratamento farmacológico associado a psicoterapia. Considere encaminhamento ao psiquiatra, sobretudo se houver comorbidade psiquiátrica, uso de substâncias ou falha terapêutica prévia.\nReavalie em 2 a 4 semanas e ajuste a dose até a remissão (PHQ-9 abaixo de 5).';
    } else {
      nextSteps =
        'Depressão grave. Inicie tratamento farmacológico e encaminhe ao psiquiatra com prioridade.\nAvalie risco de suicídio, capacidade de autocuidado, sintomas psicóticos e necessidade de internação ou de acompanhamento em CAPS.';
    }

    if (item9 >= 1) {
      nextSteps = `Avaliação imediata do risco de suicídio, independentemente do total: investigue ideação, plano, intenção, acesso a meios letais, tentativas prévias e suporte social. Restrinja o acesso a meios, defina plano de segurança com o paciente e um acompanhante, e garanta seguimento próximo. Encaminhe à emergência psiquiátrica se houver plano, intenção ou incapacidade de garantir segurança.\n${nextSteps}`;
    }

    return {
      value: pontos,
      unit: pontos === 1 ? 'ponto' : 'pontos',
      label: rotulo,
      severity,
      interpretation: linhas.join('\n'),
      details: [
        {
          label: 'Item 9: ideação suicida',
          value: item9 >= 1 ? `Positivo (${item9}/3)` : 'Negativo',
          hint: 'Positivo exige avaliação de risco imediata, qualquer que seja o total',
        },
        {
          label: 'Algoritmo diagnóstico do PHQ-9',
          value: algoritmoPositivo ? 'Provável episódio depressivo maior' : 'Não preenchido',
          hint: '5 ou mais sintomas em mais da metade dos dias, incluindo o item 1 ou o 2',
        },
        {
          label: 'PHQ-2 (itens 1 e 2)',
          value: `${phq2} de 6 pontos`,
          hint: 'Corte de rastreio: 3 pontos',
        },
        {
          label: 'Rastreio (corte ≥ 10)',
          value: pontos >= 10 ? 'Positivo' : 'Negativo',
          hint: 'Sensibilidade e especificidade de 88% (Kroenke, 2001)',
        },
      ],
      nextSteps,
    };
  },

  formula: `Nove itens, cada um pontuado pela frequência nas últimas 2 semanas:

Nenhuma vez = 0
Vários dias = 1
Mais da metade dos dias = 2
Quase todos os dias = 3

Total = soma dos nove itens (0 a 27)

Faixas de gravidade:
0 a 4 - mínima ou ausente
5 a 9 - leve
10 a 14 - moderada
15 a 19 - moderadamente grave
20 a 27 - grave

Corte de rastreio para transtorno depressivo maior: 10 pontos.

Algoritmo diagnóstico: 5 ou mais dos nove sintomas presentes em "mais da metade dos dias"
(o item 9 conta com qualquer resposta acima de zero), sendo pelo menos um deles humor
deprimido (item 2) ou anedonia (item 1).`,

  evidence:
    'O PHQ-9 foi derivado do PRIME-MD e validado por Kroenke, Spitzer e Williams em 2001, em 6.000 pacientes de oito serviços de atenção primária e sete serviços de ginecologia e obstetrícia nos Estados Unidos, com entrevista por profissional de saúde mental como padrão de referência. O corte de 10 pontos apresentou sensibilidade de 88% e especificidade de 88% para transtorno depressivo maior, e cada faixa de 5 pontos correspondeu a aumento consistente do prejuízo funcional e do número de dias de incapacidade. A metanálise de dados individuais de Levis e colaboradores (2019), com 17.357 participantes de 58 estudos, confirmou o corte de 10 como o de melhor equilíbrio, com sensibilidade agrupada de 0,88 e especificidade de 0,85 frente a entrevista diagnóstica semiestruturada. No Brasil, Santos e colaboradores validaram a versão em português em amostra populacional de adultos de Pelotas, encontrando desempenho semelhante e sustentando o mesmo ponto de corte.',

  creator: {
    name: 'Robert L. Spitzer, Kurt Kroenke e Janet B. W. Williams',
    bio: 'Autores do PRIME-MD e do Patient Health Questionnaire. Spitzer foi psiquiatra da Universidade Columbia e um dos principais responsáveis pelo DSM-III; Kroenke é internista da Universidade de Indiana. O instrumento é de uso livre.',
  },

  references: [
    {
      citation:
        'Kroenke K, Spitzer RL, Williams JB. The PHQ-9: validity of a brief depression severity measure. J Gen Intern Med. 2001;16(9):606-13.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/11556941/',
      primary: true,
    },
    {
      citation:
        'Spitzer RL, Kroenke K, Williams JB. Validation and utility of a self-report version of PRIME-MD: the PHQ primary care study. JAMA. 1999;282(18):1737-44.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/10568646/',
    },
    {
      citation:
        'Levis B, Benedetti A, Thombs BD. Accuracy of Patient Health Questionnaire-9 (PHQ-9) for screening to detect major depression: individual participant data meta-analysis. BMJ. 2019;365:l1476.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/30967483/',
    },
    {
      citation:
        'Santos IS, Tavares BF, Munhoz TN, et al. Sensibilidade e especificidade do Patient Health Questionnaire-9 (PHQ-9) entre adultos da população geral. Cad Saude Publica. 2013;29(8):1533-43.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/24005919/',
    },
  ],
};

export default calculator;
