import type { Calculator, Field, Values } from '@/lib/types';
import { sumPoints } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'trombocitopenia',
    kind: 'choice',
    label: 'Trombocitopenia',
    hint: 'Compare a contagem atual com a maior contagem antes da exposição à heparina. Use a queda percentual e o nadir juntos.',
    layout: 'stack',
    options: [
      {
        label: 'Queda > 50% e nadir ≥ 20.000/mm³',
        value: 2,
        badge: '+2',
        hint: 'Sem cirurgia nos 3 dias anteriores, que por si só derruba as plaquetas.',
      },
      {
        label: 'Queda de 30% a 50%, ou nadir entre 10.000 e 19.000/mm³',
        value: 1,
        badge: '+1',
      },
      {
        label: 'Queda < 30%, ou nadir < 10.000/mm³',
        value: 0,
      },
    ],
  },
  {
    id: 'tempo',
    kind: 'choice',
    label: 'Tempo até a queda das plaquetas',
    hint: 'Conte a partir do primeiro dia de exposição à heparina nesta internação: inclusive lavagem de cateter, circuito de diálise e profilaxia.',
    layout: 'stack',
    options: [
      {
        label: 'Início claro entre o 5º e o 10º dia, ou queda em até 1 dia com exposição à heparina nos últimos 30 dias',
        value: 2,
        badge: '+2',
        hint: 'A queda em menos de 24 horas só vale 2 pontos quando há exposição recente documentada (HIT de início rápido).',
      },
      {
        label: 'Compatível com o 5º ao 10º dia mas sem contagens suficientes, início após o 10º dia, ou queda em até 1 dia com exposição entre 30 e 100 dias',
        value: 1,
        badge: '+1',
      },
      {
        label: 'Queda antes do 4º dia, sem exposição recente à heparina',
        value: 0,
      },
    ],
  },
  {
    id: 'trombose',
    kind: 'choice',
    label: 'Trombose ou outras sequelas',
    layout: 'stack',
    options: [
      {
        label: 'Trombose nova confirmada, necrose cutânea no local da injeção, reação sistêmica aguda após bolus de heparina intravenosa ou hemorragia adrenal',
        value: 2,
        badge: '+2',
      },
      {
        label: 'Trombose progressiva ou recorrente, lesões cutâneas eritematosas não necrosantes no local da injeção, ou trombose suspeita e ainda não confirmada',
        value: 1,
        badge: '+1',
      },
      { label: 'Nenhuma dessas manifestações', value: 0 },
    ],
  },
  {
    id: 'outras_causas',
    kind: 'choice',
    label: 'Outras causas de trombocitopenia',
    hint: 'Sepse, circulação extracorpórea, hemodiluição, medicamentos (vancomicina, linezolida, inibidores da glicoproteína IIb/IIIa), púrpura trombocitopênica imune, CIVD, quimioterapia, balão intra-aórtico.',
    layout: 'stack',
    options: [
      { label: 'Nenhuma outra causa aparente', value: 2, badge: '+2' },
      { label: 'Outra causa possível', value: 1, badge: '+1' },
      { label: 'Outra causa definida e suficiente', value: 0 },
    ],
  },
];

const calculator: Calculator = {
  slug: 'escore-4ts',
  title: 'Escore 4Ts para trombocitopenia induzida por heparina',
  shortTitle: 'Escore 4Ts (HIT)',
  subtitle:
    'Estima a probabilidade pré-teste de trombocitopenia induzida por heparina e define quem precisa de investigação laboratorial e suspensão imediata da heparina.',
  specialties: ['Hematologia', 'Terapia Intensiva', 'Clínica Médica'],
  kind: 'Escore de risco',
  keywords: [
    '4ts',
    '4 ts',
    'quatro ts',
    'HIT',
    'trombocitopenia induzida por heparina',
    'plaquetopenia',
    'heparina',
    'enoxaparina',
    'anti-PF4',
    'fator plaquetário 4',
    'argatroban',
    'fondaparinux',
  ],

  whenToUse: [
    'Pacientes que desenvolvem plaquetopenia, queda relativa das plaquetas ou trombose nova durante ou logo após exposição a heparina não fracionada ou de baixo peso molecular.',
    'Antes de solicitar o anti-PF4: a probabilidade pré-teste determina se o exame vale a pena e como interpretá-lo.',
    'Não se aplica a plaquetopenia sem qualquer exposição a heparina, nem à trombocitopenia trombótica imune induzida por vacina (VITT) ou à HIT autoimune espontânea, que têm critérios próprios.',
  ],

  whyUse:
    'O anti-PF4 por ELISA é muito sensível e pouco específico: pedido sem critério, produz resultados positivos em pacientes sem HIT e leva a trocas desnecessárias de anticoagulante, que são caras e aumentam o risco de sangramento. Com escore 4Ts baixo, o valor preditivo negativo é de 0,998 na metanálise de Cuker, e a HIT pode ser afastada sem exame.',

  pearls: [
    'Sem uma contagem de plaquetas de base, o escore não pode ser aplicado corretamente. O item de trombocitopenia depende da queda percentual em relação ao maior valor pré-heparina, e não do valor absoluto isolado.',
    'Plaquetopenia profunda, abaixo de 20.000/mm³, é atípica na HIT: o nadir mediano fica em torno de 55.000/mm³. Valores muito baixos apontam para outra causa.',
    'A HIT é uma doença protrombótica, não hemorrágica. Sangramento é incomum, e transfusão profilática de plaquetas deve ser evitada.',
    'Toda fonte de heparina conta na contagem dos dias: lavagem de cateter, circuito de hemodiálise, heparina no soro de manutenção e a profilaxia subcutânea.',
    'Trocar heparina não fracionada por heparina de baixo peso molecular não resolve: há reação cruzada. Use anticoagulante não heparínico: argatroban, fondaparinux ou um anticoagulante oral direto, conforme a disponibilidade e a gravidade.',
    'Varfarina isolada na fase aguda pode causar gangrena venosa de membro. Só inicie o antagonista da vitamina K depois que as plaquetas se recuperarem acima de 150.000/mm³, com sobreposição de pelo menos 5 dias.',
    'A concordância entre observadores é apenas moderada, sobretudo em terapia intensiva, onde quase sempre há outra causa possível de plaquetopenia. Em caso de dúvida entre duas pontuações, prefira a mais alta.',
    'Um anti-PF4 positivo isolado não fecha o diagnóstico: a densidade óptica importa, e a confirmação exige teste funcional (liberação de serotonina ou agregação plaquetária induzida por heparina).',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const pontos = sumPoints(FIELDS, values);

    let label: string;
    let severity: 'baixo' | 'moderado' | 'critico';
    let interpretation: string;
    let probabilidade: string;
    let nextSteps: string;

    if (pontos <= 3) {
      label = 'Probabilidade baixa';
      severity = 'baixo';
      probabilidade = 'Cerca de 0,2% (VPN 0,998)';
      interpretation =
        'Probabilidade pré-teste baixa de trombocitopenia induzida por heparina. Na metanálise de Cuker, com 3.068 pacientes, o valor preditivo negativo de um escore baixo foi de 0,998: praticamente exclui o diagnóstico.';
      nextSteps =
        'A HIT pode ser afastada apenas com o escore: não solicite anti-PF4 nem suspenda a heparina por essa hipótese.\nInvestigue e trate a causa alternativa da plaquetopenia: sepse, medicamentos, hemodiluição, CIVD, circulação extracorpórea.\nSe as plaquetas continuarem caindo ou surgir trombose nova, recalcule o escore: ele muda com a evolução.';
    } else if (pontos <= 5) {
      label = 'Probabilidade intermediária';
      severity = 'moderado';
      probabilidade = 'Cerca de 14%';
      interpretation =
        'Probabilidade pré-teste intermediária. Na metanálise de Cuker, o valor preditivo positivo dessa faixa foi de 0,14: a maioria dos pacientes não tem HIT, mas o diagnóstico não pode ser descartado clinicamente.';
      nextSteps =
        'Suspenda toda a heparina, inclusive lavagem de cateter e circuito de diálise, e solicite o anti-PF4.\nEnquanto aguarda o resultado, avalie iniciar anticoagulação com fármaco não heparínico em dose terapêutica, sobretudo se houver trombose ou risco trombótico alto.\nSe o anti-PF4 for positivo, confirme com teste funcional. Se for negativo com densidade óptica baixa, a HIT está praticamente excluída e a heparina pode ser retomada.';
    } else {
      label = 'Probabilidade alta';
      severity = 'critico';
      probabilidade = 'Cerca de 64%';
      interpretation =
        'Probabilidade pré-teste alta de trombocitopenia induzida por heparina. Na metanálise de Cuker, o valor preditivo positivo dessa faixa foi de 0,64. O risco de trombose nas semanas seguintes é elevado mesmo sem trombose no momento do diagnóstico.';
      nextSteps =
        'Suspenda imediatamente toda a heparina e registre a alergia no prontuário.\nInicie anticoagulação plena com fármaco não heparínico, argatroban em caso de insuficiência renal, fondaparinux ou anticoagulante oral direto no paciente estável, sem esperar o resultado do anti-PF4.\nSolicite anti-PF4 e teste funcional confirmatório, e faça rastreamento de trombose venosa profunda com ultrassonografia com Doppler de membros inferiores, mesmo sem sintomas.\nNão transfunda plaquetas de rotina e não inicie varfarina antes da recuperação plaquetária acima de 150.000/mm³.';
    }

    return {
      value: pontos,
      unit: pontos === 1 ? 'ponto' : 'pontos',
      label,
      severity,
      interpretation,
      details: [
        {
          label: 'Probabilidade de HIT',
          value: probabilidade,
          hint: 'Metanálise de 13 estudos e 3.068 pacientes (Cuker, 2012)',
        },
        {
          label: 'Conduta com a heparina',
          value: pontos <= 3 ? 'Pode ser mantida' : 'Suspender imediatamente',
        },
      ],
      nextSteps,
    };
  },

  formula: `Soma de quatro domínios, de 0 a 2 pontos cada (máximo 8).

Trombocitopenia
2 - queda > 50% e nadir ≥ 20.000/mm³
1 - queda de 30% a 50%, ou nadir de 10.000 a 19.000/mm³
0 - queda < 30%, ou nadir < 10.000/mm³

Tempo da queda
2 - início claro entre o 5º e o 10º dia, ou queda em ≤ 1 dia com heparina nos últimos 30 dias
1 - compatível com o 5º ao 10º dia mas sem contagens suficientes, início após o 10º dia, ou queda em ≤ 1 dia com exposição entre 30 e 100 dias
0 - queda antes do 4º dia sem exposição recente

Trombose ou sequelas
2 - trombose nova confirmada, necrose cutânea no local da injeção, reação sistêmica após bolus intravenoso ou hemorragia adrenal
1 - trombose progressiva ou recorrente, lesão cutânea eritematosa não necrosante, trombose apenas suspeita
0 - nenhuma

Outras causas de trombocitopenia
2 - nenhuma outra causa aparente
1 - outra causa possível
0 - outra causa definida

Interpretação: 0 a 3 = probabilidade baixa · 4 a 5 = intermediária · 6 a 8 = alta`,

  evidence:
    'O escore foi avaliado prospectivamente por Lo e colaboradores em dois cenários distintos: 100 pacientes consecutivos investigados para HIT no Hamilton General Hospital, no Canadá, e 236 pacientes cujas amostras foram enviadas ao laboratório de referência de Greifswald, na Alemanha. Nos dois centros, pacientes com escore baixo raramente tinham anticorpos clinicamente significativos: 1 de 64 (1,6%) em Hamilton e 0 de 55 em Greifswald. A metanálise de Cuker e colaboradores, com 13 estudos e 3.068 pacientes, consolidou o desempenho: 55,8% dos pacientes foram classificados como de baixa probabilidade, com valor preditivo negativo de 0,998 (IC 95% 0,970 a 1,000), estável independentemente de quem aplicou o escore, da prevalência de HIT e da composição da população. O valor preditivo positivo foi de 0,14 na faixa intermediária e de 0,64 na alta. As diretrizes da American Society of Hematology de 2018 recomendam, com base nesses dados, não solicitar exames laboratoriais nem iniciar anticoagulante não heparínico empírico nos pacientes com escore 4Ts baixo.',

  creator: {
    name: 'Theodore E. Warkentin',
    bio: 'Hematologista da McMaster University, em Hamilton, no Canadá, referência mundial em trombocitopenia induzida por heparina e autor do sistema 4Ts.',
  },

  updatedAt: '2026-07-26',

  references: [
    {
      citation:
        'Lo GK, Juhl D, Warkentin TE, Sigouin CS, Eichler P, Greinacher A. Evaluation of pretest clinical score (4 T’s) for the diagnosis of heparin-induced thrombocytopenia in two clinical settings. J Thromb Haemost. 2006;4(4):759-65.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/16634744/',
      primary: true,
    },
    {
      citation:
        'Cuker A, Gimotty PA, Crowther MA, Warkentin TE. Predictive value of the 4Ts scoring system for heparin-induced thrombocytopenia: a systematic review and meta-analysis. Blood. 2012;120(20):4160-7.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/22990018/',
    },
    {
      citation:
        'Cuker A, Arepally GM, Chong BH, et al. American Society of Hematology 2018 guidelines for management of venous thromboembolism: heparin-induced thrombocytopenia. Blood Adv. 2018;2(22):3360-92.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/30482768/',
    },
  ],
};

export default calculator;
