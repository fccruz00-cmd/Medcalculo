import type { Calculator, Field, Values } from '@/lib/types';
import { sumPoints } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'gestalt',
    kind: 'choice',
    label: 'A probabilidade pré-teste de TEP, pelo seu julgamento clínico, é baixa (menor que 15%)?',
    hint: 'Pré-requisito absoluto. O PERC só foi validado em pacientes que o médico já considerava de baixo risco antes de aplicar a regra.',
    help: 'Use a impressão clínica global (gestalt) ou uma regra formal: Wells para TEP com menos de 2 pontos, ou Genebra revisado com 3 pontos ou menos. Se a suspeita for intermediária ou alta, o PERC não deve ser aplicado: o caminho é D-dímero ou angiotomografia, conforme a categoria.',
    layout: 'stack',
    options: [
      { label: 'Sim: suspeita baixa (< 15%)', value: 'sim' },
      { label: 'Não: suspeita intermediária ou alta', value: 'nao' },
    ],
  },
  {
    id: 'idade',
    kind: 'boolean',
    label: 'Idade igual ou maior que 50 anos',
    points: 1,
  },
  {
    id: 'fc',
    kind: 'boolean',
    label: 'Frequência cardíaca igual ou maior que 100 bpm',
    hint: 'Use a maior frequência aferida durante o atendimento, incluindo a da triagem.',
    points: 1,
  },
  {
    id: 'saturacao',
    kind: 'boolean',
    label: 'Saturação de oxigênio menor que 95% em ar ambiente',
    hint: 'Precisa ser medida sem oxigênio suplementar. Em paciente já em cateter nasal, o critério não pode ser avaliado.',
    points: 1,
  },
  {
    id: 'edemaUnilateral',
    kind: 'boolean',
    label: 'Edema unilateral de membro inferior',
    hint: 'Assimetria objetiva de panturrilha ou coxa. Edema bilateral não conta.',
    points: 1,
  },
  {
    id: 'hemoptise',
    kind: 'boolean',
    label: 'Hemoptise',
    points: 1,
  },
  {
    id: 'cirurgiaTrauma',
    kind: 'boolean',
    label: 'Cirurgia ou trauma nas últimas 4 semanas com necessidade de anestesia geral',
    points: 1,
  },
  {
    id: 'tevPrevio',
    kind: 'boolean',
    label: 'TEP ou TVP prévios',
    points: 1,
  },
  {
    id: 'hormonio',
    kind: 'boolean',
    label: 'Uso de hormônio exógeno',
    hint: 'Anticoncepcional oral, adesivo ou anel vaginal, terapia de reposição hormonal ou qualquer estrogênio exógeno.',
    points: 1,
  },
];

const calculator: Calculator = {
  slug: 'perc',
  title: 'Critérios PERC para exclusão de tromboembolismo pulmonar',
  shortTitle: 'PERC',
  subtitle:
    'Em pacientes com suspeita clínica já baixa, os oito critérios todos negativos afastam TEP sem D-dímero nem imagem.',
  specialties: ['Emergência', 'Pneumologia', 'Clínica Médica'],
  kind: 'Regra de decisão',
  popular: true,
  keywords: [
    'PERC',
    'pulmonary embolism rule-out criteria',
    'embolia pulmonar',
    'tromboembolismo pulmonar',
    'TEP',
    'exclusão',
    'd-dímero',
    'Kline',
  ],

  whenToUse: [
    'Adultos do pronto-socorro em que a embolia pulmonar entrou na lista de diagnósticos, mas a probabilidade pré-teste, pelo julgamento clínico, já é baixa (menor que 15%).',
    'Quando o objetivo é evitar o D-dímero: nesse grupo, um D-dímero falsamente positivo levaria a angiotomografia desnecessária, com contraste, radiação e achados incidentais.',
    'NÃO se aplica quando a probabilidade pré-teste é intermediária ou alta: nesse cenário a regra perde a sensibilidade e pode liberar um paciente com TEP.',
    'Não foi validado em gestantes e puérperas, em pacientes internados, em pacientes já anticoagulados nem em populações com prevalência de TEP acima de 15%.',
  ],

  whyUse:
    'O PERC não é um escore de risco: é uma regra binária de exclusão. Nos pacientes que já eram de baixo risco, ter os oito critérios negativos reduz a probabilidade de TEP abaixo do limiar de teste: cerca de 1%, , e a investigação pode parar ali, sem D-dímero e sem tomografia. O ensaio randomizado PROPER confirmou que essa estratégia não é inferior à investigação convencional, com menos angiotomografias e menos tempo de permanência no pronto-socorro.',

  pearls: [
    'A regra só vale onde foi validada: probabilidade pré-teste baixa. Aplicar o PERC em paciente com suspeita moderada ou alta é o erro mais grave: nessa população a taxa de falso-negativo ultrapassa o limiar aceitável de 1,8%.',
    'PERC positivo NÃO significa que o paciente tem TEP nem que precisa de tomografia. Significa apenas que a regra não pode excluir o diagnóstico: siga o algoritmo normal, quase sempre com D-dímero.',
    'É tudo ou nada. Um único critério positivo, uma paciente de 24 anos em uso de anticoncepcional, por exemplo, já invalida a exclusão, mesmo com todos os demais negativos.',
    'A saturação precisa ser medida em ar ambiente. Paciente que já chegou com cateter nasal instalado não pode ter esse critério avaliado, e o PERC não deve ser aplicado.',
    'Taquicardia transitória por dor, febre ou ansiedade conta como critério positivo. A regra usa a frequência aferida, não a "corrigida" pelo raciocínio clínico.',
    'A especificidade é baixa, em torno de 22%: a maioria dos pacientes será PERC positivo. Isso é esperado: a regra foi desenhada para ter sensibilidade alta, não para selecionar quem tem TEP.',
    'Em populações com prevalência elevada de TEP, ou em serviços que investigam pouco, o valor preditivo negativo cai. O PERC pressupõe um pronto-socorro que investiga TEP com liberalidade e encontra prevalência baixa.',
    'Na gestação, o PERC não é validado: o uso de hormônio não se aplica, a taquicardia é fisiológica e a prevalência é diferente. Use algoritmos específicos, como o YEARS adaptado à gravidez.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const criteriosPositivos = sumPoints(FIELDS, values);
    const suspeitaBaixa = values.gestalt === 'sim';

    if (!suspeitaBaixa) {
      return {
        value: 'Não se aplica',
        label: 'Probabilidade pré-teste não é baixa',
        severity: 'info' as const,
        interpretation:
          'O PERC só foi derivado e validado em pacientes cuja probabilidade pré-teste de TEP já era baixa (menor que 15%). Com suspeita intermediária ou alta, a regra perde sensibilidade e não pode ser usada para afastar embolia pulmonar.',
        details: [
          {
            label: 'Critérios positivos assinalados',
            value: `${criteriosPositivos} de 8`,
            hint: 'Registro apenas informativo: a regra não se aplica neste paciente',
          },
        ],
        nextSteps:
          'Estratifique com o escore de Wells para TEP ou com o Genebra revisado.\nProbabilidade baixa ou intermediária: D-dímero de alta sensibilidade, com ponto de corte ajustado por idade acima de 50 anos.\nProbabilidade alta ou "TEP provável": angiotomografia de artérias pulmonares diretamente, sem D-dímero.',
      };
    }

    if (criteriosPositivos === 0) {
      return {
        value: 'PERC negativo',
        label: 'TEP afastado',
        severity: 'baixo' as const,
        interpretation:
          'Todos os oito critérios negativos em paciente que já era de baixa probabilidade. O risco residual de tromboembolismo venoso fica em torno de 1%: abaixo do limiar em que os riscos de investigar superam os de não investigar.',
        details: [
          { label: 'Critérios positivos', value: '0 de 8' },
          {
            label: 'Risco residual de TEV em 45 dias',
            value: '1,0%',
            hint: 'Validação multicêntrica de Kline (2008): 1.666 pacientes de baixa suspeita e PERC negativo, entre 8.138 com suspeita de TEP',
          },
          {
            label: 'Sensibilidade / especificidade',
            value: '97,4% / 21,9%',
            hint: 'Coorte de validação de Kline (2008)',
          },
        ],
        nextSteps:
          'Nenhuma investigação adicional para TEP: não peça D-dímero, angiotomografia nem cintilografia.\nSiga a investigação dos diagnósticos alternativos que expliquem o sintoma e oriente o paciente a retornar se houver piora da dispneia, dor torácica ou síncope.\nDocumente no prontuário que a probabilidade pré-teste era baixa e que os oito critérios foram negativos: é o que sustenta a decisão de não investigar.',
      };
    }

    return {
      value: 'PERC positivo',
      unit: `${criteriosPositivos} de 8 critérios`,
      label: 'TEP não pode ser afastado pela regra',
      severity: 'moderado' as const,
      interpretation: `${criteriosPositivos === 1 ? 'Um critério positivo' : `${criteriosPositivos} critérios positivos`}. A regra não permite excluir tromboembolismo pulmonar sem exames.\nIsso não quer dizer que o paciente tenha TEP nem que a tomografia esteja indicada: a probabilidade continua baixa, e o próximo passo é o D-dímero.`,
      details: [
        { label: 'Critérios positivos', value: `${criteriosPositivos} de 8` },
        { label: 'Próximo exame', value: 'D-dímero de alta sensibilidade' },
      ],
      nextSteps:
        'Solicite D-dímero de alta sensibilidade, usando o ponto de corte ajustado por idade em maiores de 50 anos (idade × 10 µg/L em unidades FEU).\nD-dímero negativo exclui TEP nesse paciente de baixa probabilidade: nenhuma imagem é necessária.\nD-dímero positivo indica angiotomografia de artérias pulmonares.',
    };
  },

  formula: `Oito critérios. Cada um deve estar AUSENTE:

Idade ≥ 50 anos
Frequência cardíaca ≥ 100 bpm
Saturação de O₂ < 95% em ar ambiente
Edema unilateral de membro inferior
Hemoptise
Cirurgia ou trauma nas últimas 4 semanas com anestesia geral
TEP ou TVP prévios
Uso de hormônio exógeno (anticoncepcional, reposição hormonal, estrogênio)

Pré-requisito: probabilidade pré-teste de TEP já baixa (< 15%).

Todos os 8 ausentes → PERC negativo → TEP afastado, sem D-dímero e sem imagem.
Qualquer critério presente → PERC positivo → seguir o algoritmo com D-dímero.`,

  evidence:
    'Kline e colaboradores derivaram a regra em 2004, a partir de 3.148 pacientes de pronto-socorro com suspeita de TEP, e a testaram em coorte independente. A validação definitiva veio em 2008, em estudo prospectivo multicêntrico com 8.138 pacientes com suspeita de TEP em 13 serviços de emergência dos Estados Unidos, dos quais 1.666 (20%) tinham baixa suspeita clínica e PERC negativo: nesse subgrupo, a incidência de tromboembolismo venoso em 45 dias foi de 1,0%, com sensibilidade de 97,4% e especificidade de 21,9%. Em 2018, o ensaio randomizado por cluster PROPER, conduzido em 14 prontos-socorros franceses com 1.916 pacientes, mostrou não inferioridade da estratégia baseada no PERC frente à investigação convencional: 0,1% contra 0% de eventos tromboembólicos em 3 meses, , com menos angiotomografias e alta mais precoce. As diretrizes da Sociedade Europeia de Cardiologia de 2019 incorporaram o PERC como opção (classe IIb) em serviços com baixa prevalência de TEP.',

  creator: {
    name: 'Jeffrey A. Kline',
    bio: 'Emergencista norte-americano, professor de medicina de emergência, referência em pesquisa clínica sobre tromboembolismo pulmonar no pronto-socorro.',
  },

  updatedAt: '2026-07-26',

  references: [
    {
      citation:
        'Kline JA, Mitchell AM, Kabrhel C, Richman PB, Courtney DM. Clinical criteria to prevent unnecessary diagnostic testing in emergency department patients with suspected pulmonary embolism. J Thromb Haemost. 2004;2(8):1247-55.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/15304025/',
      primary: true,
    },
    {
      citation:
        'Kline JA, Courtney DM, Kabrhel C, et al. Prospective multicenter evaluation of the pulmonary embolism rule-out criteria. J Thromb Haemost. 2008;6(5):772-80.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/18318689/',
    },
    {
      citation:
        'Freund Y, Cachanado M, Aubry A, et al. Effect of the Pulmonary Embolism Rule-Out Criteria on Subsequent Thromboembolic Events Among Low-Risk Emergency Department Patients: The PROPER Randomized Clinical Trial. JAMA. 2018;319(6):559-66.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/29450523/',
    },
    {
      citation:
        'Konstantinides SV, Meyer G, Becattini C, et al. 2019 ESC Guidelines for the diagnosis and management of acute pulmonary embolism developed in collaboration with the European Respiratory Society (ERS). Eur Heart J. 2020;41(4):543-603.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/31504429/',
    },
  ],
};

export default calculator;
