import type { Calculator, Field, Values } from '@/lib/types';
import { sumPoints } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'cancer',
    kind: 'boolean',
    label: 'Câncer ativo',
    hint: 'Tratamento em curso, encerrado nos últimos 6 meses ou em cuidado paliativo.',
    points: 1,
  },
  {
    id: 'imobilizacao',
    kind: 'boolean',
    label: 'Paralisia, paresia ou imobilização gessada recente de membro inferior',
    hint: 'Inclui órtese rígida e gesso. Imobilização apenas por dor não conta.',
    points: 1,
  },
  {
    id: 'acamado',
    kind: 'boolean',
    label: 'Acamado por 3 dias ou mais, ou cirurgia de grande porte nas últimas 12 semanas',
    hint: 'A cirurgia precisa ter exigido anestesia geral ou regional.',
    points: 1,
  },
  {
    id: 'dorTrajeto',
    kind: 'boolean',
    label: 'Dor localizada à palpação ao longo do trajeto do sistema venoso profundo',
    hint: 'Palpação da região inguinal, do canal dos adutores, da fossa poplítea e da panturrilha.',
    points: 1,
  },
  {
    id: 'edemaTodoMembro',
    kind: 'boolean',
    label: 'Edema de todo o membro inferior',
    points: 1,
  },
  {
    id: 'panturrilha',
    kind: 'boolean',
    label: 'Panturrilha com circunferência ao menos 3 cm maior que a do lado assintomático',
    hint: 'Medida 10 cm abaixo da tuberosidade da tíbia, nos dois membros.',
    points: 1,
  },
  {
    id: 'cacifo',
    kind: 'boolean',
    label: 'Edema depressível (cacifo) restrito à perna sintomática',
    hint: 'Edema bilateral, típico de insuficiência cardíaca ou hipoalbuminemia, não pontua.',
    points: 1,
  },
  {
    id: 'colaterais',
    kind: 'boolean',
    label: 'Circulação venosa colateral superficial',
    hint: 'Veias superficiais dilatadas não varicosas, presentes só no membro sintomático.',
    points: 1,
  },
  {
    id: 'tvpPrevia',
    kind: 'boolean',
    label: 'TVP prévia documentada',
    hint: 'Item acrescentado na versão de 2003. Exige diagnóstico objetivo anterior, não apenas relato de "trombose".',
    points: 1,
  },
  {
    id: 'alternativo',
    kind: 'boolean',
    label: 'Diagnóstico alternativo tão ou mais provável que TVP',
    hint: 'Celulite, erisipela, ruptura de cisto de Baker, ruptura de fibras da panturrilha, linfedema, insuficiência venosa crônica, artrite.',
    points: -2,
  },
];

const calculator: Calculator = {
  slug: 'wells-tvp',
  title: 'Escore de Wells para trombose venosa profunda',
  shortTitle: 'Wells para TVP',
  subtitle:
    'Estima a probabilidade pré-teste de trombose venosa profunda de membro inferior e define quem pode ser investigado apenas com D-dímero.',
  specialties: ['Emergência', 'Hematologia', 'Cardiologia', 'Clínica Médica'],
  kind: 'Regra de decisão',
  popular: true,
  keywords: [
    'wells tvp',
    'wells dvt',
    'trombose venosa profunda',
    'TVP',
    'tromboembolismo venoso',
    'TEV',
    'd-dímero',
    'ultrassom com Doppler',
    'probabilidade pré-teste',
  ],

  whenToUse: [
    'Adultos ambulatoriais ou do pronto-socorro com suspeita clínica de trombose venosa profunda de membro inferior: dor, edema, empastamento ou eritema unilateral.',
    'Antes de pedir D-dímero: só na categoria "TVP improvável" um D-dímero negativo exclui o diagnóstico sem imagem.',
    'Não se aplica a suspeita de TVP de membro superior, a pacientes já anticoagulados, a gestantes e puérperas, nem a suspeita de tromboembolismo pulmonar: para o TEP use o Wells para TEP ou o Genebra revisado.',
    'Foi derivado em pacientes atendidos no pronto-socorro e em ambulatório; o desempenho em pacientes já internados é pior, porque quase todos acumulam pontos por imobilidade e cirurgia recente.',
  ],

  whyUse:
    'Sem estratificação, praticamente todo paciente com perna inchada acaba fazendo ultrassom. O Wells, combinado ao D-dímero de alta sensibilidade, exclui TVP com segurança em cerca de um terço dos suspeitos sem nenhuma imagem: na coorte de Wells (2003) o risco de tromboembolismo em 3 meses após alta com "TVP improvável" e D-dímero negativo foi de apenas 0,4%.',

  pearls: [
    'O item de −2 pontos ("diagnóstico alternativo tão ou mais provável") é o mais subjetivo e o que mais muda a categoria do paciente. Marcá-lo por hábito, diante de qualquer celulite possível, é o erro mais comum e transforma paciente de risco em "improvável".',
    'Celulite e TVP coexistem com frequência, e a celulite não é diagnóstico alternativo suficiente quando há fatores de risco fortes para trombose. Na dúvida, não marque o item.',
    'A medida da panturrilha precisa ser feita de verdade, com fita métrica, 10 cm abaixo da tuberosidade tibial nos dois membros. Estimativa a olho nu não vale como critério.',
    'Em pacientes com TVP prévia o ultrassom pode mostrar alterações residuais crônicas. Compare com exame anterior ou considere trombose recorrente quando o diâmetro venoso incompressível aumentar 2 mm ou mais em relação ao basal.',
    'D-dímero tem baixa especificidade: sobe na gravidez, no câncer, no pós-operatório, na infecção, na idade avançada e na internação prolongada. Usá-lo em paciente com "TVP provável" gera exames desnecessários sem resolver nada: nesse grupo vá direto ao ultrassom.',
    'Um ultrassom proximal negativo em paciente com "TVP provável" e D-dímero positivo não encerra a investigação: repita o exame em 5 a 7 dias, para detectar trombo distal que se estendeu.',
    'O escore não avalia gravidade nem indica anticoagulação: apenas a probabilidade de a TVP existir.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const pontos = sumPoints(FIELDS, values);

    // Versão de 3 níveis (Wells, 1997) e versão dicotomizada (Wells, 2003).
    const provavel = pontos >= 2;

    let nivel: string;
    let prevalencia: string;
    let severity: 'baixo' | 'moderado' | 'alto';

    if (pontos <= 0) {
      nivel = 'Probabilidade baixa';
      prevalencia = 'cerca de 5%';
      severity = 'baixo';
    } else if (pontos <= 2) {
      nivel = 'Probabilidade moderada';
      prevalencia = 'cerca de 17%';
      severity = 'moderado';
    } else {
      nivel = 'Probabilidade alta';
      prevalencia = 'cerca de 53%';
      severity = 'alto';
    }

    const nextSteps = provavel
      ? 'Grupo "TVP provável": solicite diretamente ultrassonografia com Doppler venoso do membro inferior. O D-dímero isolado não exclui o diagnóstico nesse grupo.\nSe o ultrassom proximal for negativo e o D-dímero positivo, repita a ultrassonografia em 5 a 7 dias ou realize exame de sistema venoso completo, incluindo as veias distais.\nSe a demora até o exame for significativa e não houver risco alto de sangramento, considere anticoagulação empírica enquanto aguarda.'
      : 'Grupo "TVP improvável": solicite D-dímero de alta sensibilidade.\nD-dímero negativo exclui TVP com segurança: nenhuma imagem é necessária e a anticoagulação não está indicada.\nD-dímero positivo obriga ultrassonografia com Doppler venoso do membro inferior.';

    return {
      value: pontos,
      unit: Math.abs(pontos) === 1 ? 'ponto' : 'pontos',
      label: `${nivel} · TVP ${provavel ? 'provável' : 'improvável'}`,
      severity,
      interpretation: `${nivel} de trombose venosa profunda: a prevalência esperada nessa faixa é de ${prevalencia} (metanálise de Wells, JAMA 2006).\nNa versão dicotomizada, usada nos algoritmos atuais, o paciente é classificado como TVP ${provavel ? 'provável (2 pontos ou mais)' : 'improvável (1 ponto ou menos)'}.`,
      details: [
        {
          label: 'Prevalência esperada de TVP',
          value: prevalencia,
          hint: 'Metanálise de 14 estudos (Wells, JAMA 2006)',
        },
        {
          label: 'Classificação dicotômica',
          value: provavel ? 'TVP provável (≥ 2 pontos)' : 'TVP improvável (≤ 1 ponto)',
          hint: 'Versão de Wells (2003), a usada nos algoritmos com D-dímero',
        },
        {
          label: 'Conduta diagnóstica',
          value: provavel ? 'Ultrassom com Doppler' : 'D-dímero de alta sensibilidade',
        },
      ],
      nextSteps,
    };
  },

  formula: `Um ponto para cada critério, exceto o último:

Câncer ativo (em tratamento, nos últimos 6 meses ou paliativo): +1
Paralisia, paresia ou imobilização gessada de membro inferior: +1
Acamado ≥ 3 dias ou cirurgia de grande porte nas últimas 12 semanas: +1
Dor localizada à palpação do trajeto venoso profundo: +1
Edema de todo o membro inferior: +1
Panturrilha ≥ 3 cm maior que a contralateral (10 cm abaixo da tuberosidade tibial): +1
Edema depressível restrito à perna sintomática: +1
Circulação colateral superficial não varicosa: +1
TVP prévia documentada: +1
Diagnóstico alternativo tão ou mais provável que TVP: −2

Interpretação em 3 níveis (Wells, 1997):
≤ 0 ponto - probabilidade baixa (~5%)
1 a 2 pontos - probabilidade moderada (~17%)
≥ 3 pontos - probabilidade alta (~53%)

Interpretação dicotomizada (Wells, 2003):
≤ 1 ponto - TVP improvável → D-dímero
≥ 2 pontos - TVP provável → ultrassom com Doppler`,

  evidence:
    'O modelo foi derivado e testado por Wells e colaboradores em 1997, em pacientes ambulatoriais com suspeita de TVP no Canadá: a prevalência de TVP foi de 3% no grupo de baixa probabilidade, 17% no de probabilidade moderada e 75% no de alta. Em 2003, o grupo publicou no New England Journal of Medicine a versão com o item de TVP prévia e a estratificação dicotomizada em "provável" e "improvável", em 1.096 pacientes: entre os classificados como improváveis com D-dímero negativo e liberados sem imagem, apenas 0,4% tiveram tromboembolismo venoso em 3 meses. A metanálise de 2006 do JAMA, reunindo 14 estudos, consolidou as prevalências de 5%, 17% e 53% para as categorias baixa, moderada e alta, usadas aqui. O ponto fraco reconhecido do escore é a reprodutibilidade do item de diagnóstico alternativo, que depende do julgamento do examinador.',

  creator: {
    name: 'Philip S. Wells',
    bio: 'Hematologista canadense, professor e chefe do Departamento de Medicina da Universidade de Ottawa, autor dos escores de probabilidade pré-teste para TVP e para tromboembolismo pulmonar.',
  },

  updatedAt: '2026-07-26',

  references: [
    {
      citation:
        'Wells PS, Anderson DR, Bormanis J, et al. Value of assessment of pretest probability of deep-vein thrombosis in clinical management. Lancet. 1997;350(9094):1795-8.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/9428249/',
      primary: true,
    },
    {
      citation:
        'Wells PS, Anderson DR, Rodger M, et al. Evaluation of D-dimer in the diagnosis of suspected deep-vein thrombosis. N Engl J Med. 2003;349(13):1227-35.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/14507948/',
    },
    {
      citation:
        'Wells PS, Owen C, Doucette S, Fergusson D, Tran H. Does this patient have deep vein thrombosis? JAMA. 2006;295(2):199-207.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/16403932/',
    },
    {
      citation:
        'Ortel TL, Neumann I, Ageno W, et al. American Society of Hematology 2020 guidelines for management of venous thromboembolism: treatment of deep vein thrombosis and pulmonary embolism. Blood Adv. 2020;4(19):4693-738.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/33007077/',
    },
  ],
};

export default calculator;
