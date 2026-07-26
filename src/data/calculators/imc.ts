import type { Calculator, Field, Values } from '@/lib/types';
import { n, num } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'peso',
    kind: 'number',
    label: 'Peso',
    unit: 'kg',
    min: 2,
    max: 400,
    step: 0.1,
    placeholder: '70',
    hint: 'Peso aferido em balança calibrada, com o mínimo de roupa e sem calçados.',
  },
  {
    id: 'altura',
    kind: 'number',
    label: 'Altura',
    unit: 'cm',
    min: 100,
    max: 250,
    step: 0.5,
    placeholder: '170',
    hint: 'Altura medida em estadiômetro, de pé, com os calcanhares juntos e a cabeça no plano de Frankfurt.',
    unitToggle: {
      alt: 'm',
      toBase: (value) => value * 100,
      fromBase: (value) => value / 100,
    },
  },
  {
    id: 'idade',
    kind: 'number',
    label: 'Idade',
    unit: 'anos',
    min: 20,
    max: 120,
    step: 1,
    optional: true,
    hint: 'Opcional, mas muda o resultado: a partir de 60 anos a classificação passa a usar os pontos de corte de Lipschitz, adotados pelo SISVAN/Ministério da Saúde para idosos, em vez da tabela da OMS para adultos.',
  },
];

interface Faixa {
  label: string;
  severity: 'baixo' | 'moderado' | 'alto' | 'critico';
  interpretation: string;
  nextSteps: string;
}

/** Classificação da OMS para adultos de 20 a 59 anos. */
function classificar(imc: number): Faixa {
  if (imc < 16) {
    return {
      label: 'Magreza grau III',
      severity: 'alto',
      interpretation:
        'Magreza acentuada (IMC abaixo de 16 kg/m²). Nessa faixa a mortalidade volta a subir de forma acentuada e há risco de desnutrição grave, com imunossupressão, sarcopenia e má cicatrização.',
      nextSteps:
        'Investigue causas de perda ponderal: neoplasia, tuberculose, HIV, doença inflamatória intestinal, hipertireoidismo, insuficiência cardíaca ou hepática avançada, transtorno alimentar e insegurança alimentar.\nEncaminhe para avaliação nutricional e considere suporte nutricional formal. Ao renutrir pacientes muito emagrecidos, monitore fósforo, potássio e magnésio pelo risco de síndrome de realimentação.',
    };
  }
  if (imc < 17) {
    return {
      label: 'Magreza grau II',
      severity: 'moderado',
      interpretation:
        'Magreza moderada (IMC de 16,0 a 16,9 kg/m²), com risco nutricional relevante.',
      nextSteps:
        'Investigue causas orgânicas e psiquiátricas de baixo peso e avalie a ingestão alimentar.\nEncaminhe para avaliação nutricional e acompanhe o peso de forma seriada.',
    };
  }
  if (imc < 18.5) {
    return {
      label: 'Magreza grau I',
      severity: 'moderado',
      interpretation:
        'Baixo peso leve (IMC de 17,0 a 18,4 kg/m²). Pode ser constitucional, mas também pode indicar perda ponderal recente.',
      nextSteps:
        'Confirme se houve perda de peso não intencional: perda maior que 5% em 6 meses merece investigação, mesmo com IMC próximo do normal.\nAvalie a ingestão alimentar e o contexto socioeconômico.',
    };
  }
  if (imc < 25) {
    return {
      label: 'Eutrofia',
      severity: 'baixo',
      interpretation:
        'Peso adequado para a altura (IMC de 18,5 a 24,9 kg/m²), faixa associada à menor mortalidade em adultos.',
      nextSteps:
        'Mantenha orientação de alimentação saudável e atividade física regular.\nMesmo com IMC normal, meça a circunferência abdominal: a obesidade central é fator de risco cardiometabólico independente do IMC.',
    };
  }
  if (imc < 30) {
    return {
      label: 'Sobrepeso',
      severity: 'moderado',
      interpretation:
        'Sobrepeso ou pré-obesidade (IMC de 25,0 a 29,9 kg/m²). Há aumento do risco de diabetes tipo 2, hipertensão e dislipidemia, sobretudo quando associado à obesidade abdominal.',
      nextSteps:
        'Rastreie comorbidades: pressão arterial, glicemia de jejum ou HbA1c, perfil lipídico e, quando indicado, esteatose hepática e apneia obstrutiva do sono.\nProponha mudança de estilo de vida com meta inicial de 5% a 10% de perda de peso.',
    };
  }
  if (imc < 35) {
    return {
      label: 'Obesidade grau I',
      severity: 'moderado',
      interpretation:
        'Obesidade grau I (IMC de 30,0 a 34,9 kg/m²). Risco cardiometabólico claramente aumentado.',
      nextSteps:
        'Trate como doença crônica: plano alimentar, atividade física estruturada e abordagem comportamental.\nRastreie e trate as comorbidades associadas. Farmacoterapia antiobesidade está indicada a partir de IMC ≥ 30, ou ≥ 27 com comorbidade.',
    };
  }
  if (imc < 40) {
    return {
      label: 'Obesidade grau II',
      severity: 'alto',
      interpretation:
        'Obesidade grau II (IMC de 35,0 a 39,9 kg/m²). Risco alto de diabetes, doença cardiovascular, apneia do sono e mortalidade precoce.',
      nextSteps:
        'Associe tratamento farmacológico à mudança de estilo de vida.\nCom IMC ≥ 35 e comorbidade associada (diabetes tipo 2, hipertensão de difícil controle, apneia obstrutiva grave, artropatia incapacitante), avalie indicação de cirurgia bariátrica.',
    };
  }
  return {
    label: 'Obesidade grau III',
    severity: 'critico',
    interpretation:
      'Obesidade grau III, também chamada de obesidade grave ou mórbida (IMC ≥ 40 kg/m²). Associada a redução expressiva da expectativa de vida e a alta carga de comorbidades.',
    nextSteps:
      'Encaminhe para serviço especializado em obesidade. A cirurgia bariátrica está indicada a partir de IMC ≥ 40, independentemente de comorbidade, após falha do tratamento clínico.\nRastreie apneia obstrutiva do sono antes de qualquer procedimento anestésico e avalie risco cardiovascular perioperatório.',
  };
}

/** Rótulo curto da classificação de Lipschitz (1994), para 60 anos ou mais. */
function rotuloIdoso(imc: number): string {
  if (imc < 22) return 'Baixo peso (IMC < 22)';
  if (imc <= 27) return 'Eutrofia (IMC 22 a 27)';
  return 'Sobrepeso (IMC > 27)';
}

/** Categoria grosseira pela OMS, só para detectar divergência com Lipschitz. */
function categoriaOms(imc: number): 'baixo' | 'eutrofia' | 'excesso' {
  if (imc < 18.5) return 'baixo';
  if (imc < 25) return 'eutrofia';
  return 'excesso';
}

/** Categoria grosseira por Lipschitz, só para detectar divergência com a OMS. */
function categoriaIdoso(imc: number): 'baixo' | 'eutrofia' | 'excesso' {
  if (imc < 22) return 'baixo';
  if (imc <= 27) return 'eutrofia';
  return 'excesso';
}

/**
 * Faixa que governa rótulo, gravidade e conduta a partir dos 60 anos.
 * Os pontos de corte são os de Lipschitz (1994), adotados pelo SISVAN/Ministério
 * da Saúde: baixo peso abaixo de 22, eutrofia de 22 a 27 e sobrepeso acima de 27.
 * A partir de IMC 30 mantemos a graduação da obesidade da OMS, que Lipschitz não
 * subdivide e que continua sendo a base das indicações de farmacoterapia e cirurgia.
 */
function classificarIdoso(imc: number): Faixa {
  if (imc < 16) {
    return {
      label: 'Baixo peso grave',
      severity: 'alto',
      interpretation:
        'IMC abaixo de 16 kg/m² em pessoa com 60 anos ou mais. Pelos pontos de corte de Lipschitz qualquer IMC menor que 22 já é baixo peso no idoso, e esta faixa corresponde a desnutrição grave, com sarcopenia, imunossupressão, má cicatrização e mortalidade acentuadamente aumentada.',
      nextSteps:
        'Trate como desnutrição grave: avaliação nutricional imediata e suporte nutricional formal.\nInvestigue causas de perda ponderal no idoso: neoplasia, tuberculose, disfagia, demência avançada, depressão, polifarmácia, má condição dentária, dor crônica, insegurança alimentar e isolamento social.\nAo renutrir, monitore fósforo, potássio e magnésio pelo risco de síndrome de realimentação.',
    };
  }
  if (imc < 22) {
    return {
      label: 'Baixo peso',
      severity: 'moderado',
      interpretation:
        'IMC abaixo de 22 kg/m². Pelos pontos de corte de Lipschitz, adotados pelo SISVAN para 60 anos ou mais, isso é baixo peso: ainda que parte dessa faixa seja classificada como eutrofia na tabela da OMS para adultos. No idoso o baixo peso associa-se a sarcopenia, quedas, fratura, infecção, pior recuperação pós-operatória e mortalidade aumentada.',
      nextSteps:
        'Encaminhe para avaliação nutricional e aplique um instrumento de triagem, como a Mini Avaliação Nutricional (MAN).\nDocumente perda de peso não intencional: perda maior que 5% em 6 meses exige investigação mesmo com IMC aparentemente normal.\nRastreie sarcopenia com força de preensão palmar e velocidade de marcha, e revise causas tratáveis: dentição, disfagia, depressão, polifarmácia, dor e acesso ao alimento.',
    };
  }
  if (imc <= 27) {
    return {
      label: 'Eutrofia',
      severity: 'baixo',
      interpretation:
        'IMC entre 22 e 27 kg/m², faixa de eutrofia do idoso pelos pontos de corte de Lipschitz. Nessa faixa etária uma reserva de peso um pouco maior é protetora, e a mortalidade mais baixa se desloca para IMC acima do observado em adultos jovens.',
      nextSteps:
        'Mantenha orientação de alimentação com aporte proteico adequado e atividade física, incluindo treino de força para preservar massa muscular.\nMeça a circunferência abdominal e a panturrilha, e acompanhe o peso de forma seriada: no idoso a tendência da curva importa mais do que o valor isolado.',
    };
  }
  if (imc < 30) {
    return {
      label: 'Sobrepeso',
      severity: 'moderado',
      interpretation:
        'IMC acima de 27 kg/m², sobrepeso pelos pontos de corte de Lipschitz. No idoso, o excesso de peso leve tem impacto menor sobre a mortalidade do que no adulto jovem, mas piora artrose, mobilidade, apneia do sono e controle metabólico.',
      nextSteps:
        'Priorize função e composição corporal, não o número da balança: atividade física com treino de força e aporte proteico adequado.\nRastreie comorbidades: pressão arterial, glicemia ou HbA1c, perfil lipídico e apneia obstrutiva do sono.\nEvite dietas restritivas agressivas nesta faixa etária: perda de peso rápida no idoso custa massa muscular e óssea.',
    };
  }
  // IMC ≥ 30: Lipschitz não subdivide a obesidade, mantemos a graduação da OMS,
  // que é a base das indicações de farmacoterapia e de cirurgia bariátrica.
  return classificar(imc);
}

const calculator: Calculator = {
  slug: 'imc',
  title: 'Índice de massa corporal (IMC)',
  shortTitle: 'IMC',
  subtitle:
    'Classifica o estado nutricional do adulto a partir do peso e da altura, das faixas de magreza à obesidade grau III.',
  specialties: ['Endocrinologia', 'Clínica Médica'],
  kind: 'Classificação',
  popular: true,
  keywords: [
    'IMC',
    'BMI',
    'índice de massa corpórea',
    'obesidade',
    'sobrepeso',
    'estado nutricional',
    'desnutrição',
    'baixo peso',
    'Quetelet',
  ],

  whenToUse: [
    'Triagem e classificação do estado nutricional de adultos de 20 a 59 anos, usando as faixas da Organização Mundial da Saúde.',
    'Triagem nutricional de pessoas com 60 anos ou mais: informando a idade, a classificação passa a usar os pontos de corte de Lipschitz adotados pelo SISVAN, e não a tabela da OMS para adultos.',
    'Definição de elegibilidade para farmacoterapia antiobesidade (IMC ≥ 30, ou ≥ 27 com comorbidade) e para cirurgia bariátrica (IMC ≥ 40, ou ≥ 35 com comorbidade).',
    'Acompanhamento longitudinal da resposta ao tratamento da obesidade em um mesmo paciente.',
    'Não se aplica a gestantes, a menores de 20 anos (use as curvas de IMC por idade da OMS, em escore-z ou percentil), a atletas com massa muscular elevada, nem a pacientes com edema, ascite ou amputação.',
  ],

  whyUse:
    'É a medida antropométrica mais reprodutível e barata para triagem populacional: precisa apenas de balança e estadiômetro, tem correlação razoável com a gordura corporal na população geral e define os pontos de corte usados por diretrizes e pelo SUS para indicar tratamento farmacológico e cirúrgico da obesidade.',

  pearls: [
    'O IMC não distingue massa gorda de massa magra. Atletas e pessoas muito musculosas podem ser classificados como obesos sem excesso de gordura, enquanto idosos sarcopênicos com IMC normal podem ter adiposidade elevada e massa muscular baixa: a chamada obesidade sarcopênica.',
    'Os pontos de corte da OMS foram derivados de populações majoritariamente europeias. Em populações asiáticas o risco cardiometabólico aparece com IMC mais baixo, e a própria OMS reconhece pontos de ação adicionais em 23,0 · 27,5 · 32,5 e 37,5 kg/m².',
    'Em idosos (60 anos ou mais) as faixas mudam: o Ministério da Saúde e o SISVAN adotam os pontos de corte de Lipschitz; baixo peso abaixo de 22, eutrofia entre 22 e 27 e sobrepeso acima de 27 kg/m². Aplicar a tabela de adultos ao idoso subdiagnostica desnutrição. Por isso, ao informar idade de 60 anos ou mais, esta calculadora troca a tabela: um idoso com IMC 20 sai como baixo peso, e não como eutrófico.',
    'O IMC não informa a distribuição da gordura. Meça sempre a circunferência abdominal: obesidade central prediz risco cardiovascular mesmo com IMC normal (o chamado peso normal metabolicamente obeso).',
    'Edema, ascite, grandes massas tumorais, amputações e próteses distorcem o peso e invalidam a classificação. Em amputados é preciso corrigir o peso pelo percentual do segmento ausente.',
    'Altura referida pelo paciente costuma ser superestimada, sobretudo em idosos com perda de estatura por osteoporose: e o erro entra ao quadrado no denominador.',
    'A classificação por si só não é diagnóstico de obesidade como doença: avalie comorbidades e limitação funcional para definir a gravidade clínica e a intensidade do tratamento.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const peso = n(values, 'peso');
    const alturaCm = n(values, 'altura');
    const idadeBruta = values.idade;
    const idade = typeof idadeBruta === 'number' ? idadeBruta : null;

    const alturaM = alturaCm / 100;

    if (peso <= 0 || alturaM <= 0) {
      return {
        value: '-',
        severity: 'info' as const,
        interpretation: 'Informe um peso e uma altura válidos para calcular o IMC.',
      };
    }

    const imc = peso / (alturaM * alturaM);

    if (!Number.isFinite(imc)) {
      return {
        value: '-',
        severity: 'info' as const,
        interpretation: 'Não foi possível calcular o IMC com os valores informados.',
      };
    }

    const idoso = idade !== null && idade >= 60;

    // A partir dos 60 anos quem governa rótulo, gravidade e conduta é Lipschitz.
    const faixa = idoso ? classificarIdoso(imc) : classificar(imc);

    // Faixa de peso que corresponde à eutrofia para essa altura, na tabela aplicável.
    const imcMin = idoso ? 22 : 18.5;
    const imcMax = idoso ? 27 : 24.9;
    const pesoMin = imcMin * alturaM * alturaM;
    const pesoMax = imcMax * alturaM * alturaM;
    const textoMin = idoso ? '22' : '18,5';
    const textoMax = idoso ? '27' : '24,9';

    const details = [
      {
        label: `Faixa de peso para IMC ${textoMin} a ${textoMax}`,
        value: `${num(pesoMin, 1)} a ${num(pesoMax, 1)} kg`,
        hint: idoso
          ? 'Intervalo de eutrofia de Lipschitz para a altura informada'
          : 'Intervalo de eutrofia para a altura informada',
      },
      {
        label: `Excesso ou déficit em relação a IMC ${textoMax}`,
        value:
          peso > pesoMax
            ? `+${num(peso - pesoMax, 1)} kg acima`
            : peso < pesoMin
              ? `${num(pesoMin - peso, 1)} kg abaixo de IMC ${textoMin}`
              : 'Dentro da faixa',
      },
      {
        label: 'Pontos de corte asiáticos (OMS 2004)',
        value:
          imc >= 27.5
            ? 'Faixa de risco alto (≥ 27,5)'
            : imc >= 23
              ? 'Faixa de risco aumentado (≥ 23)'
              : 'Abaixo do ponto de ação (< 23)',
        hint: 'Aplicável a pessoas de ascendência asiática',
      },
    ];

    if (idoso) {
      details.unshift({
        label: 'Classificação para idosos (Lipschitz)',
        value: rotuloIdoso(imc),
        hint: 'Adotada pelo SISVAN para 60 anos ou mais: é ela que define o resultado acima',
      });
      details.push({
        label: 'Classificação da OMS para adultos',
        value: classificar(imc).label,
        hint: 'Exibida apenas para comparação; não se aplica a partir dos 60 anos',
      });
    }

    let interpretation = faixa.interpretation;

    if (idoso) {
      const diverge = categoriaOms(imc) !== categoriaIdoso(imc);
      const nota = diverge
        ? `Como o paciente tem 60 anos ou mais, o resultado acima vem dos pontos de corte de Lipschitz: baixo peso abaixo de 22, eutrofia de 22 a 27 e sobrepeso acima de 27, , adotados pelo Ministério da Saúde e pelo SISVAN. É justamente nesta faixa que as duas tabelas discordam: pela classificação da OMS para adultos o mesmo IMC seria chamado de "${classificar(imc).label}". No idoso vale a de Lipschitz, porque a tabela de adultos subdiagnostica desnutrição e superestima o risco do excesso de peso leve.`
        : `Como o paciente tem 60 anos ou mais, o resultado acima vem dos pontos de corte de Lipschitz: baixo peso abaixo de 22, eutrofia de 22 a 27 e sobrepeso acima de 27, , adotados pelo Ministério da Saúde e pelo SISVAN.${imc >= 30 ? ' Lipschitz não subdivide a obesidade, então a partir de IMC 30 mantivemos a graduação da OMS, que é a base das indicações de farmacoterapia e de cirurgia.' : ''}`;
      interpretation = `${faixa.interpretation}\n\n${nota}`;
    }

    return {
      value: num(imc, 1),
      unit: 'kg/m²',
      label: faixa.label,
      severity: faixa.severity,
      interpretation,
      details,
      nextSteps: faixa.nextSteps,
    };
  },

  formula: `IMC = peso (kg) ÷ altura² (m)

Classificação da OMS para adultos (20 a 59 anos):

< 16,0 - Magreza grau III
16,0 a 16,9 - Magreza grau II
17,0 a 18,4 - Magreza grau I
18,5 a 24,9 - Eutrofia
25,0 a 29,9 - Sobrepeso (pré-obesidade)
30,0 a 34,9 - Obesidade grau I
35,0 a 39,9 - Obesidade grau II
≥ 40,0 - Obesidade grau III

Idosos (≥ 60 anos), pontos de corte de Lipschitz - quando a idade informada é 60
anos ou mais, é esta a tabela que define o rótulo, a gravidade e a conduta:

< 22 - Baixo peso
22 a 27 - Eutrofia
> 27 - Sobrepeso

A partir de IMC 30 mantemos a graduação da obesidade da OMS (graus I, II e III),
que Lipschitz não subdivide e que continua definindo as indicações de
farmacoterapia e de cirurgia bariátrica.`,

  evidence:
    'O índice foi proposto no século XIX por Adolphe Quetelet como medida populacional e popularizado como "body mass index" por Ancel Keys e colaboradores em 1972, que compararam vários índices de peso relativo em cinco coortes do Seven Countries Study e concluíram que peso/altura² era o que melhor se correlacionava com a gordura corporal medida por densitometria, com a menor dependência da estatura. Os pontos de corte atuais vêm do relatório da consulta da OMS sobre obesidade (Technical Report Series 894, 2000), baseados na relação em forma de J entre IMC e mortalidade observada em grandes coortes. Em 2004 uma consulta específica da OMS reconheceu que, em populações asiáticas, o risco de diabetes e de doença cardiovascular já aumenta com IMC entre 22 e 25 kg/m², e propôs pontos de ação adicionais em 23,0 · 27,5 · 32,5 e 37,5 kg/m², sem alterar a classificação internacional. Para pessoas com 60 anos ou mais, os pontos de corte usados aqui são os de Lipschitz (1994): baixo peso abaixo de 22, eutrofia de 22 a 27 e sobrepeso acima de 27 kg/m², , incorporados pela norma técnica do SISVAN do Ministério da Saúde: com o envelhecimento há perda de estatura, redistribuição da gordura e redução da massa magra, e coortes de idosos mostram mortalidade mais baixa em IMC acima do que seria eutrofia no adulto jovem, de modo que aplicar a tabela da OMS a essa faixa etária subdiagnostica desnutrição. Como Lipschitz não subdivide a obesidade, a partir de IMC 30 esta calculadora mantém a graduação da OMS, que é a base das indicações de farmacoterapia e de cirurgia.',

  creator: {
    name: 'Adolphe Quetelet',
    bio: 'Matemático e estatístico belga que descreveu o índice peso/altura² em 1832, no contexto de seus estudos sobre o "homem médio". O termo "índice de massa corporal" foi cunhado por Ancel Keys em 1972.',
  },

  updatedAt: '2026-07-26',

  references: [
    {
      citation:
        'Keys A, Fidanza F, Karvonen MJ, Kimura N, Taylor HL. Indices of relative weight and obesity. J Chronic Dis. 1972;25(6):329-43.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/4650929/',
      primary: true,
    },
    {
      citation:
        'Obesity: preventing and managing the global epidemic. Report of a WHO consultation. World Health Organ Tech Rep Ser. 2000;894:i-xii, 1-253.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/11234459/',
    },
    {
      citation:
        'WHO Expert Consultation. Appropriate body-mass index for Asian populations and its implications for policy and intervention strategies. Lancet. 2004;363(9403):157-63.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/14726171/',
    },
    {
      citation:
        'Lipschitz DA. Screening for nutritional status in the elderly. Prim Care. 1994;21(1):55-67.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/8197257/',
    },
    {
      citation:
        'Associação Brasileira para o Estudo da Obesidade e da Síndrome Metabólica (ABESO). Diretrizes brasileiras de obesidade. 4ª ed. São Paulo: ABESO; 2016.',
    },
    {
      citation:
        'Brasil. Ministério da Saúde. Orientações para a coleta e análise de dados antropométricos em serviços de saúde: norma técnica do Sistema de Vigilância Alimentar e Nutricional (SISVAN). Brasília: Ministério da Saúde; 2011.',
    },
  ],
};

export default calculator;
