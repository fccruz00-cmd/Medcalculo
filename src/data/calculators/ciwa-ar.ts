import type { Calculator, Field, Option, Severity, Values } from '@/lib/types';
import { n, sumPoints } from '@/lib/utils';

/**
 * Monta as oito opções (0 a 7) de um item da CIWA-Ar.
 * O instrumento original descreve apenas algumas âncoras em vários itens; os
 * demais graus são graduações intermediárias, deixadas a critério do avaliador.
 */
function escala7(ancoras: Record<number, string>): Option[] {
  return [0, 1, 2, 3, 4, 5, 6, 7].map((valor) => ({
    label: ancoras[valor] ? `${valor}: ${ancoras[valor]}` : `${valor}: grau intermediário`,
    value: valor,
  }));
}

const FIELDS: Field[] = [
  {
    id: 'nausea',
    kind: 'select',
    label: 'Náusea e vômitos',
    hint: 'Pergunte: "Você está enjoado? Já vomitou?". Observe o paciente.',
    placeholder: 'Selecione o grau',
    options: escala7({
      0: 'sem náusea nem vômitos',
      1: 'náusea leve, sem vômitos',
      4: 'náusea intermitente, com ânsia de vômito seca',
      7: 'náusea constante, ânsia frequente e vômitos',
    }),
  },
  {
    id: 'tremor',
    kind: 'select',
    label: 'Tremor',
    hint: 'Avalie com os braços estendidos e os dedos afastados.',
    placeholder: 'Selecione o grau',
    options: escala7({
      0: 'sem tremor',
      1: 'tremor não visível, mas perceptível ao toque das pontas dos dedos',
      4: 'tremor moderado com os braços estendidos',
      7: 'tremor intenso, mesmo sem estender os braços',
    }),
  },
  {
    id: 'sudorese',
    kind: 'select',
    label: 'Sudorese paroxística',
    placeholder: 'Selecione o grau',
    options: escala7({
      0: 'sem sudorese visível',
      1: 'sudorese quase imperceptível, palmas úmidas',
      4: 'gotas de suor evidentes na testa',
      7: 'sudorese profusa, encharcando o paciente',
    }),
  },
  {
    id: 'ansiedade',
    kind: 'select',
    label: 'Ansiedade',
    hint: 'Pergunte: "Você está nervoso?". Observe o paciente.',
    placeholder: 'Selecione o grau',
    options: escala7({
      0: 'sem ansiedade, tranquilo',
      1: 'levemente ansioso',
      4: 'moderadamente ansioso ou retraído, de modo que a ansiedade é inferida',
      7: 'equivalente a pânico agudo, como no delirium grave ou na reação esquizofrênica aguda',
    }),
  },
  {
    id: 'agitacao',
    kind: 'select',
    label: 'Agitação',
    placeholder: 'Selecione o grau',
    options: escala7({
      0: 'atividade normal',
      1: 'atividade um pouco maior que a normal',
      4: 'inquietação moderada, mexe-se o tempo todo',
      7: 'anda de um lado para o outro durante quase toda a entrevista, ou se debate constantemente',
    }),
  },
  {
    id: 'tateis',
    kind: 'select',
    label: 'Distúrbios táteis',
    hint: 'Pergunte: "Você sente coceira, alfinetadas, queimação ou dormência? Sente insetos andando sobre a pele ou por baixo dela?".',
    placeholder: 'Selecione o grau',
    options: escala7({
      0: 'ausentes',
      1: 'coceira, alfinetadas, queimação ou dormência muito leves',
      2: 'coceira, alfinetadas, queimação ou dormência leves',
      3: 'coceira, alfinetadas, queimação ou dormência moderadas',
      4: 'alucinações moderadamente graves',
      5: 'alucinações graves',
      6: 'alucinações muito graves',
      7: 'alucinações contínuas',
    }),
  },
  {
    id: 'auditivos',
    kind: 'select',
    label: 'Distúrbios auditivos',
    hint: 'Pergunte: "Você está mais sensível aos sons? Ouve algo que o assusta? Está ouvindo coisas que sabe não existirem?".',
    placeholder: 'Selecione o grau',
    options: escala7({
      0: 'ausentes',
      1: 'aspereza ou capacidade de assustar muito leves',
      2: 'aspereza ou capacidade de assustar leves',
      3: 'aspereza ou capacidade de assustar moderadas',
      4: 'alucinações moderadamente graves',
      5: 'alucinações graves',
      6: 'alucinações muito graves',
      7: 'alucinações contínuas',
    }),
  },
  {
    id: 'visuais',
    kind: 'select',
    label: 'Distúrbios visuais',
    hint: 'Pergunte: "A luz está incomodando? Está mais forte? As cores estão diferentes? Está vendo coisas que sabe não existirem?".',
    placeholder: 'Selecione o grau',
    options: escala7({
      0: 'ausentes',
      1: 'fotossensibilidade muito leve',
      2: 'fotossensibilidade leve',
      3: 'fotossensibilidade moderada',
      4: 'alucinações moderadamente graves',
      5: 'alucinações graves',
      6: 'alucinações muito graves',
      7: 'alucinações contínuas',
    }),
  },
  {
    id: 'cefaleia',
    kind: 'select',
    label: 'Cefaleia ou sensação de peso na cabeça',
    hint: 'Pergunte se a cabeça dói ou parece pesada, com uma faixa apertando. Não pontue tontura ou atordoamento.',
    placeholder: 'Selecione o grau',
    options: escala7({
      0: 'ausente',
      1: 'muito leve',
      2: 'leve',
      3: 'moderada',
      4: 'moderadamente grave',
      5: 'grave',
      6: 'muito grave',
      7: 'extremamente grave',
    }),
  },
  {
    id: 'orientacao',
    kind: 'choice',
    layout: 'stack',
    label: 'Orientação e obnubilação do sensório',
    hint: 'Pergunte a data e o local, e peça somas seriadas (por exemplo, somar 7 a partir de 100). Item de 0 a 4.',
    options: [
      { label: '0: orientado e capaz de fazer somas seriadas', value: 0 },
      { label: '1: não consegue fazer somas seriadas ou está incerto quanto à data', value: 1 },
      { label: '2: desorientado quanto à data em até 2 dias de calendário', value: 2 },
      { label: '3: desorientado quanto à data em mais de 2 dias de calendário', value: 3 },
      { label: '4: desorientado quanto ao lugar e/ou à pessoa', value: 4 },
    ],
  },
];

/**
 * Faixas de gravidade da CIWA-Ar.
 * O limite de 8 pontos é o limiar de tratamento dos protocolos sintoma-desencadeados
 * (Saitz, 1994; ASAM, 2020): abaixo de 8 a abstinência é leve e dispensa
 * benzodiazepínico; a partir de 8 há indicação de dose e de reavaliação horária.
 */
function faixa(pontos: number): { rotulo: string; severidade: Severity } {
  if (pontos < 8) return { rotulo: 'Abstinência leve', severidade: 'baixo' };
  if (pontos <= 15) return { rotulo: 'Abstinência moderada', severidade: 'moderado' };
  if (pontos <= 20) return { rotulo: 'Abstinência grave', severidade: 'alto' };
  return { rotulo: 'Abstinência muito grave', severidade: 'critico' };
}

const calculator: Calculator = {
  slug: 'ciwa-ar',
  title: 'CIWA-Ar: gravidade da síndrome de abstinência alcoólica',
  shortTitle: 'CIWA-Ar',
  subtitle:
    'Gradua a intensidade da abstinência alcoólica em dez itens e orienta a terapia sintoma-desencadeada com benzodiazepínicos.',
  specialties: ['Psiquiatria', 'Emergência', 'Toxicologia'],
  kind: 'Escala',
  keywords: [
    'ciwa',
    'ciwa-ar',
    'ciwa ar',
    'abstinência alcoólica',
    'delirium tremens',
    'álcool',
    'etilismo',
    'benzodiazepínico',
    'diazepam',
    'lorazepam',
  ],

  whenToUse: [
    'Adultos com diagnóstico já estabelecido de síndrome de abstinência alcoólica, para graduar a gravidade e guiar a terapia sintoma-desencadeada.',
    'Monitorização seriada durante a desintoxicação, em enfermaria, pronto-socorro ou unidade especializada, com reaplicação a cada 1 a 4 horas conforme a pontuação.',
    'Não serve para diagnosticar abstinência nem para prever quem vai evoluir para delirium tremens: para estimar esse risco existem escalas específicas, como o PAWSS.',
    'Não se aplica a pacientes que não conseguem se comunicar: rebaixamento de consciência, intubação, sedação, afasia, barreira de idioma ou delirium tremens já instalado. Nesses casos, use protocolo de dose fixa e escalas baseadas em observação (por exemplo, RASS associado a protocolo institucional).',
  ],

  whyUse:
    'A CIWA-Ar transformou o tratamento da abstinência ao permitir a terapia sintoma-desencadeada: em vez de dose fixa de benzodiazepínico para todos, medica-se apenas quando o escore ultrapassa o limiar. No ensaio randomizado de Saitz e colaboradores, essa estratégia reduziu a duração do tratamento de 68 para 9 horas e a dose total de clordiazepóxido de 425 para 100 mg, sem aumentar complicações.',

  pearls: [
    'A escala exige um paciente comunicativo e cooperativo. Em rebaixamento de consciência, intubação, sedação profunda ou delirium tremens instalado, a CIWA-Ar não é válida: sete dos dez itens dependem do relato do paciente, e escores falsamente baixos levam a subtratamento perigoso.',
    'A CIWA-Ar é inespecífica: qualquer causa de agitação, náusea, sudorese ou confusão eleva o escore. Antes de atribuir tudo à abstinência, exclua infecção, hemorragia digestiva, hematoma subdural, encefalopatia hepática, hipoglicemia, distúrbio hidroeletrolítico, dor e abstinência de outras substâncias.',
    'A versão revisada (Ar) removeu os sinais vitais que existiam na CIWA-A original. O escore não contempla frequência cardíaca, pressão arterial nem temperatura: avalie-os separadamente, pois hiperatividade autonômica importante pode coexistir com escore modesto.',
    'Tiamina antes de qualquer glicose, sempre. Reposição parenteral de 100 a 300 mg ao dia, com doses maiores (500 mg três vezes ao dia) na suspeita de encefalopatia de Wernicke. Corrija também magnésio, potássio e fósforo.',
    'Convulsão por abstinência costuma ocorrer entre 6 e 48 horas da última dose e pode aparecer com CIWA-Ar baixo. Não use o escore para liberar o paciente desse risco, sobretudo se houver história de convulsão prévia por abstinência.',
    'Fenitoína não previne nem trata convulsão por abstinência alcoólica. O tratamento e a profilaxia são feitos com benzodiazepínico.',
    'Em hepatopatia grave, em idosos e em pacientes com encefalopatia, prefira lorazepam ou oxazepam, que não dependem de oxidação hepática e não acumulam metabólitos ativos.',
    'Escore persistentemente alto apesar de doses crescentes de benzodiazepínico (abstinência refratária) indica avaliação para terapia intensiva e uso de fenobarbital ou propofol: e reavaliação de diagnósticos alternativos.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const pontos = sumPoints(FIELDS, values);
    const { rotulo, severidade } = faixa(pontos);

    const perceptivos = n(values, 'tateis') + n(values, 'auditivos') + n(values, 'visuais');
    const orientacao = n(values, 'orientacao');
    const alucinando =
      n(values, 'tateis') >= 4 || n(values, 'auditivos') >= 4 || n(values, 'visuais') >= 4;

    const linhas: string[] = [];
    let intervalo: string;
    let nextSteps: string;

    if (pontos < 8) {
      linhas.push(
        'Abstinência leve. Na maior parte dos casos, sintomas dessa intensidade não exigem benzodiazepínico e cedem com medidas de suporte.',
      );
      intervalo = 'a cada 4 a 8 horas';
      nextSteps =
        'Medidas de suporte: ambiente calmo e iluminado, hidratação, tiamina parenteral antes de qualquer glicose, correção de magnésio, potássio e fósforo.\nReaplique a CIWA-Ar a cada 4 a 8 horas. Se o escore atingir 8 pontos ou mais, administre a primeira dose de benzodiazepínico e passe a reavaliar a cada 1 a 2 horas.\nSe três avaliações seguidas ficarem abaixo de 8, a monitorização com a escala pode ser encerrada.';
    } else if (pontos <= 15) {
      linhas.push(
        'Abstinência moderada. Há indicação de benzodiazepínico em esquema sintoma-desencadeado.',
      );
      intervalo = 'a cada 1 a 2 horas';
      nextSteps =
        'Administre benzodiazepínico: diazepam 10 mg por via oral, ou lorazepam 2 mg por via oral em hepatopata grave, idoso ou paciente com encefalopatia.\nReavalie com a CIWA-Ar 1 hora após cada dose e repita enquanto o escore permanecer em 8 pontos ou mais.\nMantenha tiamina, hidratação e correção de eletrólitos, e reavalie diagnósticos alternativos que possam elevar o escore.';
    } else if (pontos <= 20) {
      linhas.push(
        'Abstinência grave, com risco relevante de convulsão e de evolução para delirium tremens.',
      );
      intervalo = 'a cada 1 hora';
      nextSteps =
        'Benzodiazepínico em dose mais alta: diazepam 10 a 20 mg por via oral ou endovenosa, ou lorazepam 2 a 4 mg, repetidos a cada 1 hora enquanto o escore se mantiver em 8 pontos ou mais.\nMonitorização contínua com acesso venoso, controle de sinais vitais e glicemia capilar.\nInternação hospitalar. Avalie leito de maior vigilância se houver necessidade de doses repetidas ou de via endovenosa.';
    } else {
      linhas.push(
        'Abstinência muito grave. Quadro compatível com delirium tremens iminente ou instalado, condição de alta mortalidade sem tratamento adequado.',
      );
      intervalo = 'a cada 30 a 60 minutos';
      nextSteps =
        'Benzodiazepínico endovenoso titulado até sedação leve (paciente sonolento, mas despertável): diazepam 10 a 20 mg endovenoso repetido a cada 10 a 15 minutos, ou lorazepam 2 a 4 mg endovenoso.\nAvaliação imediata para terapia intensiva, com proteção de via aérea disponível. Em abstinência refratária a doses altas, considere fenobarbital ou propofol.\nAtenção: com delirium instalado o paciente deixa de responder de forma confiável e a CIWA-Ar perde validade; passe a protocolo de dose fixa ou titulado por sedação.';
    }

    if (alucinando) {
      linhas.push(
        'Há alucinações em pelo menos uma modalidade sensorial (item perceptivo com 4 pontos ou mais): sinal de gravidade que costuma anteceder o delirium tremens.',
      );
    }
    if (orientacao >= 2) {
      linhas.push(
        'O paciente está desorientado. Se a desorientação for expressiva, a confiabilidade das respostas da escala fica comprometida e outras causas de delirium precisam ser afastadas.',
      );
    }

    return {
      value: pontos,
      unit: pontos === 1 ? 'ponto' : 'pontos',
      label: rotulo,
      severity: severidade,
      interpretation: linhas.join('\n'),
      details: [
        {
          label: 'Limiar para medicar',
          value: pontos >= 8 ? 'Atingido (≥ 8 pontos)' : 'Não atingido',
          hint: 'Protocolos sintoma-desencadeados dosam benzodiazepínico a partir de 8 pontos e reavaliam a cada 1 a 2 horas nessa faixa',
        },
        {
          label: 'Componente perceptivo (táctil + auditivo + visual)',
          value: `${perceptivos} de 21 pontos`,
          hint: '4 pontos ou mais em qualquer um deles indica alucinação',
        },
        {
          label: 'Orientação e obnubilação',
          value: `${orientacao} de 4 pontos`,
        },
        {
          label: 'Reavaliação sugerida',
          value: intervalo,
        },
      ],
      nextSteps,
    };
  },

  formula: `Soma de dez itens (máximo 67 pontos):

Nove itens de 0 a 7 pontos:
· náusea e vômitos
· tremor
· sudorese paroxística
· ansiedade
· agitação
· distúrbios táteis
· distúrbios auditivos
· distúrbios visuais
· cefaleia / peso na cabeça

Um item de 0 a 4 pontos:
· orientação e obnubilação do sensório

Faixas:
0 a 7 - abstinência leve
8 a 15 - abstinência moderada
16 a 20 - abstinência grave
21 a 67 - abstinência muito grave

Protocolo sintoma-desencadeado: benzodiazepínico sempre que o escore
atingir 8 pontos ou mais, com reavaliação 1 hora após cada dose.`,

  evidence:
    'A CIWA-Ar foi publicada em 1989 por Sullivan, Sykora, Schneiderman, Naranjo e Sellers, na Clínica de Farmacologia da Universidade de Toronto, como versão abreviada da CIWA-A: passou de 15 para 10 itens, com tempo de aplicação de cerca de 2 minutos, mantendo confiabilidade entre avaliadores e validade concorrente com a escala original. O impacto clínico veio do ensaio randomizado duplo-cego de Saitz e colaboradores (1994), com 101 pacientes internados para desintoxicação: a terapia sintoma-desencadeada guiada pela CIWA-Ar reduziu a mediana de duração do tratamento de 68 para 9 horas e a dose total de clordiazepóxido de 425 para 100 mg, sem diferença em convulsões ou delirium. A diretriz da American Society of Addiction Medicine, publicada por Mayo-Smith em 1997 e atualizada em 2020, consolidou a escala como padrão para condução da abstinência em pacientes capazes de se comunicar.',

  creator: {
    name: 'John T. Sullivan e Edward M. Sellers',
    bio: 'Pesquisadores da Divisão de Farmacologia Clínica da Universidade de Toronto e do Addiction Research Foundation, responsáveis pela revisão da CIWA-A que deu origem à CIWA-Ar.',
  },

  updatedAt: '2026-07-26',

  references: [
    {
      citation:
        'Sullivan JT, Sykora K, Schneiderman J, Naranjo CA, Sellers EM. Assessment of alcohol withdrawal: the revised clinical institute withdrawal assessment for alcohol scale (CIWA-Ar). Br J Addict. 1989;84(11):1353-7.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/2597811/',
      primary: true,
    },
    {
      citation:
        'Saitz R, Mayo-Smith MF, Roberts MS, Redmond HA, Bernard DR, Calkins DR. Individualized treatment for alcohol withdrawal. A randomized double-blind controlled trial. JAMA. 1994;272(7):519-23.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/8046805/',
    },
    {
      citation:
        'Mayo-Smith MF. Pharmacological management of alcohol withdrawal. A meta-analysis and evidence-based practice guideline. American Society of Addiction Medicine Working Group on Pharmacological Management of Alcohol Withdrawal. JAMA. 1997;278(2):144-51.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/9214531/',
    },
    {
      citation:
        'The ASAM Clinical Practice Guideline on Alcohol Withdrawal Management. J Addict Med. 2020;14(3S Suppl 1):1-72.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/32511109/',
    },
  ],
};

export default calculator;
