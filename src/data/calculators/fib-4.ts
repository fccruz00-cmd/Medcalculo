import type { Calculator, Field, Values } from '@/lib/types';
import { n, num } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'idade',
    kind: 'number',
    label: 'Idade',
    unit: 'anos',
    min: 18,
    max: 100,
    step: 1,
    hint: 'O índice foi derivado e validado em adultos. Perde acurácia abaixo de 35 anos e a partir dos 65 anos.',
  },
  {
    id: 'ast',
    kind: 'number',
    label: 'AST (TGO)',
    unit: 'U/L',
    min: 5,
    max: 1000,
    step: 1,
    normalRange: 'até cerca de 40 U/L',
    hint: 'Aspartato aminotransferase. Nos laudos brasileiros aparece como TGO.',
  },
  {
    id: 'alt',
    kind: 'number',
    label: 'ALT (TGP)',
    unit: 'U/L',
    min: 5,
    max: 1000,
    step: 1,
    normalRange: 'até cerca de 40 U/L',
    hint: 'Alanina aminotransferase. Nos laudos brasileiros aparece como TGP. Entra no denominador sob raiz quadrada.',
  },
  {
    id: 'plaquetas',
    kind: 'number',
    label: 'Plaquetas',
    unit: '×10⁹/L',
    min: 10,
    max: 800,
    step: 1,
    normalRange: '150 a 400 ×10⁹/L',
    hint: 'Equivale a mil por mm³: 150 ×10⁹/L é o mesmo que 150.000/mm³. Informe apenas o número em milhares (150, não 150.000).',
  },
];

const calculator: Calculator = {
  slug: 'fib-4',
  title: 'Índice FIB-4',
  shortTitle: 'FIB-4',
  subtitle:
    'Estima de forma não invasiva a probabilidade de fibrose hepática avançada a partir da idade, das transaminases e das plaquetas.',
  specialties: ['Hepatologia', 'Gastroenterologia', 'Clínica Médica'],
  kind: 'Fórmula',
  popular: true,
  keywords: [
    'fib4',
    'fib 4',
    'fibrose hepática',
    'fibrose avançada',
    'esteatose hepática',
    'MASLD',
    'NAFLD',
    'DHGNA',
    'esteato-hepatite',
    'cirrose',
    'elastografia',
    'biópsia hepática',
  ],

  whenToUse: [
    'Triagem de fibrose avançada em adultos com doença hepática esteatótica associada à disfunção metabólica (MASLD, antiga DHGNA), sobretudo em pacientes com diabetes tipo 2, obesidade ou síndrome metabólica.',
    'Avaliação inicial de hepatite C e hepatite B crônicas, onde o índice foi originalmente derivado e mais amplamente validado.',
    'Como primeiro passo de um algoritmo escalonado: FIB-4 na atenção primária e, se indeterminado ou elevado, elastografia hepática ou encaminhamento ao hepatologista.',
    'Não se aplica a hepatite aguda, colestase aguda, hepatite alcoólica aguda nem a qualquer situação em que as transaminases estejam agudamente alteradas.',
    'Não foi validado em menores de 18 anos, e perde acurácia abaixo de 35 anos (excesso de falso-negativos) e a partir dos 65 anos (excesso de falso-positivos).',
  ],

  whyUse:
    'Usa quatro variáveis que já estão em qualquer exame de rotina, não custa nada e tem valor preditivo negativo alto: um FIB-4 abaixo de 1,30 praticamente afasta fibrose avançada e dispensa investigação adicional na maioria dos pacientes. É a ferramenta recomendada como primeira linha por AASLD, EASL e pelas diretrizes de rastreamento de MASLD para reduzir encaminhamentos e biópsias desnecessárias.',

  pearls: [
    'A idade está no numerador: o índice sobe com o envelhecimento mesmo sem doença hepática. Em pacientes com 65 anos ou mais, o corte inferior de 1,30 gera muitos falso-positivos e deve ser elevado para 2,00. Abaixo de 35 anos, o índice tem sensibilidade ruim e não deve ser usado isoladamente para afastar fibrose.',
    'Não confunda AST com ALT. A AST (TGO) fica no numerador e a ALT (TGP) no denominador, sob raiz quadrada: inverter as duas muda o resultado por completo.',
    'Plaquetas devem ser informadas em ×10⁹/L, que é o mesmo que milhares por mm³. Digitar 150.000 em vez de 150 divide o índice por mil e produz um falso "sem fibrose".',
    'Qualquer causa não hepática de plaquetopenia, púrpura imune, hiperesplenismo de outra origem, quimioterapia, dengue, eleva artificialmente o FIB-4 e simula fibrose avançada.',
    'A zona indeterminada (1,30 a 2,67) abrange cerca de um terço dos pacientes triados e NÃO é resultado normal: exige um segundo teste, de preferência elastografia hepática transitória ou um marcador sérico proprietário.',
    'Nas hepatites virais os pontos de corte originais são outros: 1,45 e 3,25, , derivados na coorte de coinfecção HIV/HCV. Os cortes de 1,30 e 2,67 vêm dos estudos de doença hepática gordurosa.',
    'O índice estima fibrose, não atividade inflamatória nem esteatose. Um FIB-4 baixo não exclui esteato-hepatite ativa, e a conduta sobre fatores metabólicos e álcool independe do resultado.',
    'Não use durante quadro agudo: hepatite aguda, hepatite alcoólica e colestase elevam a AST desproporcionalmente e superestimam o índice.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const idade = n(values, 'idade');
    const ast = n(values, 'ast');
    const alt = n(values, 'alt');
    const plaquetas = n(values, 'plaquetas');

    if (idade <= 0 || ast <= 0 || alt <= 0 || plaquetas <= 0) {
      return {
        value: '-',
        interpretation:
          'Informe idade, AST, ALT e contagem de plaquetas maiores que zero para calcular o índice.',
        severity: 'info' as const,
      };
    }

    const denominador = plaquetas * Math.sqrt(alt);
    if (!(denominador > 0) || !Number.isFinite(denominador)) {
      return {
        value: '-',
        interpretation: 'Não foi possível calcular o índice com os valores informados.',
        severity: 'info' as const,
      };
    }

    const fib4 = (idade * ast) / denominador;

    if (!Number.isFinite(fib4)) {
      return {
        value: '-',
        interpretation: 'Não foi possível calcular o índice com os valores informados.',
        severity: 'info' as const,
      };
    }

    // Com 65 anos ou mais, o corte inferior sobe de 1,30 para 2,00 para conter os
    // falso-positivos gerados pela idade no numerador (McPherson, 2017).
    const idoso = idade >= 65;
    const corteInferior = idoso ? 2.0 : 1.3;
    const corteSuperior = 2.67;

    let label: string;
    let severity: 'baixo' | 'moderado' | 'alto';
    let interpretation: string;
    let nextSteps: string;

    if (fib4 < corteInferior) {
      label = 'Fibrose avançada improvável';
      severity = 'baixo';
      interpretation = `FIB-4 abaixo de ${num(corteInferior, 2)}${idoso ? ' (corte ajustado para 65 anos ou mais)' : ''}. Valor preditivo negativo alto: fibrose avançada (F3 a F4) é improvável.`;
      nextSteps =
        'Não há indicação de elastografia nem de encaminhamento ao hepatologista apenas por esse resultado.\nMantenha o tratamento dos fatores metabólicos: perda de peso, controle glicêmico e lipídico, atividade física e abstinência alcoólica.\nRepita o FIB-4 em 1 a 3 anos, conforme o risco: anualmente em diabetes tipo 2 ou em quem tem dois ou mais componentes da síndrome metabólica.';
    } else if (fib4 <= corteSuperior) {
      label = 'Zona indeterminada';
      severity = 'moderado';
      interpretation = `FIB-4 entre ${num(corteInferior, 2)} e 2,67${idoso ? ' (corte inferior ajustado para 65 anos ou mais)' : ''}. Faixa indeterminada: o índice não confirma nem afasta fibrose avançada. Cerca de um terço dos pacientes triados cai nessa zona.`;
      nextSteps =
        'Solicite um segundo teste não invasivo: elastografia hepática transitória (FibroScan) é a opção preferida; alternativas incluem ARFI, elastografia por ressonância e marcadores séricos proprietários.\nSe o segundo teste não estiver disponível, encaminhe ao hepatologista para estratificação.\nRevise causas não hepáticas de plaquetopenia e de elevação da AST antes de assumir fibrose.';
    } else {
      label = 'Fibrose avançada provável';
      severity = 'alto';
      interpretation =
        'FIB-4 acima de 2,67. Alta probabilidade de fibrose avançada (F3 a F4). Nas coortes de doença hepática gordurosa, esse corte teve valor preditivo positivo em torno de 80%.';
      nextSteps =
        'Encaminhe ao hepatologista para confirmação com elastografia e definição de conduta; a biópsia hepática fica reservada aos casos discordantes ou com diagnóstico incerto.\nSe houver cirrose confirmada ou provável, inicie rastreamento semestral de hepatocarcinoma por ultrassonografia e pesquisa de varizes esofágicas conforme os critérios de Baveno.\nInvestigue e trate causas associadas: hepatites virais, consumo de álcool, hemocromatose, hepatite autoimune e fármacos hepatotóxicos.';
    }

    return {
      value: num(fib4, 2),
      label,
      severity,
      interpretation,
      details: [
        {
          label: 'Pontos de corte aplicados',
          value: `${num(corteInferior, 2)} e 2,67`,
          hint: idoso
            ? 'Corte inferior elevado para 2,00 por idade de 65 anos ou mais'
            : 'Cortes das coortes de doença hepática gordurosa (MASLD)',
        },
        {
          label: 'Relação AST/ALT',
          value: num(ast / alt, 2),
          hint: 'Valor auxiliar: na doença hepática gordurosa, razão acima de 1 sugere fibrose avançada; razão igual ou acima de 2 sugere doença hepática alcoólica',
        },
        {
          label: 'Cortes nas hepatites virais',
          value: '1,45 e 3,25',
          hint: 'Coorte de derivação de coinfecção HIV/HCV (Sterling, 2006)',
        },
      ],
      nextSteps,
    };
  },

  formula: `FIB-4 = (idade em anos × AST) / (plaquetas × √ALT)

Unidades:
· AST e ALT em U/L (TGO e TGP)
· Plaquetas em ×10⁹/L, que equivale a mil/mm³ - 150 ×10⁹/L = 150.000/mm³

PONTOS DE CORTE

Doença hepática esteatótica metabólica (MASLD/DHGNA):
< 1,30 = fibrose avançada improvável
1,30 a 2,67 = zona indeterminada
> 2,67 = fibrose avançada provável

Com 65 anos ou mais, o corte inferior sobe para 2,00

Hepatites virais (coorte original):
< 1,45 = fibrose avançada improvável
> 3,25 = fibrose avançada provável`,

  evidence:
    'O FIB-4 foi derivado por Sterling e colaboradores (Hepatology, 2006) em 832 pacientes coinfectados por HIV e vírus da hepatite C do estudo APRICOT, todos com biópsia hepática. Para fibrose avançada (Ishak 4 a 6), a AUROC foi de 0,765; o corte inferior de 1,45 teve valor preditivo negativo de 90% com sensibilidade de 70%, e o corte superior de 3,25, valor preditivo positivo de 65% com especificidade de 97%. Aplicando ambos os cortes, a biópsia poderia ser evitada em 71% do grupo de validação, com classificação correta em 87% desses pacientes. Shah e colaboradores (Clinical Gastroenterology and Hepatology, 2009) compararam marcadores não invasivos em doença hepática gordurosa não alcoólica com biópsia e estabeleceram os cortes de 1,30 e 2,67, hoje incorporados às diretrizes de MASLD. McPherson e colaboradores (2017) mostraram que, em pacientes com 65 anos ou mais, a especificidade do corte de 1,30 cai para cerca de 35%, e propuseram elevá-lo para 2,00; abaixo de 35 anos, a sensibilidade é insuficiente para afastar fibrose. As recomendações atuais posicionam o FIB-4 como primeiro passo de um algoritmo escalonado, seguido de elastografia hepática nos casos indeterminados ou elevados.',

  creator: {
    name: 'Richard K. Sterling',
    bio: 'Hepatologista da Virginia Commonwealth University, nos Estados Unidos, que derivou o índice a partir da coorte do ensaio APRICOT em pacientes coinfectados por HIV e hepatite C.',
  },

  references: [
    {
      citation:
        'Sterling RK, Lissen E, Clumeck N, et al. Development of a simple noninvasive index to predict significant fibrosis in patients with HIV/HCV coinfection. Hepatology. 2006;43(6):1317-25.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/16729309/',
      primary: true,
    },
    {
      citation:
        'Shah AG, Lydecker A, Murray K, et al. Comparison of noninvasive markers of fibrosis in patients with nonalcoholic fatty liver disease. Clin Gastroenterol Hepatol. 2009;7(10):1104-12.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/19523535/',
    },
    {
      citation:
        'McPherson S, Hardy T, Dufour JF, et al. Age as a confounding factor for the accurate non-invasive diagnosis of advanced NAFLD fibrosis. Am J Gastroenterol. 2017;112(5):740-51.',
    },
    {
      citation:
        'Rinella ME, Neuschwander-Tetri BA, Siddiqui MS, et al. AASLD Practice Guidance on the clinical assessment and management of nonalcoholic fatty liver disease. Hepatology. 2023;77(5):1797-835.',
    },
  ],
};

export default calculator;
