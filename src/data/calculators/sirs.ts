import type { Calculator, Field, Values } from '@/lib/types';
import { sumPoints } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'temperatura',
    kind: 'boolean',
    label: 'Temperatura > 38 °C ou < 36 °C',
    hint: 'Prefira a temperatura central (esofágica, vesical ou retal). A axilar subestima em cerca de 0,5 °C e pode mascarar a febre.',
    points: 1,
  },
  {
    id: 'fc',
    kind: 'boolean',
    label: 'Frequência cardíaca > 90 bpm',
    hint: 'Betabloqueador, marca-passo e fibrilação atrial com resposta controlada podem impedir a taquicardia esperada.',
    points: 1,
  },
  {
    id: 'respiratorio',
    kind: 'boolean',
    label: 'Frequência respiratória > 20 irpm ou PaCO₂ < 32 mmHg',
    hint: 'Basta um dos dois. A PaCO₂ baixa capta a hiperventilação compensatória mesmo quando a frequência foi anotada de forma imprecisa.',
    points: 1,
  },
  {
    id: 'leucocitos',
    kind: 'boolean',
    label: 'Leucócitos > 12.000/mm³, < 4.000/mm³ ou bastões > 10%',
    hint: 'O desvio à esquerda acima de 10% de formas jovens conta mesmo com leucometria global normal.',
    points: 1,
  },
  {
    id: 'infeccao',
    kind: 'choice',
    label: 'Há infecção suspeita ou confirmada?',
    hint: 'Pelas definições de 1992, SIRS somado a infecção caracterizava sepse. Sem infecção, o quadro é SIRS de causa não infecciosa.',
    options: [
      { label: 'Sim', value: 'sim' },
      { label: 'Não', value: 'nao' },
      { label: 'Indeterminado', value: 'indeterminado' },
    ],
  },
];

const calculator: Calculator = {
  slug: 'sirs',
  title: 'Critérios de SIRS: síndrome da resposta inflamatória sistêmica',
  shortTitle: 'SIRS',
  subtitle:
    'Identifica resposta inflamatória sistêmica por quatro critérios à beira do leito; dois ou mais caracterizam SIRS.',
  specialties: ['Terapia Intensiva', 'Emergência'],
  kind: 'Critérios diagnósticos',
  keywords: [
    'sirs',
    'resposta inflamatória sistêmica',
    'sepse',
    'sepsis',
    'bone',
    'accp sccm',
    'triagem de sepse',
    'rastreio',
  ],

  whenToUse: [
    'Como rastreio sensível de possível infecção grave em adultos no pronto-socorro, na enfermaria e na admissão em terapia intensiva: a Surviving Sepsis Campaign de 2021 mantém o SIRS entre as ferramentas aceitáveis de triagem, ao contrário do qSOFA isolado.',
    'Para descrever resposta inflamatória sistêmica de causa não infecciosa: pancreatite aguda, politrauma, grandes queimados, pós-operatório de grande porte, circulação extracorpórea, isquemia mesentérica e reações medicamentosas.',
    'Não é mais critério diagnóstico de sepse. Desde o Sepsis-3 (2016), sepse é infecção suspeita somada a disfunção orgânica aguda medida pelo SOFA.',
    'Baixa especificidade em pós-operatório imediato, uso de aminas, dor, ansiedade e abstinência: situações que produzem taquicardia e taquipneia sem infecção.',
  ],

  whyUse:
    'É a ferramenta de triagem mais sensível entre as de beira do leito e não depende de exames complexos. Justamente por ser sensível e pouco específica, funciona bem como gatilho para investigar, e mal como critério para definir diagnóstico ou prognóstico.',

  pearls: [
    'SIRS não é sinônimo de sepse nem de infecção. Cerca de metade dos pacientes internados em enfermaria preenche dois critérios em algum momento, a maioria sem infecção alguma.',
    'O erro inverso é mais perigoso: o estudo de Kaukonen (NEJM, 2015), com mais de 100 mil pacientes de UTI com infecção e disfunção orgânica, mostrou que 1 em cada 8 NÃO preenchia dois critérios de SIRS, e esses pacientes também morriam. SIRS negativo não afasta sepse.',
    'Idosos, imunossuprimidos, cirróticos, urêmicos e pacientes em uso de betabloqueador ou corticoide frequentemente não montam febre nem taquicardia. Nesses grupos, a sensibilidade despenca.',
    'Não existe gradiente prognóstico útil entre 2, 3 e 4 critérios: o número de critérios preenchidos acrescenta pouco à predição de mortalidade, o que motivou o abandono do SIRS como definição de sepse.',
    'A leucopenia (< 4.000/mm³) pontua tanto quanto a leucocitose e costuma indicar quadro mais grave, não mais leve.',
    'O critério respiratório aceita PaCO₂ < 32 mmHg como alternativa à taquipneia: útil quando a frequência respiratória foi anotada como "20" por hábito, o que é frequente em prontuário.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const criterios = sumPoints(FIELDS, values);
    const comInfeccao = values.infeccao === 'sim';
    const semInfeccao = values.infeccao === 'nao';
    const positivo = criterios >= 2;

    let label: string;
    let severity: 'baixo' | 'moderado' | 'alto';
    let interpretation: string;
    let nextSteps: string;

    if (!positivo) {
      label = 'SIRS ausente';
      severity = 'baixo';
      interpretation =
        'Menos de dois critérios preenchidos: não caracteriza SIRS.\nAtenção: isso não exclui infecção grave. Em coortes de pacientes de UTI com infecção e disfunção orgânica, cerca de 12% não preenchiam dois critérios de SIRS, com mortalidade ainda substancial, na série de Kaukonen, entre 9% e 28% conforme o ano, contra 18% a 36% nos SIRS-positivos, e sem qualquer degrau de risco no corte de dois critérios.';
      nextSteps =
        'Se a suspeita clínica de infecção persistir, siga a investigação: lactato, hemograma, função renal e hepática, imagem do foco e cálculo do SOFA.\nReavalie os sinais vitais periodicamente: os critérios podem positivar em poucas horas.';
    } else if (comInfeccao) {
      label = 'SIRS presente com infecção';
      severity = 'alto';
      interpretation =
        `${criterios} de 4 critérios preenchidos, na vigência de infecção suspeita ou confirmada.\nPela definição de 1992 esse quadro era chamado de sepse. Pela definição atual (Sepsis-3), o diagnóstico de sepse depende de disfunção orgânica aguda: infecção somada a aumento de 2 ou mais pontos no SOFA em relação ao basal.`;
      nextSteps =
        'Acione o protocolo institucional de sepse: lactato arterial, duas hemoculturas e culturas do foco antes do antimicrobiano, sem atrasar a primeira dose além de uma hora quando houver sinais de gravidade.\nCalcule o SOFA para verificar se há disfunção orgânica e, portanto, sepse pelo Sepsis-3.\nSe houver hipotensão ou lactato acima de 2 mmol/L, inicie cristaloide 30 mL/kg e reavalie a perfusão.';
    } else {
      label = 'SIRS presente';
      severity = 'moderado';
      interpretation =
        `${criterios} de 4 critérios preenchidos, o que caracteriza síndrome da resposta inflamatória sistêmica.\nA especificidade é baixa: pancreatite, trauma, queimadura, pós-operatório, tromboembolismo, hemorragia e até dor e ansiedade produzem o mesmo padrão. O achado obriga a procurar a causa, não a assumir infecção.`;
      nextSteps =
        'Procure ativamente um foco infeccioso e, em paralelo, as causas não infecciosas de SIRS.\nSolicite lactato e exames de função orgânica; calcule o SOFA se houver qualquer sinal de disfunção.\nSe a suspeita de infecção bacteriana for razoável e houver sinais de gravidade, não retarde o antimicrobiano enquanto investiga.';
    }

    if (semInfeccao && positivo) {
      interpretation += '\nSem infecção identificada, o quadro corresponde a SIRS de causa não infecciosa: investigue pancreatite, trauma, isquemia, tromboembolismo, grandes queimaduras e reação medicamentosa.';
    }

    return {
      value: criterios,
      unit: criterios === 1 ? 'critério' : 'critérios',
      label,
      severity,
      interpretation,
      details: [
        {
          label: 'SIRS (≥ 2 critérios)',
          value: positivo ? 'Presente' : 'Ausente',
        },
        {
          label: 'Terminologia de 1992',
          value: positivo && comInfeccao ? 'Sepse (definição antiga)' : positivo ? 'SIRS não infeccioso' : 'Não se aplica',
          hint: 'Conferência de consenso ACCP/SCCM de 1992, substituída pelo Sepsis-3 em 2016',
        },
        {
          label: 'Próximo passo diagnóstico',
          value: 'Calcular SOFA',
          hint: 'Sepse pelo Sepsis-3 = infecção suspeita + aumento agudo ≥ 2 pontos no SOFA',
        },
      ],
      nextSteps,
    };
  },

  formula: `Dois ou mais dos quatro critérios caracterizam SIRS:

Temperatura > 38 °C ou < 36 °C
Frequência cardíaca > 90 bpm
Frequência respiratória > 20 irpm ou PaCO₂ < 32 mmHg
Leucócitos > 12.000/mm³, < 4.000/mm³ ou > 10% de formas jovens (bastões)

Terminologia de 1992 (ACCP/SCCM), hoje superada:
SIRS + infecção = sepse
Sepse + disfunção orgânica = sepse grave
Sepse + hipotensão refratária a volume = choque séptico

Terminologia atual (Sepsis-3, 2016):
Sepse = infecção suspeita + aumento agudo ≥ 2 pontos no SOFA
Choque séptico = sepse + vasopressor para PAM ≥ 65 mmHg + lactato > 2 mmol/L apesar de reposição volêmica adequada`,

  evidence:
    'Os critérios de SIRS foram definidos na conferência de consenso do American College of Chest Physicians e da Society of Critical Care Medicine de 1991, publicada por Bone e colaboradores em 1992, com o objetivo de padronizar a inclusão de pacientes em ensaios clínicos de sepse. A conferência de 2001 (Levy e colaboradores) reconheceu a baixa especificidade dos critérios e ampliou a lista de sinais de alerta, mas manteve a estrutura. A crítica decisiva veio de Kaukonen e colaboradores no New England Journal of Medicine em 2015: em 109.663 pacientes australianos e neozelandeses admitidos em UTI com infecção e disfunção orgânica ao longo de 14 anos, 12,1% não preenchiam dois critérios de SIRS, e a mortalidade desses pacientes seguia a mesma curva de aumento por critério adicional, sem qualquer degrau no ponto de corte de 2: indicando que o limiar era arbitrário. Esse achado sustentou o abandono do SIRS como definição de sepse no Sepsis-3. Ainda assim, a Surviving Sepsis Campaign de 2021 mantém o SIRS, o NEWS e o MEWS como ferramentas de triagem aceitáveis, recomendando contra o uso do qSOFA isolado.',

  creator: {
    name: 'Roger C. Bone',
    bio: 'Pneumologista e intensivista norte-americano, presidente da conferência de consenso ACCP/SCCM de 1991 que criou os conceitos de SIRS, sepse e choque séptico.',
  },

  updatedAt: '2026-07-26',

  references: [
    {
      citation:
        'Bone RC, Balk RA, Cerra FB, et al. Definitions for sepsis and organ failure and guidelines for the use of innovative therapies in sepsis. The ACCP/SCCM Consensus Conference Committee. American College of Chest Physicians/Society of Critical Care Medicine. Chest. 1992;101(6):1644-55.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/1303622/',
      primary: true,
    },
    {
      citation:
        'Levy MM, Fink MP, Marshall JC, et al. 2001 SCCM/ESICM/ACCP/ATS/SIS International Sepsis Definitions Conference. Crit Care Med. 2003;31(4):1250-6.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/12682500/',
    },
    {
      citation:
        'Kaukonen KM, Bailey M, Pilcher D, Cooper DJ, Bellomo R. Systemic inflammatory response syndrome criteria in defining severe sepsis. N Engl J Med. 2015;372(17):1629-38.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/25776936/',
    },
    {
      citation:
        'Evans L, Rhodes A, Alhazzani W, et al. Surviving Sepsis Campaign: International Guidelines for Management of Sepsis and Septic Shock 2021. Crit Care Med. 2021;49(11):e1063-e1143.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/34605781/',
    },
  ],
};

export default calculator;
