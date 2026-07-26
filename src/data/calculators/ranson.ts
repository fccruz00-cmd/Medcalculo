import type { Calculator, Field, Severity, Values } from '@/lib/types';

/** Ids dos cinco critérios colhidos na admissão. */
const IDS_ADMISSAO = ['idade', 'leucocitos', 'glicemia', 'ldh', 'ast'];

/** Ids dos seis critérios reavaliados em 48 horas. */
const IDS_48H = ['hematocrito', 'ureia', 'calcio', 'pao2', 'deficit_base', 'sequestro'];

/** Soma os pontos de um subconjunto de campos, ignorando o que não é número. */
function subtotal(values: Values, ids: string[]): number {
  return ids.reduce((total, id) => {
    const value = values[id];
    return typeof value === 'number' ? total + value : total;
  }, 0);
}

/**
 * Mortalidade por faixa de critérios nas séries originais de Ranson
 * (Nova York, décadas de 1970-1980). São números históricos: com a terapia
 * intensiva atual, a mortalidade observada é bem menor.
 */
function prognostico(pontos: number): { faixa: string; mortalidade: string; severity: Severity } {
  if (pontos <= 2) return { faixa: '0 a 2 critérios', mortalidade: 'cerca de 2%', severity: 'baixo' };
  if (pontos <= 4) return { faixa: '3 a 4 critérios', mortalidade: 'cerca de 15%', severity: 'alto' };
  if (pontos <= 6) return { faixa: '5 a 6 critérios', mortalidade: 'cerca de 40%', severity: 'critico' };
  return { faixa: '7 ou mais critérios', mortalidade: 'próxima de 100%', severity: 'critico' };
}

const em48h = (values: Values) => values.momento === '48h';

const FIELDS: Field[] = [
  {
    id: 'momento',
    kind: 'choice',
    label: 'Momento da avaliação',
    hint: 'Os seis critérios de 48 horas só aparecem depois que esse intervalo se completa.',
    layout: 'stack',
    options: [
      {
        label: 'Admissão (ainda não completou 48 horas)',
        value: 'admissao',
        hint: 'O escore fica parcial: no máximo 5 dos 11 critérios.',
      },
      {
        label: 'Já se passaram 48 horas da admissão',
        value: '48h',
        hint: 'Permite calcular o escore completo, de 0 a 11.',
      },
    ],
  },

  // ---- Admissão ----
  {
    id: 'idade',
    kind: 'boolean',
    label: 'Idade > 55 anos',
    points: 1,
  },
  {
    id: 'leucocitos',
    kind: 'boolean',
    label: 'Leucócitos > 16.000/mm³',
    hint: 'Leucometria global do hemograma da admissão.',
    points: 1,
  },
  {
    id: 'glicemia',
    kind: 'boolean',
    label: 'Glicemia > 200 mg/dL',
    hint: 'Glicemia da admissão. Perde valor discriminatório em diabéticos previamente descompensados.',
    points: 1,
  },
  {
    id: 'ldh',
    kind: 'boolean',
    label: 'LDH (desidrogenase láctica) > 350 U/L',
    hint: 'Confira o método do laboratório: o valor de referência do LDH varia bastante entre técnicas.',
    points: 1,
  },
  {
    id: 'ast',
    kind: 'boolean',
    label: 'AST (TGO) > 250 U/L',
    hint: 'AST muito elevada na pancreatite sugere etiologia biliar.',
    points: 1,
  },

  // ---- 48 horas ----
  {
    id: 'hematocrito',
    kind: 'boolean',
    label: 'Queda do hematócrito > 10 pontos percentuais',
    hint: 'Diferença absoluta entre o hematócrito da admissão e o de 48 horas (ex.: de 45% para 34%).',
    points: 1,
    showIf: em48h,
  },
  {
    id: 'ureia',
    kind: 'boolean',
    label: 'Elevação da ureia > 10,7 mg/dL em relação à admissão',
    hint: 'Corresponde a aumento do BUN > 5 mg/dL. Ureia (mg/dL) = BUN × 2,14: laboratórios brasileiros dosam ureia, não BUN.',
    points: 1,
    showIf: em48h,
  },
  {
    id: 'calcio',
    kind: 'boolean',
    label: 'Cálcio sérico total < 8 mg/dL',
    hint: 'Corrija pela albumina antes de julgar: cálcio corrigido = cálcio medido + 0,8 × (4 − albumina em g/dL).',
    points: 1,
    showIf: em48h,
  },
  {
    id: 'pao2',
    kind: 'boolean',
    label: 'PaO₂ < 60 mmHg',
    hint: 'Gasometria arterial em ar ambiente.',
    points: 1,
    showIf: em48h,
  },
  {
    id: 'deficit_base',
    kind: 'boolean',
    label: 'Déficit de base > 4 mEq/L',
    hint: 'Equivale a excesso de base (BE) menor que −4 mEq/L na gasometria.',
    points: 1,
    showIf: em48h,
  },
  {
    id: 'sequestro',
    kind: 'boolean',
    label: 'Sequestro estimado de líquidos > 6 L',
    hint: 'Balanço hídrico acumulado em 48 horas (entradas menos saídas).',
    points: 1,
    showIf: em48h,
  },
];

const calculator: Calculator = {
  slug: 'ranson',
  title: 'Critérios de Ranson',
  shortTitle: 'Ranson',
  subtitle:
    'Estima a gravidade e a mortalidade da pancreatite aguda a partir de 5 critérios na admissão e 6 reavaliados em 48 horas.',
  specialties: ['Gastroenterologia', 'Cirurgia', 'Terapia Intensiva'],
  kind: 'Escore de risco',
  keywords: [
    'ranson',
    'pancreatite',
    'pancreatite aguda',
    'gravidade',
    'mortalidade',
    'necrose pancreática',
  ],

  whenToUse: [
    'Adultos com diagnóstico estabelecido de pancreatite aguda, para estimar gravidade e mortalidade hospitalar.',
    'Foi derivado em pancreatite de etiologia predominantemente alcoólica, em pacientes internados em hospital terciário. Os pontos de corte aqui apresentados são os da versão não biliar.',
    'Não serve para diagnosticar pancreatite nem para prever necrose infectada, e não deve ser aplicado a crianças, gestantes ou pancreatite crônica agudizada.',
    'Não use como ferramenta de triagem no pronto-socorro: o escore só fica completo 48 horas depois da admissão.',
  ],

  whyUse:
    'É o escore prognóstico mais antigo e mais citado na pancreatite aguda, ainda muito usado em prova, em auditoria e em protocolos institucionais. Reúne marcadores de resposta inflamatória, de sequestro de líquidos e de disfunção orgânica em um único número, e escores de 3 ou mais separam bem a pancreatite grave da leve.',

  pearls: [
    'A principal limitação é temporal: o escore só fica completo às 48 horas, exatamente quando a decisão de reposição volêmica agressiva e de vaga em terapia intensiva já deveria ter sido tomada. Foi por isso que o BISAP, calculável nas primeiras 24 horas, ganhou espaço na prática.',
    'Há duas versões com cortes diferentes. Na pancreatite biliar os limiares mudam (idade > 70, leucócitos > 18.000/mm³, glicemia > 220 mg/dL, LDH > 400 U/L, aumento do BUN > 2 mg/dL, déficit de base > 5 mEq/L, sequestro > 4 L) e a PaO₂ sai da lista, totalizando 10 critérios. Esta calculadora usa a versão original, não biliar.',
    'Nada de BUN nos laudos brasileiros: os laboratórios daqui informam ureia. A elevação de BUN > 5 mg/dL corresponde a elevação de ureia > 10,7 mg/dL (ureia = BUN × 2,14).',
    'Queda do hematócrito acima de 10 pontos é sinal de reposição volêmica adequada em um paciente que estava hemoconcentrado: não de sangramento. O critério pontua porque marca a gravidade do sequestro de líquidos no terceiro espaço.',
    'A amilase e a lipase não entram no escore. O grau de elevação das enzimas pancreáticas não guarda relação com a gravidade da doença.',
    'O desempenho discriminatório é apenas modesto (área sob a curva ROC em torno de 0,7 a 0,8 nas validações), semelhante ao do BISAP e inferior ao da avaliação seriada de disfunção orgânica persistente, que é o determinante prognóstico mais forte segundo a classificação de Atlanta revisada.',
    'As mortalidades históricas (até 100% com 7 ou mais critérios) vêm das séries dos anos 1970. Com a terapia intensiva atual esses números são bem menores; use-os como gradiente de risco, não como prognóstico individual.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const completo = values.momento === '48h';
    const pontosAdmissao = subtotal(values, IDS_ADMISSAO);
    const pontos48h = subtotal(values, IDS_48H);
    const total = completo ? pontosAdmissao + pontos48h : pontosAdmissao;

    if (!completo) {
      const severity: Severity = pontosAdmissao >= 3 ? 'alto' : pontosAdmissao === 2 ? 'moderado' : 'info';
      const detailsParciais = [
        {
          label: 'Critérios na admissão',
          value: `${pontosAdmissao} de 5`,
        },
        {
          label: 'Critérios em 48 horas',
          value: 'ainda não avaliados',
        },
        {
          label: 'Mortalidade na série original',
          value: 'não estimável',
          hint: 'As faixas de mortalidade de Ranson valem apenas para o escore completo, com os 11 critérios aferidos às 48 horas.',
        },
      ];
      return {
        value: pontosAdmissao,
        unit: pontosAdmissao === 1 ? 'critério (parcial)' : 'critérios (parcial)',
        label: 'Escore incompleto',
        severity,
        interpretation:
          pontosAdmissao >= 3
            ? 'Três ou mais critérios já presentes na admissão bastam para classificar a pancreatite como grave: não é preciso esperar as 48 horas para agir.\nO escore ainda está parcial: refaça o cálculo com os seis critérios de 48 horas para estimar a mortalidade.'
            : 'Apenas os cinco critérios de admissão foram avaliados. O escore de Ranson só fica completo 48 horas após a internação, e um valor parcial baixo não exclui evolução grave.',
        details: detailsParciais,
        nextSteps:
          'Reponha volume de forma dirigida, com solução cristaloide balanceada (Ringer lactato), guiada por diurese, frequência cardíaca, pressão e hematócrito: evite tanto a hipovolemia quanto a sobrecarga.\nInicie dieta oral precocemente conforme tolerância, controle a dor e busque a etiologia (ultrassonografia de abdome, triglicerídeos, cálcio, história de álcool e de medicamentos).\nRepita hematócrito, ureia, cálcio e gasometria em 48 horas para completar o escore, e use um instrumento aplicável nas primeiras 24 horas, como o BISAP, junto com a reavaliação de disfunção orgânica.',
      };
    }

    const faixa = prognostico(total);
    const grave = total >= 3;

    const details = [
      {
        label: 'Critérios na admissão',
        value: `${pontosAdmissao} de 5`,
      },
      {
        label: 'Critérios em 48 horas',
        value: `${pontos48h} de 6`,
      },
      {
        label: 'Mortalidade na série original',
        value: faixa.mortalidade,
        hint: `${faixa.faixa}: séries de Ranson, anos 1970. A mortalidade atual é menor.`,
      },
    ];

    return {
      value: total,
      unit: total === 1 ? 'critério' : 'critérios',
      label: grave ? 'Pancreatite grave' : 'Pancreatite leve a moderada',
      severity: faixa.severity,
      interpretation: grave
        ? `Três ou mais critérios classificam a pancreatite como grave nos critérios de Ranson, com risco aumentado de necrose, de disfunção orgânica e de morte. Mortalidade de ${faixa.mortalidade} na série original de derivação.`
        : `Menos de três critérios indicam pancreatite de curso previsivelmente favorável, com mortalidade de ${faixa.mortalidade} na série original. Isso não dispensa a reavaliação clínica seriada: a disfunção orgânica persistente pode aparecer nos primeiros dias.`,
      details,
      nextSteps: grave
        ? 'Considere leito monitorizado ou terapia intensiva, com reavaliação frequente de disfunção orgânica (SOFA ou critérios de Atlanta revisados).\nMantenha reposição volêmica dirigida com cristaloide balanceado e analgesia adequada; prefira nutrição enteral precoce à dieta zero prolongada e à nutrição parenteral.\nNão prescreva antibiótico profilático: só trate infecção documentada ou fortemente suspeita.\nSolicite tomografia de abdome com contraste apenas após 72 a 96 horas, quando houver piora clínica ou dúvida diagnóstica: antes disso ela subestima a necrose.\nSe a etiologia for biliar com colangite ou obstrução persistente, indique colangiopancreatografia endoscópica precoce; nos demais casos biliares, programe colecistectomia na mesma internação.'
        : 'Mantenha cuidado em enfermaria com reposição volêmica dirigida, analgesia e dieta oral precoce conforme tolerância.\nReavalie clinicamente pelo menos a cada 12 horas nas primeiras 48 horas: a disfunção orgânica persistente por mais de 48 horas é o que define pancreatite grave na classificação de Atlanta revisada.\nSe a causa for biliar, programe colecistectomia ainda nesta internação para evitar recorrência.',
    };
  },

  formula: `Um ponto por critério presente (máximo 11) - versão original, não biliar.

Na admissão (5):
· Idade > 55 anos
· Leucócitos > 16.000/mm³
· Glicemia > 200 mg/dL
· LDH > 350 U/L
· AST (TGO) > 250 U/L

Em 48 horas (6):
· Queda do hematócrito > 10 pontos percentuais
· Elevação da ureia > 10,7 mg/dL (BUN > 5 mg/dL)
· Cálcio sérico < 8 mg/dL
· PaO₂ < 60 mmHg
· Déficit de base > 4 mEq/L
· Sequestro de líquidos > 6 L

Interpretação: 3 ou mais critérios = pancreatite grave.
Mortalidade nas séries originais: 0 a 2 ≈ 2% · 3 a 4 ≈ 15% · 5 a 6 ≈ 40% · 7 ou mais ≈ 100%.

Versão biliar (10 critérios): idade > 70, leucócitos > 18.000/mm³,
glicemia > 220 mg/dL, LDH > 400 U/L, AST > 250 U/L; em 48 h, queda do
hematócrito > 10%, elevação do BUN > 2 mg/dL, cálcio < 8 mg/dL, déficit de
base > 5 mEq/L e sequestro > 4 L (sem o critério de PaO₂).`,

  evidence:
    'John Ranson e colaboradores publicaram os critérios em 1974, a partir da análise de 100 pacientes internados com pancreatite aguda no Bellevue Hospital, em Nova York, com etiologia predominantemente alcoólica. Entre 43 variáveis testadas, 11 se associaram de forma independente a morte ou a internação prolongada em terapia intensiva. Nessa casuística e nas séries subsequentes do mesmo grupo, a mortalidade subiu de cerca de 2% com até dois critérios para quase 100% com sete ou mais. Comparações posteriores, como a de Papachristou e colaboradores (2010), mostraram que Ranson, BISAP, APACHE II e o índice tomográfico de gravidade têm poder discriminatório semelhante para mortalidade e falência orgânica, com áreas sob a curva ROC em torno de 0,8: nenhum deles supera de forma consistente a reavaliação clínica seriada da disfunção orgânica, critério central da classificação de Atlanta revisada em 2012.',

  creator: {
    name: 'John H. C. Ranson',
    bio: 'Cirurgião britânico radicado nos Estados Unidos, professor da New York University e uma das principais referências do século XX no manejo cirúrgico da pancreatite aguda.',
  },

  references: [
    {
      citation:
        'Ranson JH, Rifkind KM, Roses DF, Fink SD, Eng K, Spencer FC. Prognostic signs and the role of operative management in acute pancreatitis. Surg Gynecol Obstet. 1974;139(1):69-81.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/4834279/',
      primary: true,
    },
    {
      citation:
        'Banks PA, Bollen TL, Dervenis C, et al. Classification of acute pancreatitis, 2012: revision of the Atlanta classification and definitions by international consensus. Gut. 2013;62(1):102-11.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/23100216/',
    },
    {
      citation:
        'Papachristou GI, Muddana V, Yadav D, et al. Comparison of BISAP, Ranson’s, APACHE-II, and CTSI scores in predicting organ failure, complications, and mortality in acute pancreatitis. Am J Gastroenterol. 2010;105(2):435-41.',
    },
    {
      citation:
        'Tenner S, Baillie J, DeWitt J, Vege SS. American College of Gastroenterology guideline: management of acute pancreatitis. Am J Gastroenterol. 2013;108(9):1400-15.',
    },
  ],
};

export default calculator;
