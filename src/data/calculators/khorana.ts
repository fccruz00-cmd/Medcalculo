import type { Calculator, Field, Values } from '@/lib/types';
import { n, num } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'sitio',
    kind: 'select',
    label: 'Sítio primário do tumor',
    placeholder: 'Selecione o sítio',
    hint: 'A classificação vem do modelo original, derivado em pacientes ambulatoriais iniciando quimioterapia.',
    options: [
      { label: 'Estômago ou pâncreas: risco muito alto', value: 2, badge: '+2' },
      {
        label: 'Pulmão, linfoma, ginecológico, bexiga ou testículo: risco alto',
        value: 1,
        badge: '+1',
        hint: 'Ginecológico inclui colo do útero, corpo do útero e ovário.',
      },
      {
        label: 'Outros sítios',
        value: 0,
        hint: 'Mama, próstata, colorretal, cabeça e pescoço, entre outros.',
      },
    ],
  },
  {
    id: 'plaquetas',
    kind: 'number',
    label: 'Contagem de plaquetas antes da quimioterapia',
    unit: '/mm³',
    min: 1000,
    max: 1500000,
    step: 1000,
    normalRange: '150.000 a 450.000/mm³',
    hint: 'Marca 1 ponto quando ≥ 350.000/mm³ (350 × 10⁹/L). Use o hemograma anterior ao primeiro ciclo.',
    unitToggle: {
      alt: '× 10⁹/L',
      toBase: (value) => value * 1000,
      fromBase: (value) => value / 1000,
    },
  },
  {
    id: 'hemoglobina',
    kind: 'number',
    label: 'Hemoglobina',
    unit: 'g/dL',
    min: 3,
    max: 22,
    step: 0.1,
    normalRange: '12 a 16 g/dL em mulheres e 13 a 17 g/dL em homens',
    hint: 'Marca 1 ponto quando < 10 g/dL (100 g/L).',
  },
  {
    id: 'esa',
    kind: 'boolean',
    label: 'Uso de agente estimulador da eritropoese',
    hint: 'Eritropoetina ou darbepoetina. Marca o mesmo ponto da hemoglobina baixa: os dois juntos não somam 2.',
    points: 1,
  },
  {
    id: 'leucocitos',
    kind: 'number',
    label: 'Contagem de leucócitos antes da quimioterapia',
    unit: '/mm³',
    min: 100,
    max: 200000,
    step: 100,
    normalRange: '4.000 a 11.000/mm³',
    hint: 'Marca 1 ponto quando > 11.000/mm³ (11 × 10⁹/L).',
    unitToggle: {
      alt: '× 10⁹/L',
      toBase: (value) => value * 1000,
      fromBase: (value) => value / 1000,
    },
  },
  {
    id: 'imc',
    kind: 'number',
    label: 'Índice de massa corporal',
    unit: 'kg/m²',
    min: 10,
    max: 70,
    step: 0.1,
    hint: 'Marca 1 ponto quando ≥ 35 kg/m²: obesidade grau II ou III, e não sobrepeso.',
  },
];

const calculator: Calculator = {
  slug: 'khorana',
  title: 'Escore de Khorana: risco de tromboembolismo venoso no paciente com câncer',
  shortTitle: 'Escore de Khorana',
  subtitle:
    'Estima o risco de tromboembolismo venoso em pacientes ambulatoriais com câncer que vão iniciar quimioterapia e seleciona quem pode se beneficiar de tromboprofilaxia.',
  specialties: ['Oncologia', 'Hematologia'],
  kind: 'Escore de risco',
  keywords: [
    'khorana',
    'TEV',
    'tromboembolismo venoso',
    'trombose associada ao câncer',
    'trombose e câncer',
    'quimioterapia',
    'profilaxia',
    'apixabana',
    'rivaroxabana',
    'enoxaparina',
  ],

  whenToUse: [
    'Pacientes ambulatoriais com tumor sólido ou linfoma que vão iniciar um novo esquema de quimioterapia sistêmica, para decidir sobre tromboprofilaxia primária.',
    'Reavaliação a cada novo esquema de tratamento, já que o sítio tumoral pesa mais que qualquer outro item e os exames mudam ao longo do tratamento.',
    'Não se aplica a pacientes internados, já anticoagulados, com TEV atual, com mieloma múltiplo (que tem modelos próprios, como IMPEDE-VTE e SAVED) ou com tumor primário do sistema nervoso central.',
    'Não foi derivado nem validado para quem recebe apenas hormonioterapia ou apenas imunoterapia.',
  ],

  whyUse:
    'A trombose é a segunda causa de morte no paciente oncológico ambulatorial, mas anticoagular todo mundo não se justifica. O escore de Khorana é o instrumento usado pelos ensaios AVERT e CASSINI para selecionar os pacientes que recebem profilaxia primária, e é o modelo recomendado pela ASCO e pela ITAC para essa decisão.',

  pearls: [
    'Os exames devem ser os anteriores ao primeiro ciclo. Hemograma colhido durante a quimioterapia, já sob mielossupressão, reduz artificialmente as plaquetas e os leucócitos e derruba o escore.',
    'Hemoglobina abaixo de 10 g/dL e uso de eritropoetina são o mesmo item: quem tem os dois marca 1 ponto, não 2.',
    'O corte do índice de massa corporal é 35 kg/m², não 30. Sobrepeso e obesidade grau I não pontuam.',
    'O escore original define alto risco como 3 pontos ou mais, mas os ensaios clínicos de profilaxia (AVERT e CASSINI) e as diretrizes da ASCO usam 2 pontos ou mais como limiar para oferecer anticoagulação. As duas leituras convivem na literatura: deixe claro qual está usando.',
    'Um escore baixo não significa risco desprezível. Na metanálise de Mulder, com quase 28 mil pacientes, a incidência de TEV em 6 meses foi de 5,0% mesmo entre os que tinham 0 ponto, e apenas 23% de todos os eventos ocorreram no grupo de alto risco.',
    'O desempenho é fraco em câncer de pulmão, no qual quase todos os pacientes se concentram nas faixas intermediárias, e o modelo não foi construído para mieloma múltiplo nem para tumores cerebrais primários.',
    'Antes de prescrever profilaxia, avalie o risco de sangramento: lesão luminal em tumor gastrointestinal ou geniturinário, plaquetas abaixo de 50.000/mm³, insuficiência renal grave e interações com indutores ou inibidores potentes de CYP3A4 e glicoproteína P contraindicam ou limitam os anticoagulantes orais diretos.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const sitio = n(values, 'sitio');
    const plaquetas = n(values, 'plaquetas');
    const hemoglobina = n(values, 'hemoglobina');
    const usaEsa = n(values, 'esa') > 0;
    const leucocitos = n(values, 'leucocitos');
    const imc = n(values, 'imc');

    const pontoPlaquetas = plaquetas >= 350000 ? 1 : 0;
    const pontoAnemia = hemoglobina > 0 && hemoglobina < 10 ? 1 : usaEsa ? 1 : 0;
    const pontoLeucocitos = leucocitos > 11000 ? 1 : 0;
    const pontoImc = imc >= 35 ? 1 : 0;

    const pontos = sitio + pontoPlaquetas + pontoAnemia + pontoLeucocitos + pontoImc;

    let label: string;
    let severity: 'baixo' | 'moderado' | 'alto';
    let interpretation: string;
    let taxaDerivacao: string;
    let nextSteps: string;

    if (pontos === 0) {
      label = 'Risco baixo';
      severity = 'baixo';
      taxaDerivacao = '0,8% na derivação e 0,3% na validação';
      interpretation =
        'Risco baixo. Na coorte de derivação de Khorana, a incidência de TEV sintomático em cerca de 2,5 meses foi de 0,8%, e de 0,3% na coorte de validação.';
      nextSteps =
        'Não está indicada tromboprofilaxia farmacológica primária.\nOriente o paciente sobre os sinais de trombose venosa profunda e de embolia pulmonar, e recalcule o escore a cada novo esquema de quimioterapia.';
    } else if (pontos === 1) {
      label = 'Risco intermediário';
      severity = 'moderado';
      taxaDerivacao = '1,8% na derivação e 2,0% na validação';
      interpretation =
        'Risco intermediário. Na coorte de derivação, a faixa de 1 a 2 pontos teve incidência de TEV sintomático de 1,8% em cerca de 2,5 meses, e de 2,0% na validação. Com apenas 1 ponto, o paciente fica abaixo do limiar usado nos ensaios de profilaxia primária.';
      nextSteps =
        'A profilaxia farmacológica primária não é indicada de rotina nessa pontuação.\nReavalie a cada ciclo e diante de internação, imobilização, cirurgia ou progressão da doença, situações que mudam o balanço de risco.';
    } else if (pontos === 2) {
      label = 'Risco intermediário: limiar de profilaxia atingido';
      severity = 'moderado';
      taxaDerivacao = '1,8% na derivação e 2,0% na validação';
      interpretation =
        'Risco intermediário pelo modelo original (faixa de 1 a 2 pontos: 1,8% de TEV na derivação e 2,0% na validação, em cerca de 2,5 meses). Com 2 pontos o paciente já atende ao critério de inclusão dos ensaios AVERT e CASSINI, que testaram profilaxia primária nessa população.';
      nextSteps =
        'Discuta com o paciente a tromboprofilaxia primária, conforme recomendam a ASCO e a ITAC: apixabana 2,5 mg por via oral a cada 12 horas, rivaroxabana 10 mg por via oral a cada 24 horas, ou heparina de baixo peso molecular em dose profilática, por até 6 meses.\nContraindicações: sangramento ativo, lesão luminal em tumor gastrointestinal ou geniturinário, plaquetas abaixo de 50.000/mm³, insuficiência renal grave e interações medicamentosas relevantes.\nSe optar por não anticoagular, reavalie a cada ciclo.';
    } else {
      label = 'Risco alto';
      severity = 'alto';
      taxaDerivacao = '7,1% na derivação e 6,7% na validação';
      interpretation =
        'Risco alto. Na coorte de derivação de Khorana, a incidência de TEV sintomático em cerca de 2,5 meses foi de 7,1%, e de 6,7% na validação. Na metanálise de Mulder, a incidência em 6 meses nessa faixa chegou a 11,0%.';
      nextSteps =
        'Ofereça tromboprofilaxia primária, salvo contraindicação: apixabana 2,5 mg por via oral a cada 12 horas, rivaroxabana 10 mg por via oral a cada 24 horas, ou heparina de baixo peso molecular em dose profilática, por até 6 meses.\nVerifique antes o risco de sangramento e as interações com indutores ou inibidores potentes de CYP3A4 e glicoproteína P: antifúngicos azólicos, rifampicina, alguns antirretrovirais.\nOriente sobre sinais de alarme e mantenha limiar baixo para investigar trombose sintomática.';
    }

    return {
      value: pontos,
      unit: pontos === 1 ? 'ponto' : 'pontos',
      label,
      severity,
      interpretation,
      details: [
        {
          label: 'TEV sintomático em cerca de 2,5 meses',
          value: taxaDerivacao,
          hint: 'Coortes de derivação (2.701 pacientes) e validação (1.365) de Khorana, 2008',
        },
        {
          label: 'Pontos por item',
          value: `Sítio ${num(sitio)} · Plaquetas ${num(pontoPlaquetas)} · Hemoglobina/EPO ${num(pontoAnemia)} · Leucócitos ${num(pontoLeucocitos)} · IMC ${num(pontoImc)}`,
        },
      ],
      nextSteps,
    };
  },

  formula: `Soma dos pontos (máximo 6):

Sítio primário do tumor
· Estômago ou pâncreas: 2
· Pulmão, linfoma, ginecológico, bexiga ou testículo: 1
· Outros sítios: 0

1 ponto cada:
· Plaquetas antes da quimioterapia ≥ 350.000/mm³ (350 × 10⁹/L)
· Hemoglobina < 10 g/dL ou uso de agente estimulador da eritropoese
· Leucócitos antes da quimioterapia > 11.000/mm³ (11 × 10⁹/L)
· Índice de massa corporal ≥ 35 kg/m²

Faixas do modelo original: 0 = risco baixo · 1 a 2 = intermediário · ≥ 3 = alto
Limiar usado pelos ensaios AVERT e CASSINI e pelas diretrizes da ASCO: ≥ 2 pontos`,

  evidence:
    'O modelo foi derivado por Khorana e colaboradores em 2.701 pacientes ambulatoriais com câncer de um estudo observacional prospectivo e validado em 1.365 pacientes independentes da mesma coorte. Em um seguimento mediano de 2,5 meses, as taxas de TEV sintomático foram de 0,8% e 0,3% no grupo de baixo risco (0 ponto), 1,8% e 2,0% no intermediário (1 a 2 pontos) e 7,1% e 6,7% no alto risco (≥ 3 pontos), nas coortes de derivação e validação respectivamente, com estatística C de 0,7 em ambas. Os ensaios AVERT (apixabana) e CASSINI (rivaroxabana), publicados em 2019, incluíram pacientes com escore ≥ 2 e mostraram redução do TEV com aumento aceitável de sangramento, o que levou a ASCO a recomendar que a profilaxia seja oferecida a partir desse limiar. A metanálise de Mulder e colaboradores, com 34.555 pacientes de 55 coortes, confirmou o gradiente de risco em 6 meses (5,0%, 6,6% e 11,0% nas faixas de 0, 1 a 2 e ≥ 3 pontos), mas mostrou que apenas 23,4% de todos os eventos ocorreram no grupo de alto risco: a principal limitação do escore.',

  creator: {
    name: 'Alok A. Khorana',
    bio: 'Oncologista norte-americano da Cleveland Clinic, referência em trombose associada ao câncer, que derivou o modelo em 2008 quando estava na Universidade de Rochester.',
  },

  updatedAt: '2026-07-26',

  references: [
    {
      citation:
        'Khorana AA, Kuderer NM, Culakova E, Lyman GH, Francis CW. Development and validation of a predictive model for chemotherapy-associated thrombosis. Blood. 2008;111(10):4902-7.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/18216292/',
      primary: true,
    },
    {
      citation:
        'Key NS, Khorana AA, Kuderer NM, et al. Venous Thromboembolism Prophylaxis and Treatment in Patients With Cancer: ASCO Clinical Practice Guideline Update. J Clin Oncol. 2020;38(5):496-520.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/31381464/',
    },
    {
      citation:
        'Carrier M, Abou-Nassar K, Mallick R, et al. Apixaban to Prevent Venous Thromboembolism in Patients with Cancer. N Engl J Med. 2019;380(8):711-9.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/30511879/',
    },
    {
      citation:
        'Khorana AA, Soff GA, Kakkar AK, et al. Rivaroxaban for Thromboprophylaxis in High-Risk Ambulatory Patients with Cancer. N Engl J Med. 2019;380(8):720-8.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/30786186/',
    },
    {
      citation:
        'Mulder FI, Candeloro M, Kamphuisen PW, et al. The Khorana score for prediction of venous thromboembolism in cancer patients: a systematic review and meta-analysis. Haematologica. 2019;104(6):1277-87.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/30606788/',
    },
  ],
};

export default calculator;
