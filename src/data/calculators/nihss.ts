import type { Calculator, Field, Values } from '@/lib/types';
import { n, sumPoints } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'item1a',
    kind: 'choice',
    label: '1a. Nível de consciência',
    hint: 'Pontue mesmo quando a avaliação for limitada por tubo orotraqueal, barreira de idioma ou trauma facial. Só use 3 se o paciente estiver flácido e arreflexo ou responder apenas com postura reflexa.',
    layout: 'stack',
    options: [
      { label: 'Alerta, responde com vivacidade', value: 0, badge: '0' },
      {
        label: 'Não alerta, mas desperta com estímulo mínimo',
        value: 1,
        badge: '+1',
        hint: 'Obedece, responde ou reage após um chamado ou toque leve.',
      },
      {
        label: 'Não alerta, requer estímulo repetido ou doloroso',
        value: 2,
        badge: '+2',
        hint: 'Move-se, mas os movimentos não são estereotipados.',
      },
      {
        label: 'Responde só com reflexo motor ou reação autonômica, ou irresponsivo',
        value: 3,
        badge: '+3',
        hint: 'Flácido e arreflexo, ou apenas postura em extensão/flexão.',
      },
    ],
  },
  {
    id: 'item1b',
    kind: 'choice',
    label: '1b. Perguntas de nível de consciência',
    hint: 'Pergunte o mês atual e a idade. Só a primeira resposta conta: não dê pistas nem aceite aproximações. Paciente intubado, disártrico grave ou com barreira de idioma pontua 1; afásico ou estuporoso que não compreende pontua 2.',
    layout: 'stack',
    options: [
      { label: 'Responde as duas corretamente', value: 0, badge: '0' },
      { label: 'Responde uma corretamente', value: 1, badge: '+1' },
      { label: 'Não responde nenhuma corretamente', value: 2, badge: '+2' },
    ],
  },
  {
    id: 'item1c',
    kind: 'choice',
    label: '1c. Comandos de nível de consciência',
    hint: 'Peça para abrir e fechar os olhos e depois abrir e fechar a mão não parética. Se o paciente não compreender o comando falado, demonstre por mímica. Vale apenas a primeira tentativa.',
    layout: 'stack',
    options: [
      { label: 'Executa os dois comandos corretamente', value: 0, badge: '0' },
      { label: 'Executa um comando corretamente', value: 1, badge: '+1' },
      { label: 'Não executa nenhum comando', value: 2, badge: '+2' },
    ],
  },
  {
    id: 'item2',
    kind: 'choice',
    label: '2. Melhor olhar conjugado',
    hint: 'Avalie apenas o movimento ocular horizontal, voluntário ou pelo reflexo oculocefálico. Paralisia isolada de III, IV ou VI par pontua 1.',
    layout: 'stack',
    options: [
      { label: 'Normal', value: 0, badge: '0' },
      {
        label: 'Paralisia parcial do olhar',
        value: 1,
        badge: '+1',
        hint: 'Olhar anormal em um ou nos dois olhos, sem desvio forçado nem paresia total.',
      },
      {
        label: 'Desvio forçado ou paresia total do olhar',
        value: 2,
        badge: '+2',
        hint: 'Não vencido pela manobra oculocefálica.',
      },
    ],
  },
  {
    id: 'item3',
    kind: 'choice',
    label: '3. Campos visuais',
    hint: 'Teste os quadrantes por confrontação, com contagem de dedos ou ameaça visual. Em caso de cegueira unilateral prévia, avalie os campos do olho bom. Se houver extinção visual, pontue 1 aqui e registre o achado também no item 11.',
    layout: 'stack',
    options: [
      { label: 'Sem perda visual', value: 0, badge: '0' },
      { label: 'Hemianopsia parcial (quadrantanopsia)', value: 1, badge: '+1' },
      { label: 'Hemianopsia completa', value: 2, badge: '+2' },
      { label: 'Hemianopsia bilateral, incluindo cegueira cortical', value: 3, badge: '+3' },
    ],
  },
  {
    id: 'item4',
    kind: 'choice',
    label: '4. Paralisia facial',
    hint: 'Peça para mostrar os dentes, elevar as sobrancelhas e fechar os olhos com força. No paciente irresponsivo, avalie a simetria da careta ao estímulo doloroso.',
    layout: 'stack',
    options: [
      { label: 'Movimentos normais e simétricos', value: 0, badge: '0' },
      {
        label: 'Paralisia menor',
        value: 1,
        badge: '+1',
        hint: 'Apagamento do sulco nasolabial, assimetria ao sorrir.',
      },
      {
        label: 'Paralisia parcial',
        value: 2,
        badge: '+2',
        hint: 'Paralisia total ou quase total da metade inferior da face (padrão central).',
      },
      {
        label: 'Paralisia completa de um ou dos dois lados',
        value: 3,
        badge: '+3',
        hint: 'Ausência de movimento nas metades superior e inferior da face.',
      },
    ],
  },
  {
    id: 'item5a',
    kind: 'choice',
    label: '5a. Motor: braço esquerdo',
    hint: 'Braço a 90° se sentado, ou a 45° se deitado, por 10 segundos. Comece pelo braço não parético. Amputação ou fusão articular do ombro torna o item não testável (UN): nesse caso não pontue e registre UN.',
    layout: 'stack',
    options: [
      { label: 'Sem queda: mantém a posição por 10 segundos', value: 0, badge: '0' },
      { label: 'Queda parcial antes de 10 segundos, sem atingir o leito', value: 1, badge: '+1' },
      { label: 'Algum esforço contra a gravidade, mas não sustenta a posição', value: 2, badge: '+2' },
      { label: 'Nenhum esforço contra a gravidade: o braço cai', value: 3, badge: '+3' },
      { label: 'Nenhum movimento', value: 4, badge: '+4' },
    ],
  },
  {
    id: 'item5b',
    kind: 'choice',
    label: '5b. Motor: braço direito',
    hint: 'Mesma manobra do item 5a, no membro contralateral.',
    layout: 'stack',
    options: [
      { label: 'Sem queda: mantém a posição por 10 segundos', value: 0, badge: '0' },
      { label: 'Queda parcial antes de 10 segundos, sem atingir o leito', value: 1, badge: '+1' },
      { label: 'Algum esforço contra a gravidade, mas não sustenta a posição', value: 2, badge: '+2' },
      { label: 'Nenhum esforço contra a gravidade: o braço cai', value: 3, badge: '+3' },
      { label: 'Nenhum movimento', value: 4, badge: '+4' },
    ],
  },
  {
    id: 'item6a',
    kind: 'choice',
    label: '6a. Motor: perna esquerda',
    hint: 'Perna a 30° em decúbito dorsal, por 5 segundos. Amputação ou fusão do quadril torna o item não testável (UN).',
    layout: 'stack',
    options: [
      { label: 'Sem queda: mantém a posição por 5 segundos', value: 0, badge: '0' },
      { label: 'Queda parcial antes de 5 segundos, sem atingir o leito', value: 1, badge: '+1' },
      { label: 'Algum esforço contra a gravidade: cai ao leito antes de 5 segundos', value: 2, badge: '+2' },
      { label: 'Nenhum esforço contra a gravidade: a perna cai imediatamente', value: 3, badge: '+3' },
      { label: 'Nenhum movimento', value: 4, badge: '+4' },
    ],
  },
  {
    id: 'item6b',
    kind: 'choice',
    label: '6b. Motor: perna direita',
    hint: 'Mesma manobra do item 6a, no membro contralateral.',
    layout: 'stack',
    options: [
      { label: 'Sem queda: mantém a posição por 5 segundos', value: 0, badge: '0' },
      { label: 'Queda parcial antes de 5 segundos, sem atingir o leito', value: 1, badge: '+1' },
      { label: 'Algum esforço contra a gravidade: cai ao leito antes de 5 segundos', value: 2, badge: '+2' },
      { label: 'Nenhum esforço contra a gravidade: a perna cai imediatamente', value: 3, badge: '+3' },
      { label: 'Nenhum movimento', value: 4, badge: '+4' },
    ],
  },
  {
    id: 'item7',
    kind: 'choice',
    label: '7. Ataxia de membros',
    hint: 'Índex-nariz e calcanhar-joelho dos dois lados, com os olhos abertos. A ataxia só conta se for desproporcional à fraqueza. Paciente que não compreende ou está plégico pontua 0.',
    layout: 'stack',
    options: [
      { label: 'Ausente', value: 0, badge: '0' },
      { label: 'Presente em um membro', value: 1, badge: '+1' },
      { label: 'Presente em dois membros', value: 2, badge: '+2' },
    ],
  },
  {
    id: 'item8',
    kind: 'choice',
    label: '8. Sensibilidade',
    hint: 'Teste a sensibilidade dolorosa (agulha) na face, no braço, no tronco e na perna, comparando os lados. Só pontue a perda atribuível ao AVC. Paciente com nível de consciência 3 (item 1a) pontua 2 por convenção.',
    layout: 'stack',
    options: [
      { label: 'Normal', value: 0, badge: '0' },
      {
        label: 'Perda leve a moderada',
        value: 1,
        badge: '+1',
        hint: 'Sente o estímulo como menos intenso ou perde a dor superficial, mas percebe o toque.',
      },
      {
        label: 'Perda grave a total',
        value: 2,
        badge: '+2',
        hint: 'Não percebe o toque na face, no braço e na perna, ou perda bilateral.',
      },
    ],
  },
  {
    id: 'item9',
    kind: 'choice',
    label: '9. Melhor linguagem',
    hint: 'Peça para descrever a figura padronizada, nomear objetos e ler as frases da prancha. Paciente intubado deve escrever. Nível de consciência 3 (item 1a) pontua 3 por convenção.',
    layout: 'stack',
    options: [
      { label: 'Sem afasia', value: 0, badge: '0' },
      {
        label: 'Afasia leve a moderada',
        value: 1,
        badge: '+1',
        hint: 'Perda de fluência ou de compreensão, sem limitação importante das ideias expressas.',
      },
      {
        label: 'Afasia grave',
        value: 2,
        badge: '+2',
        hint: 'Comunicação fragmentada; o examinador precisa inferir grande parte do conteúdo.',
      },
      { label: 'Mudez ou afasia global', value: 3, badge: '+3', hint: 'Nenhuma fala útil nem compreensão auditiva.' },
    ],
  },
  {
    id: 'item10',
    kind: 'choice',
    label: '10. Disartria',
    hint: 'Avalie a articulação, e não o conteúdo, pedindo para repetir ou ler palavras da lista padronizada. Intubação ou outra barreira física torna o item não testável (UN).',
    layout: 'stack',
    options: [
      { label: 'Normal', value: 0, badge: '0' },
      {
        label: 'Disartria leve a moderada',
        value: 1,
        badge: '+1',
        hint: 'Arrasta algumas palavras; é compreendido com alguma dificuldade.',
      },
      {
        label: 'Disartria grave ou anartria',
        value: 2,
        badge: '+2',
        hint: 'Fala ininteligível, desproporcional a eventual afasia, ou mudez.',
      },
    ],
  },
  {
    id: 'item11',
    kind: 'choice',
    label: '11. Extinção e desatenção (negligência)',
    hint: 'Use a estimulação simultânea bilateral, visual e tátil. Paciente com afasia grave que responde aos dois lados pontua 0. Item não testável em quem não pode ser avaliado pontua 0.',
    layout: 'stack',
    options: [
      { label: 'Sem anormalidade', value: 0, badge: '0' },
      {
        label: 'Desatenção ou extinção em uma modalidade sensorial',
        value: 1,
        badge: '+1',
        hint: 'Visual, tátil, auditiva, espacial ou pessoal.',
      },
      {
        label: 'Hemi-desatenção profunda ou desatenção em mais de uma modalidade',
        value: 2,
        badge: '+2',
        hint: 'Não reconhece a própria mão ou se orienta apenas para um hemiespaço.',
      },
    ],
  },
];

/** Faixas de gravidade convencionadas para a NIHSS. */
function classificar(total: number): {
  label: string;
  severity: 'info' | 'baixo' | 'moderado' | 'alto' | 'critico';
  faixa: string;
} {
  if (total === 0) {
    return { label: 'Sem déficit mensurável', severity: 'info', faixa: '0' };
  }
  if (total <= 4) {
    return { label: 'AVC leve', severity: 'baixo', faixa: '1 a 4' };
  }
  if (total <= 15) {
    return { label: 'AVC moderado', severity: 'moderado', faixa: '5 a 15' };
  }
  if (total <= 20) {
    return { label: 'AVC moderado a grave', severity: 'alto', faixa: '16 a 20' };
  }
  return { label: 'AVC grave', severity: 'critico', faixa: '21 a 42' };
}

const calculator: Calculator = {
  slug: 'nihss',
  title: 'NIHSS: escala de AVC do NIH',
  shortTitle: 'NIHSS',
  subtitle:
    'Quantifica a gravidade do déficit neurológico no acidente vascular cerebral agudo em 11 itens, somando de 0 a 42 pontos.',
  specialties: ['Neurologia', 'Emergência', 'Terapia Intensiva'],
  kind: 'Escala',
  popular: true,
  keywords: [
    'nihss',
    'NIH stroke scale',
    'escala de AVC do NIH',
    'AVC',
    'acidente vascular cerebral',
    'AVC isquêmico',
    'trombólise',
    'alteplase',
    'tenecteplase',
    'trombectomia',
    'déficit neurológico',
  ],

  whenToUse: [
    'Avaliação inicial de todo paciente com suspeita de AVC agudo, para quantificar a gravidade do déficit de forma padronizada e reprodutível.',
    'Monitoramento seriado nas primeiras 24 horas após trombólise ou trombectomia: piora de 4 pontos ou mais sugere hemorragia sintomática, reoclusão ou edema.',
    'Seleção e comunicação em terapias de reperfusão: é a escala usada como critério de inclusão em praticamente todos os ensaios de trombólise e trombectomia, e no acionamento de transferência para centro com neurointervenção.',
    'Não é um instrumento diagnóstico: não distingue AVC isquêmico de hemorrágico nem de mimetizadores (crise epiléptica com paralisia de Todd, hipoglicemia, enxaqueca com aura, distúrbio funcional). A tomografia continua obrigatória.',
    'Não foi desenhada para AVC subagudo nem para reabilitação: nessas fases use a escala de Rankin modificada ou o índice de Barthel.',
  ],

  whyUse:
    'A NIHSS transformou a descrição narrativa do exame neurológico em um número reprodutível entre observadores treinados, que se correlaciona com o volume do infarto, com a probabilidade de oclusão de grande vaso e com o desfecho funcional em três meses. É a linguagem comum das unidades de AVC, dos protocolos de trombólise e dos ensaios clínicos.',

  pearls: [
    'A escala é enviesada para a circulação anterior esquerda: sete pontos dependem de linguagem e de funções corticais dominantes. Um AVC de hemisfério direito ou de território vertebrobasilar pode ter NIHSS baixo e ser devastador: oclusão de basilar frequentemente pontua abaixo de 10 antes de deteriorar.',
    'NIHSS baixo não é motivo para negar trombólise. O que define a indicação é o déficit ser incapacitante para aquele paciente: afasia isolada, hemianopsia ou monoparesia da mão dominante em quem depende dela são incapacitantes mesmo com 2 ou 3 pontos.',
    'Aplique os itens na ordem e registre a primeira resposta. Voltar atrás, treinar o paciente ou repetir a tarefa até acertar invalida a padronização e subestima o déficit.',
    'Pontue o que o paciente faz, não o que você acha que ele conseguiria fazer. Déficit prévio (amaurose antiga, amputação, prótese) exige a regra específica do item: nos itens motores 5 e 6, amputação ou fusão articular é registrada como "UN" e não pontua.',
    'Item 1a com 3 pontos força pontuações automáticas: sensibilidade 2, linguagem 3 e extinção 2. Não reavalie esses itens no paciente arresponsivo.',
    'A ataxia (item 7) só conta quando é desproporcional à fraqueza. Membro plégico ou paciente que não compreende o comando pontua 0: erro comum é pontuar ataxia em quem simplesmente não consegue mover o membro.',
    'Não some pontos "de tronco" nem invente itens. A escala tem exatamente 15 registros (11 itens, com 5a/5b e 6a/6b duplicados) e teto de 42.',
    'ECASS III excluiu pacientes com NIHSS acima de 25 da trombólise entre 3 e 4,5 horas; os ensaios de trombectomia da janela estendida exigiram NIHSS de pelo menos 6 (DEFUSE 3) ou 10 (DAWN). Conhecer esses limiares evita atrasos na decisão.',
    'A confiabilidade entre observadores depende de treinamento formal em vídeo: sem certificação, os itens de ataxia, disartria e face são os que mais divergem.',
    'Registre também o horário do último momento em que o paciente foi visto bem. O NIHSS sem esse dado não decide nada em reperfusão.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const total = sumPoints(FIELDS, values);
    const { label, severity, faixa } = classificar(total);

    const consciencia = n(values, 'item1a') + n(values, 'item1b') + n(values, 'item1c');
    const motor =
      n(values, 'item5a') + n(values, 'item5b') + n(values, 'item6a') + n(values, 'item6b');
    const linguagem = n(values, 'item9') + n(values, 'item10');

    let interpretation: string;
    let nextSteps: string;

    if (total === 0) {
      interpretation =
        'Nenhum déficit detectável pelos itens da escala. Isso não exclui AVC: infartos de tronco, cerebelo e território posterior, além de quadros já em resolução, podem cursar com NIHSS 0.\nA decisão sobre reperfusão depende do déficit ser incapacitante, e não do número.';
      nextSteps =
        'Mantenha a investigação de AVC se a história for compatível: tomografia ou ressonância, glicemia capilar, eletrocardiograma e avaliação vascular.\nReavalie a escala periodicamente: a deterioração precoce é frequente na oclusão de grande vaso e na dissecção arterial.';
    } else if (total <= 4) {
      interpretation =
        'AVC leve pela escala. A maioria desses pacientes evolui com bom desfecho funcional, mas o escore baixo não é sinônimo de déficit não incapacitante nem exclui oclusão de grande vaso.';
      nextSteps =
        'Avalie se o déficit é incapacitante para este paciente: afasia, hemianopsia, ataxia ou paresia da mão dominante justificam trombólise mesmo com poucos pontos.\nSolicite angiotomografia de vasos cervicais e intracranianos: oclusão proximal pode se manifestar inicialmente com NIHSS baixo.\nInternação em unidade de AVC, prevenção secundária precoce e reavaliação neurológica seriada.';
    } else if (total <= 15) {
      interpretation =
        'AVC moderado. Faixa de escore em que o benefício absoluto das terapias de reperfusão é maior, desde que respeitada a janela terapêutica.';
      nextSteps =
        'Acione o protocolo de AVC: tomografia sem contraste imediata, glicemia, avaliação da janela e checagem de contraindicações à trombólise.\nSolicite angiotomografia: NIHSS nessa faixa tem probabilidade relevante de oclusão de grande vaso e possível indicação de trombectomia.\nInternação em unidade de AVC, com monitorização neurológica e controle pressórico conforme o tratamento instituído.';
    } else if (total <= 20) {
      interpretation =
        'AVC moderado a grave. Alta probabilidade de oclusão de grande vaso e de incapacidade residual significativa; o risco de transformação hemorrágica após reperfusão também é maior.';
      nextSteps =
        'Angiotomografia arterial imediata e contato com serviço de neurointervenção: a trombectomia mecânica é o tratamento de maior benefício quando há oclusão proximal.\nAvalie trombólise endovenosa em paralelo, se dentro da janela e sem contraindicações.\nMonitorização em unidade de AVC ou terapia intensiva, com vigilância de edema cerebral e de rebaixamento do nível de consciência.';
    } else {
      interpretation =
        'AVC grave. Escore acima de 20 associa-se a alta probabilidade de óbito ou de incapacidade grave e ao maior risco de hemorragia sintomática após trombólise.';
      nextSteps =
        'Angiotomografia e contato imediato com a neurointervenção: mesmo com escore alto, a trombectomia mantém benefício quando há oclusão proximal e tecido salvável.\nInternação em terapia intensiva ou unidade de AVC com vigilância para infarto maligno de artéria cerebral média: considere craniectomia descompressiva precoce em pacientes selecionados.\nDiscuta prognóstico com a família, mas evite limitações terapêuticas nas primeiras 24 a 48 horas: a deterioração precoce não prediz de forma confiável o desfecho final.';
    }

    return {
      value: total,
      unit: total === 1 ? 'ponto' : 'pontos',
      label,
      severity,
      interpretation,
      details: [
        { label: 'Faixa de gravidade', value: `${faixa} pontos: ${label}` },
        {
          label: 'Nível de consciência (itens 1a a 1c)',
          value: `${consciencia} de 7`,
        },
        {
          label: 'Déficit motor (itens 5 e 6)',
          value: `${motor} de 16`,
        },
        {
          label: 'Linguagem e fala (itens 9 e 10)',
          value: `${linguagem} de 5`,
          hint: 'Itens dependentes do hemisfério dominante',
        },
        {
          label: 'Total possível',
          value: '42 pontos',
        },
      ],
      nextSteps,
    };
  },

  formula: `Soma dos 11 itens (15 registros), de 0 a 42 pontos:

1a. Nível de consciência: 0 a 3
1b. Perguntas de nível de consciência (mês e idade): 0 a 2
1c. Comandos de nível de consciência: 0 a 2
2. Melhor olhar conjugado: 0 a 2
3. Campos visuais: 0 a 3
4. Paralisia facial: 0 a 3
5a. Motor - braço esquerdo: 0 a 4
5b. Motor - braço direito: 0 a 4
6a. Motor - perna esquerda: 0 a 4
6b. Motor - perna direita: 0 a 4
7. Ataxia de membros: 0 a 2
8. Sensibilidade: 0 a 2
9. Melhor linguagem: 0 a 3
10. Disartria: 0 a 2
11. Extinção e desatenção: 0 a 2

Faixas de gravidade convencionadas:
0 - sem déficit mensurável
1 a 4 - AVC leve
5 a 15 - AVC moderado
16 a 20 - AVC moderado a grave
21 a 42 - AVC grave`,

  evidence:
    'A escala foi publicada por Brott e colaboradores em 1989, na Universidade de Cincinnati, a partir de 65 pacientes com infarto cerebral agudo avaliados por múltiplos examinadores; mostrou boa concordância entre observadores e correlação forte com o volume do infarto na tomografia em sete a dez dias. O treinamento em vídeo padronizado, descrito por Lyden e colaboradores para o estudo NINDS de rt-PA em 1994, elevou a confiabilidade a níveis aceitáveis para ensaios multicêntricos. No estudo TOAST, com 1.281 pacientes, cada ponto adicional na NIHSS inicial reduziu em 24% (em sete dias) e em 17% (em três meses) a chance de desfecho excelente; escore inicial de 16 ou mais previu alta probabilidade de óbito ou incapacidade grave, e escore de 6 ou menos previu boa recuperação. A escala foi traduzida, adaptada culturalmente e validada para o português do Brasil por Cincura e colaboradores em 2009, em Salvador, junto com a escala de Rankin modificada e o índice de Barthel.',

  creator: {
    name: 'Thomas Brott, Harold P. Adams Jr. e colaboradores',
    bio: 'Neurologistas norte-americanos ligados aos ensaios do National Institute of Neurological Disorders and Stroke (NINDS), que desenvolveram a escala em 1989 para uso em ensaios clínicos de AVC agudo.',
  },

  references: [
    {
      citation:
        'Brott T, Adams HP Jr, Olinger CP, et al. Measurements of acute cerebral infarction: a clinical examination scale. Stroke. 1989;20(7):864-70.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/2749846/',
      primary: true,
    },
    {
      citation:
        'Lyden P, Brott T, Tilley B, et al. Improved reliability of the NIH Stroke Scale using video training. NINDS TPA Stroke Study Group. Stroke. 1994;25(11):2220-6.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/7974549/',
    },
    {
      citation:
        'Adams HP Jr, Davis PH, Leira EC, et al. Baseline NIH Stroke Scale score strongly predicts outcome after stroke: A report of the Trial of Org 10172 in Acute Stroke Treatment (TOAST). Neurology. 1999;53(1):126-31.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/10408548/',
    },
    {
      citation:
        'Cincura C, Pontes-Neto OM, Neville IS, et al. Validation of the National Institutes of Health Stroke Scale, modified Rankin Scale and Barthel Index in Brazil: the role of cultural adaptation and structured interviewing. Cerebrovasc Dis. 2009;27(2):119-22.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/19039215/',
    },
    {
      citation:
        'Powers WJ, Rabinstein AA, Ackerson T, et al. Guidelines for the Early Management of Patients With Acute Ischemic Stroke: 2019 Update to the 2018 Guidelines for the Early Management of Acute Ischemic Stroke: A Guideline for Healthcare Professionals From the American Heart Association/American Stroke Association. Stroke. 2019;50(12):e344-e418.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/31662037/',
    },
    {
      citation:
        'Oliveira-Filho J, Martins SCO, Pontes-Neto OM, et al. Guidelines for acute ischemic stroke treatment: part I. Arq Neuropsiquiatr. 2012;70(8):621-9.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/22899035/',
    },
  ],
};

export default calculator;
