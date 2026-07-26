import type { Calculator, Field, Values } from '@/lib/types';
import { n } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'ocular',
    kind: 'choice',
    label: 'Abertura ocular (O)',
    hint: 'Registre a melhor resposta observada. Se as pálpebras estiverem fechadas por edema ou trauma local, o item é não testável.',
    layout: 'stack',
    options: [
      { label: 'Espontânea', value: 4, badge: '4', hint: 'Olhos já abertos, sem estímulo.' },
      { label: 'Ao som', value: 3, badge: '3', hint: 'Abre ao ser chamado ou a um comando verbal em voz alta.' },
      { label: 'À pressão', value: 2, badge: '2', hint: 'Abre apenas com estímulo doloroso (leito ungueal, trapézio ou incisura supraorbital).' },
      { label: 'Ausente', value: 1, badge: '1', hint: 'Nenhuma abertura ocular, mesmo com pressão adequada.' },
    ],
  },
  {
    id: 'verbal',
    kind: 'choice',
    label: 'Melhor resposta verbal (V)',
    hint: 'Em paciente intubado ou traqueostomizado o componente não é avaliável: registre "T" e não presuma 1 ponto.',
    layout: 'stack',
    options: [
      { label: 'Orientado', value: 5, badge: '5', hint: 'Diz corretamente nome, local e mês/ano.' },
      { label: 'Confuso', value: 4, badge: '4', hint: 'Conversa em frases, mas está desorientado.' },
      { label: 'Palavras isoladas', value: 3, badge: '3', hint: 'Palavras compreensíveis, sem frases.' },
      { label: 'Sons incompreensíveis', value: 2, badge: '2', hint: 'Gemidos, grunhidos, nenhuma palavra.' },
      { label: 'Ausente', value: 1, badge: '1', hint: 'Nenhuma emissão sonora.' },
    ],
  },
  {
    id: 'motora',
    kind: 'choice',
    label: 'Melhor resposta motora (M)',
    hint: 'Use o melhor membro e a melhor resposta obtida. É o componente com maior valor prognóstico da escala.',
    layout: 'stack',
    options: [
      { label: 'Obedece a comandos', value: 6, badge: '6', hint: 'Executa duas ordens simples (ex.: mostre a língua, levante o braço).' },
      { label: 'Localiza a dor', value: 5, badge: '5', hint: 'Leva a mão acima da linha da clavícula em direção ao estímulo.' },
      { label: 'Flexão normal (retirada)', value: 4, badge: '4', hint: 'Retira rapidamente o membro do estímulo, sem postura estereotipada.' },
      { label: 'Flexão anormal (decorticação)', value: 3, badge: '3', hint: 'Flexão lenta e estereotipada, com adução do ombro e flexão de punho e dedos.' },
      { label: 'Extensão (descerebração)', value: 2, badge: '2', hint: 'Extensão e rotação interna do membro superior.' },
      { label: 'Ausente', value: 1, badge: '1', hint: 'Nenhuma resposta motora com estímulo doloroso adequado.' },
    ],
  },
  {
    id: 'pupilas',
    kind: 'choice',
    label: 'Reatividade pupilar à luz (opcional: calcula o GCS-P)',
    hint: 'Preencha apenas se quiser o GCS-P (Glasgow Coma Scale-Pupils). O escore pupilar é subtraído do total.',
    optional: true,
    layout: 'stack',
    options: [
      { label: 'Ambas as pupilas reagem', value: 0, badge: '−0' },
      { label: 'Uma pupila não reage', value: 1, badge: '−1' },
      { label: 'Nenhuma pupila reage', value: 2, badge: '−2' },
    ],
  },
];

/** Classificação de gravidade usada no trauma cranioencefálico. */
function classificar(total: number): {
  label: string;
  severity: 'baixo' | 'moderado' | 'alto' | 'critico';
  categoria: string;
} {
  if (total >= 15) {
    return { label: 'Consciência preservada', severity: 'baixo', categoria: 'Sem rebaixamento' };
  }
  if (total >= 13) {
    return { label: 'Rebaixamento leve', severity: 'moderado', categoria: 'TCE leve (13 a 15)' };
  }
  if (total >= 9) {
    return { label: 'Rebaixamento moderado', severity: 'alto', categoria: 'TCE moderado (9 a 12)' };
  }
  return { label: 'Coma', severity: 'critico', categoria: 'TCE grave (3 a 8)' };
}

const calculator: Calculator = {
  slug: 'escala-coma-glasgow',
  title: 'Escala de Coma de Glasgow',
  shortTitle: 'Glasgow (GCS)',
  subtitle:
    'Mede objetivamente o nível de consciência pela abertura ocular, pela resposta verbal e pela resposta motora, somando de 3 a 15 pontos.',
  specialties: ['Neurologia', 'Emergência', 'Terapia Intensiva'],
  kind: 'Escala',
  popular: true,
  keywords: [
    'glasgow',
    'GCS',
    'ECG',
    'escala de coma',
    'nível de consciência',
    'coma',
    'TCE',
    'traumatismo cranioencefálico',
    'rebaixamento',
    'GCS-P',
  ],

  whenToUse: [
    'Avaliação inicial e monitoramento seriado do nível de consciência em qualquer paciente com rebaixamento: trauma cranioencefálico, acidente vascular cerebral, intoxicação exógena, encefalopatias, pós-parada.',
    'Classificação da gravidade do trauma cranioencefálico (leve 13 a 15, moderado 9 a 12, grave 3 a 8) e gatilho para via aérea definitiva quando o total é 8 ou menos.',
    'Comunicação padronizada entre equipes, no atendimento pré-hospitalar, na transferência e na evolução diária.',
    'Não é confiável em pacientes sedados, curarizados, em choque não corrigido ou hipoglicêmicos: corrija essas causas antes de atribuir o rebaixamento à lesão neurológica.',
    'Não se aplica bem a pacientes afásicos (o componente verbal cai sem rebaixamento de consciência) nem a crianças pré-verbais, que exigem a escala de Glasgow pediátrica.',
  ],

  whyUse:
    'Antes de 1974 o nível de consciência era descrito por termos vagos como "torporoso" ou "semicomatoso", sem reprodutibilidade entre observadores. A escala substituiu isso por três observações simples e reprodutíveis, que qualquer profissional treinado registra à beira do leito. É o instrumento neurológico mais usado no mundo e está embutido em praticamente todos os escores de trauma e de terapia intensiva (RTS, APACHE II, SOFA, ICH score, FOUR modificado).',

  pearls: [
    'Registre sempre os três componentes separados, e não apenas o total: "O4 V5 M6" carrega muito mais informação. Dois pacientes com 8 pontos podem ser completamente diferentes: O1 V1 M6 (obedece a comandos) tem prognóstico muito melhor que O2 V4 M2 (postura em extensão).',
    'A resposta motora é o componente de maior peso prognóstico. Quando só é possível avaliar um item, avalie a resposta motora.',
    'Paciente intubado: o componente verbal não pode ser avaliado. Anote "T" (ex.: O4 VT M6) e informe o total apenas dos itens testáveis. Somar 1 ponto arbitrariamente ao verbal subestima o paciente e superestima a gravidade.',
    'Edema periorbital, hematoma ou curativo impedem a abertura ocular: registre "NT" (não testável) em vez de 1 ponto.',
    'O estímulo doloroso precisa ser padronizado e adequado: pressão no leito ungueal, na incisura supraorbital ou no trapézio, por até 10 segundos. Estímulos fracos ou aplicados apenas em membros com lesão medular ou periférica geram falsa pontuação baixa.',
    'Localizar a dor (5) exige que a mão cruze a linha da clavícula em direção ao estímulo. Retirar o membro (4) é apenas afastar-se do estímulo. Confundir os dois é o erro mais frequente na aplicação.',
    'Flexão anormal (3, decorticação) é lenta, estereotipada, com adução do ombro, flexão de cotovelo e punho e polegar entre os dedos. Flexão normal (4) é rápida e variável.',
    'Álcool, sedativos, opioides, hipoglicemia, hipóxia, hipotensão e hipotermia rebaixam o escore sem lesão estrutural. Meça glicemia capilar e corrija a perfusão antes de interpretar o resultado.',
    'No AVC, a afasia derruba o componente verbal sem que haja rebaixamento do nível de consciência: use a NIHSS para quantificar o déficit, não o Glasgow.',
    'GCS-P (Teasdale e Brennan, 2018): subtraia do total o escore de reatividade pupilar (0 se as duas pupilas reagem, 1 se uma não reage, 2 se nenhuma reage). A escala passa a variar de 1 a 15 e discrimina melhor os pacientes no extremo inferior de gravidade, onde a soma clássica satura em 3.',
    'A versão publicada em 1974 tinha 14 pontos; a separação entre flexão normal e flexão anormal foi acrescentada em 1976, resultando nos 15 pontos usados hoje.',
    'O Glasgow não substitui o exame neurológico: pupilas, reflexos de tronco, força e marcha continuam obrigatórios. Um paciente com 15 pontos pode ter hemiparesia.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const ocular = n(values, 'ocular');
    const verbal = n(values, 'verbal');
    const motora = n(values, 'motora');
    const total = ocular + verbal + motora;

    const { label, severity, categoria } = classificar(total);

    const pupilasInformadas = typeof values.pupilas === 'number';
    const escorePupilar = pupilasInformadas ? n(values, 'pupilas') : 0;
    const gcsP = Math.max(1, total - escorePupilar);

    let interpretation: string;
    let nextSteps: string;

    if (total >= 15) {
      interpretation =
        'Nível de consciência normal: abre os olhos espontaneamente, está orientado e obedece a comandos.\nO escore máximo não exclui lesão intracraniana nem déficit focal: a decisão sobre neuroimagem depende de regras próprias, como a regra canadense para tomografia de crânio.';
      nextSteps =
        'Mantenha reavaliações seriadas se houve trauma craniano, intoxicação ou risco de deterioração.\nEm trauma cranioencefálico, aplique a regra canadense para tomografia de crânio para definir a necessidade de imagem.\nOriente sinais de alarme na alta: vômitos repetidos, cefaleia progressiva, sonolência, déficit focal ou convulsão.';
    } else if (total >= 13) {
      interpretation =
        'Rebaixamento leve. Na classificação do trauma cranioencefálico corresponde à faixa de TCE leve, que ainda assim tem risco não desprezível de lesão intracraniana: sobretudo quando o escore permanece abaixo de 15 duas horas após o trauma.';
      nextSteps =
        'Solicite tomografia de crânio sem contraste: Glasgow abaixo de 15 duas horas após o trauma é critério de alto risco na regra canadense.\nMantenha observação com reavaliação neurológica seriada e registre os três componentes a cada avaliação.\nPesquise e corrija causas metabólicas e tóxicas de rebaixamento.';
    } else if (total >= 9) {
      interpretation =
        'Rebaixamento moderado do nível de consciência. Corresponde ao TCE moderado quando a causa é traumática. Há risco relevante de deterioração e de perda de proteção de via aérea.';
      nextSteps =
        'Tomografia de crânio urgente e monitorização contínua em ambiente com suporte avançado.\nAvalie proteção de via aérea: rebaixamento progressivo, vômitos ou incapacidade de manter a via aérea indicam intubação mesmo com escore acima de 8.\nEvite hipotensão e hipoxemia, que são os principais determinantes modificáveis de desfecho no trauma cranioencefálico.\nReavalie de hora em hora e registre a tendência do escore: a queda de 2 pontos ou mais é sinal de alarme.';
    } else {
      interpretation =
        'Coma. Corresponde ao trauma cranioencefálico grave quando a causa é traumática. O paciente não protege a via aérea e há risco imediato de hipertensão intracraniana e de lesão secundária.';
      nextSteps =
        'Via aérea definitiva imediata: escore de 8 ou menos é indicação clássica de intubação orotraqueal com sequência rápida.\nTomografia de crânio de urgência e contato com a neurocirurgia.\nEvite lesão secundária: mantenha saturação acima de 94%, pressão arterial sistólica pelo menos em 110 mmHg, normocapnia, normoglicemia e normotermia; cabeceira a 30°.\nConsidere monitorização de pressão intracraniana conforme os critérios da Brain Trauma Foundation, especialmente se a tomografia for anormal.';
    }

    const details = [
      { label: 'Abertura ocular (O)', value: `${ocular} de 4` },
      { label: 'Resposta verbal (V)', value: `${verbal} de 5` },
      { label: 'Resposta motora (M)', value: `${motora} de 6`, hint: 'Componente de maior valor prognóstico' },
      { label: 'Notação recomendada', value: `O${ocular} V${verbal} M${motora} = ${total}` },
      { label: 'Classificação', value: categoria },
    ];

    if (pupilasInformadas) {
      details.push({
        label: 'GCS-P (Glasgow + pupilas)',
        value: `${gcsP} de 15`,
        hint: `Total ${total} menos escore pupilar ${escorePupilar}`,
      });
    }

    return {
      value: total,
      unit: total === 1 ? 'ponto' : 'pontos',
      label,
      severity,
      interpretation,
      details,
      nextSteps,
    };
  },

  formula: `Total = Abertura ocular (O) + Resposta verbal (V) + Melhor resposta motora (M)
Variação: 3 (mínimo) a 15 (máximo)

Abertura ocular (1 a 4)
4 - Espontânea
3 - Ao som
2 - À pressão
1 - Ausente

Resposta verbal (1 a 5)
5 - Orientado
4 - Confuso
3 - Palavras isoladas
2 - Sons incompreensíveis
1 - Ausente

Melhor resposta motora (1 a 6)
6 - Obedece a comandos
5 - Localiza a dor
4 - Flexão normal (retirada)
3 - Flexão anormal (decorticação)
2 - Extensão (descerebração)
1 - Ausente

Gravidade do trauma cranioencefálico:
Leve 13 a 15 · Moderado 9 a 12 · Grave 3 a 8

GCS-P = Total − escore de reatividade pupilar
(0 = ambas reagem · 1 = uma não reage · 2 = nenhuma reage), variando de 1 a 15.`,

  evidence:
    'Graham Teasdale e Bryan Jennett publicaram a escala em 1974, no Instituto de Ciências Neurológicas de Glasgow, com o objetivo explícito de substituir termos imprecisos como "estupor" e "semicoma" por observações reprodutíveis entre observadores diferentes. A versão original tinha 14 pontos; a subdivisão da flexão em normal e anormal, em 1976, criou a escala de 15 pontos usada até hoje. Cinquenta anos de uso mostraram concordância interobservador adequada quando os avaliadores são treinados e associação forte e graduada entre o escore inicial, em especial o componente motor, e a mortalidade e a incapacidade em seis meses no trauma cranioencefálico. Em 2018, Brennan, Murray e Teasdale propuseram o GCS-P, que subtrai do total o escore de reatividade pupilar: analisando as bases IMPACT e CRASH, a escala estendida de 1 a 15 discriminou melhor o prognóstico nos pacientes mais graves, faixa em que a soma clássica satura em 3 pontos. As diretrizes da Brain Trauma Foundation mantêm o escore de 8 ou menos como marcador de trauma cranioencefálico grave e como referência para indicação de via aérea definitiva e de monitorização da pressão intracraniana.',

  creator: {
    name: 'Graham Teasdale e Bryan Jennett',
    bio: 'Neurocirurgiões do Instituto de Ciências Neurológicas de Glasgow, na Escócia, que propuseram a escala em 1974 e o Glasgow Outcome Scale em 1975.',
  },

  references: [
    {
      citation:
        'Teasdale G, Jennett B. Assessment of coma and impaired consciousness. A practical scale. Lancet. 1974;2(7872):81-4.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/4136544/',
      primary: true,
    },
    {
      citation:
        'Teasdale G, Maas A, Lecky F, Manley G, Stocchetti N, Murray G. The Glasgow Coma Scale at 40 years: standing the test of time. Lancet Neurol. 2014;13(8):844-54.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/25030516/',
    },
    {
      citation:
        'Brennan PM, Murray GD, Teasdale GM. Simplifying the use of prognostic information in traumatic brain injury. Part 1: The GCS-Pupils score: an extended index of clinical severity. J Neurosurg. 2018;128(6):1612-20.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Brennan+Murray+Teasdale+GCS-Pupils+score+J+Neurosurg+2018',
    },
    {
      citation:
        'Carney N, Totten AM, O’Reilly C, et al. Guidelines for the Management of Severe Traumatic Brain Injury, Fourth Edition. Neurosurgery. 2017;80(1):6-15.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Guidelines+for+the+Management+of+Severe+Traumatic+Brain+Injury+Fourth+Edition+Neurosurgery+2017',
    },
  ],
};

export default calculator;
