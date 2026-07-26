import type { Calculator, Field, Values } from '@/lib/types';
import { sumPoints } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'idade55',
    kind: 'boolean',
    label: 'Idade igual ou maior que 55 anos',
    points: 1,
  },
  {
    id: 'patela',
    kind: 'boolean',
    label: 'Dor à palpação isolada da patela',
    hint: 'A patela precisa ser o ÚNICO ponto com dor à palpação óssea do joelho. Se também dói o côndilo femoral ou o platô tibial, este critério é negativo.',
    help: 'O critério foi escrito assim porque a dor patelar isolada é o padrão da fratura de patela. Dor óssea em outros pontos, embora não preencha este item, deve pesar no julgamento clínico: e frequentemente o paciente já preenche outro critério da regra.',
    points: 1,
  },
  {
    id: 'fibula',
    kind: 'boolean',
    label: 'Dor à palpação da cabeça da fíbula',
    hint: 'Proeminência óssea na face lateral da perna, cerca de 2 cm abaixo da interlinha articular.',
    points: 1,
  },
  {
    id: 'flexao90',
    kind: 'boolean',
    label: 'Incapacidade de fletir o joelho a 90°',
    hint: 'Avalie com o paciente sentado ou em decúbito dorsal. A limitação por dor conta como incapacidade.',
    points: 1,
  },
  {
    id: 'semApoio',
    kind: 'boolean',
    label: 'Incapacidade de apoiar o peso logo após o trauma E no pronto-socorro',
    hint: 'Apoiar o peso significa dar 4 passos, transferindo o peso duas vezes para cada perna. Mancar conta como capaz de apoiar. Os dois momentos precisam estar comprometidos.',
    points: 1,
  },
];

const calculator: Calculator = {
  slug: 'regra-ottawa-joelho',
  title: 'Regra de Ottawa para joelho',
  shortTitle: 'Ottawa (joelho)',
  subtitle:
    'Cinco critérios que definem quais traumas agudos de joelho precisam de radiografia, com sensibilidade de 100% para fratura clinicamente importante.',
  specialties: ['Ortopedia', 'Emergência'],
  kind: 'Regra de decisão',
  keywords: [
    'ottawa',
    'joelho',
    'radiografia',
    'raio-x',
    'fratura',
    'patela',
    'trauma de joelho',
    'Stiell',
  ],

  whenToUse: [
    'Adultos com trauma agudo de joelho ocorrido nos últimos 7 dias, para decidir se a radiografia é necessária.',
    'Pronto-socorro, pronto atendimento e ambulatório de ortopedia, onde a maior parte das radiografias de joelho por trauma resulta normal.',
    'NÃO se aplica a menores de 18 anos na derivação original, a traumas com mais de 7 dias, a reavaliações do mesmo trauma e a lesões apenas superficiais de pele.',
    'NÃO se aplica a pacientes com rebaixamento do nível de consciência, intoxicados, paraplégicos, politraumatizados ou com múltiplas lesões distratoras.',
  ],

  whyUse:
    'Menos de 7% das radiografias de joelho solicitadas por trauma agudo mostram fratura. A regra de Ottawa para joelho reduz cerca de um quarto desses exames sem perder fraturas clinicamente importantes, e é mais simples de memorizar do que as regras de Pittsburgh porque não depende do mecanismo do trauma.',

  pearls: [
    'Basta UM critério para indicar a radiografia. Nenhum critério presente significa que a probabilidade de fratura clinicamente importante é inferior a 1%.',
    'O critério da patela é "dor à palpação ISOLADA da patela": a patela precisa ser o único ponto ósseo doloroso. Muitos aplicam errado, marcando o item apenas por haver dor patelar junto com dor no côndilo: o que na regra original não preenche o item.',
    'Apoiar o peso significa dar quatro passos, transferindo o peso duas vezes para cada perna. Mancar conta como capaz de apoiar. O critério só é positivo quando a incapacidade existe nos dois momentos: logo após o trauma e no pronto-socorro.',
    '"Fratura clinicamente importante" foi definida no estudo original como fragmento ósseo de pelo menos 5 mm de largura, ou avulsão associada à ruptura completa de tendão ou ligamento. Avulsões diminutas sem repercussão foram deliberadamente deixadas de fora.',
    'A regra decide sobre radiografia, não sobre lesão. Regra negativa não exclui ruptura de ligamento cruzado anterior, lesão meniscal, luxação patelar reduzida espontaneamente nem lesão osteocondral.',
    'Hemartrose de instalação rápida (menos de 2 horas) aponta para lesão intra-articular grave: ruptura do cruzado anterior, fratura osteocondral ou luxação patelar. Não é critério da regra, mas justifica avaliação especializada mesmo com radiografia normal.',
    'Sempre examine também o tornozelo, o quadril e a coxa. Dor referida no joelho por epifisiólise da cabeça femoral no adolescente e por fratura de quadril no idoso é armadilha clássica.',
    'Em idosos com queda da própria altura e dor no joelho, lembre-se da fratura de platô tibial: a radiografia inicial pode ser sutil, e a tomografia é o exame de escolha quando a suspeita persiste.',
    'Alternativa: as regras de Pittsburgh, que exigem mecanismo (queda ou trauma contuso) somado a idade menor que 12 ou maior que 50 anos, ou incapacidade de dar 4 passos. Têm especificidade maior, mas cobrem uma população mais restrita.',
    'Em crianças, validações mostram sensibilidade próxima de 100% acima dos 5 anos, com redução aproximada de 30% das radiografias: mas o desempenho abaixo dessa idade é pouco estudado.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const positivos = sumPoints(FIELDS, values);

    if (positivos === 0) {
      return {
        value: 'Radiografia dispensável',
        label: 'Regra de Ottawa negativa',
        severity: 'baixo' as const,
        interpretation:
          'Nenhum dos cinco critérios está presente. A probabilidade de fratura clinicamente importante do joelho é inferior a 1%, e a radiografia pode ser dispensada com segurança.\nIsso não afasta lesão ligamentar ou meniscal, que não aparecem na radiografia.',
        details: [
          { label: 'Critérios positivos', value: '0 de 5' },
          {
            label: 'Sensibilidade / especificidade',
            value: '100% / 49%',
            hint: 'Validação prospectiva de Stiell (1996), 1.096 pacientes',
          },
          { label: 'Redução potencial de radiografias', value: 'Cerca de 28%' },
        ],
        nextSteps:
          'Trate como lesão de partes moles: analgesia, gelo, carga conforme tolerância e retorno progressivo à atividade.\nExamine ligamentos e meniscos assim que a dor permitir; hemartrose de instalação rápida indica avaliação ortopédica mesmo sem fratura.\nOriente reavaliação em 5 a 7 dias se a dor não melhorar: nesse caso reexamine e reconsidere a imagem.',
      };
    }

    return {
      value: 'Radiografia indicada',
      unit: `${positivos} de 5 critérios`,
      label: 'Regra de Ottawa positiva',
      severity: 'moderado' as const,
      interpretation:
        `${positivos === 1 ? 'Um critério positivo' : `${positivos} critérios positivos`}. A regra indica a série radiográfica de joelho.\nRegra positiva não significa fratura: a especificidade é de cerca de 49%, e mais da metade desses pacientes terá radiografia normal. O objetivo é não perder fratura, e não prever quem a tem.`,
      details: [
        { label: 'Critérios positivos', value: `${positivos} de 5` },
        {
          label: 'Sensibilidade / especificidade',
          value: '100% / 49%',
          hint: 'Validação prospectiva de Stiell (1996), 1.096 pacientes',
        },
        { label: 'Exame sugerido', value: 'Radiografia de joelho: AP e perfil' },
      ],
      nextSteps:
        'Solicite radiografia de joelho em AP e perfil; acrescente incidência axial de patela quando houver dor patelar.\nImobilize provisoriamente e mantenha analgesia enquanto aguarda o exame.\nSe a radiografia for normal mas persistirem dor óssea intensa, derrame volumoso ou incapacidade de apoiar o peso, considere tomografia para afastar fratura de platô tibial oculta.\nAvalie estabilidade ligamentar assim que a dor permitir e encaminhe ao ortopedista conforme o achado.',
    };
  },

  formula: `Radiografia de joelho indicada se houver PELO MENOS UM dos 5 critérios:

1. Idade ≥ 55 anos
2. Dor à palpação isolada da patela (nenhum outro ponto ósseo doloroso)
3. Dor à palpação da cabeça da fíbula
4. Incapacidade de fletir o joelho a 90°
5. Incapacidade de apoiar o peso (4 passos) logo após o trauma E no pronto-socorro

Nenhum critério presente → radiografia dispensável.`,

  evidence:
    'Stiell e colaboradores derivaram a regra em 1995, a partir de 1.047 adultos com trauma agudo de joelho atendidos em dois prontos-socorros de Ottawa. A validação prospectiva multicêntrica foi publicada na JAMA em 1996, com 1.096 pacientes: os cinco critérios tiveram sensibilidade de 100% (IC 95% 94,9% a 100%) para fratura clinicamente importante, especificidade de 49% e redução potencial de 28% no uso da radiografia. Em 1997, um estudo de implementação em serviços canadenses confirmou queda real no número de radiografias e no tempo de permanência no pronto-socorro, sem nenhuma fratura perdida e sem aumento de retornos. Fratura clinicamente importante foi definida como qualquer fragmento ósseo com pelo menos 5 mm de largura, ou avulsão associada à ruptura completa de tendão ou ligamento. Revisões sistemáticas posteriores mantêm a sensibilidade agregada próxima de 99% e confirmam a baixa especificidade, em torno de 50%.',

  creator: {
    name: 'Ian G. Stiell',
    bio: 'Emergencista canadense, professor da Universidade de Ottawa e autor das regras de Ottawa para tornozelo e joelho, da regra canadense para tomografia de crânio e da Canadian C-Spine Rule.',
  },

  updatedAt: '2026-07-26',

  references: [
    {
      citation:
        'Stiell IG, Greenberg GH, Wells GA, et al. Derivation of a decision rule for the use of radiography in acute knee injuries. Ann Emerg Med. 1995;26(4):405-13.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/7574120/',
      primary: true,
    },
    {
      citation:
        'Stiell IG, Greenberg GH, Wells GA, et al. Prospective validation of a decision rule for the use of radiography in acute knee injuries. JAMA. 1996;275(8):611-5.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/8594242/',
    },
    {
      citation:
        'Stiell IG, Wells GA, Hoag RH, et al. Implementation of the Ottawa Knee Rule for the use of radiography in acute knee injuries. JAMA. 1997;278(23):2075-9.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Implementation+of+the+Ottawa+Knee+Rule+for+the+use+of+radiography+in+acute+knee+injuries+JAMA+1997',
    },
  ],
};

export default calculator;
