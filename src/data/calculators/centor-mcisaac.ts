import type { Calculator, Field, Values } from '@/lib/types';
import { sumPoints } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'febre',
    kind: 'boolean',
    label: 'Temperatura acima de 38 °C',
    hint: 'Febre aferida na consulta ou referida de forma consistente durante o episódio atual.',
    points: 1,
  },
  {
    id: 'semTosse',
    kind: 'boolean',
    label: 'Ausência de tosse',
    hint: 'Responda "Sim" quando o paciente NÃO apresenta tosse. Tosse aponta para etiologia viral.',
    points: 1,
  },
  {
    id: 'adenopatia',
    kind: 'boolean',
    label: 'Linfonodos cervicais anteriores aumentados e dolorosos',
    hint: 'Cadeia cervical anterior. Adenopatia cervical posterior sugere mononucleose infecciosa.',
    points: 1,
  },
  {
    id: 'exsudato',
    kind: 'boolean',
    label: 'Exsudato ou aumento das tonsilas',
    hint: 'Tonsilas com exsudato purulento ou tumefeitas.',
    points: 1,
  },
  {
    id: 'idade',
    kind: 'choice',
    label: 'Idade',
    hint: 'A modificação de McIsaac acrescentou este item ao escore original de Centor, que era restrito a adultos. Não foi validado abaixo dos 3 anos.',
    layout: 'stack',
    options: [
      { label: '3 a 14 anos', value: 1, badge: '+1' },
      { label: '15 a 44 anos', value: 0 },
      { label: '45 anos ou mais', value: -1, badge: '−1' },
    ],
  },
];

/** Probabilidade de estreptococo do grupo A (%): faixas de McIsaac 1998 e 2004. */
const PROBABILIDADE: Record<number, string> = {
  [-1]: '1 a 2,5%',
  0: '1 a 2,5%',
  1: '5 a 10%',
  2: '11 a 17%',
  3: '28 a 35%',
  4: '51 a 53%',
  5: '51 a 53%',
};

const calculator: Calculator = {
  slug: 'centor-mcisaac',
  title: 'Escore de Centor modificado por McIsaac',
  shortTitle: 'Centor / McIsaac',
  subtitle:
    'Estima a probabilidade de faringite por estreptococo beta-hemolítico do grupo A e define quem precisa de teste microbiológico e de antibiótico.',
  specialties: ['Otorrinolaringologia', 'Infectologia', 'Pediatria', 'Clínica Médica', 'Emergência'],
  kind: 'Regra de decisão',
  popular: true,
  keywords: [
    'centor',
    'mcisaac',
    'centor modificado',
    'faringite',
    'faringoamigdalite',
    'amigdalite',
    'dor de garganta',
    'estreptococo',
    'estreptococcia',
    'GAS',
    'Streptococcus pyogenes',
    'febre reumática',
    'teste rápido',
  ],

  whenToUse: [
    'Pacientes com 3 anos ou mais e dor de garganta aguda (menos de duas semanas de evolução), para estimar a chance de infecção por estreptococo do grupo A e decidir quem testar.',
    'Derivado em pronto-socorro de adultos por Centor (1981) e ampliado por McIsaac (1998) para atenção primária, incluindo crianças a partir dos 3 anos.',
    'Não se aplica a menores de 3 anos: infecção por estreptococo do grupo A é incomum nessa faixa e a febre reumática é excepcional.',
    'Não use quando houver suspeita de complicação supurativa (abscesso periamigdaliano, epiglotite, síndrome de Lemierre), em imunossuprimidos, em surto documentado de estreptococo ou em contactante domiciliar de caso confirmado: nesses cenários a conduta independe do escore.',
  ],

  whyUse:
    'A imensa maioria das faringites é viral, e a prescrição empírica de antibiótico para dor de garganta é uma das principais fontes de uso desnecessário de antimicrobianos. O escore identifica, com quatro perguntas de anamnese e exame físico mais a idade, quem tem probabilidade suficientemente baixa de estreptococo para dispensar teste e antibiótico: na coorte de derivação, seguir o escore reduziria em 48% as prescrições iniciais de antibiótico sem aumentar o uso de cultura.',

  pearls: [
    'Mesmo o escore máximo prevê pouco mais de 50% de chance de estreptococo: metade dos pacientes com 4 ou 5 pontos ainda tem faringite viral. Por isso a IDSA recomenda confirmação laboratorial antes de tratar, em vez de tratamento empírico.',
    'Sinais claramente virais, coriza, rouquidão, conjuntivite, úlceras orais, diarreia, exantema viral, apontam para etiologia viral independentemente da pontuação. O escore não os inclui, mas o julgamento clínico deve.',
    'A mononucleose infecciosa imita perfeitamente um escore alto (febre, exsudato, adenopatia, sem tosse). Adenopatia cervical posterior, esplenomegalia, fadiga prolongada e linfocitose atípica devem levantar a suspeita: e amoxicilina nesse cenário provoca exantema maculopapular.',
    'Em adolescentes e adultos jovens com faringite grave, prolongada ou com sinais sistêmicos, lembre-se de Fusobacterium necrophorum e da síndrome de Lemierre (tromboflebite séptica da veia jugular interna). O escore não cobre essa possibilidade.',
    'Até 20% das crianças em idade escolar são portadoras crônicas assintomáticas de estreptococo do grupo A. Nelas, o teste rápido positivo durante uma faringite viral leva a antibiótico desnecessário: motivo pelo qual não se testa quem tem escore baixo.',
    'O teste rápido de antígeno tem especificidade alta (em torno de 95%) e sensibilidade variável (70% a 90%). Em crianças e adolescentes, um teste rápido negativo deve ser confirmado por cultura de orofaringe; em adultos, essa confirmação em geral não é necessária.',
    'O objetivo principal do tratamento é prevenir febre reumática: o antibiótico encurta pouco os sintomas (cerca de um dia). Como a incidência de febre reumática no Brasil é maior do que na América do Norte, os protocolos nacionais tendem a ser mais permissivos com o tratamento em crianças e adolescentes quando não há teste disponível.',
    'Tratar não previne glomerulonefrite pós-estreptocócica. Previne febre reumática e complicações supurativas.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const pontos = sumPoints(FIELDS, values);
    const probabilidade = PROBABILIDADE[pontos] ?? '51 a 53%';

    let label: string;
    let severity: 'baixo' | 'moderado' | 'alto';
    let interpretation: string;
    let nextSteps: string;
    let conduta: string;

    if (pontos <= 1) {
      label = 'Probabilidade baixa';
      severity = 'baixo';
      conduta = 'Não testar, não tratar';
      interpretation =
        'Probabilidade baixa de faringite estreptocócica. O quadro é quase certamente viral, e nem o teste rápido nem a cultura estão indicados: testar nesta faixa aumenta a chance de identificar portadores crônicos e tratar sem necessidade.';
      nextSteps =
        'Tratamento sintomático: analgésico e antitérmico (dipirona ou paracetamol; anti-inflamatório se não houver contraindicação), hidratação e repouso.\nNão prescreva antibiótico nem solicite teste rápido ou cultura.\nOriente retorno se houver piora, febre persistente por mais de 3 a 5 dias, trismo, sialorreia, voz abafada, dificuldade para engolir a própria saliva ou abaulamento assimétrico da orofaringe.';
    } else if (pontos <= 3) {
      label = 'Probabilidade intermediária';
      severity = 'moderado';
      conduta = 'Testar e tratar apenas se positivo';
      interpretation =
        'Probabilidade intermediária. Este é exatamente o grupo em que o teste microbiológico muda a conduta: tratar todo mundo geraria antibiótico desnecessário na maioria, e não tratar ninguém deixaria casos de estreptococo sem cobertura.';
      nextSteps =
        'Solicite teste rápido de detecção de antígeno ou cultura de orofaringe. Prescreva antibiótico apenas se o resultado for positivo.\nEm criança ou adolescente com teste rápido negativo, confirme com cultura.\nEnquanto aguarda, prescreva sintomáticos.\nSe não houver teste disponível no serviço, decida caso a caso, considerando a idade e o risco de febre reumática.';
    } else {
      label = 'Probabilidade alta';
      severity = 'alto';
      conduta = 'Testar; tratar se positivo';
      interpretation =
        'A maior probabilidade prevista pelo escore: ainda assim, cerca de metade desses pacientes tem faringite viral. A IDSA recomenda confirmação laboratorial mesmo nesta faixa, e não tratamento empírico.';
      nextSteps =
        'Solicite teste rápido ou cultura e trate se positivo.\nSe o teste não estiver disponível e o risco de febre reumática for relevante (criança ou adolescente, história pessoal ou familiar de febre reumática, contexto de surto), o tratamento empírico é aceitável.\nEsquemas: penicilina G benzatina por via intramuscular em dose única, 600.000 UI para menos de 27 kg e 1.200.000 UI para 27 kg ou mais; ou amoxicilina 50 mg/kg/dia (máximo de 1 g/dia) por 10 dias; ou penicilina V oral por 10 dias.\nAlérgicos: cefalexina por 10 dias quando a reação não for de hipersensibilidade imediata; caso contrário, azitromicina ou clindamicina.';
    }

    return {
      value: pontos,
      unit: pontos === 1 || pontos === -1 ? 'ponto' : 'pontos',
      label,
      severity,
      interpretation,
      details: [
        {
          label: 'Probabilidade de estreptococo do grupo A',
          value: probabilidade,
          hint: 'Derivação de McIsaac (1998, 521 pacientes de 3 a 76 anos) e validação (2004, 787 pacientes), ambas em atenção primária no Canadá.',
        },
        { label: 'Conduta sugerida', value: conduta },
        {
          label: 'Faixa do escore',
          value: pontos <= 1 ? '≤ 1' : pontos <= 3 ? '2 a 3' : '4 a 5',
          hint: 'O escore varia de −1 a 5 pontos.',
        },
      ],
      nextSteps,
    };
  },

  formula: `Soma dos itens - escore de −1 a 5 pontos:

Temperatura > 38 °C - +1
Ausência de tosse - +1
Linfonodos cervicais anteriores aumentados e dolorosos - +1
Exsudato ou aumento das tonsilas - +1
Idade 3 a 14 anos - +1 · 15 a 44 anos - 0 · ≥ 45 anos - −1

Probabilidade de estreptococo do grupo A e conduta:
≤ 0 - 1 a 2,5% - não testar, não tratar
1 - 5 a 10% - não testar, não tratar
2 - 11 a 17% - testar; tratar se positivo
3 - 28 a 35% - testar; tratar se positivo
4 a 5 - 51 a 53% - testar; tratar se positivo

Os quatro primeiros itens formam o escore original de Centor (1981),
aplicável a adultos. O item de idade é a modificação de McIsaac (1998).`,

  evidence:
    'Centor e colaboradores derivaram, em 1981, quatro achados clínicos (febre, ausência de tosse, adenopatia cervical anterior dolorosa e exsudato tonsilar) capazes de estratificar a probabilidade de estreptococo do grupo A em adultos atendidos em pronto-socorro. McIsaac e colaboradores adicionaram o ajuste por idade e validaram o instrumento em 521 pacientes de 3 a 76 anos atendidos em um centro de medicina de família em Toronto (1995-1997): a sensibilidade para identificar estreptococo foi de 83,1%, contra 69,4% do cuidado usual, e a adoção das recomendações do escore teria reduzido em 48% as prescrições iniciais de antibiótico, sem aumento no uso de cultura. Em 2004, o grupo validou empiricamente as estratégias baseadas em diretrizes em 787 crianças e adultos de 3 a 69 anos em Calgary, confirmando que o escore, combinado a teste microbiológico, oferece o melhor equilíbrio entre sensibilidade e prescrição desnecessária. A diretriz da Infectious Diseases Society of America de 2012 endossa o uso de critérios clínicos para selecionar quem testar, mas desaconselha o tratamento empírico mesmo com escore máximo.',

  creator: {
    name: 'Robert M. Centor e Warren J. McIsaac',
    bio: 'Centor, internista norte-americano da University of Alabama at Birmingham, propôs os quatro critérios clínicos em 1981. McIsaac, médico de família da Universidade de Toronto, acrescentou o ajuste por idade e validou o escore em atenção primária.',
  },

  updatedAt: '2026-07-26',

  references: [
    {
      citation:
        'McIsaac WJ, White D, Tannenbaum D, Low DE. A clinical score to reduce unnecessary antibiotic use in patients with sore throat. CMAJ. 1998;158(1):75-83.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/9475915/',
      primary: true,
    },
    {
      citation:
        'Centor RM, Witherspoon JM, Dalton HP, Brody CE, Link K. The diagnosis of strep throat in adults in the emergency room. Med Decis Making. 1981;1(3):239-46.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/6763125/',
    },
    {
      citation:
        'McIsaac WJ, Kellner JD, Aufricht P, Vanjaka A, Low DE. Empirical validation of guidelines for the management of pharyngitis in children and adults. JAMA. 2004;291(13):1587-95.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/15069046/',
    },
    {
      citation:
        'Shulman ST, Bisno AL, Clegg HW, et al. Clinical practice guideline for the diagnosis and management of group A streptococcal pharyngitis: 2012 update by the Infectious Diseases Society of America. Clin Infect Dis. 2012;55(10):e86-102.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/22965026/',
    },
  ],
};

export default calculator;
