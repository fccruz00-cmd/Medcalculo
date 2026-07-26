import type { Calculator, Field, Values } from '@/lib/types';
import { sumPoints } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'cancer',
    kind: 'boolean',
    label: 'Câncer ativo',
    hint: 'Metástases locais ou a distância e/ou quimioterapia ou radioterapia nos últimos 6 meses.',
    points: 3,
  },
  {
    id: 'tev_previo',
    kind: 'boolean',
    label: 'Tromboembolismo venoso prévio',
    hint: 'Trombose venosa profunda ou embolia pulmonar prévias. Tromboflebite superficial isolada não conta.',
    points: 3,
  },
  {
    id: 'mobilidade',
    kind: 'boolean',
    label: 'Mobilidade reduzida',
    hint: 'Restrição ao leito, com permissão apenas para ir ao banheiro, por pelo menos 3 dias: previstos ou já decorridos.',
    points: 3,
  },
  {
    id: 'trombofilia',
    kind: 'boolean',
    label: 'Trombofilia já conhecida',
    hint: 'Deficiência de antitrombina, de proteína C ou de proteína S, fator V de Leiden, mutação G20210A da protrombina ou síndrome antifosfolípide.',
    points: 3,
  },
  {
    id: 'trauma_cirurgia',
    kind: 'boolean',
    label: 'Trauma ou cirurgia no último mês',
    points: 2,
  },
  {
    id: 'idade',
    kind: 'boolean',
    label: 'Idade ≥ 70 anos',
    points: 1,
  },
  {
    id: 'ic_ir',
    kind: 'boolean',
    label: 'Insuficiência cardíaca e/ou insuficiência respiratória',
    hint: 'Descompensação aguda ou doença crônica em atividade que motive a internação.',
    points: 1,
  },
  {
    id: 'iam_avc',
    kind: 'boolean',
    label: 'Infarto agudo do miocárdio ou AVC isquêmico agudo',
    points: 1,
  },
  {
    id: 'infeccao_reumato',
    kind: 'boolean',
    label: 'Infecção aguda e/ou doença reumatológica em atividade',
    points: 1,
  },
  {
    id: 'obesidade',
    kind: 'boolean',
    label: 'Obesidade (IMC ≥ 30 kg/m²)',
    points: 1,
  },
  {
    id: 'hormonal',
    kind: 'boolean',
    label: 'Tratamento hormonal em curso',
    hint: 'Anticoncepcional oral, terapia de reposição hormonal ou terapia hormonal antineoplásica (por exemplo, tamoxifeno).',
    points: 1,
  },
];

const calculator: Calculator = {
  slug: 'padua',
  title: 'Escore de Pádua: risco de tromboembolismo venoso em pacientes clínicos',
  shortTitle: 'Escore de Pádua',
  subtitle:
    'Identifica pacientes clínicos internados com risco alto de tromboembolismo venoso e que se beneficiam de tromboprofilaxia farmacológica.',
  specialties: ['Hematologia', 'Clínica Médica', 'Emergência'],
  kind: 'Escore de risco',
  popular: true,
  keywords: [
    'padua',
    'pádua',
    'padua prediction score',
    'TEV',
    'tromboembolismo venoso',
    'trombose venosa profunda',
    'TVP',
    'embolia pulmonar',
    'profilaxia',
    'tromboprofilaxia',
    'heparina',
    'enoxaparina',
  ],

  whenToUse: [
    'Adultos internados em enfermaria clínica, na admissão, para decidir sobre tromboprofilaxia farmacológica.',
    'Reavaliação durante a internação, sempre que a mobilidade, a função cardiorrespiratória ou o quadro infeccioso mudarem.',
    'Não se aplica a pacientes cirúrgicos, nesses use o escore de Caprini, nem a gestantes, pacientes já anticoagulados por outra indicação ou menores de 18 anos.',
    'Não foi derivado para decidir profilaxia estendida após a alta hospitalar.',
  ],

  whyUse:
    'A tromboprofilaxia em pacientes clínicos é ao mesmo tempo subutilizada em quem precisa e usada em excesso em quem não precisa. O escore de Pádua é o modelo de avaliação de risco recomendado pelo ACCP e pela ASH para essa decisão: na coorte de derivação, os pacientes de alto risco que não receberam profilaxia tiveram 11% de TEV sintomático em 90 dias, contra 0,3% nos de baixo risco.',

  pearls: [
    '"Mobilidade reduzida" não é sinônimo de "internado". O critério original exige restrição ao leito, com permissão apenas para ir ao banheiro, por 3 dias ou mais: previstos ou já decorridos. Aplicá-lo a todo paciente internado infla o escore e leva a profilaxia desnecessária.',
    'O escore avalia apenas o risco de trombose. Antes de prescrever, verifique separadamente o risco de sangramento e as contraindicações: sangramento ativo, plaquetas abaixo de 50.000/mm³, coagulopatia grave, punção lombar ou anestesia neuroaxial recente, hipertensão não controlada. O escore IMPROVE de sangramento é o instrumento correspondente.',
    'Quatro itens valem 3 pontos cada (câncer ativo, TEV prévio, mobilidade reduzida e trombofilia conhecida). Qualquer combinação de dois deles já ultrapassa o corte, e mobilidade reduzida somada a qualquer fator de 1 ponto, idade ≥ 70 anos, infecção aguda, obesidade, já atinge o corte de 4. Quem não chega ao corte é o paciente com trauma ou cirurgia no último mês (2 pontos) e um único fator de 1 ponto.',
    'Insuficiência renal grave muda o fármaco, não a indicação: com clearance abaixo de 30 mL/min, prefira heparina não fracionada 5.000 UI a cada 8 ou 12 horas, ou reduza a enoxaparina para 20 a 40 mg/dia conforme protocolo institucional.',
    'Validações externas mostraram discriminação apenas modesta (estatística C em torno de 0,6). O escore organiza a decisão, mas não substitui o julgamento clínico: pacientes com escore abaixo de 4 e um fator de risco muito forte ainda podem merecer profilaxia.',
    'Meias de compressão graduada não são alternativa aceitável à profilaxia farmacológica em pacientes clínicos; quando há contraindicação a anticoagulante, prefira compressão pneumática intermitente e reavalie diariamente.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const pontos = sumPoints(FIELDS, values);
    const altoRisco = pontos >= 4;

    return {
      value: pontos,
      unit: pontos === 1 ? 'ponto' : 'pontos',
      label: altoRisco ? 'Alto risco de TEV' : 'Baixo risco de TEV',
      severity: altoRisco ? 'alto' : 'baixo',
      interpretation: altoRisco
        ? 'Escore ≥ 4: alto risco de tromboembolismo venoso. Na coorte de Pádua, os pacientes de alto risco que não receberam profilaxia apresentaram 11,0% de TEV sintomático em 90 dias, contra 2,2% entre os que receberam.'
        : 'Escore < 4: baixo risco de tromboembolismo venoso. Na coorte de Pádua, a incidência de TEV sintomático em 90 dias nesse grupo foi de 0,3%, e a profilaxia farmacológica de rotina não traz benefício que compense o risco de sangramento.',
      details: [
        {
          label: 'TEV sintomático em 90 dias',
          value: altoRisco ? '11,0% sem profilaxia · 2,2% com profilaxia' : '0,3%',
          hint: 'Coorte de derivação de Pádua (Barbar, 2010), 1.180 pacientes clínicos',
        },
        {
          label: 'Conduta sugerida',
          value: altoRisco ? 'Profilaxia farmacológica indicada' : 'Profilaxia farmacológica não indicada',
        },
      ],
      nextSteps: altoRisco
        ? 'Indique tromboprofilaxia farmacológica, salvo contraindicação: enoxaparina 40 mg por via subcutânea a cada 24 horas, ou heparina não fracionada 5.000 UI por via subcutânea a cada 8 a 12 horas. Com clearance de creatinina abaixo de 30 mL/min, prefira a heparina não fracionada ou ajuste a dose da enoxaparina.\nSe houver contraindicação ao anticoagulante, use compressão pneumática intermitente e reavalie diariamente a possibilidade de iniciar o fármaco.\nMantenha a profilaxia enquanto durar a restrição de mobilidade e a doença aguda: em geral 6 a 14 dias. A profilaxia estendida após a alta não é recomendada de rotina.'
        : 'Não prescreva profilaxia farmacológica de rotina. Estimule a deambulação precoce e a hidratação adequada.\nReavalie o escore diariamente: piora da mobilidade, infecção nova ou descompensação cardiorrespiratória podem levá-lo acima do corte.',
    };
  },

  formula: `Soma dos pontos (máximo 20). Alto risco quando o total é ≥ 4.

3 pontos cada:
· Câncer ativo
· Tromboembolismo venoso prévio
· Mobilidade reduzida (repouso no leito ≥ 3 dias)
· Trombofilia já conhecida

2 pontos:
· Trauma ou cirurgia no último mês

1 ponto cada:
· Idade ≥ 70 anos
· Insuficiência cardíaca e/ou respiratória
· Infarto agudo do miocárdio ou AVC isquêmico agudo
· Infecção aguda e/ou doença reumatológica em atividade
· Obesidade (IMC ≥ 30 kg/m²)
· Tratamento hormonal em curso`,

  evidence:
    'O escore foi derivado por Barbar e colaboradores em uma coorte prospectiva de 1.180 pacientes consecutivos internados em enfermaria de clínica médica da Universidade de Pádua, acompanhados por até 90 dias. Foram classificados como de alto risco 469 pacientes (39,7%). Entre os de alto risco que não receberam tromboprofilaxia, 31 de 283 (11,0%) tiveram TEV sintomático, contra 4 de 186 (2,2%) entre os que receberam (razão de risco 0,13; IC 95% 0,04 a 0,40). Entre os de baixo risco, o TEV ocorreu em 2 de 711 (0,3%), com razão de risco de 32,0 para os de alto risco sem profilaxia em relação a eles. Sangramento ocorreu em 1,6% dos pacientes de alto risco que receberam profilaxia. As diretrizes do American College of Chest Physicians de 2012 e da American Society of Hematology de 2018 adotam o modelo para estratificar pacientes clínicos. Validações externas, como a de Greene e colaboradores em coorte norte-americana, mostraram discriminação apenas modesta (estatística C em torno de 0,6), o que reforça o uso do escore como apoio, e não como substituto, do julgamento clínico.',

  creator: {
    name: 'Sofia Barbar e Paolo Prandoni',
    bio: 'Grupo de medicina interna e doença tromboembólica da Universidade de Pádua, na Itália, onde o modelo foi derivado e publicado em 2010.',
  },

  references: [
    {
      citation:
        'Barbar S, Noventa F, Rossetto V, et al. A risk assessment model for the identification of hospitalized medical patients at risk for venous thromboembolism: the Padua Prediction Score. J Thromb Haemost. 2010;8(11):2450-7.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/20738765/',
      primary: true,
    },
    {
      citation:
        'Kahn SR, Lim W, Dunn AS, et al. Prevention of VTE in nonsurgical patients: Antithrombotic Therapy and Prevention of Thrombosis, 9th ed: American College of Chest Physicians Evidence-Based Clinical Practice Guidelines. Chest. 2012;141(2 Suppl):e195S-e226S.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/22315261/',
    },
    {
      citation:
        'Schünemann HJ, Cushman M, Burnett AE, et al. American Society of Hematology 2018 guidelines for management of venous thromboembolism: prophylaxis for hospitalized and nonhospitalized medical patients. Blood Adv. 2018;2(22):3198-225.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/30482763/',
    },
    {
      citation:
        'Greene MT, Spyropoulos AC, Chopra V, et al. Validation of Risk Assessment Models of Venous Thromboembolism in Hospitalized Medical Patients. Am J Med. 2016;129(9):1001.e9-1001.e18.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/27107925/',
    },
  ],
};

export default calculator;
