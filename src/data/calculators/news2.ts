import type { Calculator, Field, Values } from '@/lib/types';
import { isFieldVisible, sumPoints } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'escala',
    kind: 'choice',
    layout: 'stack',
    label: 'Qual escala de saturação usar?',
    hint: 'A escala 2 só deve ser aplicada por decisão médica registrada em prontuário, em pacientes com insuficiência respiratória hipercápnica e alvo de saturação de 88% a 92%.',
    help: 'A escala 2 existe porque, no retentor crônico de CO₂, uma saturação alta em oxigênio suplementar é sinal de perigo (risco de narcose por CO₂), e não de segurança. Fora desse contexto, use sempre a escala 1.',
    options: [
      { label: 'Escala 1: padrão', value: 'e1' },
      { label: 'Escala 2: retentor crônico de CO₂ (alvo 88% a 92%)', value: 'e2' },
    ],
  },
  {
    id: 'fr',
    kind: 'choice',
    layout: 'stack',
    label: 'Frequência respiratória',
    hint: 'Conte por um minuto completo. É o parâmetro que mais antecipa a deterioração e o mais frequentemente anotado sem medir.',
    options: [
      { label: '≤ 8 irpm', value: 3, badge: '+3' },
      { label: '9 a 11 irpm', value: 1, badge: '+1' },
      { label: '12 a 20 irpm', value: 0 },
      { label: '21 a 24 irpm', value: 2, badge: '+2' },
      { label: '≥ 25 irpm', value: 3, badge: '+3' },
    ],
  },
  {
    id: 'spo2_escala1',
    kind: 'choice',
    layout: 'stack',
    label: 'Saturação de oxigênio: escala 1',
    showIf: (values) => values.escala !== 'e2',
    options: [
      { label: '≤ 91%', value: 3, badge: '+3' },
      { label: '92% a 93%', value: 2, badge: '+2' },
      { label: '94% a 95%', value: 1, badge: '+1' },
      { label: '≥ 96%', value: 0 },
    ],
  },
  {
    id: 'spo2_escala2',
    kind: 'choice',
    layout: 'stack',
    label: 'Saturação de oxigênio: escala 2 (retentor de CO₂)',
    hint: 'Note a inversão: em oxigênio suplementar, saturação alta pontua.',
    showIf: (values) => values.escala === 'e2',
    options: [
      { label: '≤ 83%', value: 3, badge: '+3' },
      { label: '84% a 85%', value: 2, badge: '+2' },
      { label: '86% a 87%', value: 1, badge: '+1' },
      { label: '88% a 92%, ou ≥ 93% em ar ambiente', value: 0 },
      { label: '93% a 94% em oxigênio suplementar', value: 1, badge: '+1' },
      { label: '95% a 96% em oxigênio suplementar', value: 2, badge: '+2' },
      { label: '≥ 97% em oxigênio suplementar', value: 3, badge: '+3' },
    ],
  },
  {
    id: 'oxigenio',
    kind: 'choice',
    label: 'Ar ambiente ou oxigênio suplementar',
    hint: 'Qualquer oferta de oxigênio pontua 2, independentemente do fluxo ou do dispositivo.',
    options: [
      { label: 'Ar ambiente', value: 0 },
      { label: 'Oxigênio suplementar', value: 2, badge: '+2' },
    ],
  },
  {
    id: 'pas',
    kind: 'choice',
    layout: 'stack',
    label: 'Pressão arterial sistólica',
    options: [
      { label: '≤ 90 mmHg', value: 3, badge: '+3' },
      { label: '91 a 100 mmHg', value: 2, badge: '+2' },
      { label: '101 a 110 mmHg', value: 1, badge: '+1' },
      { label: '111 a 219 mmHg', value: 0 },
      { label: '≥ 220 mmHg', value: 3, badge: '+3' },
    ],
  },
  {
    id: 'fc',
    kind: 'choice',
    layout: 'stack',
    label: 'Frequência cardíaca',
    options: [
      { label: '≤ 40 bpm', value: 3, badge: '+3' },
      { label: '41 a 50 bpm', value: 1, badge: '+1' },
      { label: '51 a 90 bpm', value: 0 },
      { label: '91 a 110 bpm', value: 1, badge: '+1' },
      { label: '111 a 130 bpm', value: 2, badge: '+2' },
      { label: '≥ 131 bpm', value: 3, badge: '+3' },
    ],
  },
  {
    id: 'consciencia',
    kind: 'choice',
    layout: 'stack',
    label: 'Nível de consciência',
    hint: 'A escala AVPU do NEWS2 acrescentou o "C" de confusão: qualquer confusão nova ou delirium pontua 3, mesmo com o paciente alerta.',
    options: [
      { label: 'Alerta', value: 0 },
      {
        label: 'Confusão nova, resposta à voz, à dor ou ausente',
        value: 3,
        badge: '+3',
      },
    ],
  },
  {
    id: 'temperatura',
    kind: 'choice',
    layout: 'stack',
    label: 'Temperatura',
    options: [
      { label: '≤ 35,0 °C', value: 3, badge: '+3' },
      { label: '35,1 a 36,0 °C', value: 1, badge: '+1' },
      { label: '36,1 a 38,0 °C', value: 0 },
      { label: '38,1 a 39,0 °C', value: 1, badge: '+1' },
      { label: '≥ 39,1 °C', value: 2, badge: '+2' },
    ],
  },
];

const calculator: Calculator = {
  slug: 'news2',
  title: 'NEWS2: escore de alerta precoce',
  shortTitle: 'NEWS2',
  subtitle:
    'Detecta deterioração clínica em pacientes internados a partir de sete parâmetros de beira do leito e define o nível de resposta assistencial.',
  specialties: ['Terapia Intensiva', 'Clínica Médica'],
  kind: 'Escore de risco',
  keywords: [
    'news 2',
    'national early warning score',
    'escore de alerta precoce',
    'deterioração clínica',
    'time de resposta rápida',
    'MEWS',
    'parada cardiorrespiratória',
    'triagem de sepse',
  ],

  whenToUse: [
    'Adultos internados em enfermaria ou em observação de pronto-socorro, medido em toda checagem de sinais vitais, para detectar deterioração antes da parada cardiorrespiratória ou da admissão não planejada em UTI.',
    'Como gatilho padronizado para acionar o time de resposta rápida e definir a frequência de monitorização.',
    'Como ferramenta de triagem de sepse aceita pela Surviving Sepsis Campaign de 2021, em alternativa ao qSOFA isolado.',
    'Não se aplica a menores de 16 anos, gestantes (use escores obstétricos como o MEOWS) nem a pacientes já em terapia intensiva, onde a monitorização é contínua.',
    'Não é validado para pacientes em cuidados exclusivamente paliativos, em que o escore alto é esperado e não deve disparar escalonamento.',
  ],

  whyUse:
    'Padroniza em um único número a leitura dos sinais vitais e, principalmente, define de forma explícita o que fazer com cada faixa: frequência de monitorização e quem deve avaliar o paciente. Sua adoção nacional no NHS reduziu a variabilidade entre serviços e melhorou a detecção precoce de deterioração.',

  pearls: [
    'Três pontos em um único parâmetro já é gatilho de resposta, mesmo com total baixo. Uma frequência respiratória de 26 irpm isolada (total 3) obriga o enfermeiro registrado a comunicar a equipe médica, que revisa o paciente e decide o escalonamento: não basta a conduta da faixa de total 1 a 4, em que o próprio enfermeiro decide.',
    'O item de oxigênio suplementar pontua 2 fixos, independentemente do fluxo. Um paciente estável em cateter nasal de 1 L/min sai do zero, o que gera alarmes falsos em portadores de doença pulmonar crônica em oxigenoterapia domiciliar.',
    'A escala 2 de saturação inverte a lógica: no retentor crônico de CO₂ em oxigênio suplementar, saturação de 97% pontua 3 porque sinaliza risco de narcose. Usar a escala 2 sem indicação registrada produz escores artificialmente altos; usar a escala 1 no retentor mascara o risco.',
    'A escala de consciência do NEWS2 é ACVPU: confusão nova ou delirium pontua 3 mesmo em paciente alerta e orientado no tempo; foi a principal mudança em relação ao NEWS original.',
    'A frequência respiratória é o parâmetro mais preditivo e o mais mal medido. Anotação automática de "20 irpm" é a falha mais comum e derruba a sensibilidade do escore.',
    'O NEWS2 mede risco de deterioração, não diagnostica. Um escore baixo não autoriza ignorar preocupação da equipe, da família ou do próprio paciente: a preocupação clínica é, por si só, critério de acionamento na maioria dos protocolos.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const total = sumPoints(FIELDS, values);

    // Maior pontuação em um único parâmetro: 3 isolado já é gatilho de resposta.
    let maiorIsolado = 0;
    for (const field of FIELDS) {
      if (!isFieldVisible(field, values)) continue;
      const valor = values[field.id];
      if (typeof valor === 'number' && valor > maiorIsolado) maiorIsolado = valor;
    }
    const gatilhoIsolado = maiorIsolado >= 3;

    let label: string;
    let severity: 'baixo' | 'moderado' | 'alto' | 'critico';
    let interpretation: string;
    let nextSteps: string;
    let frequencia: string;

    if (total >= 7) {
      label = 'Risco alto';
      severity = 'critico';
      frequencia = 'Monitorização contínua dos sinais vitais';
      interpretation =
        'Faixa de risco alto (7 ou mais pontos). Exige resposta de emergência com avaliação imediata por equipe com competência em terapia intensiva.';
      nextSteps =
        'Acione imediatamente o time de resposta rápida ou a equipe de terapia intensiva, com avaliação por médico de nível sênior.\nMonitorização contínua dos sinais vitais.\nTransfira o paciente para um ambiente com capacidade de suporte avançado (nível 2 ou 3 de cuidado).';
    } else if (total >= 5) {
      label = 'Risco médio';
      severity = 'alto';
      frequencia = 'Sinais vitais no mínimo de hora em hora';
      interpretation =
        'Faixa de risco médio (5 ou 6 pontos). Este é o limiar-chave de resposta urgente do NEWS2: a maior parte das deteriorações evitáveis é detectada aqui.';
      nextSteps =
        'Avaliação urgente por médico ou por profissional com competência no manejo da doença aguda.\nSinais vitais no mínimo de hora em hora.\nDefina se o paciente precisa de cuidado de nível 1 (monitorização ampliada em enfermaria) ou de vaga em terapia intensiva.';
    } else if (gatilhoIsolado) {
      label = 'Risco baixo a médio';
      severity = 'moderado';
      frequencia = 'Sinais vitais no mínimo de hora em hora';
      interpretation =
        `Total de ${total} ponto${total === 1 ? '' : 's'}, mas com 3 pontos concentrados em um único parâmetro. O NEWS2 trata essa situação como gatilho independente: uma alteração isolada extrema pode preceder deterioração mesmo com escore total baixo.`;
      nextSteps =
        'O enfermeiro registrado deve comunicar imediatamente a equipe médica responsável, que avalia o paciente e decide sobre o escalonamento do cuidado.\nAumente a frequência de aferição para, no mínimo, de hora em hora.\nRevise especificamente o parâmetro alterado e sua causa provável.';
    } else if (total >= 1) {
      label = 'Risco baixo';
      severity = 'baixo';
      frequencia = 'Sinais vitais a cada 4 a 6 horas';
      interpretation =
        `Faixa de risco baixo (${total} ponto${total === 1 ? '' : 's'}), sem nenhum parâmetro isolado em 3 pontos.`;
      nextSteps =
        'Avaliação por enfermeiro registrado, que decide sobre a necessidade de aumentar a frequência de monitorização ou de escalonar o cuidado.\nSinais vitais a cada 4 a 6 horas.';
    } else {
      label = 'Sem alteração';
      severity = 'baixo';
      frequencia = 'Sinais vitais a cada 12 horas';
      interpretation =
        'Nenhum parâmetro alterado. Mantenha a monitorização de rotina.';
      nextSteps =
        'Monitorização de rotina, com sinais vitais no mínimo a cada 12 horas.\nReavalie sempre que a equipe, o paciente ou a família manifestarem preocupação: isso é gatilho independente do escore.';
    }

    return {
      value: total,
      unit: total === 1 ? 'ponto' : 'pontos',
      label,
      severity,
      interpretation,
      details: [
        {
          label: 'Maior pontuação isolada',
          value: `${maiorIsolado} ponto${maiorIsolado === 1 ? '' : 's'}`,
          hint: gatilhoIsolado
            ? '3 pontos em um único parâmetro já dispara resposta, independentemente do total'
            : 'Nenhum parâmetro isolado atingiu o gatilho de 3 pontos',
        },
        {
          label: 'Frequência de monitorização',
          value: frequencia,
          hint: 'Recomendação do Royal College of Physicians (NEWS2, 2017)',
        },
        {
          label: 'Escala de saturação usada',
          value: values.escala === 'e2' ? 'Escala 2 (retentor de CO₂)' : 'Escala 1 (padrão)',
        },
      ],
      nextSteps,
    };
  },

  formula: `Some os pontos dos sete parâmetros (total de 0 a 20):

FREQUÊNCIA RESPIRATÓRIA (irpm)
≤ 8 = 3 · 9-11 = 1 · 12-20 = 0 · 21-24 = 2 · ≥ 25 = 3

SATURAÇÃO - ESCALA 1 (%)
≤ 91 = 3 · 92-93 = 2 · 94-95 = 1 · ≥ 96 = 0

SATURAÇÃO - ESCALA 2 (%), só para retentor crônico de CO₂ com alvo 88-92%
≤ 83 = 3 · 84-85 = 2 · 86-87 = 1 · 88-92 ou ≥ 93 em ar ambiente = 0 ·
93-94 em O₂ = 1 · 95-96 em O₂ = 2 · ≥ 97 em O₂ = 3

AR AMBIENTE OU OXIGÊNIO
Ar ambiente = 0 · Oxigênio suplementar = 2

PRESSÃO ARTERIAL SISTÓLICA (mmHg)
≤ 90 = 3 · 91-100 = 2 · 101-110 = 1 · 111-219 = 0 · ≥ 220 = 3

FREQUÊNCIA CARDÍACA (bpm)
≤ 40 = 3 · 41-50 = 1 · 51-90 = 0 · 91-110 = 1 · 111-130 = 2 · ≥ 131 = 3

NÍVEL DE CONSCIÊNCIA (ACVPU)
Alerta = 0 · Confusão nova, voz, dor ou ausente = 3

TEMPERATURA (°C)
≤ 35,0 = 3 · 35,1-36,0 = 1 · 36,1-38,0 = 0 · 38,1-39,0 = 1 · ≥ 39,1 = 2

RESPOSTA CLÍNICA
0 - rotina, sinais vitais a cada 12 h
1 a 4 - risco baixo; sinais vitais a cada 4 a 6 h; avaliação pelo enfermeiro
3 em um único parâmetro - risco baixo a médio; sinais vitais horários; enfermeiro comunica a equipe médica, que revisa e decide o escalonamento
5 a 6 - risco médio; sinais vitais horários; avaliação urgente por médico
≥ 7 - risco alto; monitorização contínua; avaliação de emergência pela equipe de terapia intensiva`,

  evidence:
    'O National Early Warning Score foi desenvolvido pelo Royal College of Physicians do Reino Unido em 2012, para substituir as dezenas de escores locais de alerta precoce em uso no NHS. Na validação de Smith e colaboradores (Resuscitation, 2013), com 198.755 conjuntos de sinais vitais de 35.585 admissões clínicas agudas, o NEWS superou 33 outros escores de alerta precoce, com área sob a curva ROC de aproximadamente 0,87 para o desfecho combinado de parada cardiorrespiratória, admissão não planejada em UTI ou óbito em 24 horas. A revisão de 2017 criou o NEWS2, com três mudanças principais: a escala 2 de saturação para pacientes com insuficiência respiratória hipercápnica, a inclusão do "C" de confusão na escala de consciência (ACVPU) e a ênfase no reconhecimento precoce de sepse. Estudos comparativos posteriores em grandes bases hospitalares mostraram desempenho semelhante entre NEWS e NEWS2 para mortalidade hospitalar, com o ganho do NEWS2 concentrado na segurança dos pacientes retentores de CO₂ e na detecção de delirium.',

  creator: {
    name: 'Royal College of Physicians (Reino Unido)',
    bio: 'Grupo de trabalho coordenado pelo Royal College of Physicians, com participação da Royal College of Nursing e do NHS England, responsável pelo NEWS (2012) e pela revisão NEWS2 (2017).',
  },

  updatedAt: '2026-07-26',

  references: [
    {
      citation:
        'Royal College of Physicians. National Early Warning Score (NEWS) 2: Standardising the assessment of acute-illness severity in the NHS. Updated report of a working party. London: RCP; 2017.',
      url: 'https://www.rcp.ac.uk/improving-care/resources/national-early-warning-score-news-2/',
      primary: true,
    },
    {
      citation:
        'Smith GB, Prytherch DR, Meredith P, Schmidt PE, Featherstone PI. The ability of the National Early Warning Score (NEWS) to discriminate patients at risk of early cardiac arrest, unanticipated intensive care unit admission, and death. Resuscitation. 2013;84(4):465-70.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/23295778/',
    },
    {
      citation:
        'Pimentel MAF, Redfern OC, Gerry S, et al. A comparison of the ability of the National Early Warning Score and the National Early Warning Score 2 to identify patients at risk of in-hospital mortality: A multi-centre database study. Resuscitation. 2019;134:147-56.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/30287355/',
    },
    {
      citation:
        'Evans L, Rhodes A, Alhazzani W, et al. Surviving Sepsis Campaign: International Guidelines for Management of Sepsis and Septic Shock 2021. Crit Care Med. 2021;49(11):e1063-e1143.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/34605781/',
    },
  ],
};

export default calculator;
