import type { Calculator, Field, Values } from '@/lib/types';
import { sumPoints } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'bilirrubina',
    kind: 'choice',
    layout: 'stack',
    label: 'Bilirrubina total',
    hint: 'Em mg/dL, como reportado nos laboratórios brasileiros. Para converter de µmol/L, divida por 17,1.',
    help: 'Nas colestases crônicas (colangite biliar primária, colangite esclerosante primária), a hiperbilirrubinemia não reflete a mesma perda de função hepatocelular. Nesses casos, use os limiares alternativos de Pugh: < 4 mg/dL = 1 ponto, 4 a 10 mg/dL = 2 pontos, > 10 mg/dL = 3 pontos.',
    options: [
      { label: 'Menor que 2,0 mg/dL', value: 1, badge: '1', hint: '< 34 µmol/L' },
      { label: '2,0 a 3,0 mg/dL', value: 2, badge: '2', hint: '34 a 51 µmol/L' },
      { label: 'Maior que 3,0 mg/dL', value: 3, badge: '3', hint: '> 51 µmol/L' },
    ],
  },
  {
    id: 'albumina',
    kind: 'choice',
    layout: 'stack',
    label: 'Albumina sérica',
    hint: 'Em g/dL. Multiplique por 10 para obter g/L: 3,5 g/dL = 35 g/L.',
    options: [
      { label: 'Maior que 3,5 g/dL', value: 1, badge: '1', hint: '> 35 g/L' },
      { label: '2,8 a 3,5 g/dL', value: 2, badge: '2', hint: '28 a 35 g/L' },
      { label: 'Menor que 2,8 g/dL', value: 3, badge: '3', hint: '< 28 g/L' },
    ],
  },
  {
    id: 'inr',
    kind: 'choice',
    layout: 'stack',
    label: 'INR',
    hint: 'A versão original de Pugh usava o prolongamento do tempo de protrombina: até 4 s = 1 ponto, 4 a 6 s = 2 pontos, mais de 6 s = 3 pontos.',
    options: [
      { label: 'Menor que 1,7', value: 1, badge: '1', hint: 'TP prolongado em até 4 segundos' },
      { label: '1,7 a 2,3', value: 2, badge: '2', hint: 'TP prolongado em 4 a 6 segundos' },
      { label: 'Maior que 2,3', value: 3, badge: '3', hint: 'TP prolongado em mais de 6 segundos' },
    ],
  },
  {
    id: 'ascite',
    kind: 'choice',
    layout: 'stack',
    label: 'Ascite',
    hint: 'Classifique pela resposta ao tratamento no momento da avaliação, não pelo pior episódio da história.',
    options: [
      { label: 'Ausente', value: 1, badge: '1' },
      {
        label: 'Leve a moderada',
        value: 2,
        badge: '2',
        hint: 'Controlada com restrição de sódio e diurético',
      },
      {
        label: 'Tensa ou refratária',
        value: 3,
        badge: '3',
        hint: 'Sem resposta ao diurético em dose máxima ou dependente de paracenteses de repetição',
      },
    ],
  },
  {
    id: 'encefalopatia',
    kind: 'choice',
    layout: 'stack',
    label: 'Encefalopatia hepática',
    hint: 'Graus de West Haven. Exclua outras causas de rebaixamento antes de pontuar.',
    help: 'West Haven: grau I, inversão do ciclo sono-vigília, euforia ou ansiedade, redução da atenção; grau II: letargia, desorientação no tempo, comportamento inadequado, asterixe evidente; grau III: sonolência a estupor, resposta a estímulos, desorientação grosseira; grau IV: coma.',
    options: [
      { label: 'Ausente', value: 1, badge: '1' },
      {
        label: 'Grau I ou II',
        value: 2,
        badge: '2',
        hint: 'Leve a moderada, ou controlada com lactulose e rifaximina',
      },
      {
        label: 'Grau III ou IV',
        value: 3,
        badge: '3',
        hint: 'Estupor ou coma, ou refratária ao tratamento',
      },
    ],
  },
];

/**
 * Sobrevida descrita nas séries clássicas de cirrose reproduzidas nos textos de
 * hepatologia. São dados anteriores à era do transplante de rotina e do
 * tratamento antiviral moderno, e por isso subestimam a sobrevida atual de
 * boa parte dos pacientes.
 */
const PROGNOSTICO: Record<'A' | 'B' | 'C', { um: string; dois: string; cirurgia: string }> = {
  A: { um: '100%', dois: '85%', cirurgia: 'cerca de 10%' },
  B: { um: '81%', dois: '57%', cirurgia: 'cerca de 30%' },
  C: { um: '45%', dois: '35%', cirurgia: '70% a 80%' },
};

const calculator: Calculator = {
  slug: 'child-pugh',
  title: 'Classificação de Child-Pugh',
  shortTitle: 'Child-Pugh',
  subtitle:
    'Gradua a gravidade da cirrose hepática em classes A, B e C a partir de cinco variáveis clínicas e laboratoriais, estimando sobrevida e risco cirúrgico.',
  specialties: ['Hepatologia', 'Gastroenterologia', 'Clínica Médica'],
  kind: 'Classificação',
  popular: true,
  keywords: [
    'child pugh',
    'child turcotte pugh',
    'CTP',
    'cirrose',
    'hepatopatia crônica',
    'insuficiência hepática',
    'prognóstico hepático',
    'classe A B C',
    'hipertensão portal',
  ],

  whenToUse: [
    'Adultos com cirrose hepática estabelecida, para graduar a gravidade da doença e estimar a sobrevida.',
    'Antes de cirurgia não hepática em cirróticos, como estimativa grosseira do risco perioperatório: a classe C contraindica cirurgia eletiva na maioria dos cenários.',
    'Para orientar ajuste de dose de fármacos com metabolismo hepático: muitas bulas trazem recomendações específicas por classe de Child-Pugh.',
    'Como critério de elegibilidade em condutas dependentes de reserva hepática, como TIPS, ressecção de hepatocarcinoma e uso de betabloqueador não seletivo.',
    'Não se aplica a hepatite aguda grave nem a insuficiência hepática aguda sobre fígado previamente normal: nesses casos, use os critérios do King’s College.',
    'Não é o instrumento usado para priorizar a fila de transplante hepático: essa função cabe ao MELD.',
  ],

  whyUse:
    'É a classificação mais antiga e mais difundida de reserva hepática funcional: exige apenas cinco variáveis rotineiras, dispensa cálculo e é a linguagem usada em bulas, protocolos cirúrgicos e critérios de elegibilidade terapêutica. Onde o MELD é melhor para priorizar transplante, o Child-Pugh continua sendo a referência prática para decisões de beira de leito.',

  pearls: [
    'Dois dos cinco itens, ascite e encefalopatia, são subjetivos e dependem do avaliador. Essa é a principal limitação da classificação e a razão pela qual o MELD, inteiramente laboratorial, foi adotado na alocação de órgãos.',
    'Ascite e encefalopatia devem ser pontuadas pelo estado ATUAL, e não pelo pior episódio já ocorrido. Um paciente com ascite hoje controlada por diurético pontua 2, não 3.',
    'Albumina baixa não é específica de hepatopatia: desnutrição, síndrome nefrótica, enteropatia perdedora de proteína e inflamação sistêmica reduzem a albumina e inflam artificialmente o escore.',
    'O INR só é confiável se o paciente NÃO estiver anticoagulado. Em uso de varfarina, o item perde o significado e a classificação fica superestimada.',
    'Nas colestases crônicas (colangite biliar primária e esclerosante primária), Pugh propôs limiares mais altos de bilirrubina: 4 e 10 mg/dL, , porque a icterícia colestática não traduz o mesmo grau de disfunção hepatocelular.',
    'O escore mínimo é 5, e não 0: mesmo um cirrótico totalmente compensado soma um ponto em cada item.',
    'A sobrevida das séries clássicas foi medida antes do transplante de rotina, dos antivirais de ação direta para hepatite C e do tratamento antiviral da hepatite B. Em cirrose de causa tratável, o prognóstico atual pode ser bem melhor.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const pontos = sumPoints(FIELDS, values);

    let classe: 'A' | 'B' | 'C';
    let severity: 'baixo' | 'moderado' | 'critico';
    let interpretation: string;
    let nextSteps: string;

    if (pontos <= 6) {
      classe = 'A';
      severity = 'baixo';
      interpretation =
        'Cirrose compensada, com reserva hepática funcional preservada. Sobrevida próxima de 100% em 1 ano e de 85% em 2 anos nas séries clássicas.';
      nextSteps =
        'Mantenha o rastreamento semestral de hepatocarcinoma com ultrassonografia (com ou sem alfafetoproteína) e a pesquisa de varizes esofágicas conforme os critérios de Baveno.\nTrate a causa de base: antivirais na hepatite B ou C, abstinência alcoólica, controle metabólico, , porque a reversão da agressão pode recompensar o fígado.\nCirurgia eletiva costuma ser tolerada, com mortalidade em torno de 10% em procedimentos abdominais.';
    } else if (pontos <= 9) {
      classe = 'B';
      severity = 'moderado';
      interpretation =
        'Comprometimento funcional significativo, em geral com cirrose já descompensada. Sobrevida em torno de 81% em 1 ano e 57% em 2 anos nas séries clássicas.';
      nextSteps =
        'Encaminhe para avaliação em centro de transplante hepático e calcule o MELD-Na, que é o escore usado para priorização na fila.\nTrate as descompensações: diurético e restrição de sódio na ascite, lactulose e rifaximina na encefalopatia, profilaxia de peritonite bacteriana espontânea quando indicada.\nEvite anti-inflamatórios, aminoglicosídeos e sedativos de meia-vida longa. Cirurgia eletiva tem mortalidade em torno de 30% e deve ser postergada ou reavaliada.';
    } else {
      classe = 'C';
      severity = 'critico';
      interpretation =
        'Cirrose descompensada com falência funcional avançada. Sobrevida em torno de 45% em 1 ano e 35% em 2 anos nas séries clássicas.';
      nextSteps =
        'Avaliação urgente por centro de transplante hepático: é a única terapia que altera a história natural nessa faixa.\nOtimize o tratamento das complicações da hipertensão portal e investigue ativamente infecção, lesão renal aguda e síndrome hepatorrenal, que são os gatilhos usuais de deterioração.\nCirurgia eletiva está contraindicada: a mortalidade perioperatória em procedimentos abdominais chega a 70% a 80%.\nIntroduza cuidados paliativos em paralelo, sobretudo se houver contraindicação ao transplante.';
    }

    const prognostico = PROGNOSTICO[classe];

    return {
      value: pontos,
      unit: pontos === 1 ? 'ponto' : 'pontos',
      label: `Classe ${classe}`,
      severity,
      interpretation,
      details: [
        {
          label: 'Classe de Child-Pugh',
          value: `${classe} (${pontos} pontos)`,
          hint: 'A = 5 a 6 · B = 7 a 9 · C = 10 a 15',
        },
        {
          label: 'Sobrevida em 1 ano',
          value: prognostico.um,
          hint: 'Séries clássicas de cirrose, anteriores ao transplante de rotina',
        },
        {
          label: 'Sobrevida em 2 anos',
          value: prognostico.dois,
          hint: 'Séries clássicas de cirrose, anteriores ao transplante de rotina',
        },
        {
          label: 'Mortalidade em cirurgia abdominal',
          value: prognostico.cirurgia,
          hint: 'Estimativa clássica para procedimentos abdominais não hepáticos',
        },
      ],
      nextSteps,
    };
  },

  formula: `Some 1 a 3 pontos em cada um dos cinco itens (total de 5 a 15):

BILIRRUBINA TOTAL (mg/dL)
< 2,0 = 1 · 2,0 a 3,0 = 2 · > 3,0 = 3
Nas colestases crônicas: < 4 = 1 · 4 a 10 = 2 · > 10 = 3

ALBUMINA (g/dL)
> 3,5 = 1 · 2,8 a 3,5 = 2 · < 2,8 = 3

INR (ou prolongamento do TP)
< 1,7 (até 4 s) = 1 · 1,7 a 2,3 (4 a 6 s) = 2 · > 2,3 (> 6 s) = 3

ASCITE
Ausente = 1 · Leve a moderada, controlada com diurético = 2 · Tensa ou refratária = 3

ENCEFALOPATIA HEPÁTICA
Ausente = 1 · Grau I a II = 2 · Grau III a IV = 3

CLASSES
A = 5 a 6 pontos · B = 7 a 9 pontos · C = 10 a 15 pontos`,

  evidence:
    'A classificação nasceu em 1964, quando Child e Turcotte agruparam pacientes cirróticos em três categorias de risco (A, B e C) para prever a tolerância à cirurgia de derivação portossistêmica; os critérios originais incluíam o estado nutricional. Em 1973, Pugh e colaboradores modificaram o esquema em um estudo de 38 pacientes submetidos a transecção esofágica por sangramento varicoso, substituindo o estado nutricional pelo tempo de protrombina e transformando as categorias em uma pontuação de 5 a 15. A versão de Pugh é a usada até hoje. Décadas de estudos observacionais mostraram associação consistente entre a classe e a sobrevida, e as taxas amplamente reproduzidas nos textos de hepatologia são de aproximadamente 100% e 85% de sobrevida em 1 e 2 anos na classe A, 81% e 57% na classe B e 45% e 35% na classe C. A mortalidade perioperatória em cirurgia abdominal não hepática segue o mesmo gradiente, de cerca de 10% na classe A a 70% a 80% na classe C. A partir de 2002, o MELD substituiu o Child-Pugh na alocação de fígados nos Estados Unidos, e desde 2006 no Brasil, por ser inteiramente objetivo e continuamente graduado, mas o Child-Pugh permanece como referência clínica e regulatória.',

  creator: {
    name: 'Charles Gardner Child III e Jeremiah Turcotte; modificado por R. N. H. Pugh',
    bio: 'Child e Turcotte eram cirurgiões da Universidade de Michigan e propuseram a classificação em 1964 para prever a tolerância à cirurgia de derivação portossistêmica. Pugh e colaboradores, do King’s College Hospital em Londres, publicaram em 1973 a modificação que substituiu o estado nutricional pelo tempo de protrombina.',
  },

  updatedAt: '2026-07-26',

  references: [
    {
      citation:
        'Pugh RNH, Murray-Lyon IM, Dawson JL, Pietroni MC, Williams R. Transection of the oesophagus for bleeding oesophageal varices. Br J Surg. 1973;60(8):646-9.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/4541913/',
      primary: true,
    },
    {
      citation:
        'Child CG, Turcotte JG. Surgery and portal hypertension. In: Child CG, editor. The Liver and Portal Hypertension. Philadelphia: WB Saunders; 1964. p. 50-64.',
    },
    {
      citation:
        'Durand F, Valla D. Assessment of the prognosis of cirrhosis: Child-Pugh versus MELD. J Hepatol. 2005;42 Suppl 1:S100-7.',
    },
    {
      citation:
        'European Association for the Study of the Liver. EASL Clinical Practice Guidelines for the management of patients with decompensated cirrhosis. J Hepatol. 2018;69(2):406-60.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/29653741/',
    },
  ],
};

export default calculator;
