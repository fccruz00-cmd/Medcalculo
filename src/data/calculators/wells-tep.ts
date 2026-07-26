import type { Calculator, Field, Values } from '@/lib/types';
import { num, sumPoints } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'sinaisTvp',
    kind: 'boolean',
    label: 'Sinais ou sintomas clínicos de TVP',
    hint: 'Edema de membro inferior e dor à palpação do trajeto venoso profundo: no mínimo esses dois achados.',
    points: 3,
  },
  {
    id: 'alternativoMenosProvavel',
    kind: 'boolean',
    label: 'TEP é o diagnóstico mais provável, ou tão provável quanto as alternativas',
    hint: 'Item de julgamento clínico: marque quando nenhum diagnóstico alternativo explica melhor o quadro que uma embolia pulmonar.',
    points: 3,
  },
  {
    id: 'fc',
    kind: 'boolean',
    label: 'Frequência cardíaca acima de 100 bpm',
    points: 1.5,
  },
  {
    id: 'imobilizacao',
    kind: 'boolean',
    label: 'Imobilização por 3 dias ou mais, ou cirurgia nas últimas 4 semanas',
    hint: 'Imobilização significa repouso no leito, exceto para ir ao banheiro. A cirurgia deve ter exigido anestesia geral ou regional.',
    points: 1.5,
  },
  {
    id: 'tevPrevio',
    kind: 'boolean',
    label: 'TEP ou TVP prévios documentados objetivamente',
    hint: 'Exige diagnóstico confirmado por imagem no passado, não apenas relato de "trombose".',
    points: 1.5,
  },
  {
    id: 'hemoptise',
    kind: 'boolean',
    label: 'Hemoptise',
    points: 1,
  },
  {
    id: 'cancer',
    kind: 'boolean',
    label: 'Câncer ativo',
    hint: 'Em tratamento, tratado nos últimos 6 meses ou em cuidado paliativo.',
    points: 1,
  },
];

/** Formata o escore, que pode ter meio ponto, no padrão brasileiro. */
function formatarPontos(valor: number): string {
  return Number.isInteger(valor) ? num(valor) : num(valor, 1);
}

const calculator: Calculator = {
  slug: 'wells-tep',
  title: 'Escore de Wells para tromboembolismo pulmonar',
  shortTitle: 'Wells para TEP',
  subtitle:
    'Estima a probabilidade pré-teste de embolia pulmonar e define quem pode ser investigado com D-dímero antes da angiotomografia.',
  specialties: ['Emergência', 'Pneumologia', 'Cardiologia', 'Clínica Médica'],
  kind: 'Regra de decisão',
  popular: true,
  keywords: [
    'wells tep',
    'wells pe',
    'embolia pulmonar',
    'tromboembolismo pulmonar',
    'TEP',
    'TEV',
    'd-dímero',
    'angiotomografia',
    'angio-TC de tórax',
    'probabilidade pré-teste',
  ],

  whenToUse: [
    'Adultos atendidos no pronto-socorro ou internados com suspeita de tromboembolismo pulmonar: dispneia, dor torácica pleurítica, síncope, hipoxemia ou taquicardia sem explicação.',
    'Antes de solicitar D-dímero ou angiotomografia, para decidir qual dos dois é o exame adequado para aquele paciente.',
    'Não se aplica a pacientes hemodinamicamente instáveis: na suspeita de TEP com choque ou hipotensão persistente, vá direto à angiotomografia ou ao ecocardiograma à beira do leito, sem estratificar.',
    'Não foi derivado nem validado em gestantes: na gestação use algoritmos específicos, como o YEARS adaptado à gravidez.',
  ],

  whyUse:
    'Cerca de 90% das angiotomografias pedidas por suspeita de TEP são negativas. O Wells identifica o grupo "TEP improvável", em que um D-dímero negativo encerra a investigação com segurança: no estudo Christopher, 1.028 pacientes liberados por essa via tiveram apenas 0,5% de tromboembolismo venoso em 3 meses, poupando contraste, radiação e internação.',

  pearls: [
    'Os dois itens de 3 pontos decidem quase tudo. O de "diagnóstico alternativo" é o mais subjetivo do escore, e sua má reprodutibilidade entre examinadores é a principal crítica ao Wells: foi justamente para eliminá-lo que se criou o escore de Genebra revisado.',
    'Frequência cardíaca acima de 100 bpm significa acima de 100, não 100 exato. Registre a FC da avaliação inicial, antes de analgesia, ansiolítico ou betabloqueador.',
    '"Sinais clínicos de TVP" exige achados objetivos de membro inferior, não apenas dor na panturrilha. Sem edema e dor à palpação venosa profunda, o item não pontua.',
    'D-dímero só serve nos grupos de probabilidade baixa/intermediária ou "TEP improvável". Pedir D-dímero em paciente com Wells alto é erro clássico: um resultado negativo nesse cenário não exclui TEP e apenas atrasa a angiotomografia.',
    'Use o ponto de corte de D-dímero ajustado por idade em maiores de 50 anos (idade × 10 µg/L em unidades FEU) apenas nos grupos de probabilidade não alta: isso reduz angiotomografias sem perder segurança, como demonstrou o estudo ADJUST-PE.',
    'Cuidado ao misturar versões: nesta, a original com pontuação fracionada, o corte da dicotomização é 4 pontos. No Wells simplificado (Gibson, 2008), em que todos os sete itens valem 1 ponto, o corte para "TEP provável" é 2. Aplicar o corte de uma versão à pontuação da outra reclassifica o paciente para o lado errado.',
    'Escore baixo não é sinônimo de risco zero. Em paciente com probabilidade baixa e D-dímero indisponível, os critérios PERC podem dispensar o exame; um Wells alto com angiotomografia negativa merece reavaliação, incluindo ultrassom venoso de membros inferiores.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const pontos = sumPoints(FIELDS, values);
    const texto = formatarPontos(pontos);

    // Dicotomização usada nos algoritmos com D-dímero (Wells 2001, estudo Christopher).
    const provavel = pontos > 4;

    let nivel: string;
    let prevalencia: string;
    let severity: 'baixo' | 'moderado' | 'alto';

    if (pontos < 2) {
      nivel = 'Probabilidade baixa';
      prevalencia = '1,3%';
      severity = 'baixo';
    } else if (pontos <= 6) {
      nivel = 'Probabilidade intermediária';
      prevalencia = '16,2%';
      severity = 'moderado';
    } else {
      nivel = 'Probabilidade alta';
      prevalencia = '37,5%';
      severity = 'alto';
    }

    const nextSteps = provavel
      ? 'Grupo "TEP provável": solicite angiotomografia de artérias pulmonares diretamente. O D-dímero não deve ser usado para excluir TEP nesse grupo.\nSe houver contraindicação ao contraste ou à radiação, considere cintilografia de ventilação/perfusão ou ultrassonografia venosa de membros inferiores: uma TVP proximal confirmada já justifica anticoagulação.\nSe a probabilidade for alta e o exame demorar, considere anticoagulação empírica enquanto aguarda, desde que o risco de sangramento seja aceitável.'
      : 'Grupo "TEP improvável": solicite D-dímero de alta sensibilidade, com ponto de corte ajustado por idade em maiores de 50 anos.\nD-dímero negativo exclui TEP: o paciente pode receber alta sem angiotomografia e sem anticoagulação.\nD-dímero positivo indica angiotomografia de artérias pulmonares.';

    return {
      value: texto,
      unit: pontos === 1 ? 'ponto' : 'pontos',
      label: `${nivel} · TEP ${provavel ? 'provável' : 'improvável'}`,
      severity,
      interpretation: `${nivel} de tromboembolismo pulmonar. Na coorte de validação de Wells (2001), a prevalência de TEP nessa faixa foi de ${prevalencia}.\nNa versão dicotomizada, usada nos algoritmos com D-dímero, o paciente é classificado como TEP ${provavel ? 'provável (mais de 4 pontos)' : 'improvável (4 pontos ou menos)'}, é essa leitura que orienta a conduta sugerida abaixo.`,
      details: [
        {
          label: 'Prevalência esperada de TEP',
          value: prevalencia,
          hint: 'Coorte de validação de Wells (Ann Intern Med, 2001)',
        },
        {
          label: 'Classificação dicotômica',
          value: provavel ? 'TEP provável (> 4 pontos)' : 'TEP improvável (≤ 4 pontos)',
        },
        {
          label: 'Exame indicado',
          value: provavel ? 'Angiotomografia de tórax' : 'D-dímero de alta sensibilidade',
        },
      ],
      nextSteps,
    };
  },

  formula: `Soma dos pontos (máximo 12,5):

Sinais ou sintomas clínicos de TVP: 3
TEP é o diagnóstico mais provável ou tão provável quanto as alternativas: 3
Frequência cardíaca > 100 bpm: 1,5
Imobilização ≥ 3 dias ou cirurgia nas últimas 4 semanas: 1,5
TEP ou TVP prévios: 1,5
Hemoptise: 1
Câncer ativo: 1

Interpretação em 3 níveis:
< 2 pontos - probabilidade baixa (1,3%)
2 a 6 pontos - probabilidade intermediária (16,2%)
> 6 pontos - probabilidade alta (37,5%)

Interpretação dicotomizada:
≤ 4 pontos - TEP improvável → D-dímero
> 4 pontos - TEP provável → angiotomografia`,

  evidence:
    'O modelo foi construído por Wells e colaboradores a partir de coortes canadenses de pacientes com suspeita de TEP e publicado em sua forma simplificada em 2000, no Thrombosis and Haemostasis. Foi testado prospectivamente em 2001, no estudo do Annals of Internal Medicine com 930 pacientes de pronto-socorro: a prevalência de TEP foi de 1,3% na categoria de baixa probabilidade, 16,2% na intermediária e 37,5% na alta. Em 2006, o estudo Christopher aplicou a versão dicotomizada em 3.306 pacientes: entre os classificados como "TEP improvável" com D-dímero negativo, a incidência de tromboembolismo venoso em 3 meses foi de 0,5%, comprovando que a combinação permite alta sem imagem. As diretrizes da Sociedade Europeia de Cardiologia de 2019 recomendam explicitamente essa estratégia, com Wells ou Genebra revisado seguido de D-dímero, e reservam a angiotomografia imediata para os pacientes de alta probabilidade e para os instáveis.',

  creator: {
    name: 'Philip S. Wells',
    bio: 'Hematologista canadense, professor e chefe do Departamento de Medicina da Universidade de Ottawa, autor dos escores de probabilidade pré-teste para TVP e para tromboembolismo pulmonar.',
  },

  references: [
    {
      citation:
        'Wells PS, Anderson DR, Rodger M, et al. Derivation of a simple clinical model to categorize patients probability of pulmonary embolism: increasing the models utility with the SimpliRED D-dimer. Thromb Haemost. 2000;83(3):416-20.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/10744147/',
      primary: true,
    },
    {
      citation:
        'Wells PS, Anderson DR, Rodger M, et al. Excluding pulmonary embolism at the bedside without diagnostic imaging: management of patients with suspected pulmonary embolism presenting to the emergency department by using a simple clinical model and D-dimer. Ann Intern Med. 2001;135(2):98-107.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/11453709/',
    },
    {
      citation:
        'van Belle A, Büller HR, Huisman MV, et al. Effectiveness of managing suspected pulmonary embolism using an algorithm combining clinical probability, D-dimer testing, and computed tomography. JAMA. 2006;295(2):172-9.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/16403929/',
    },
    {
      citation:
        'Righini M, Van Es J, Den Exter PL, et al. Age-adjusted D-dimer cutoff levels to rule out pulmonary embolism: the ADJUST-PE study. JAMA. 2014;311(11):1117-24.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/24643601/',
    },
    {
      citation:
        'Konstantinides SV, Meyer G, Becattini C, et al. 2019 ESC Guidelines for the diagnosis and management of acute pulmonary embolism developed in collaboration with the European Respiratory Society (ERS). Eur Heart J. 2020;41(4):543-603.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/31504429/',
    },
  ],
};

export default calculator;
