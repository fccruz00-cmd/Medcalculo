import type { Calculator, Field, ResultDetail, Values } from '@/lib/types';
import { n } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'dorMaleolar',
    kind: 'boolean',
    label: 'Dor na região maleolar',
    hint: 'Zona maleolar: a faixa que vai da ponta dos maléolos até cerca de 6 cm acima deles, incluindo a articulação do tornozelo.',
    help: 'A regra só é aplicada nas zonas em que o paciente refere dor. Se não há dor maleolar nem no médio-pé, nenhuma radiografia é indicada pela regra.',
    points: 1,
  },
  {
    id: 'maleoloLateral',
    kind: 'boolean',
    label: 'Dor à palpação da borda posterior ou da ponta do maléolo lateral',
    hint: 'Palpe os 6 cm distais da borda POSTERIOR da fíbula. Dor na face anterior do maléolo lateral costuma ser do ligamento talofibular anterior e não conta.',
    points: 1,
    showIf: (values) => n(values, 'dorMaleolar') > 0,
  },
  {
    id: 'maleoloMedial',
    kind: 'boolean',
    label: 'Dor à palpação da borda posterior ou da ponta do maléolo medial',
    hint: 'Palpe os 6 cm distais da borda POSTERIOR da tíbia.',
    points: 1,
    showIf: (values) => n(values, 'dorMaleolar') > 0,
  },
  {
    id: 'dorMedioPe',
    kind: 'boolean',
    label: 'Dor na região do médio-pé',
    hint: 'Zona do médio-pé: navicular, cuboide, cuneiformes e bases dos metatarsos.',
    points: 1,
    labels: ['Não', 'Sim'],
  },
  {
    id: 'base5Metatarso',
    kind: 'boolean',
    label: 'Dor à palpação da base do 5º metatarso',
    hint: 'Proeminência óssea palpável na borda lateral do pé, na metade do seu comprimento.',
    points: 1,
    showIf: (values) => n(values, 'dorMedioPe') > 0,
  },
  {
    id: 'navicular',
    kind: 'boolean',
    label: 'Dor à palpação do navicular',
    hint: 'Proeminência óssea na borda medial do pé, à frente do maléolo medial.',
    points: 1,
    showIf: (values) => n(values, 'dorMedioPe') > 0,
  },
  {
    id: 'semApoio',
    kind: 'boolean',
    label: 'Incapacidade de apoiar o peso logo após o trauma E no pronto-socorro',
    hint: 'Apoiar o peso significa dar 4 passos, transferindo o peso duas vezes para cada pé. Mancar conta como capaz de apoiar. Os dois momentos precisam estar comprometidos.',
    help: 'Este critério vale tanto para a série de tornozelo quanto para a série de pé. Se o paciente conseguiu andar 4 passos no local do trauma mas não consegue agora (ou o contrário), o critério é considerado NEGATIVO.',
    points: 1,
  },
];

const calculator: Calculator = {
  slug: 'regra-ottawa-tornozelo',
  title: 'Regra de Ottawa para tornozelo e pé',
  shortTitle: 'Ottawa (tornozelo/pé)',
  subtitle:
    'Define quais traumas de tornozelo e de médio-pé precisam de radiografia, com sensibilidade próxima de 100% para fratura clinicamente significativa.',
  specialties: ['Ortopedia', 'Emergência'],
  kind: 'Regra de decisão',
  keywords: [
    'ottawa',
    'tornozelo',
    'pé',
    'médio-pé',
    'entorse',
    'radiografia',
    'raio-x',
    'fratura',
    'maléolo',
    'Stiell',
  ],

  whenToUse: [
    'Adultos com trauma agudo de tornozelo ou de médio-pé, avaliados nos primeiros 10 dias após a lesão, para decidir se a radiografia é necessária.',
    'Ambientes de alta demanda, pronto-socorro, unidade de pronto atendimento, ambulatório de ortopedia, em que a radiografia sistemática gera fila, custo e radiação sem ganho diagnóstico.',
    'NÃO se aplica a pacientes intoxicados, com rebaixamento de consciência, com déficit sensitivo (neuropatia diabética, lesão medular), com lesões distratoras que dificultem a localização da dor ou com edema que impeça a palpação óssea.',
    'NÃO se aplica a traumas com mais de 10 dias, a reavaliações do mesmo trauma, a fraturas evidentes com deformidade e a ferimentos abertos: esses vão direto para a imagem.',
    'A derivação foi feita em maiores de 18 anos; validações pediátricas mostram bom desempenho acima de 5 a 6 anos, mas com cautela pela presença de fises abertas.',
  ],

  whyUse:
    'Antes da regra, mais de 95% dos traumas de tornozelo levados ao pronto-socorro recebiam radiografia, e menos de 15% tinham fratura. A regra de Ottawa reduz cerca de um terço dessas radiografias mantendo sensibilidade próxima de 100% para fraturas clinicamente significativas, e é uma das regras de decisão clínica mais validadas e mais replicadas da medicina de emergência.',

  pearls: [
    'São DUAS regras independentes, uma para o tornozelo e outra para o médio-pé, cada uma com sua zona de dor e seus pontos de palpação. Um mesmo paciente pode precisar de radiografia do pé e não do tornozelo, ou o contrário.',
    'Palpe a borda POSTERIOR dos maléolos, nos 6 cm distais. Dor na face anterior ou na ponta inferior anterior do maléolo lateral é característica de lesão do ligamento talofibular anterior e não preenche o critério: esse é o erro de exame mais comum.',
    'Apoiar o peso significa dar quatro passos, transferindo o peso duas vezes para cada pé. Mancar conta como capaz de apoiar. O critério só é positivo quando a incapacidade existe nos dois momentos: logo após o trauma e no pronto-socorro.',
    'A regra decide sobre radiografia, não sobre diagnóstico. Regra negativa não exclui entorse grave, lesão da sindesmose, lesão osteocondral do tálus nem ruptura tendínea: todas com radiografia normal.',
    'A zona maleolar e a zona do médio-pé não cobrem o retropé. Fratura do calcâneo por queda de altura, fratura do processo lateral do tálus (típica de snowboard) e lesão de Lisfranc são as causas clássicas de falso-negativo: procure-as ativamente pelo mecanismo.',
    'Sempre palpe a fíbula proximal. A fratura de Maisonneuve (fratura da fíbula proximal com lesão da sindesmose) fica inteiramente fora do campo da radiografia de tornozelo e é perdida se a perna não for examinada.',
    'A especificidade é baixa, entre 30% e 40%: a maioria dos pacientes com dor maleolar continuará precisando de radiografia. A regra economiza cerca de um terço dos exames, não a maioria deles.',
    'Edema volumoso ou hematoma tenso impedem a palpação óssea confiável e invalidam a aplicação da regra.',
    'Se a radiografia for negativa mas a dor à palpação óssea persistir após 5 a 7 dias, repita a imagem ou solicite tomografia: fraturas ocultas do maléolo e do tálus aparecem tardiamente.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const dorMaleolar = n(values, 'dorMaleolar') > 0;
    const dorMedioPe = n(values, 'dorMedioPe') > 0;
    const semApoio = n(values, 'semApoio') > 0;
    const maleoloLateral = dorMaleolar && n(values, 'maleoloLateral') > 0;
    const maleoloMedial = dorMaleolar && n(values, 'maleoloMedial') > 0;
    const base5 = dorMedioPe && n(values, 'base5Metatarso') > 0;
    const navicular = dorMedioPe && n(values, 'navicular') > 0;

    const rxTornozelo = dorMaleolar && (maleoloLateral || maleoloMedial || semApoio);
    const rxPe = dorMedioPe && (base5 || navicular || semApoio);

    const detalhes: ResultDetail[] = [
      {
        label: 'Série de tornozelo',
        value: rxTornozelo ? 'Indicada' : dorMaleolar ? 'Dispensável' : 'Não avaliada (sem dor maleolar)',
        hint: 'Incidências AP, perfil e oblíqua com rotação interna de 15° (mortalha)',
      },
      {
        label: 'Série de pé',
        value: rxPe ? 'Indicada' : dorMedioPe ? 'Dispensável' : 'Não avaliada (sem dor no médio-pé)',
        hint: 'Incidências AP, perfil e oblíqua do pé',
      },
      {
        label: 'Sensibilidade da regra',
        value: 'Próxima de 100%',
        hint: 'Validação prospectiva da regra refinada (Stiell, 1993), 453 pacientes na segunda fase; metanálise de Bachmann (2003), 15.581 pacientes',
      },
    ];

    if (!dorMaleolar && !dorMedioPe) {
      return {
        value: 'Radiografia dispensável',
        label: 'Nenhuma zona dolorosa',
        severity: 'baixo' as const,
        interpretation:
          'Sem dor na zona maleolar e sem dor na zona do médio-pé, a regra de Ottawa não indica radiografia nem do tornozelo nem do pé.\nSe a dor estiver em outra topografia: calcâneo, retropé, fíbula proximal, antepé, , a regra não se aplica e a decisão de imagem é clínica.',
        details: detalhes,
        nextSteps:
          'Trate como lesão de partes moles: repouso relativo, gelo, compressão elástica, elevação e analgesia.\nCarga conforme tolerância e retorno progressivo às atividades, com reabilitação proprioceptiva quando houver entorse.\nOriente reavaliação em 5 a 7 dias se a dor não melhorar: nesse caso, reexamine e considere imagem.',
      };
    }

    if (!rxTornozelo && !rxPe) {
      return {
        value: 'Radiografia dispensável',
        label: 'Regra de Ottawa negativa',
        severity: 'baixo' as const,
        interpretation:
          'Há dor, mas nenhum ponto de palpação óssea positivo e o paciente consegue apoiar o peso. A probabilidade de fratura clinicamente significativa do tornozelo ou do médio-pé é inferior a 2%.\nO quadro é compatível com lesão ligamentar (entorse).',
        details: detalhes,
        nextSteps:
          'Não solicite radiografia. Trate como entorse, com analgesia, gelo, compressão, elevação e carga conforme tolerância.\nInicie reabilitação proprioceptiva precoce, que reduz a recorrência de entorse.\nReavalie em 5 a 7 dias: dor óssea persistente à palpação nessa reavaliação justifica radiografia, pela possibilidade de fratura oculta.',
      };
    }

    const alvo = rxTornozelo && rxPe ? 'tornozelo e pé' : rxTornozelo ? 'tornozelo' : 'pé';

    return {
      value: `Radiografia de ${alvo}`,
      label: 'Regra de Ottawa positiva',
      severity: 'moderado' as const,
      interpretation:
        `Pelo menos um critério da regra está presente, o que indica a série radiográfica de ${alvo}.\nRegra positiva não significa fratura: a especificidade é baixa (30% a 40%) e a maioria desses pacientes terá radiografia normal. O objetivo da regra é não perder fratura, e não prever quem a tem.`,
      details: detalhes,
      nextSteps:
        `Solicite radiografia de ${alvo} nas incidências habituais.\nImobilize provisoriamente, mantenha analgesia e eleve o membro enquanto aguarda o exame.\nRadiografia normal com dor óssea persistente: considere fratura oculta, reavalie em 5 a 7 dias ou solicite tomografia.\nPalpe também a fíbula proximal antes de liberar: a fratura de Maisonneuve não aparece na radiografia do tornozelo.`,
    };
  },

  formula: `Série radiográfica de TORNOZELO - indicada se há dor na zona maleolar E pelo menos um:
· Dor à palpação da borda posterior ou da ponta do maléolo lateral (6 cm distais da fíbula)
· Dor à palpação da borda posterior ou da ponta do maléolo medial (6 cm distais da tíbia)
· Incapacidade de apoiar o peso (4 passos) logo após o trauma E no pronto-socorro

Série radiográfica de PÉ - indicada se há dor na zona do médio-pé E pelo menos um:
· Dor à palpação da base do 5º metatarso
· Dor à palpação do navicular
· Incapacidade de apoiar o peso (4 passos) logo após o trauma E no pronto-socorro

Nenhum critério presente na zona dolorosa → radiografia dispensável.`,

  evidence:
    'Stiell e colaboradores derivaram a regra em 1992, a partir de 750 adultos atendidos em dois prontos-socorros de Ottawa com trauma agudo de tornozelo, cruzando 32 achados clínicos com o resultado da radiografia. O estudo de 1993 teve duas fases: os 1.032 pacientes da primeira fase serviram para refinar a regra, e a regra refinada foi validada prospectivamente em 453 pacientes na segunda fase, com sensibilidade de 100% para fraturas maleolares e do médio-pé clinicamente significativas e redução potencial de 34% nas radiografias de tornozelo e de 30% nas de pé, sem nenhuma fratura perdida. A metanálise de Bachmann e colaboradores, publicada no BMJ em 2003, reuniu 27 estudos e 15.581 pacientes: a sensibilidade agregada ficou próxima de 100% e a razão de verossimilhança negativa em 0,08, o que leva a probabilidade de fratura a menos de 2% quando a regra é negativa; a especificidade permaneceu baixa, entre 30% e 40%. Nessa mesma metanálise, o desempenho em crianças acima de 5 anos foi comparável ao dos adultos. Fratura clinicamente significativa foi definida como fragmento ósseo com pelo menos 3 mm: avulsões menores foram consideradas sem repercussão no manejo.',

  creator: {
    name: 'Ian G. Stiell',
    bio: 'Emergencista canadense, professor da Universidade de Ottawa e autor das regras de Ottawa para tornozelo e joelho, da regra canadense para tomografia de crânio e da Canadian C-Spine Rule.',
  },

  references: [
    {
      citation:
        'Stiell IG, Greenberg GH, McKnight RD, Nair RC, McDowell I, Worthington JR. A study to develop clinical decision rules for the use of radiography in acute ankle injuries. Ann Emerg Med. 1992;21(4):384-90.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/1554175/',
      primary: true,
    },
    {
      citation:
        'Stiell IG, Greenberg GH, McKnight RD, et al. Decision rules for the use of radiography in acute ankle injuries. Refinement and prospective validation. JAMA. 1993;269(9):1127-32.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/8433468/',
    },
    {
      citation:
        'Bachmann LM, Kolb E, Koller MT, Steurer J, ter Riet G. Accuracy of Ottawa ankle rules to exclude fractures of the ankle and mid-foot: systematic review. BMJ. 2003;326(7386):417.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/12595378/',
    },
  ],
};

export default calculator;
