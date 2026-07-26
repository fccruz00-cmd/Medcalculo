import type { Calculator, Field, Values } from '@/lib/types';
import { sumPoints } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'idade',
    kind: 'boolean',
    label: 'Idade acima de 80 anos',
    hint: 'Estritamente maior que 80 anos. No PESI original a idade entra como pontos equivalentes ao número de anos.',
    points: 1,
  },
  {
    id: 'cancer',
    kind: 'boolean',
    label: 'História de câncer',
    hint: 'Câncer prévio ou atual, sólido ou hematológico, conforme a definição do PESI original.',
    points: 1,
  },
  {
    id: 'cardiopulmonar',
    kind: 'boolean',
    label: 'Doença cardiopulmonar crônica',
    hint: 'Insuficiência cardíaca crônica OU doença pulmonar crônica (DPOC, doença intersticial). Basta uma das duas; no PESI original eram dois itens separados.',
    points: 1,
  },
  {
    id: 'fc',
    kind: 'boolean',
    label: 'Frequência cardíaca igual ou maior que 110 bpm',
    points: 1,
  },
  {
    id: 'pas',
    kind: 'boolean',
    label: 'Pressão arterial sistólica menor que 100 mmHg',
    points: 1,
  },
  {
    id: 'saturacao',
    kind: 'boolean',
    label: 'Saturação de oxigênio menor que 90%',
    hint: 'Medida por oximetria de pulso, com ou sem oxigênio suplementar.',
    points: 1,
  },
];

const calculator: Calculator = {
  slug: 'spesi',
  title: 'sPESI: índice simplificado de gravidade do tromboembolismo pulmonar',
  shortTitle: 'sPESI',
  subtitle:
    'Estima a mortalidade em 30 dias no TEP agudo confirmado e identifica quem pode ser tratado fora do hospital.',
  specialties: ['Pneumologia', 'Emergência', 'Cardiologia', 'Clínica Médica'],
  kind: 'Escore de risco',
  keywords: [
    'sPESI',
    'PESI simplificado',
    'pulmonary embolism severity index',
    'embolia pulmonar',
    'tromboembolismo pulmonar',
    'TEP',
    'mortalidade',
    'tratamento ambulatorial',
    'alta precoce',
    'prognóstico',
  ],

  whenToUse: [
    'Pacientes com tromboembolismo pulmonar agudo JÁ CONFIRMADO por imagem, para estimar a mortalidade em 30 dias e decidir o local de tratamento.',
    'Na triagem de candidatos a alta precoce ou tratamento domiciliar com anticoagulante oral direto.',
    'Não é instrumento diagnóstico: não serve para decidir se o paciente tem TEP; para isso use Wells, Genebra revisado ou PERC.',
    'Não se aplica ao TEP de alto risco: paciente com choque, parada cardíaca ou hipotensão persistente já é de alto risco por definição, independentemente do escore.',
    'Derivado em coorte espanhola e validado no registro RIETE, em adultos; não foi validado em gestantes nem em crianças.',
  ],

  whyUse:
    'O PESI original tem 11 variáveis e cinco classes, o que dificulta o uso à beira do leito. O sPESI reduz o modelo a seis itens dicotômicos sem perder poder prognóstico: uma pontuação zero identifica um grupo com mortalidade em 30 dias em torno de 1%, que pode ser tratado em casa com segurança, evitando internação desnecessária num quadro em que boa parte dos pacientes ficaria hospitalizada por hábito.',

  pearls: [
    'sPESI zero, sozinho, não autoriza a alta. As diretrizes exigem também função ventricular direita normal no ecocardiograma ou na angiotomografia, troponina normal e condições sociais adequadas: moradia, cuidador, acesso ao medicamento e retorno garantido.',
    'O escore não substitui a avaliação hemodinâmica. Hipotensão sustentada, choque ou necessidade de vasopressor colocam o paciente em alto risco mesmo com sPESI baixo: nesse cenário a discussão é sobre reperfusão, não sobre alta.',
    'O corte de pressão do sPESI é PAS abaixo de 100 mmHg, que não é o mesmo da definição de TEP de alto risco (PAS abaixo de 90 mmHg ou queda de 40 mmHg por mais de 15 minutos). São limiares diferentes, com finalidades diferentes.',
    'A idade pontua acima de 80 anos. Um paciente de 78 anos com TEP não marca esse item: o que costuma surpreender quem vem do PESI original, em que a idade em anos é somada diretamente.',
    'Todo paciente com história de câncer já tem ao menos 1 ponto e nunca será classificado como baixo risco por este escore. Nessa população, considere critérios alternativos, como os de Hestia, para avaliar tratamento ambulatorial.',
    '"Doença cardiopulmonar crônica" reúne em um único item a insuficiência cardíaca e a doença pulmonar crônica: marcar as duas separadamente é erro comum e infla o escore.',
    'sPESI de 1 ponto não é sinônimo de gravidade extrema. Significa apenas "não é baixo risco": a maioria desses pacientes é de risco intermediário e se beneficia de internação com monitorização, não de trombólise.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const pontos = sumPoints(FIELDS, values);

    if (pontos === 0) {
      return {
        value: 0,
        unit: 'pontos',
        label: 'Baixo risco',
        severity: 'baixo' as const,
        interpretation:
          'Nenhum critério presente. Mortalidade estimada em 30 dias de 1,0% na coorte de derivação espanhola, com risco muito baixo de deterioração hemodinâmica.\nEsse é o grupo em que o tratamento domiciliar ou a alta precoce foram estudados e se mostraram seguros.',
        details: [
          {
            label: 'Mortalidade em 30 dias',
            value: '1,0%',
            hint: 'IC 95% 0,0 a 2,1%: coorte de derivação espanhola (Jiménez, 2010)',
          },
          { label: 'Classificação', value: 'Baixo risco (sPESI = 0)' },
          {
            label: 'Local de tratamento',
            value: 'Ambulatorial, se critérios adicionais preenchidos',
          },
        ],
        nextSteps:
          'Antes de liberar, confirme os critérios adicionais das diretrizes: ausência de disfunção de ventrículo direito no ecocardiograma ou na angiotomografia, troponina normal, ausência de dor que exija opioide venoso, ausência de hipoxemia com necessidade de oxigênio, ausência de sangramento ativo ou de insuficiência renal ou hepática graves.\nAvalie também as condições sociais: adesão, suporte domiciliar, acesso ao anticoagulante e possibilidade de retorno rápido.\nSe tudo estiver preenchido, inicie anticoagulante oral direto (rivaroxabana ou apixabana, em esquema com dose de ataque) e programe reavaliação em 3 a 7 dias.\nCaso qualquer um desses critérios falhe, trate o paciente internado, mesmo com sPESI zero.',
      };
    }

    // O escore é dicotômico: há uma única estimativa de mortalidade para toda
    // pontuação ≥ 1, sem graduação publicada acima de zero (Jiménez, 2010).
    const severity = 'moderado' as const;

    return {
      value: pontos,
      unit: pontos === 1 ? 'ponto' : 'pontos',
      label: 'Não é baixo risco',
      severity,
      interpretation:
        'Ao menos um critério presente. Mortalidade estimada em 30 dias de 10,9% na coorte de derivação espanhola.\nO escore não gradua a gravidade acima de zero: qualquer pontuação positiva significa apenas que o paciente não pertence ao grupo de baixo risco e não deve ser tratado em casa.',
      details: [
        {
          label: 'Mortalidade em 30 dias',
          value: '10,9%',
          hint: 'IC 95% 8,5 a 13,2%: coorte de derivação espanhola (Jiménez, 2010)',
        },
        { label: 'Classificação', value: `Não baixo risco (sPESI = ${pontos})` },
        { label: 'Local de tratamento', value: 'Internação hospitalar' },
      ],
      nextSteps:
        'Interne o paciente e inicie anticoagulação plena, salvo contraindicação.\nComplete a estratificação de risco intermediário: ecocardiograma ou angiotomografia para avaliar a relação VD/VE e dosagem de troponina.\nDisfunção de ventrículo direito COM troponina elevada caracteriza risco intermediário-alto: mantenha monitorização contínua nas primeiras 48 a 72 horas e tenha plano de reperfusão de resgate caso haja deterioração hemodinâmica.\nTrombólise sistêmica não está indicada de rotina no paciente normotenso: reserve-a para instabilidade hemodinâmica instalada ou como resgate.',
    };
  },

  formula: `Um ponto para cada critério presente (máximo 6):

Idade > 80 anos
História de câncer
Doença cardiopulmonar crônica (insuficiência cardíaca crônica ou doença pulmonar crônica)
Frequência cardíaca ≥ 110 bpm
Pressão arterial sistólica < 100 mmHg
Saturação de oxigênio < 90%

0 ponto - baixo risco, mortalidade em 30 dias de 1,0%
≥ 1 ponto - não baixo risco, mortalidade em 30 dias de 10,9%`,

  evidence:
    'Jiménez e colaboradores derivaram o sPESI em 2010, a partir de 995 pacientes com TEP agudo sintomático de uma coorte espanhola, e o validaram externamente em 7.106 pacientes do registro multinacional RIETE. Na coorte de derivação, a mortalidade em 30 dias foi de 1,0% (IC 95% 0,0 a 2,1%) entre os pacientes com escore zero e de 10,9% (IC 95% 8,5 a 13,2%) entre os que tinham ao menos 1 ponto; na validação do RIETE, as taxas correspondentes foram de 1,1% (0,7 a 1,5%) e 8,9% (8,1 a 9,8%): desempenho equivalente ao do PESI original, de 11 variáveis, com bem menos complexidade. O ensaio HoT-PE e outros estudos de manejo domiciliar confirmaram a segurança de tratar fora do hospital pacientes de baixo risco selecionados. As diretrizes da Sociedade Europeia de Cardiologia de 2019 usam o sPESI zero, associado a função ventricular direita normal e troponina normal, como definição operacional de TEP de baixo risco elegível a alta precoce.',

  creator: {
    name: 'David Jiménez',
    bio: 'Pneumologista do Hospital Ramón y Cajal, em Madri, pesquisador do registro RIETE e uma das principais referências em estratificação prognóstica do tromboembolismo pulmonar.',
  },

  references: [
    {
      citation:
        'Jiménez D, Aujesky D, Moores L, et al. Simplification of the pulmonary embolism severity index for prognostication in patients with acute symptomatic pulmonary embolism. Arch Intern Med. 2010;170(15):1383-9.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/20696966/',
      primary: true,
    },
    {
      citation:
        'Aujesky D, Obrosky DS, Stone RA, et al. Derivation and validation of a prognostic model for pulmonary embolism. Am J Respir Crit Care Med. 2005;172(8):1041-6.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/16020800/',
    },
    {
      citation:
        'Konstantinides SV, Meyer G, Becattini C, et al. 2019 ESC Guidelines for the diagnosis and management of acute pulmonary embolism developed in collaboration with the European Respiratory Society (ERS). Eur Heart J. 2020;41(4):543-603.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/31504429/',
    },
    {
      citation:
        'Zondag W, Mos ICM, Creemers-Schild D, et al. Outpatient treatment in patients with acute pulmonary embolism: the Hestia Study. J Thromb Haemost. 2011;9(8):1500-7.',
    },
  ],
};

export default calculator;
