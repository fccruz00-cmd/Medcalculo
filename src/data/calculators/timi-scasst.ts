import type { Calculator, Field, Values } from '@/lib/types';
import { sumPoints } from '@/lib/utils';

/**
 * Desfecho composto em 14 dias (%): morte por qualquer causa, infarto novo ou
 * recorrente, ou isquemia recorrente grave com necessidade de revascularização
 * urgente. Coorte de derivação TIMI 11B / ESSENCE (Antman et al., 2000).
 */
const DESFECHO_14D: Record<number, number> = {
  0: 4.7,
  1: 4.7,
  2: 8.3,
  3: 13.2,
  4: 19.9,
  5: 26.2,
  6: 40.9,
  7: 40.9,
};

const FIELDS: Field[] = [
  {
    id: 'idade',
    kind: 'boolean',
    label: 'Idade ≥ 65 anos',
    points: 1,
  },
  {
    id: 'fatores',
    kind: 'boolean',
    label: 'Três ou mais fatores de risco para doença coronariana',
    hint: 'Conte: história familiar de doença coronariana, hipertensão, dislipidemia, diabetes e tabagismo atual.',
    points: 1,
  },
  {
    id: 'dac',
    kind: 'boolean',
    label: 'Doença coronariana conhecida (estenose ≥ 50%)',
    hint: 'Documentada em cateterismo ou angiotomografia prévia. Vale mesmo que o exame seja antigo.',
    points: 1,
  },
  {
    id: 'aas',
    kind: 'boolean',
    label: 'Uso de AAS nos últimos 7 dias',
    hint: 'Ter apresentado o quadro apesar do AAS indica doença mais avançada ou resistente: por isso o item pontua.',
    points: 1,
  },
  {
    id: 'angina',
    kind: 'boolean',
    label: 'Angina grave recente',
    hint: 'Dois ou mais episódios de angina em repouso nas últimas 24 horas.',
    points: 1,
  },
  {
    id: 'st',
    kind: 'boolean',
    label: 'Desvio do segmento ST ≥ 0,5 mm',
    hint: 'Infradesnivelamento ≥ 0,5 mm, ou supradesnivelamento transitório (< 20 minutos). Supra persistente configura IAM com supra, situação em que este escore não se aplica.',
    points: 1,
  },
  {
    id: 'marcadores',
    kind: 'boolean',
    label: 'Marcadores de necrose miocárdica elevados',
    hint: 'Troponina acima do percentil 99 do ensaio local (no estudo original usou-se CK-MB ou troponina).',
    points: 1,
  },
];

const calculator: Calculator = {
  slug: 'timi-scasst',
  title: 'Escore TIMI para síndrome coronariana aguda sem supra de ST',
  shortTitle: 'TIMI (SCA sem supra)',
  subtitle:
    'Estima o risco de morte, infarto ou isquemia recorrente com necessidade de revascularização urgente em 14 dias na angina instável e no IAM sem supradesnivelamento de ST.',
  specialties: ['Cardiologia', 'Emergência', 'Clínica Médica'],
  kind: 'Escore de risco',
  popular: true,
  keywords: [
    'timi',
    'angina instável',
    'IAMSSST',
    'IAM sem supra',
    'NSTEMI',
    'síndrome coronariana aguda',
    'SCA',
    'risco',
  ],

  whenToUse: [
    'Pacientes com angina instável ou infarto sem supradesnivelamento de ST já caracterizados: dor isquêmica em repouso nas últimas 24 horas associada a alteração de ST, elevação de marcadores ou doença coronariana conhecida.',
    'Para decidir entre estratégia invasiva precoce e estratégia conservadora guiada por isquemia, e para escolher terapia antitrombótica mais intensa.',
    'Não se aplica ao IAM com supradesnivelamento persistente de ST (para esse cenário existe o TIMI específico do IAM com supra) nem à dor torácica indiferenciada no pronto-socorro: nesse caso, use o HEART Score.',
  ],

  whyUse:
    'É um escore de sete itens de igual peso, calculável à beira do leito em menos de um minuto, cujo gradiente de risco vai de 4,7% a 40,9% em 14 dias. Além de prognóstico, orienta terapia: nos estudos de derivação, os pacientes com 3 pontos ou mais foram justamente os que obtiveram benefício com enoxaparina, inibidores da glicoproteína IIb/IIIa e estratégia invasiva precoce.',

  pearls: [
    'O item do AAS é contraintuitivo e frequentemente esquecido: usar AAS nos últimos 7 dias SOMA um ponto, porque o evento ocorreu apesar da antiagregação.',
    'O desfecho é composto e inclui revascularização urgente, que responde por boa parte dos eventos nas faixas intermediárias. Não leia o percentual como risco de morte.',
    'O escore foi derivado em ensaios clínicos, com critérios de inclusão restritivos: pacientes muito idosos, com insuficiência renal avançada ou com comorbidades graves estavam sub-representados. Nessas populações ele subestima o risco.',
    'Todos os itens valem 1 ponto, o que é a principal limitação: elevação de troponina e desvio de ST pesam clinicamente muito mais que os demais. Um escore 2 formado por troponina positiva e infra de ST é bem mais grave que um escore 2 formado por idade e fatores de risco.',
    'Para prognóstico intra-hospitalar e em 6 meses, o escore GRACE tem melhor discriminação e é o preferido pelas diretrizes brasileiras e europeias para definir o momento do cateterismo. O TIMI é mais rápido; o GRACE é mais preciso.',
    'Marcadores elevados no artigo original incluíam CK-MB. Com troponina ultrassensível, mais pacientes pontuam nesse item do que na coorte de derivação, o que tende a deslocar a distribuição de escores para cima.',
    'Supradesnivelamento persistente de ST não é "desvio de ST" para fins deste escore: é indicação de reperfusão imediata.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const pontos = sumPoints(FIELDS, values);
    const risco = DESFECHO_14D[pontos] ?? 40.9;

    let label: string;
    let severity: 'baixo' | 'moderado' | 'alto' | 'critico';
    let interpretation: string;
    let nextSteps: string;

    if (pontos <= 2) {
      label = 'Risco baixo';
      severity = 'baixo';
      interpretation =
        'Risco baixo de morte, infarto ou revascularização urgente em 14 dias. Ainda assim, trata-se de uma síndrome coronariana aguda: o paciente precisa de monitorização e de terapia antitrombótica.';
      nextSteps =
        'Estratégia inicialmente conservadora, guiada por isquemia, é aceitável: AAS, anticoagulação, betabloqueador e estatina de alta potência, com troponina seriada e monitorização eletrocardiográfica.\nProgramar teste não invasivo ou angiotomografia antes da alta.\nQualquer recorrência de dor, alteração dinâmica de ST ou elevação de troponina muda a estratégia para invasiva.';
    } else if (pontos <= 4) {
      label = 'Risco intermediário';
      severity = 'moderado';
      interpretation =
        'Risco intermediário. A partir de 3 pontos, os estudos de derivação mostraram benefício consistente da terapia antitrombótica mais intensa e da estratégia invasiva.';
      nextSteps =
        'Internação em leito monitorizado, dupla antiagregação e anticoagulação plena conforme protocolo.\nEstratégia invasiva com cateterismo em até 24 a 72 horas.\nCalcule também o GRACE e o CRUSADE (risco de sangramento) antes de definir o momento do cateterismo e a intensidade da antitrombose.';
    } else if (pontos <= 6) {
      label = 'Risco alto';
      severity = 'alto';
      interpretation =
        'Risco alto de desfecho adverso em 14 dias. Essa faixa concentra os pacientes com maior benefício absoluto da revascularização precoce.';
      nextSteps =
        'Internação em unidade coronariana, dupla antiagregação e anticoagulação plena.\nCateterismo em até 24 horas, ou imediato se houver dor refratária, instabilidade hemodinâmica ou elétrica, ou alterações dinâmicas de ST.\nAvalie o risco de sangramento (CRUSADE) para escolher a via de acesso e o esquema antitrombótico.';
    } else {
      label = 'Risco muito alto';
      severity = 'critico';
      interpretation =
        'Risco muito alto: cerca de 4 em cada 10 pacientes com 6 ou 7 pontos apresentaram morte, infarto ou revascularização urgente em 14 dias na coorte de derivação.';
      nextSteps =
        'Internação em unidade coronariana com estratégia invasiva precoce, idealmente em até 24 horas, e imediata na presença de instabilidade.\nOtimize terapia antitrombótica e anti-isquêmica e antecipe complicações mecânicas e elétricas.';
    }

    return {
      value: pontos,
      unit: pontos === 1 ? 'ponto' : 'pontos',
      label,
      severity,
      interpretation,
      details: [
        {
          label: 'Morte, IAM ou revascularização urgente em 14 dias',
          value: `${risco.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`,
          hint: 'Coorte de derivação TIMI 11B / ESSENCE (Antman, 2000)',
        },
        {
          label: 'Estratégia sugerida',
          value: pontos <= 2 ? 'Conservadora guiada por isquemia' : 'Invasiva',
        },
      ],
      nextSteps,
    };
  },

  formula: `Um ponto para cada critério presente (máximo 7):

Idade ≥ 65 anos
≥ 3 fatores de risco para doença coronariana
Doença coronariana conhecida (estenose ≥ 50%)
Uso de AAS nos últimos 7 dias
Angina grave recente (≥ 2 episódios em 24 h)
Desvio do segmento ST ≥ 0,5 mm
Marcadores de necrose miocárdica elevados

Desfecho composto em 14 dias (morte, IAM ou revascularização urgente):
0 a 1 ponto - 4,7% · 2 - 8,3% · 3 - 13,2% · 4 - 19,9% · 5 - 26,2% · 6 a 7 - 40,9%`,

  evidence:
    'O escore foi derivado por Antman e colaboradores em 2000, no grupo tratado com heparina não fracionada do estudo TIMI 11B (1.957 pacientes), e validado em outras três coortes: o grupo enoxaparina do próprio TIMI 11B e os dois grupos do estudo ESSENCE. O desfecho composto em 14 dias, morte por qualquer causa, infarto novo ou recorrente e isquemia recorrente grave com revascularização urgente, subiu progressivamente de 4,7% com 0 a 1 ponto para 40,9% com 6 a 7 pontos (p < 0,001 para tendência), com desempenho semelhante nas quatro coortes. O escore também mostrou interação com o tratamento: o benefício da enoxaparina em relação à heparina não fracionada foi maior nos pacientes com escore mais alto, achado depois reproduzido para inibidores da glicoproteína IIb/IIIa e para a estratégia invasiva precoce no estudo TACTICS-TIMI 18.',

  creator: {
    name: 'Elliott M. Antman',
    bio: 'Cardiologista do Brigham and Women’s Hospital e professor da Harvard Medical School, membro do grupo TIMI (Thrombolysis in Myocardial Infarction).',
  },

  updatedAt: '2026-07-26',

  references: [
    {
      citation:
        'Antman EM, Cohen M, Bernink PJLM, et al. The TIMI risk score for unstable angina/non-ST elevation MI: a method for prognostication and therapeutic decision making. JAMA. 2000;284(7):835-42.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/10938172/',
      primary: true,
    },
    {
      citation:
        'Cannon CP, Weintraub WS, Demopoulos LA, et al. Comparison of early invasive and conservative strategies in patients with unstable coronary syndromes treated with the glycoprotein IIb/IIIa inhibitor tirofiban (TACTICS-TIMI 18). N Engl J Med. 2001;344(25):1879-87.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/11419424/',
    },
    {
      citation:
        'Nicolau JC, Feitosa Filho GS, Petriz JL, et al. Diretrizes da Sociedade Brasileira de Cardiologia sobre Angina Instável e Infarto Agudo do Miocárdio sem Supradesnível do Segmento ST: 2021. Arq Bras Cardiol. 2021;117(1):181-264.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/34320090/',
    },
  ],
};

export default calculator;
