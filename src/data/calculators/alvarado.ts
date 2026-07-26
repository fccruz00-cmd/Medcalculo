import type { Calculator, Field, Severity, Values } from '@/lib/types';
import { sumPoints } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'migracao',
    kind: 'boolean',
    label: 'Migração da dor para a fossa ilíaca direita',
    hint: 'Dor que começa periumbilical ou epigástrica e depois se localiza no quadrante inferior direito.',
    points: 1,
  },
  {
    id: 'anorexia',
    kind: 'boolean',
    label: 'Anorexia',
    hint: 'Perda de apetite relatada pelo paciente ou pelo acompanhante desde o início do quadro.',
    points: 1,
  },
  {
    id: 'nausea',
    kind: 'boolean',
    label: 'Náusea ou vômito',
    points: 1,
  },
  {
    id: 'dor_fid',
    kind: 'boolean',
    label: 'Dor à palpação da fossa ilíaca direita',
    hint: 'É o item de maior peso do escore, junto com a leucocitose.',
    points: 2,
  },
  {
    id: 'descompressao',
    kind: 'boolean',
    label: 'Dor à descompressão brusca (Blumberg)',
    hint: 'Sinal de irritação peritoneal na fossa ilíaca direita.',
    points: 1,
  },
  {
    id: 'temperatura',
    kind: 'boolean',
    label: 'Temperatura ≥ 37,3 °C',
    hint: 'Temperatura oral no trabalho original. Febre alta é incomum na apendicite não complicada e sugere perfuração ou outro diagnóstico.',
    points: 1,
  },
  {
    id: 'leucocitose',
    kind: 'boolean',
    label: 'Leucócitos > 10.000/mm³',
    points: 2,
  },
  {
    id: 'desvio',
    kind: 'boolean',
    label: 'Desvio à esquerda (neutrófilos > 75%)',
    hint: 'Percentual de neutrófilos, incluindo bastões, acima de 75% no hemograma.',
    points: 1,
  },
];

const calculator: Calculator = {
  slug: 'alvarado',
  title: 'Escore de Alvarado',
  shortTitle: 'Alvarado',
  subtitle:
    'Estima a probabilidade de apendicite aguda em pacientes com dor abdominal, combinando sintomas, sinais e hemograma (mnemônico MANTRELS).',
  specialties: ['Cirurgia', 'Emergência'],
  kind: 'Regra de decisão',
  popular: true,
  keywords: [
    'alvarado',
    'mantrels',
    'apendicite',
    'apendicite aguda',
    'dor abdominal',
    'fossa ilíaca direita',
    'abdome agudo',
  ],

  whenToUse: [
    'Adultos e adolescentes com dor abdominal aguda em que a apendicite é uma hipótese, para estratificar o risco antes de decidir entre alta, observação, imagem ou cirurgia.',
    'Foi derivado em pacientes hospitalizados com suspeita de apendicite, em ambiente cirúrgico, e é mais bem calibrado em homens adultos.',
    'Não se aplica a pacientes com abdome agudo já com indicação cirúrgica evidente (peritonite difusa, instabilidade hemodinâmica): nesses casos, o escore não deve atrasar a operação.',
    'Não use isoladamente em crianças pequenas, gestantes, idosos e imunossuprimidos, em que a apresentação é atípica e o desempenho do escore piora.',
  ],

  whyUse:
    'É um escore de beira de leito, calculado com dados que já se colhem na anamnese, no exame físico e no hemograma. Ajuda sobretudo a identificar quem tem baixa probabilidade de apendicite e pode receber alta com reavaliação, reduzindo tomografias desnecessárias e a exposição à radiação.',

  pearls: [
    'O desempenho é claramente inferior em mulheres em idade fértil: o escore superestima a probabilidade de apendicite nesse grupo, porque anorexia, náusea, dor em fossa ilíaca direita e leucocitose também acompanham cisto ovariano roto, torção anexial, doença inflamatória pélvica e gestação ectópica. Um escore alto em uma mulher jovem não substitui a imagem, e o teste de gravidez é obrigatório.',
    'Em crianças o escore também superestima a probabilidade; prefira instrumentos pediátricos, como o escore de apendicite pediátrica (PAS), associados à ultrassonografia.',
    'O ponto forte do escore é excluir, não confirmar. Valores de 0 a 4 têm valor preditivo negativo alto; valores intermediários (5 a 6) são o cenário em que a imagem realmente muda a conduta.',
    'A febre do critério é baixa: 37,3 °C já pontua. Temperatura acima de 38,5 °C é incomum na apendicite não complicada e deve levantar suspeita de perfuração, abscesso ou outro diagnóstico.',
    'A pontuação é fotografia de um momento. Na dúvida, reavalie em 6 a 12 horas com novo exame físico e novo hemograma: a evolução do quadro discrimina melhor que qualquer escore isolado.',
    'Um escore baixo não afasta apendicite retrocecal ou pélvica, que costuma cursar sem dor à descompressão e com exame abdominal pobre.',
    'A versão de 9 pontos (escore de Alvarado modificado ou de Kalan) retira o desvio à esquerda por indisponibilidade da contagem diferencial em alguns serviços. Os pontos de corte não são intercambiáveis com os da versão de 10 pontos.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const pontos = sumPoints(FIELDS, values);

    let label: string;
    let severity: Severity;
    let probabilidade: string;
    let interpretation: string;
    let nextSteps: string;

    if (pontos <= 4) {
      label = 'Apendicite improvável';
      severity = 'baixo';
      probabilidade = 'Baixa';
      interpretation =
        'Probabilidade baixa de apendicite aguda. Nessa faixa o escore tem bom valor preditivo negativo e a maioria dos pacientes tem outra causa para a dor.';
      nextSteps =
        'Em geral é possível dispensar imagem e liberar o paciente com orientação clara de retorno em caso de piora da dor, febre, vômitos persistentes ou dor que se localize na fossa ilíaca direita.\nReavalie em 12 a 24 horas se a dor persistir.\nInvestigue diagnósticos alternativos: gastroenterite, adenite mesentérica, infecção urinária, cólica renal e, em mulheres, causas ginecológicas.';
    } else if (pontos <= 6) {
      label = 'Probabilidade intermediária';
      severity = 'moderado';
      probabilidade = 'Intermediária';
      interpretation =
        'Zona de indefinição: nem alta o bastante para indicar cirurgia, nem baixa o bastante para dar alta. É exatamente aqui que a imagem e a reavaliação seriada mudam a conduta.';
      nextSteps =
        'Solicite exame de imagem: ultrassonografia como primeira escolha em crianças, gestantes e adultos magros; tomografia de abdome com contraste nos demais adultos, quando a ultrassonografia for inconclusiva.\nMantenha o paciente em observação com analgesia (a analgesia não mascara o diagnóstico) e repita o exame físico e o hemograma em 6 a 12 horas.\nEm mulheres em idade fértil, solicite beta-hCG e avalie causas ginecológicas.';
    } else if (pontos <= 8) {
      label = 'Apendicite provável';
      severity = 'alto';
      probabilidade = 'Alta';
      interpretation =
        'Probabilidade alta de apendicite aguda. Nessa faixa a avaliação cirúrgica é prioritária.';
      nextSteps =
        'Acione a equipe cirúrgica e mantenha o paciente em jejum, com hidratação e analgesia.\nNa maioria dos serviços a tomografia ainda é solicitada antes da indicação cirúrgica, para confirmar o diagnóstico e afastar diferenciais: sobretudo em mulheres em idade fértil e em idosos.\nInicie antibiótico conforme protocolo institucional quando a indicação cirúrgica for firmada.';
    } else {
      label = 'Apendicite muito provável';
      severity = 'critico';
      probabilidade = 'Muito alta';
      interpretation =
        'Probabilidade muito alta de apendicite aguda. Escores de 9 a 10 pontos, em homens adultos com quadro clínico típico, justificam indicação cirúrgica sem necessidade de imagem adicional.';
      nextSteps =
        'Avaliação cirúrgica imediata, com jejum, hidratação, analgesia e antibioticoterapia conforme protocolo.\nMesmo aqui, mantenha a imagem em mulheres em idade fértil e em pacientes com apresentação atípica, em que a taxa de apendicectomia negativa é maior.';
    }

    return {
      value: pontos,
      unit: pontos === 1 ? 'ponto' : 'pontos',
      label,
      severity,
      interpretation,
      details: [
        { label: 'Probabilidade de apendicite', value: probabilidade },
        {
          label: 'Conduta sugerida na faixa',
          value:
            pontos <= 4
              ? 'Alta com orientação e reavaliação'
              : pontos <= 6
                ? 'Imagem e observação'
                : 'Avaliação cirúrgica',
          hint: 'Faixas do artigo original de Alvarado (1986), com o ponto de corte de 5 usado na revisão sistemática de Ohle (2011)',
        },
      ],
      nextSteps,
    };
  },

  formula: `Mnemônico MANTRELS - soma dos pontos (máximo 10):

M - Migration: migração da dor para a fossa ilíaca direita - 1
A - Anorexia - 1
N - Nausea/vomiting: náusea ou vômito - 1
T - Tenderness: dor à palpação da fossa ilíaca direita - 2
R - Rebound: dor à descompressão brusca - 1
E - Elevated temperature: temperatura ≥ 37,3 °C - 1
L - Leukocytosis: leucócitos > 10.000/mm³ - 2
S - Shift: desvio à esquerda, neutrófilos > 75% - 1

Faixas:
0 a 4 - apendicite improvável
5 a 6 - probabilidade intermediária, indicar imagem
7 a 8 - apendicite provável
9 a 10 - apendicite muito provável`,

  evidence:
    'Alfredo Alvarado publicou o escore em 1986, a partir da revisão de 305 pacientes internados com dor abdominal e suspeita de apendicite aguda. Entre os oito achados que se mantiveram associados ao diagnóstico, a dor à palpação da fossa ilíaca direita e a leucocitose receberam peso 2 e os demais, peso 1. A revisão sistemática de Ohle e colaboradores (2011), que reuniu 42 estudos, mostrou que o escore é bem calibrado em homens, superestima a probabilidade de apendicite em mulheres e em crianças, e que o ponto de corte de 5 é sensível o suficiente para afastar a necessidade de internação por apendicite em todos os grupos. Por isso o uso mais defensável do escore é como filtro para excluir a doença e para selecionar quem precisa de imagem, e não como indicação isolada de cirurgia.',

  creator: {
    name: 'Alfredo Alvarado',
    bio: 'Cirurgião colombiano; publicou o escore em 1986, no Elmhurst Hospital Center, em Nova York, com o objetivo de padronizar o diagnóstico precoce da apendicite aguda.',
  },

  references: [
    {
      citation:
        'Alvarado A. A practical score for the early diagnosis of acute appendicitis. Ann Emerg Med. 1986;15(5):557-64.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/3963537/',
      primary: true,
    },
    {
      citation:
        'Ohle R, O’Reilly F, O’Brien KK, Fahey T, Dimitrov BD. The Alvarado score for predicting acute appendicitis: a systematic review. BMC Med. 2011;9:139.',
    },
    {
      citation:
        'Di Saverio S, Podda M, De Simone B, et al. Diagnosis and treatment of acute appendicitis: 2020 update of the WSES Jerusalem guidelines. World J Emerg Surg. 2020;15(1):27.',
    },
  ],
};

export default calculator;
