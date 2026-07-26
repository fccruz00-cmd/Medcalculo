import type { Calculator, Field, Values } from '@/lib/types';
import { n, sumPoints } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'estridor',
    kind: 'choice',
    label: 'Estridor inspiratório',
    hint: 'Avalie a criança calma, no colo do cuidador. Estridor em repouso é o divisor de águas entre crupe leve e moderado.',
    layout: 'stack',
    options: [
      { label: 'Ausente', value: 0 },
      { label: 'Presente apenas quando agitada ou chorando', value: 1, badge: '+1' },
      { label: 'Presente em repouso', value: 2, badge: '+2' },
    ],
  },
  {
    id: 'retracao',
    kind: 'choice',
    label: 'Retração (tiragem)',
    hint: 'Tiragem intercostal, subcostal, de fúrcula e batimento de asa de nariz.',
    layout: 'stack',
    options: [
      { label: 'Ausente', value: 0 },
      { label: 'Leve', value: 1, badge: '+1' },
      { label: 'Moderada', value: 2, badge: '+2' },
      { label: 'Grave (uso intenso da musculatura acessória)', value: 3, badge: '+3' },
    ],
  },
  {
    id: 'entradaAr',
    kind: 'choice',
    label: 'Entrada de ar',
    hint: 'Murmúrio vesicular à ausculta das bases e dos ápices.',
    layout: 'stack',
    options: [
      { label: 'Normal', value: 0 },
      { label: 'Diminuída', value: 1, badge: '+1' },
      { label: 'Muito diminuída', value: 2, badge: '+2' },
    ],
  },
  {
    id: 'cianose',
    kind: 'choice',
    label: 'Cianose',
    hint: 'Cianose central. Qualquer cianose já classifica o quadro como grave.',
    layout: 'stack',
    options: [
      { label: 'Ausente', value: 0 },
      { label: 'Presente com agitação ou choro', value: 4, badge: '+4' },
      { label: 'Presente em repouso', value: 5, badge: '+5' },
    ],
  },
  {
    id: 'consciencia',
    kind: 'choice',
    label: 'Nível de consciência',
    hint: 'Sono tranquilo conta como normal. Letargia, agitação intensa e desorientação não.',
    layout: 'stack',
    options: [
      { label: 'Normal (inclui criança dormindo)', value: 0 },
      { label: 'Alterado: desorientada, letárgica ou muito agitada', value: 5, badge: '+5' },
    ],
  },
];

/** Conduta da faixa grave, reaproveitada quando cianose ou alteração de consciência forçam essa faixa. */
const CONDUTA_GRAVE =
  'Adrenalina nebulizada imediatamente: L-adrenalina 1:1.000, 0,5 mL/kg (máximo de 5 mL), diluída em soro fisiológico; ou adrenalina racêmica 2,25%, 0,05 mL/kg (máximo de 0,5 mL). Pode ser repetida.\nDexametasona 0,6 mg/kg em dose única, pela via disponível, associada.\nOxigênio suplementar se houver hipoxemia, monitorização contínua e mínima manipulação. Reavalie o escore a cada 15 a 30 minutos e mantenha em observação hospitalar; internação é a regra nessa faixa.';

const calculator: Calculator = {
  slug: 'westley-crupe',
  title: 'Escore de Westley para crupe',
  shortTitle: 'Westley (crupe)',
  subtitle:
    'Quantifica a gravidade da laringotraqueíte aguda (crupe viral) em crianças e orienta o uso de corticoide e de adrenalina nebulizada.',
  specialties: ['Pediatria', 'Otorrinolaringologia', 'Emergência'],
  kind: 'Escala',
  keywords: [
    'westley',
    'crupe',
    'croup',
    'laringotraqueíte',
    'laringotraqueobronquite',
    'estridor',
    'tosse ladrante',
    'tosse de cachorro',
    'obstrução de via aérea superior',
    'adrenalina nebulizada',
    'dexametasona',
  ],

  whenToUse: [
    'Crianças com diagnóstico clínico de crupe viral: tosse ladrante de início agudo, rouquidão e estridor inspiratório, geralmente entre 6 meses e 3 anos, após pródromo de infecção de via aérea superior.',
    'Para graduar a gravidade na admissão e, sobretudo, para medir objetivamente a resposta ao tratamento ao longo das horas de observação.',
    'Não se aplica a outras causas de estridor: epiglotite, traqueíte bacteriana, abscesso retrofaríngeo, aspiração de corpo estranho, angioedema e anomalias congênitas de via aérea.',
    'Não foi desenvolvido nem validado como regra de decisão isolada para internação ou alta.',
  ],

  whyUse:
    'É o instrumento de graduação de crupe mais usado no mundo e o desfecho padrão dos ensaios clínicos da doença, o que permite traduzir a evidência disponível diretamente para a beira do leito. Objetiva uma avaliação que, de outro modo, seria puramente impressionista, e torna comparáveis reavaliações feitas por profissionais diferentes.',

  pearls: [
    'O escore foi criado como desfecho de um ensaio clínico, não como regra de triagem. Use-o para acompanhar a evolução, não para decidir sozinho quem interna ou recebe alta.',
    'Os pesos são muito desiguais: cianose vale 4 ou 5 pontos e alteração da consciência vale 5. Cuidado com a armadilha aritmética: isoladamente, qualquer um desses achados soma no máximo 5 pontos e cairia na faixa "moderada" do total, apesar de indicar hipoxemia ou exaustão. Cianose e rebaixamento de consciência devem ser tratados como crupe grave independentemente do escore, e é isso que esta calculadora faz. Na prática, a imensa maioria dos casos atendidos no pronto-socorro pontua 5 ou menos.',
    'Estridor que diminui junto com a entrada de ar, em criança sonolenta, é sinal de obstrução crítica e exaustão: não de melhora. Nesse cenário o escore pode até cair enquanto o paciente piora; confie no quadro global.',
    'Não examine a orofaringe com abaixador de língua, não colha exames desnecessários e não force o decúbito: agitar a criança piora a obstrução dinâmica e, se a hipótese for epiglotite, pode precipitar obstrução completa.',
    'Corticoide está indicado em todos os graus, inclusive no crupe leve com estridor apenas à agitação: reduz sintomas em 2 horas, retornos ao serviço e internações. Dexametasona 0,15 mg/kg parece tão eficaz quanto 0,6 mg/kg.',
    'A adrenalina nebulizada age em 10 a 30 minutos e o efeito se esgota em 1 a 2 horas. Observe a criança por pelo menos 2 a 4 horas após a última dose antes de considerar alta, pelo risco de recorrência dos sintomas.',
    'Ar frio, ar umidificado, nebulização com soro fisiológico, broncodilatadores e antitussígenos não têm benefício comprovado no crupe.',
    'Crupe em menor de 3 meses, crupe recorrente ou quadro sem pródromo viral obriga a investigar estenose subglótica, hemangioma subglótico, anel vascular, papilomatose laríngea ou corpo estranho.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const pontos = sumPoints(FIELDS, values);
    const cianose = n(values, 'cianose');
    const consciencia = n(values, 'consciencia');
    /** Cianose (4 ou 5) e consciência alterada (5) isoladas não alcançam 6 pontos, mas são quadros graves. */
    const sinalDeAlarme = cianose > 0 || consciencia > 0;

    let label: string;
    let severity: 'baixo' | 'moderado' | 'alto' | 'critico';
    let interpretation: string;
    let nextSteps: string;

    if (pontos <= 2) {
      label = 'Crupe leve';
      severity = 'baixo';
      interpretation =
        'Crupe leve: tosse ladrante com estridor ausente ou presente apenas ao choro, sem tiragem significativa. Corresponde à grande maioria dos atendimentos e tem evolução benigna.';
      nextSteps =
        'Dexametasona em dose única, 0,15 mg/kg por via oral (alguns protocolos usam até 0,6 mg/kg; máximo habitual de 10 mg). Se a via oral não for possível, budesonida nebulizada 2 mg ou dexametasona intramuscular.\nAlta após breve observação, com orientação clara para retorno imediato se surgir estridor em repouso, tiragem, sonolência ou cianose.\nNão prescreva broncodilatador, antitussígeno, descongestionante nem antibiótico.';
    } else if (pontos <= 5) {
      label = 'Crupe moderado';
      severity = 'moderado';
      interpretation =
        'Crupe moderado: estridor em repouso com tiragem perceptível e desconforto respiratório evidente. Exige tratamento e período de observação com repontuação seriada.';
      nextSteps =
        'Dexametasona em dose única (0,15 a 0,6 mg/kg, por via oral, intramuscular ou endovenosa).\nConsidere adrenalina nebulizada se houver estridor em repouso com desconforto respiratório evidente.\nMantenha a criança no colo do cuidador, evite procedimentos desnecessários e observe por pelo menos 2 a 4 horas, repontuando o escore. Alta apenas com estridor de repouso resolvido e após o período de observação pós-adrenalina.';
    } else if (pontos <= 11) {
      label = 'Crupe grave';
      severity = 'alto';
      interpretation =
        'Crupe grave: estridor em repouso com tiragem importante, agitação ou sonolência, entrada de ar reduzida, obstrução significativa da via aérea superior.';
      nextSteps = CONDUTA_GRAVE;
    } else {
      label = 'Insuficiência respiratória iminente';
      severity = 'critico';
      interpretation =
        'Obstrução grave com falência respiratória iminente. Cianose e rebaixamento do nível de consciência indicam hipoxemia e/ou hipercapnia e exaustão.';
      nextSteps =
        'Acione a equipe de via aérea difícil e a terapia intensiva pediátrica. Oxigênio, adrenalina nebulizada e dexametasona endovenosa em paralelo, sem atrasar a via aérea.\nSe for necessário intubar, faça com o profissional mais experiente disponível e escolha um tubo com meio a um número abaixo do previsto para a idade, pela estenose subglótica inflamatória.\nHeliox pode ser considerado como medida de ponte enquanto se organiza a via aérea definitiva.';
    }

    // Cianose ou alteração da consciência se sobrepõem ao total: nunca abaixo de "Crupe grave".
    const forcadoGrave = sinalDeAlarme && pontos <= 5;

    if (forcadoGrave) {
      const achado =
        cianose > 0 && consciencia > 0
          ? 'Há cianose e alteração do nível de consciência.'
          : cianose > 0
            ? 'Há cianose.'
            : 'Há alteração do nível de consciência.';
      label = 'Crupe grave';
      severity = 'alto';
      interpretation = `${achado} Pelos pesos do escore, esses achados isolados somam no máximo 5 pontos e não chegam à faixa de 6 ou mais, mas indicam hipoxemia e/ou exaustão: trate como crupe grave independentemente do total, que permanece em ${pontos} ${pontos === 1 ? 'ponto' : 'pontos'}.`;
      nextSteps = `Oxigênio suplementar imediato, com a mínima manipulação possível da criança.\n${CONDUTA_GRAVE}`;
    }

    const faixaTexto =
      pontos <= 2
        ? '0 a 2: leve'
        : pontos <= 5
          ? '3 a 5: moderado'
          : pontos <= 11
            ? '6 a 11: grave'
            : '12 a 17: falência respiratória iminente';

    return {
      value: pontos,
      unit: pontos === 1 ? 'ponto' : 'pontos',
      label,
      severity,
      interpretation,
      details: [
        {
          label: 'Faixa de gravidade',
          value: forcadoGrave ? `${faixaTexto}: tratado como grave` : faixaTexto,
          ...(forcadoGrave
            ? {
                hint: 'Cianose ou alteração do nível de consciência exigem conduta de crupe grave mesmo com total baixo.',
              }
            : {}),
        },
        {
          label: 'Corticoide',
          value: 'Indicado em todas as faixas',
          hint: 'Dexametasona em dose única reduz sintomas, retornos e internações mesmo no crupe leve.',
        },
        {
          label: 'Adrenalina nebulizada',
          value: forcadoGrave ? 'Indicada' : pontos <= 2 ? 'Não indicada' : pontos <= 5 ? 'Considerar' : 'Indicada',
          hint: 'Observar por 2 a 4 horas após a dose antes de considerar alta.',
        },
      ],
      nextSteps,
    };
  },

  formula: `Soma de cinco itens - total de 0 a 17 pontos:

Estridor inspiratório - ausente (0) · à agitação (1) · em repouso (2)
Retração / tiragem - ausente (0) · leve (1) · moderada (2) · grave (3)
Entrada de ar - normal (0) · diminuída (1) · muito diminuída (2)
Cianose - ausente (0) · à agitação (4) · em repouso (5)
Nível de consciência - normal, inclusive dormindo (0) · alterado (5)

Faixas de gravidade:
0 a 2 - leve
3 a 5 - moderado
6 a 11 - grave
12 a 17 - insuficiência respiratória iminente

Atenção aos pesos: cianose (4 ou 5) ou alteração do nível de consciência (5),
isoladamente, somam no máximo 5 pontos e cairiam na faixa "moderada". Esta
calculadora mantém o valor numérico do escore, mas classifica esses casos como
crupe grave.`,

  evidence:
    'O escore nasceu como instrumento de desfecho no ensaio duplo-cego de Westley, Cotton e Brooks (1978), que comparou adrenalina racêmica nebulizada por respiração com pressão positiva intermitente contra soro fisiológico em 20 crianças de 4 meses a 5 anos internadas com crupe e estridor persistente em repouso: houve melhora significativa do escore aos 10 e aos 30 minutos, mas não aos 120 minutos, a origem da recomendação de observar a criança por algumas horas após a adrenalina. Desde então tornou-se a medida de desfecho padrão da literatura de crupe. A revisão Cochrane de glicocorticoides para crupe (atualização de 2023) reuniu 45 ensaios randomizados e 5.888 crianças e mostrou redução do escore de gravidade em 2, 6 e 12 horas, além de menos retornos e reinternações; a dose de 0,15 mg/kg de dexametasona mostrou-se possivelmente tão eficaz quanto a de 0,6 mg/kg. O ensaio de Bjornson e colaboradores (2004), com crianças com crupe leve, confirmou que a dexametasona reduz retornos ao serviço mesmo nos quadros mais brandos.',

  creator: {
    name: 'Charles R. Westley',
    bio: 'Pediatra norte-americano que, com E. K. Cotton e J. G. Brooks, descreveu o escore em 1978 no ensaio clínico que estabeleceu a eficácia da adrenalina racêmica nebulizada no crupe.',
  },

  updatedAt: '2026-07-26',

  references: [
    {
      citation:
        'Westley CR, Cotton EK, Brooks JG. Nebulized racemic epinephrine by IPPB for the treatment of croup: a double-blind study. Am J Dis Child. 1978;132(5):484-7.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/347921/',
      primary: true,
    },
    {
      citation:
        'Aregbesola A, Tam CM, Kothari A, Le ML, Ragheb M, Klassen TP. Glucocorticoids for croup in children. Cochrane Database Syst Rev. 2023;1(1):CD001955.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/36626194/',
    },
    {
      citation:
        'Bjornson CL, Klassen TP, Williamson J, et al. A randomized trial of a single dose of oral dexamethasone for mild croup. N Engl J Med. 2004;351(13):1306-13.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/15385657/',
    },
    {
      citation:
        'Bjornson C, Russell K, Vandermeer B, Klassen TP, Johnson DW. Nebulized epinephrine for croup in children. Cochrane Database Syst Rev. 2013;(10):CD006619.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/24114291/',
    },
  ],
};

export default calculator;
