import type { Calculator, Field, Values } from '@/lib/types';
import { sumPoints } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'dilatacao',
    kind: 'choice',
    label: 'Dilatação do colo',
    hint: 'Diâmetro do orifício cervical interno ao toque, em centímetros.',
    options: [
      { label: 'Fechado', value: 0 },
      { label: '1 a 2 cm', value: 1, badge: '+1' },
      { label: '3 a 4 cm', value: 2, badge: '+2' },
      { label: '5 cm ou mais', value: 3, badge: '+3' },
    ],
  },
  {
    id: 'apagamento',
    kind: 'choice',
    label: 'Apagamento (esvaecimento) do colo',
    hint: 'Percentual de encurtamento em relação ao colo não apagado, de cerca de 3 cm. Apagamento de 50% equivale a um colo de aproximadamente 1,5 cm.',
    layout: 'stack',
    options: [
      { label: '0 a 30% (colo grosso, com 3 cm ou mais)', value: 0 },
      { label: '40 a 50%', value: 1, badge: '+1' },
      { label: '60 a 70%', value: 2, badge: '+2' },
      { label: '80% ou mais (colo fino)', value: 3, badge: '+3' },
    ],
  },
  {
    id: 'altura',
    kind: 'choice',
    label: 'Altura da apresentação (planos de De Lee)',
    hint: 'Referência é o nível das espinhas isquiáticas, que corresponde ao De Lee 0 e ao III plano de Hodge.',
    layout: 'stack',
    options: [
      { label: '−3 (alto e móvel)', value: 0 },
      { label: '−2', value: 1, badge: '+1' },
      { label: '−1 ou 0 (insinuada)', value: 2, badge: '+2' },
      { label: '+1 ou +2 (descida no canal)', value: 3, badge: '+3' },
    ],
  },
  {
    id: 'consistencia',
    kind: 'choice',
    label: 'Consistência do colo',
    hint: 'Compare com a ponta do nariz (firme), com o lóbulo da orelha (intermediária) e com o lábio (amolecido).',
    options: [
      { label: 'Firme', value: 0 },
      { label: 'Intermediária', value: 1, badge: '+1' },
      { label: 'Amolecido', value: 2, badge: '+2' },
    ],
  },
  {
    id: 'posicao',
    kind: 'choice',
    label: 'Posição do colo',
    hint: 'Orientação do colo em relação ao eixo da vagina.',
    options: [
      { label: 'Posterior', value: 0 },
      { label: 'Centralizado', value: 1, badge: '+1' },
      { label: 'Anterior', value: 2, badge: '+2' },
    ],
  },
];

const calculator: Calculator = {
  slug: 'bishop',
  title: 'Índice de Bishop',
  shortTitle: 'Bishop',
  subtitle:
    'Avalia a favorabilidade do colo uterino para indução do parto e indica quando é preciso preparo (maturação) cervical antes da ocitocina.',
  specialties: ['Obstetrícia'],
  kind: 'Escala',
  keywords: [
    'bishop',
    'índice de bishop',
    'escore de bishop',
    'indução do parto',
    'colo favorável',
    'maturação cervical',
    'preparo cervical',
    'misoprostol',
    'ocitocina',
    'sonda de Foley',
  ],

  whenToUse: [
    'Gestantes com indicação de indução do parto, para decidir entre iniciar ocitocina diretamente ou fazer preparo cervical antes.',
    'Derivado em multíparas a termo submetidas a indução eletiva. Em nulíparas e em induções por indicação médica o desempenho preditivo é menor, mas o escore continua sendo usado para orientar o método.',
    'Não se aplica quando há contraindicação ao parto vaginal ou à indução: placenta prévia, vasa prévia, situação transversa, prolapso de cordão, herpes genital ativo, cesárea prévia com incisão corporal clássica ou miomectomia com abertura da cavidade.',
    'O toque vaginal para pontuar o escore é contraindicado na rotura prematura de membranas pré-termo em conduta expectante e diante de sangramento sem localização placentária definida.',
  ],

  whyUse:
    'Um colo desfavorável é o principal preditor de indução prolongada e de falha de indução. O índice de Bishop separa, à beira do leito e em segundos, quem pode receber ocitocina desde já de quem precisa de maturação cervical prévia com prostaglandina ou método mecânico: decisão que muda a duração do trabalho de parto e o risco de cesárea.',

  pearls: [
    'Bishop desfavorável não contraindica a indução: indica preparo cervical. A maioria das gestantes induzidas com colo desfavorável ainda chega ao parto vaginal, apenas com trabalho de parto mais longo.',
    'A reprodutibilidade entre examinadores é baixa, sobretudo para apagamento e consistência. Dois profissionais podem diferir em 2 a 3 pontos no mesmo colo: registre quem examinou e prefira o mesmo examinador nas reavaliações.',
    'Confusão clássica no Brasil: o índice usa os planos de De Lee (−5 a +5, referência nas espinhas isquiáticas), não os planos de Hodge (I a IV). O III plano de Hodge corresponde ao De Lee 0; o II plano fica em torno de −2. Converter errado altera o escore em até 3 pontos.',
    'Revisão sistemática de 40 estudos com 13.757 mulheres mostrou que o Bishop, isoladamente, é preditor ruim do desfecho da indução (cesárea): serve para escolher o método de indução, não para decidir se a indução deve ou não ser feita.',
    'Circulam várias versões "modificadas" e "simplificadas" (algumas com apenas dilatação, apagamento e altura; outras somando pontos por pré-eclâmpsia ou pós-datismo e subtraindo por prematuridade). Registre sempre qual versão foi usada: esta é a original de Bishop, de 0 a 13 pontos.',
    'Misoprostol é contraindicado em gestante com cesárea anterior ou qualquer cicatriz uterina, pelo risco de rotura. Nesses casos, prefira método mecânico (sonda de Foley intracervical).',
    'O escore não avalia bem-estar fetal, apresentação nem proporção cefalopélvica. Confirme situação, apresentação e vitalidade antes de indicar a indução.',
    'Comprimento cervical medido por ultrassom transvaginal foi proposto como alternativa mais objetiva, mas não superou de forma consistente o índice de Bishop na prática clínica.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const pontos = sumPoints(FIELDS, values);

    let label: string;
    let severity: 'baixo' | 'moderado' | 'alto';
    let interpretation: string;
    let nextSteps: string;

    if (pontos >= 8) {
      label = 'Colo favorável';
      severity = 'baixo';
      interpretation =
        'Colo favorável. Com índice de 8 ou mais, a probabilidade de parto vaginal após indução aproxima-se da do trabalho de parto de início espontâneo. Não há indicação de preparo cervical.';
      nextSteps =
        'Indução direta com ocitocina endovenosa em bomba de infusão, seguindo o protocolo institucional de dose e incremento, associada ou não à amniotomia quando a apresentação estiver insinuada.\nMonitorização da frequência cardíaca fetal e da dinâmica uterina conforme o risco da gestação.';
    } else if (pontos === 7) {
      label = 'Colo intermediário';
      severity = 'moderado';
      interpretation =
        'Zona intermediária. Em multíparas, o colo já tende a responder bem à ocitocina; em nulíparas, o preparo cervical prévio costuma encurtar o processo.';
      nextSteps =
        'Em multípara, pode-se iniciar ocitocina diretamente.\nEm nulípara, considere uma etapa de preparo cervical antes da ocitocina.\nReavalie o colo após algumas horas e recalcule o escore antes de mudar de estratégia.';
    } else {
      label = 'Colo desfavorável';
      severity = 'alto';
      interpretation =
        pontos <= 3
          ? 'Colo muito desfavorável. Indução com ocitocina isolada tem alta probabilidade de trabalho de parto prolongado e de falha de indução: o preparo cervical é obrigatório.'
          : 'Colo desfavorável. Está indicado preparo (maturação) cervical antes da ocitocina.';
      nextSteps =
        'Métodos de preparo cervical: misoprostol 25 µg por via vaginal a cada 6 horas (ou 25 µg por via oral a cada 2 horas), dinoprostona em gel ou dispositivo vaginal, ou método mecânico com sonda de Foley intracervical (balão insuflado com 30 a 60 mL, por até 12 a 24 horas).\nMisoprostol está contraindicado em gestante com cesárea anterior ou outra cicatriz uterina: nesse cenário, use o método mecânico.\nReavalie o índice de Bishop após cada ciclo de preparo. Só inicie ocitocina pelo menos 4 horas após a última dose de misoprostol.\nMantenha monitorização fetal e vigilância para taquissistolia.';
    }

    return {
      value: pontos,
      unit: pontos === 1 ? 'ponto' : 'pontos',
      label,
      severity,
      interpretation,
      details: [
        {
          label: 'Faixa',
          value:
            pontos >= 8 ? '≥ 8: favorável' : pontos === 7 ? '7: intermediário' : '≤ 6: desfavorável',
        },
        {
          label: 'Preparo cervical',
          value: pontos >= 8 ? 'Não indicado' : pontos === 7 ? 'Considerar em nulíparas' : 'Indicado',
        },
        {
          label: 'Pontuação máxima',
          value: '13 pontos',
          hint: 'Dilatação, apagamento e altura valem até 3 pontos cada; consistência e posição, até 2 cada.',
        },
      ],
      nextSteps,
    };
  },

  formula: `Soma de cinco itens - total de 0 a 13 pontos:

Dilatação - fechado (0) · 1 a 2 cm (1) · 3 a 4 cm (2) · ≥ 5 cm (3)
Apagamento - 0 a 30% (0) · 40 a 50% (1) · 60 a 70% (2) · ≥ 80% (3)
Altura (De Lee) - −3 (0) · −2 (1) · −1 ou 0 (2) · +1 ou +2 (3)
Consistência - firme (0) · intermediária (1) · amolecido (2)
Posição - posterior (0) · centralizado (1) · anterior (2)

Interpretação:
≥ 8 - colo favorável, indução com ocitocina
7 - intermediário
≤ 6 - colo desfavorável, indicar preparo cervical`,

  evidence:
    'Edward Bishop publicou o índice em 1964, na Obstetrics & Gynecology, a partir de sua experiência com indução eletiva em multíparas a termo: mulheres com pontuação alta iam para o parto vaginal de forma previsível, o que permitia programar a indução com segurança. O escore se difundiu para todas as induções, embora seu desempenho fora da população de derivação seja bem mais modesto. A revisão sistemática de Kolkman e colaboradores (2013), com 40 estudos e 13.757 mulheres induzidas a termo, encontrou capacidade preditiva pobre para cesárea, para um índice abaixo de 9, a sensibilidade foi de 95% com especificidade de apenas 30%, e concluiu que o escore não deve ser usado para decidir se a indução será feita. Na prática atual, sustentada pelo ACOG, o índice mantém-se útil para a decisão operacional: colo desfavorável (habitualmente definido como 6 ou menos) indica maturação cervical prévia com prostaglandina ou método mecânico.',

  creator: {
    name: 'Edward H. Bishop',
    bio: 'Obstetra norte-americano da Pennsylvania Hospital, na Filadélfia. Publicou o índice de favorabilidade cervical em 1964, ainda hoje o padrão para avaliar o colo antes da indução.',
  },

  updatedAt: '2026-07-26',

  references: [
    {
      citation: 'Bishop EH. Pelvic scoring for elective induction. Obstet Gynecol. 1964;24:266-8.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/14199536/',
      primary: true,
    },
    {
      citation:
        'Kolkman DGE, Verhoeven CJM, Brinkhorst SJ, et al. The Bishop score as a predictor of labor induction success: a systematic review. Am J Perinatol. 2013;30(8):625-30.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/23283806/',
    },
    {
      citation:
        'American College of Obstetricians and Gynecologists. ACOG Practice Bulletin No. 107: Induction of labor. Obstet Gynecol. 2009;114(2 Pt 1):386-97.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/19623003/',
    },
    {
      citation:
        'Brasil. Ministério da Saúde. Diretrizes nacionais de assistência ao parto normal: versão resumida. Brasília: Ministério da Saúde; 2017.',
    },
  ],
};

export default calculator;
