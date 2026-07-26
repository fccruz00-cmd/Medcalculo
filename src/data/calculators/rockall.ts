import type { Calculator, Field, Values } from '@/lib/types';
import { n } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'idade',
    kind: 'choice',
    label: 'Idade',
    options: [
      { label: 'Menos de 60 anos', value: 0 },
      { label: '60 a 79 anos', value: 1, badge: '+1' },
      { label: '80 anos ou mais', value: 2, badge: '+2' },
    ],
  },
  {
    id: 'choque',
    kind: 'choice',
    layout: 'stack',
    label: 'Choque',
    hint: 'Use os sinais vitais da chegada, antes da reposição volêmica.',
    options: [
      { label: 'Sem choque: PAS ≥ 100 mmHg e FC < 100 bpm', value: 0 },
      { label: 'Taquicardia: PAS ≥ 100 mmHg e FC ≥ 100 bpm', value: 1, badge: '+1' },
      { label: 'Hipotensão: PAS < 100 mmHg', value: 2, badge: '+2' },
    ],
  },
  {
    id: 'comorbidade',
    kind: 'choice',
    layout: 'stack',
    label: 'Comorbidade',
    hint: 'Não existe categoria de 1 ponto neste item: a pontuação salta de 0 para 2.',
    options: [
      { label: 'Nenhuma comorbidade maior', value: 0 },
      {
        label: 'Insuficiência cardíaca, doença isquêmica do coração ou outra comorbidade maior',
        value: 2,
        badge: '+2',
      },
      {
        label: 'Insuficiência renal, insuficiência hepática ou neoplasia disseminada',
        value: 3,
        badge: '+3',
      },
    ],
  },
  {
    id: 'endoscopia',
    kind: 'choice',
    label: 'Endoscopia digestiva alta já realizada?',
    hint: 'Sem endoscopia, calcula-se apenas o Rockall clínico (0 a 7 pontos), usado na triagem inicial.',
    options: [
      { label: 'Ainda não realizada', value: 'nao' },
      { label: 'Já realizada', value: 'sim' },
    ],
  },
  {
    id: 'diagnostico',
    kind: 'choice',
    layout: 'stack',
    label: 'Diagnóstico endoscópico',
    showIf: (values) => values.endoscopia === 'sim',
    options: [
      {
        label: 'Laceração de Mallory-Weiss, ou nenhuma lesão identificada e sem estigmas de sangramento recente',
        value: 0,
      },
      {
        label: 'Todos os demais diagnósticos',
        value: 1,
        badge: '+1',
        hint: 'Úlcera péptica, esofagite, gastrite erosiva, varizes, lesão de Dieulafoy',
      },
      {
        label: 'Neoplasia maligna do trato gastrointestinal alto',
        value: 2,
        badge: '+2',
      },
    ],
  },
  {
    id: 'estigmas',
    kind: 'choice',
    layout: 'stack',
    label: 'Estigmas maiores de sangramento recente',
    hint: 'Classificação de Forrest: Ia e Ib (sangramento ativo), IIa (vaso visível) e IIb (coágulo aderido) pontuam 2. IIc (mancha escura) e III (base limpa) pontuam 0.',
    showIf: (values) => values.endoscopia === 'sim',
    options: [
      { label: 'Nenhum, ou apenas mancha escura (Forrest IIc ou III)', value: 0 },
      {
        label: 'Sangue no trato digestivo alto, coágulo aderido, vaso visível ou sangramento ativo',
        value: 2,
        badge: '+2',
      },
    ],
  },
];

/**
 * Rockall clínico (pré-endoscopia, 0 a 7 pontos): mortalidade na coorte de
 * derivação e validação britânica (Rockall et al., Gut 1996).
 */
const MORTALIDADE_CLINICO: Record<number, string> = {
  0: '0,2%',
  1: '2,4%',
  2: '5,6%',
  3: '11,0%',
  4: '24,6%',
  5: '39,6%',
  6: '48,9%',
  7: '50,0%',
};

/**
 * Rockall completo (pós-endoscopia, 0 a 11 pontos): ressangramento e
 * mortalidade na mesma coorte (Rockall et al., Gut 1996).
 */
const DESFECHO_COMPLETO: Record<number, { ressangramento: string; mortalidade: string }> = {
  0: { ressangramento: '4,9%', mortalidade: '0%' },
  1: { ressangramento: '3,4%', mortalidade: '0%' },
  2: { ressangramento: '5,3%', mortalidade: '0,2%' },
  3: { ressangramento: '11,2%', mortalidade: '2,9%' },
  4: { ressangramento: '14,1%', mortalidade: '5,3%' },
  5: { ressangramento: '24,1%', mortalidade: '10,8%' },
  6: { ressangramento: '32,9%', mortalidade: '17,3%' },
  7: { ressangramento: '43,8%', mortalidade: '27,0%' },
  8: { ressangramento: '41,8%', mortalidade: '41,1%' },
};

const calculator: Calculator = {
  slug: 'rockall',
  title: 'Escore de Rockall',
  shortTitle: 'Rockall',
  subtitle:
    'Estima ressangramento e mortalidade na hemorragia digestiva alta, com uma versão clínica pré-endoscopia e uma versão completa após o exame.',
  specialties: ['Gastroenterologia', 'Emergência', 'Clínica Médica'],
  kind: 'Escore de risco',
  keywords: [
    'rockall',
    'hemorragia digestiva alta',
    'HDA',
    'ressangramento',
    'mortalidade',
    'úlcera péptica',
    'endoscopia',
    'Forrest',
    'hematêmese',
    'melena',
  ],

  whenToUse: [
    'Adultos com hemorragia digestiva alta aguda, para estimar risco de ressangramento e de óbito.',
    'Na chegada ao pronto-socorro, na versão clínica (idade, choque e comorbidade), como triagem de gravidade antes da endoscopia.',
    'Após a endoscopia digestiva alta, na versão completa, para decidir alta precoce, tempo de internação e intensidade da vigilância.',
    'Não se aplica a hemorragia digestiva baixa nem a sangramento oculto.',
    'Não foi construído para prever necessidade de intervenção antes do exame: para essa finalidade, o Glasgow-Blatchford tem desempenho melhor.',
  ],

  whyUse:
    'É o escore de referência para prognóstico após a endoscopia na hemorragia digestiva alta: incorpora o achado endoscópico, que é o dado que mais informa sobre ressangramento, e foi derivado e validado em quase 6.000 pacientes. Um Rockall completo de 2 ou menos identifica um grupo com mortalidade próxima de zero e ressangramento em torno de 5%, elegível para alta precoce.',

  pearls: [
    'Existem DUAS versões. A clínica (idade + choque + comorbidade, máximo 7) é pré-endoscópica; a completa (máximo 11) só pode ser calculada após o exame. Não misture os pontos de corte das duas: a mesma pontuação significa coisas diferentes em cada uma.',
    'O item comorbidade não tem categoria de 1 ponto: pula de 0 para 2 e depois para 3. Não é erro de digitação do artigo original.',
    'Ausência de lesão identificada pontua 0 no item diagnóstico apenas quando também não há estigmas de sangramento recente. Endoscopia "normal" com sangue no estômago não é diagnóstico de 0 ponto.',
    'Coágulo aderido conta como estigma maior (2 pontos), junto com vaso visível e sangramento ativo. Mancha escura plana (Forrest IIc) e base limpa (Forrest III) pontuam 0.',
    'O escore não inclui hemoglobina, ureia, INR nem uso de anticoagulante. Um cirrótico anticoagulado com varizes pode ter Rockall clínico baixo e mesmo assim estar sob alto risco.',
    'Na comparação internacional prospectiva de 2017, o Rockall clínico teve desempenho inferior ao Glasgow-Blatchford para identificar pacientes de risco muito baixo. Use o Blatchford para decidir alta pré-endoscopia e reserve o Rockall para o prognóstico após o exame.',
    'A mortalidade tabelada vem de uma coorte britânica dos anos 1990, anterior ao uso rotineiro de inibidor de bomba de prótons endovenoso em altas doses e às técnicas endoscópicas atuais: as taxas absolutas de hoje tendem a ser menores.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const clinico = n(values, 'idade') + n(values, 'choque') + n(values, 'comorbidade');
    const pos = values.endoscopia === 'sim';
    const completo = pos ? clinico + n(values, 'diagnostico') + n(values, 'estigmas') : clinico;

    if (!pos) {
      let label: string;
      let severity: 'baixo' | 'moderado' | 'alto' | 'critico';
      let interpretation: string;
      let nextSteps: string;

      const mortalidade = MORTALIDADE_CLINICO[clinico] ?? '50,0%';

      if (clinico === 0) {
        label = 'Rockall clínico: risco baixo';
        severity = 'baixo';
        interpretation =
          'Rockall clínico 0: paciente jovem, sem repercussão hemodinâmica e sem comorbidade maior. Mortalidade de 0,2% na coorte de derivação.';
        nextSteps =
          'Grupo de baixo risco. Programe endoscopia digestiva alta e, se o Glasgow-Blatchford também for 0 ou 1, considere manejo ambulatorial.\nRecalcule o Rockall completo assim que a endoscopia estiver disponível: é a versão que sustenta a decisão de alta precoce.';
      } else if (clinico <= 2) {
        label = 'Rockall clínico: risco intermediário';
        severity = 'moderado';
        interpretation = `Rockall clínico de ${clinico} pontos, com mortalidade de ${mortalidade} na coorte de derivação. Não permite alta antes da endoscopia.`;
        nextSteps =
          'Interne ou mantenha em observação com acesso venoso, tipagem e reserva de hemocomponentes.\nInibidor de bomba de prótons endovenoso e endoscopia digestiva alta em até 24 horas.\nRecalcule o escore completo após o exame.';
      } else if (clinico <= 4) {
        label = 'Rockall clínico: risco alto';
        severity = 'alto';
        interpretation = `Rockall clínico de ${clinico} pontos, com mortalidade de ${mortalidade} na coorte de derivação.`;
        nextSteps =
          'Internação com reanimação volêmica, correção de coagulopatia e reserva de concentrado de hemácias (meta transfusional restritiva, hemoglobina de 7 a 9 g/dL).\nEndoscopia digestiva alta em até 24 horas, após estabilização hemodinâmica.\nSe houver suspeita de sangramento varicoso, associe droga vasoativa esplâncnica e antibiótico profilático.';
      } else {
        label = 'Rockall clínico: risco muito alto';
        severity = 'critico';
        interpretation = `Rockall clínico de ${clinico} pontos, com mortalidade de ${mortalidade} na coorte de derivação: a faixa mais grave da versão pré-endoscópica.`;
        nextSteps =
          'Reanimação imediata e avaliação para leito de terapia intensiva.\nEndoscopia de urgência assim que houver estabilização mínima, com equipe de cirurgia e radiologia intervencionista cientes.\nConsidere proteção de via aérea antes do exame se houver hematêmese volumosa ou rebaixamento do nível de consciência.';
      }

      return {
        value: clinico,
        unit: clinico === 1 ? 'ponto' : 'pontos',
        label,
        severity,
        interpretation,
        details: [
          {
            label: 'Versão calculada',
            value: 'Rockall clínico (0 a 7)',
            hint: 'Idade + choque + comorbidade. Informe a endoscopia para obter o escore completo.',
          },
          {
            label: 'Mortalidade estimada',
            value: mortalidade,
            hint: 'Rockall clínico: coorte britânica de derivação e validação (Rockall, 1996)',
          },
        ],
        nextSteps,
      };
    }

    const chave = Math.min(completo, 8);
    const desfecho = DESFECHO_COMPLETO[chave] ?? DESFECHO_COMPLETO[8];

    let label: string;
    let severity: 'baixo' | 'moderado' | 'alto' | 'critico';
    let interpretation: string;
    let nextSteps: string;

    if (completo <= 2) {
      label = 'Rockall completo: risco baixo';
      severity = 'baixo';
      interpretation = `Rockall completo de ${completo} pontos. Nessa faixa, a mortalidade foi de até 0,2% e o ressangramento ficou em torno de 5% na coorte de derivação. É o grupo classicamente elegível para alta precoce.`;
      nextSteps =
        'Considere alta precoce, em 24 a 48 horas, se o achado endoscópico for de baixo risco (Forrest IIc ou III), o paciente estiver estável e houver suporte para retorno.\nInibidor de bomba de prótons oral, pesquisa e erradicação de Helicobacter pylori quando houver úlcera, e suspensão de anti-inflamatórios.\nReintroduza antiagregante e anticoagulante de forma programada, pesando risco trombótico e risco de ressangramento.';
    } else if (completo <= 4) {
      label = 'Rockall completo: risco intermediário';
      severity = 'moderado';
      interpretation = `Rockall completo de ${completo} pontos, com ressangramento de ${desfecho.ressangramento} e mortalidade de ${desfecho.mortalidade} na coorte de derivação.`;
      nextSteps =
        'Mantenha internado por 48 a 72 horas com monitorização de sinais vitais e hemoglobina seriada.\nInibidor de bomba de prótons endovenoso em infusão contínua ou em bolus de alta dose por 72 horas quando houver estigmas de alto risco tratados endoscopicamente.\nDefina previamente o plano para ressangramento: nova endoscopia como primeira linha.';
    } else if (completo <= 7) {
      label = 'Rockall completo: risco alto';
      severity = 'alto';
      interpretation = `Rockall completo de ${completo} pontos, com ressangramento de ${desfecho.ressangramento} e mortalidade de ${desfecho.mortalidade} na coorte de derivação.`;
      nextSteps =
        'Internação em unidade com monitorização contínua e avaliação de leito de terapia intensiva.\nInibidor de bomba de prótons endovenoso em alta dose por 72 horas após terapêutica endoscópica bem-sucedida.\nDiscuta previamente com cirurgia e radiologia intervencionista a conduta em caso de falha de nova endoscopia.';
    } else {
      label = 'Rockall completo: risco muito alto';
      severity = 'critico';
      interpretation = `Rockall completo de ${completo} pontos. Com 8 pontos ou mais, a mortalidade chegou a 41,1% e o ressangramento a 41,8% na coorte de derivação.`;
      nextSteps =
        'Terapia intensiva, com suporte hemodinâmico e transfusional e correção agressiva da coagulopatia.\nPlano definido para ressangramento: nova endoscopia, e em caso de falha, embolização arterial ou cirurgia sem postergar.\nDiscuta metas de cuidado com o paciente e a família, sobretudo se houver neoplasia disseminada ou insuficiência hepática avançada.';
    }

    return {
      value: completo,
      unit: completo === 1 ? 'ponto' : 'pontos',
      label,
      severity,
      interpretation,
      details: [
        {
          label: 'Versão calculada',
          value: 'Rockall completo (0 a 11)',
          hint: `Componente clínico: ${clinico} pontos · componente endoscópico: ${completo - clinico} pontos`,
        },
        {
          label: 'Ressangramento estimado',
          value: desfecho.ressangramento,
          hint: 'Coorte britânica de derivação e validação (Rockall, 1996)',
        },
        {
          label: 'Mortalidade estimada',
          value: desfecho.mortalidade,
          hint: 'Coorte britânica de derivação e validação (Rockall, 1996)',
        },
      ],
      nextSteps,
    };
  },

  formula: `COMPONENTE CLÍNICO (pré-endoscopia, 0 a 7 pontos)

Idade: < 60 anos = 0 · 60 a 79 anos = 1 · ≥ 80 anos = 2
Choque: sem choque (PAS ≥ 100 e FC < 100) = 0 · taquicardia (PAS ≥ 100 e FC ≥ 100) = 1 · hipotensão (PAS < 100) = 2
Comorbidade: nenhuma maior = 0 · insuficiência cardíaca, doença isquêmica do coração ou outra comorbidade maior = 2 · insuficiência renal, insuficiência hepática ou neoplasia disseminada = 3

COMPONENTE ENDOSCÓPICO (soma ao anterior; total de 0 a 11 pontos)

Diagnóstico: Mallory-Weiss ou nenhuma lesão e sem estigmas = 0 · todos os demais diagnósticos = 1 · neoplasia maligna do trato gastrointestinal alto = 2
Estigmas maiores de sangramento recente: nenhum ou mancha escura = 0 · sangue no trato digestivo alto, coágulo aderido, vaso visível ou sangramento ativo = 2

INTERPRETAÇÃO DO ESCORE COMPLETO
≤ 2 = risco baixo, candidato a alta precoce
3 a 4 = risco intermediário
5 a 7 = risco alto
≥ 8 = risco muito alto`,

  evidence:
    'Rockall e colaboradores derivaram o escore (Gut, 1996) em uma auditoria nacional britânica de 4.185 internações por hemorragia digestiva alta aguda em 74 hospitais, com validação prospectiva em outras 1.625 internações. A mortalidade acompanhou o escore completo de forma monotônica: 0% com 0 a 1 ponto, 2,9% com 3, 10,8% com 5, 27,0% com 7 e 41,1% com 8 ou mais, , assim como o ressangramento, de cerca de 5% nos escores baixos a mais de 40% nos mais altos. O componente clínico isolado, calculável antes da endoscopia, também estratificou mortalidade (de 0,2% com 0 ponto a cerca de 50% com 7). Validações posteriores confirmaram boa discriminação para mortalidade (AUROC em torno de 0,72 a 0,81), mas desempenho apenas modesto para prever ressangramento e claramente inferior ao do Glasgow-Blatchford para identificar pacientes de risco muito baixo antes do exame: como demonstrado no estudo internacional prospectivo de Stanley e colaboradores (BMJ, 2017) com 3.012 pacientes.',

  creator: {
    name: 'Timothy A. Rockall',
    bio: 'Cirurgião britânico que coordenou, junto ao National Audit of Acute Upper Gastrointestinal Haemorrhage, a auditoria nacional que deu origem ao escore.',
  },

  references: [
    {
      citation:
        'Rockall TA, Logan RFA, Devlin HB, Northfield TC. Risk assessment after acute upper gastrointestinal haemorrhage. Gut. 1996;38(3):316-21.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/8675081/',
      primary: true,
    },
    {
      citation:
        'Stanley AJ, Laine L, Dalton HR, et al. Comparison of risk scoring systems for patients presenting with upper gastrointestinal bleeding: international multicentre prospective study. BMJ. 2017;356:i6432.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/28053181/',
    },
    {
      citation:
        'Gralnek IM, Stanley AJ, Morris AJ, et al. Endoscopic diagnosis and management of nonvariceal upper gastrointestinal hemorrhage (NVUGIH): European Society of Gastrointestinal Endoscopy (ESGE) Guideline, Update 2021. Endoscopy. 2021;53(3):300-32.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/33567467/',
    },
    {
      citation:
        'Barkun AN, Almadi M, Kuipers EJ, et al. Management of Nonvariceal Upper Gastrointestinal Bleeding: Guideline Recommendations From the International Consensus Group. Ann Intern Med. 2019;171(11):805-22.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/31634917/',
    },
  ],
};

export default calculator;
