import type { Calculator, Field, Severity, Values } from '@/lib/types';
import { sumPoints } from '@/lib/utils';

/**
 * Mortalidade hospitalar por pontuação. Faixas construídas a partir da coorte
 * de derivação e validação de Wu et al. (2008) e das validações prospectivas
 * posteriores, que produziram números um pouco diferentes entre si.
 */
const MORTALIDADE: Record<number, string> = {
  0: 'menos de 1%',
  1: 'menos de 1%',
  2: 'cerca de 2%',
  3: 'cerca de 5 a 8%',
  4: 'cerca de 13 a 19%',
  5: 'cerca de 22 a 27%',
};

const FIELDS: Field[] = [
  {
    id: 'ureia',
    kind: 'boolean',
    label: 'Ureia > 53 mg/dL',
    hint: 'Corresponde a BUN > 25 mg/dL. Ureia (mg/dL) = BUN × 2,14: os laboratórios brasileiros informam ureia, não BUN.',
    help: 'Use a ureia das primeiras 24 horas de internação. A ureia é o marcador laboratorial isolado com melhor desempenho prognóstico na pancreatite aguda: mais do que o valor absoluto, a elevação nas primeiras 24 horas apesar da reposição volêmica indica pior evolução.',
    points: 1,
  },
  {
    id: 'mental',
    kind: 'boolean',
    label: 'Alteração do estado mental',
    hint: 'Desorientação, letargia, sonolência, torpor ou coma: qualquer Escala de Coma de Glasgow menor que 15.',
    points: 1,
  },
  {
    id: 'sirs',
    kind: 'boolean',
    label: 'SIRS presente (2 ou mais critérios)',
    hint: 'Síndrome da resposta inflamatória sistêmica nas primeiras 24 horas.',
    help: 'Critérios de SIRS: considere presente com 2 ou mais:\n· Temperatura < 36 °C ou > 38 °C\n· Frequência cardíaca > 90 bpm\n· Frequência respiratória > 20 irpm ou PaCO₂ < 32 mmHg\n· Leucócitos < 4.000 ou > 12.000/mm³, ou mais de 10% de bastões',
    points: 1,
  },
  {
    id: 'idade',
    kind: 'boolean',
    label: 'Idade > 60 anos',
    points: 1,
  },
  {
    id: 'derrame',
    kind: 'boolean',
    label: 'Derrame pleural em exame de imagem',
    hint: 'Radiografia, ultrassonografia ou tomografia. Qualquer derrame conta, uni ou bilateral.',
    points: 1,
  },
];

const calculator: Calculator = {
  slug: 'bisap',
  title: 'Escore BISAP: gravidade da pancreatite aguda',
  shortTitle: 'BISAP',
  subtitle:
    'Estima a mortalidade hospitalar na pancreatite aguda usando cinco variáveis disponíveis nas primeiras 24 horas de internação.',
  specialties: ['Gastroenterologia', 'Emergência'],
  kind: 'Escore de risco',
  popular: true,
  keywords: [
    'bisap',
    'pancreatite',
    'pancreatite aguda',
    'gravidade',
    'mortalidade',
    'ureia',
    'derrame pleural',
  ],

  whenToUse: [
    'Adultos internados com pancreatite aguda, nas primeiras 24 horas, para estratificar o risco de morte e de falência orgânica.',
    'Como triagem para decidir o nível de cuidado: enfermaria com reavaliação frequente ou leito monitorizado/terapia intensiva.',
    'Não se aplica a crianças, a pancreatite crônica agudizada nem à decisão sobre necessidade de tomografia ou de intervenção cirúrgica.',
    'Não é um instrumento diagnóstico: pressupõe pancreatite aguda já confirmada por dor típica, enzimas pancreáticas elevadas ou imagem.',
  ],

  whyUse:
    'Fica pronto nas primeiras 24 horas, ao contrário dos critérios de Ranson, que exigem 48 horas, e usa apenas cinco itens de rotina, sem necessidade de gasometria ou de escores fisiológicos complexos. Nas comparações diretas, tem desempenho semelhante ao de Ranson, APACHE II e do índice tomográfico de gravidade, com muito menos trabalho à beira do leito.',

  pearls: [
    'Ureia, não BUN. O corte original é BUN > 25 mg/dL, que equivale a ureia > 53 mg/dL nos laudos brasileiros. Usar 25 mg/dL de ureia superestima grosseiramente a gravidade: é o erro mais comum na aplicação do escore no Brasil.',
    'A tendência da ureia importa tanto quanto o valor: ureia que sobe nas primeiras 24 horas apesar da hidratação adequada indica pior prognóstico e deve pesar na decisão mesmo com BISAP baixo.',
    'O escore prediz mortalidade, não necessidade de tomografia. Imagem contrastada precoce subestima a necrose; reserve a tomografia para depois de 72 a 96 horas ou para dúvida diagnóstica.',
    'Um BISAP de 0 a 2 não autoriza relaxar a vigilância: cerca de metade dos pacientes que evoluem com falência orgânica persistente começa com escores baixos. Reavalie clinicamente pelo menos a cada 12 horas nas primeiras 48 horas.',
    'O derrame pleural conta apenas quando há exame de imagem: não presuma pelo exame físico. Muitos pacientes só fazem radiografia de tórax se alguém pedir, e o critério passa despercebido.',
    'Hipertrigliceridemia, obesidade, hematócrito elevado e proteína C reativa acima de 150 mg/L em 48 horas são marcadores de gravidade que o BISAP não captura.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const pontos = sumPoints(FIELDS, values);
    const mortalidade = MORTALIDADE[pontos] ?? MORTALIDADE[5];

    let label: string;
    let severity: Severity;
    let interpretation: string;
    let nextSteps: string;

    if (pontos <= 1) {
      label = 'Risco baixo';
      severity = 'baixo';
      interpretation =
        'Mortalidade hospitalar baixa. A maior parte desses pacientes evolui com pancreatite intersticial edematosa e alta em poucos dias.';
      nextSteps =
        'Cuidado em enfermaria com reposição volêmica dirigida por cristaloide balanceado (Ringer lactato), analgesia adequada e dieta oral precoce conforme tolerância: não mantenha dieta zero por rotina.\nInvestigue a etiologia: ultrassonografia de abdome, triglicerídeos, cálcio, revisão de medicamentos e história de álcool.\nReavalie clinicamente a cada 12 horas nas primeiras 48 horas: escore baixo não exclui evolução para falência orgânica.';
    } else if (pontos === 2) {
      label = 'Risco intermediário';
      severity = 'moderado';
      interpretation =
        'Risco intermediário de mortalidade hospitalar, com probabilidade aumentada de falência orgânica transitória.';
      nextSteps =
        'Mantenha o paciente em leito com reavaliação frequente e monitorização de diurese, considerando vaga em unidade semi-intensiva se houver hipoxemia, taquicardia persistente ou oligúria.\nReponha volume de forma dirigida e reavalie ureia, hematócrito e creatinina em 12 a 24 horas.\nSem antibiótico profilático: só trate infecção documentada.';
    } else {
      label = 'Risco alto';
      severity = pontos >= 4 ? 'critico' : 'alto';
      interpretation =
        'Três ou mais pontos identificam pancreatite de alto risco, com aumento importante da mortalidade hospitalar, da falência orgânica persistente e da necrose pancreática.';
      nextSteps =
        'Considere leito monitorizado ou terapia intensiva desde já, com reavaliação seriada de disfunção orgânica (SOFA ou critérios de Atlanta revisados).\nReposição volêmica dirigida com cristaloide balanceado, analgesia adequada e nutrição enteral precoce por sonda quando a via oral não for tolerada: evite nutrição parenteral.\nNão prescreva antibiótico profilático; reserve o antimicrobiano para infecção documentada ou fortemente suspeita, como necrose infectada.\nTomografia de abdome com contraste após 72 a 96 horas, ou antes se houver deterioração clínica.\nSe a etiologia for biliar com colangite ou obstrução persistente, indique colangiopancreatografia endoscópica precoce.';
    }

    return {
      value: pontos,
      unit: pontos === 1 ? 'ponto' : 'pontos',
      label,
      severity,
      interpretation,
      details: [
        {
          label: 'Mortalidade hospitalar estimada',
          value: mortalidade,
          hint: 'Wu, 2008 (derivação e validação) e validações prospectivas posteriores',
        },
        {
          label: 'Classificação',
          value: pontos >= 3 ? 'Pancreatite de alto risco' : 'Pancreatite de baixo risco',
          hint: 'O corte de gravidade do BISAP é 3 pontos',
        },
      ],
      nextSteps,
    };
  },

  formula: `Um ponto para cada item presente nas primeiras 24 horas (máximo 5):

B - Ureia (BUN) > 53 mg/dL de ureia, equivalente a BUN > 25 mg/dL
I - Impairment: alteração do estado mental (Glasgow < 15)
S - SIRS: 2 ou mais critérios de resposta inflamatória sistêmica
A - Age: idade > 60 anos
P - Pleural effusion: derrame pleural em exame de imagem

Interpretação: 3 pontos ou mais = pancreatite de alto risco.
Mortalidade hospitalar: 0 a 1 < 1% · 2 ≈ 2% · 3 ≈ 5 a 8% · 4 ≈ 13 a 19% · 5 ≈ 22 a 27%.`,

  evidence:
    'O BISAP foi derivado por Wu e colaboradores em 2008, em uma base de 17.992 internações por pancreatite aguda em 212 hospitais norte-americanos entre 2000 e 2001, e validado em 18.256 internações de 177 hospitais entre 2004 e 2005. A área sob a curva ROC para mortalidade hospitalar foi de aproximadamente 0,82 na coorte de validação, com risco de morte mais de dez vezes maior nos pacientes com 3 pontos ou mais em comparação aos de escore menor. A validação prospectiva de Papachristou e colaboradores (2010), em 185 pacientes, mostrou desempenho comparável ao dos critérios de Ranson, do APACHE II e do índice tomográfico de gravidade para prever falência orgânica, necrose e morte, com a vantagem prática de estar completo em 24 horas e usar apenas cinco variáveis de rotina.',

  creator: {
    name: 'Bechien U. Wu e Peter A. Banks',
    bio: 'Gastroenterologistas do Brigham and Women’s Hospital, em Boston, dedicados à epidemiologia e ao manejo da pancreatite aguda.',
  },

  references: [
    {
      citation:
        'Wu BU, Johannes RS, Sun X, Tabak Y, Conwell DL, Banks PA. The early prediction of mortality in acute pancreatitis: a large population-based study. Gut. 2008;57(12):1698-703.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/18519429/',
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
