import type { Calculator, Field, Values } from '@/lib/types';
import { sumPoints } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'dorLinhaMedia',
    kind: 'boolean',
    label: 'Dor à palpação da linha média posterior da coluna cervical',
    hint: 'Palpe os processos espinhosos, do occipito até a proeminência de C7. Dor apenas na musculatura paravertebral ou na face lateral do pescoço NÃO preenche o critério.',
    help: 'A palpação deve ser feita com o colar cervical aberto, mantendo estabilização manual da cabeça. Também conta como positivo o paciente que refere dor na linha média posterior mesmo sem palpação.',
    points: 1,
  },
  {
    id: 'intoxicacao',
    kind: 'boolean',
    label: 'Evidência de intoxicação',
    hint: 'História recente de ingestão de álcool ou drogas, hálito etílico, alterações de comportamento, ataxia, disartria, nistagmo, ou exame toxicológico positivo.',
    points: 1,
  },
  {
    id: 'alteracaoConsciencia',
    kind: 'boolean',
    label: 'Nível de consciência alterado',
    hint: 'Glasgow menor que 15, desorientação em pessoa, lugar, tempo ou situação, incapacidade de lembrar três objetos em 5 minutos, resposta lentificada ou inapropriada a estímulos externos.',
    points: 1,
  },
  {
    id: 'deficitFocal',
    kind: 'boolean',
    label: 'Déficit neurológico focal',
    hint: 'Qualquer achado focal ao exame neurológico: perda de força, alteração de sensibilidade, parestesias em dermátomo, reflexos assimétricos.',
    points: 1,
  },
  {
    id: 'lesaoDistratora',
    kind: 'boolean',
    label: 'Lesão dolorosa distratora',
    hint: 'Fratura de osso longo, lesão visceral com dor abdominal, laceração extensa, esmagamento, queimadura extensa ou qualquer lesão dolorosa o bastante para desviar a atenção do paciente da coluna cervical.',
    help: 'O estudo NEXUS deliberadamente não fechou a definição, deixando-a ao julgamento do examinador. É o critério com maior variabilidade entre avaliadores e a principal fonte de discordância na aplicação da regra.',
    points: 1,
  },
];

const calculator: Calculator = {
  slug: 'nexus-cervical',
  title: 'Critérios NEXUS para coluna cervical',
  shortTitle: 'NEXUS',
  subtitle:
    'Cinco critérios de baixo risco que, todos negativos, dispensam a imagem da coluna cervical no trauma contuso.',
  specialties: ['Emergência', 'Ortopedia'],
  kind: 'Regra de decisão',
  keywords: [
    'nexus',
    'coluna cervical',
    'cervical',
    'trauma raquimedular',
    'colar cervical',
    'radiografia cervical',
    'tomografia de coluna',
    'low-risk criteria',
    'Hoffman',
  ],

  whenToUse: [
    'Pacientes com trauma contuso e possibilidade de lesão da coluna cervical, para decidir se a imagem cervical pode ser dispensada e o colar retirado.',
    'Pronto-socorro e atendimento pré-hospitalar, onde a imobilização cervical prolongada gera desconforto, úlcera de pressão, dificuldade de via aérea e retenção de leito.',
    'NÃO se aplica a trauma penetrante do pescoço, que exige avaliação específica.',
    'NÃO se aplica quando a imagem já foi realizada, nem substitui a tomografia de corpo inteiro indicada por outros motivos no politraumatizado.',
    'Use com cautela nos extremos de idade: a casuística original incluiu poucas crianças abaixo de 2 anos, e em idosos a sensibilidade é menor.',
  ],

  whyUse:
    'A lesão de coluna cervical ocorre em cerca de 2% a 3% dos traumas contusos avaliados no pronto-socorro, mas quase todos esses pacientes recebem imagem. O NEXUS é a regra mais simples para identificar quem pode ser liberado clinicamente: são cinco perguntas, sem manobras, sem escores e sem exigir mobilização do pescoço, vantagem sobre a Canadian C-Spine Rule, que exige testar a rotação cervical ativa.',

  pearls: [
    'É tudo ou nada: os cinco critérios precisam estar ausentes. Um único critério positivo obriga a imagem, mesmo que o paciente pareça bem.',
    '"Lesão distratora" não tem definição objetiva no estudo original: foi deixada ao critério do examinador. É a maior fonte de discordância entre avaliadores e o item que mais compromete a reprodutibilidade da regra.',
    'A dor precisa ser na linha média POSTERIOR, sobre os processos espinhosos. Dor cervical lateral ou paravertebral isolada, típica de distensão muscular, não preenche o critério.',
    'A especificidade é de apenas 12,9%: o NEXUS libera cerca de um em cada oito pacientes examinados. Não é ferramenta de triagem em massa, e sim de liberação criteriosa.',
    'Idosos são o ponto fraco da regra. Queda da própria altura pode causar fratura do odontoide com exame pobre, e várias séries mostram sensibilidade reduzida acima dos 65 anos. A Canadian C-Spine Rule classifica idade igual ou maior que 65 anos como fator de alto risco e indica imagem diretamente.',
    'Na comparação direta com a Canadian C-Spine Rule (Stiell, 2003, com 8.283 pacientes), o NEXUS teve sensibilidade de 90,7% e especificidade de 36,8%, contra 99,4% e 45,1% da regra canadense: desempenho bem inferior ao dos 99,0% relatados no estudo original.',
    'A regra decide sobre imagem, não sobre imobilização definitiva. Se persistir dor cervical ou o exame mudar na reavaliação, reindique a imagem, mesmo com NEXUS inicialmente negativo.',
    'Quando a imagem está indicada em adulto com trauma significativo, a tomografia é superior à radiografia simples: a radiografia em três incidências perde uma parcela relevante das fraturas cervicais.',
    'Imagem negativa não exclui lesão ligamentar pura. Dor cervical persistente, sobretudo à mobilização, justifica manter o colar e reavaliar, considerando ressonância magnética.',
    'Não confunda com a Canadian C-Spine Rule: são regras diferentes, com critérios diferentes e populações de exclusão diferentes.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const positivos = sumPoints(FIELDS, values);

    if (positivos === 0) {
      return {
        value: 'Imagem dispensável',
        label: 'NEXUS negativo',
        severity: 'baixo' as const,
        interpretation:
          'Os cinco critérios de baixo risco estão ausentes. A probabilidade de lesão da coluna cervical é muito baixa: o valor preditivo negativo na coorte original foi de 99,8%.\nA imagem cervical pode ser dispensada e o colar retirado.',
        details: [
          { label: 'Critérios positivos', value: '0 de 5' },
          {
            label: 'Sensibilidade / especificidade',
            value: '99,0% / 12,9%',
            hint: 'Coorte NEXUS (Hoffman, 2000), 34.069 pacientes com trauma contuso',
          },
          {
            label: 'Valor preditivo negativo',
            value: '99,8%',
            hint: 'Prevalência de lesão cervical de 2,4% na coorte de derivação',
          },
        ],
        nextSteps:
          'Retire o colar cervical e libere a mobilização, sem solicitar imagem da coluna cervical.\nRegistre no prontuário os cinco critérios avaliados e negativos: é essa documentação que sustenta a decisão.\nReavalie antes da alta: se surgir dor na linha média posterior ou qualquer alteração neurológica, reinstale o colar e solicite tomografia.\nOriente retorno em caso de dor cervical progressiva, parestesias ou perda de força.',
      };
    }

    return {
      value: 'Imagem indicada',
      unit: `${positivos} de 5 critérios`,
      label: 'NEXUS positivo',
      severity: 'moderado' as const,
      interpretation:
        `${positivos === 1 ? 'Um critério de baixo risco está presente' : `${positivos} critérios de baixo risco estão presentes`}. A regra não permite dispensar a imagem da coluna cervical.\nIsso não significa que exista lesão: a especificidade é baixa e a maioria desses pacientes terá exame normal. Significa apenas que o paciente não pode ser liberado clinicamente.`,
      details: [
        { label: 'Critérios positivos', value: `${positivos} de 5` },
        {
          label: 'Exame de escolha',
          value: 'Tomografia de coluna cervical',
          hint: 'Em adulto com trauma significativo, a TC supera a radiografia em três incidências',
        },
        {
          label: 'Prevalência de lesão cervical',
          value: '2,4%',
          hint: 'Coorte NEXUS (Hoffman, 2000), 818 lesões em 34.069 pacientes',
        },
      ],
      nextSteps:
        'Mantenha a imobilização cervical com colar rígido e restrição de movimento até a conclusão da avaliação.\nSolicite tomografia de coluna cervical; em crianças, discuta a estratégia de imagem considerando a dose de radiação.\nDéficit neurológico focal indica avaliação neurocirúrgica imediata e considerar ressonância magnética, que avalia medula, disco e ligamentos.\nSe a tomografia for normal mas persistirem dor importante ou déficit, mantenha o colar, reavalie e considere ressonância magnética para lesão ligamentar.',
    };
  },

  formula: `A imagem da coluna cervical pode ser dispensada quando TODOS os cinco
critérios de baixo risco estão AUSENTES:

1. Dor à palpação da linha média posterior da coluna cervical
2. Evidência de intoxicação
3. Nível de consciência alterado
4. Déficit neurológico focal
5. Lesão dolorosa distratora

Todos ausentes → imagem dispensável, colar pode ser retirado.
Qualquer critério presente → imagem indicada (tomografia de coluna cervical).

Aplica-se apenas a trauma contuso.`,

  evidence:
    'O National Emergency X-Radiography Utilization Study (NEXUS) foi um estudo prospectivo observacional em 21 serviços de emergência dos Estados Unidos, publicado no New England Journal of Medicine em 2000, com 34.069 pacientes vítimas de trauma contuso submetidos a imagem da coluna cervical. Lesão cervical documentada radiologicamente ocorreu em 818 pacientes (2,4%). Os cinco critérios de baixo risco identificaram todos, menos 8: sensibilidade de 99,0% (IC 95% 98,0% a 99,6%), valor preditivo negativo de 99,8% e especificidade de 12,9%. Dos 8 casos não identificados, apenas 2 tinham lesão clinicamente significativa e apenas 1 recebeu tratamento cirúrgico. Em 2003, um estudo canadense comparou diretamente as duas regras em 8.283 pacientes alertas e estáveis: a Canadian C-Spine Rule teve sensibilidade de 99,4% e especificidade de 45,1%, contra 90,7% e 36,8% do NEXUS, desempenho do NEXUS abaixo do relatado na coorte original, o que ilustra a queda esperada de acurácia fora do ambiente de derivação. Um subestudo pediátrico do NEXUS incluiu 3.065 crianças, das quais 88 tinham menos de 2 anos; houve 30 lesões cervicais, todas identificadas pela regra (sensibilidade 100%), mas nenhuma delas em criança abaixo de 2 anos: daí o poder insuficiente para validar a regra em lactentes.',

  creator: {
    name: 'Jerome R. Hoffman e William R. Mower',
    bio: 'Emergencistas da Universidade da Califórnia em Los Angeles (UCLA), coordenadores do National Emergency X-Radiography Utilization Study (NEXUS).',
  },

  references: [
    {
      citation:
        'Hoffman JR, Mower WR, Wolfson AB, Todd KH, Zucker MI. Validity of a set of clinical criteria to rule out injury to the cervical spine in patients with blunt trauma. N Engl J Med. 2000;343(2):94-9.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/10891516/',
      primary: true,
    },
    {
      citation:
        'Stiell IG, Clement CM, McKnight RD, et al. The Canadian C-Spine Rule versus the NEXUS Low-Risk Criteria in patients with trauma. N Engl J Med. 2003;349(26):2510-8.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/14695411/',
    },
    {
      citation:
        'Hoffman JR, Wolfson AB, Todd K, Mower WR. Selective cervical spine radiography in blunt trauma: methodology of the National Emergency X-Radiography Utilization Study (NEXUS). Ann Emerg Med. 1998;32(4):461-9.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Selective+cervical+spine+radiography+in+blunt+trauma+methodology+of+the+National+Emergency+X-Radiography+Utilization+Study',
    },
  ],
};

export default calculator;
