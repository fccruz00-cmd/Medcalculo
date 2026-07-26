import type { Calculator, Field, Values } from '@/lib/types';
import { sumPoints } from '@/lib/utils';

/** Só aparece quando o sexo informado é feminino. */
const feminino = (values: Values) => values.sexo === 'F';

const FIELDS: Field[] = [
  {
    id: 'idade',
    kind: 'choice',
    label: 'Idade',
    options: [
      { label: 'Menos de 41 anos', value: 0 },
      { label: '41 a 60 anos', value: 1, badge: '+1' },
      { label: '61 a 74 anos', value: 2, badge: '+2' },
      { label: '75 anos ou mais', value: 3, badge: '+3' },
    ],
  },
  {
    id: 'sexo',
    kind: 'choice',
    label: 'Sexo',
    hint: 'Define se aparecem os itens obstétricos e hormonais do modelo original.',
    options: [
      { label: 'Masculino', value: 'M' },
      { label: 'Feminino', value: 'F' },
    ],
  },

  // ---------------------------------------------------------------- 1 ponto
  {
    id: 'cirurgia_menor',
    kind: 'boolean',
    label: 'Cirurgia de pequeno porte programada',
    hint: 'Procedimento com menos de 45 minutos de duração.',
    points: 1,
  },
  {
    id: 'cirurgia_recente',
    kind: 'boolean',
    label: 'Cirurgia de grande porte nos últimos 30 dias',
    hint: 'História de operação de grande porte no mês anterior à avaliação atual.',
    points: 1,
  },
  {
    id: 'varizes',
    kind: 'boolean',
    label: 'Varizes de membros inferiores',
    points: 1,
  },
  {
    id: 'dii',
    kind: 'boolean',
    label: 'Doença inflamatória intestinal',
    hint: 'Doença de Crohn ou retocolite ulcerativa.',
    points: 1,
  },
  {
    id: 'edema',
    kind: 'boolean',
    label: 'Edema de membros inferiores no momento',
    points: 1,
  },
  {
    id: 'imc',
    kind: 'boolean',
    label: 'IMC > 25 kg/m²',
    hint: 'O modelo original usa sobrepeso, e não obesidade, como ponto de corte.',
    points: 1,
  },
  {
    id: 'iam',
    kind: 'boolean',
    label: 'Infarto agudo do miocárdio',
    points: 1,
  },
  {
    id: 'icc',
    kind: 'boolean',
    label: 'Insuficiência cardíaca congestiva nos últimos 30 dias',
    points: 1,
  },
  {
    id: 'sepse',
    kind: 'boolean',
    label: 'Sepse nos últimos 30 dias',
    points: 1,
  },
  {
    id: 'pneumopatia_aguda',
    kind: 'boolean',
    label: 'Doença pulmonar grave, incluindo pneumonia, nos últimos 30 dias',
    points: 1,
  },
  {
    id: 'dpoc',
    kind: 'boolean',
    label: 'Função pulmonar anormal (DPOC)',
    points: 1,
  },
  {
    id: 'repouso_clinico',
    kind: 'boolean',
    label: 'Paciente clínico atualmente em repouso no leito',
    points: 1,
  },
  {
    id: 'hormonal',
    kind: 'boolean',
    label: 'Anticoncepcional oral ou terapia de reposição hormonal',
    points: 1,
    showIf: feminino,
  },
  {
    id: 'gestacao',
    kind: 'boolean',
    label: 'Gestação ou puerpério nos últimos 30 dias',
    points: 1,
    showIf: feminino,
  },
  {
    id: 'historia_obstetrica',
    kind: 'boolean',
    label: 'História obstétrica desfavorável',
    hint: 'Natimorto sem causa esclarecida, três ou mais abortamentos espontâneos, parto prematuro com toxemia ou recém-nascido com restrição de crescimento.',
    points: 1,
    showIf: feminino,
  },

  // --------------------------------------------------------------- 2 pontos
  {
    id: 'artroscopia',
    kind: 'boolean',
    label: 'Cirurgia artroscópica',
    points: 2,
  },
  {
    id: 'cirurgia_aberta',
    kind: 'boolean',
    label: 'Cirurgia aberta de grande porte (> 45 minutos)',
    points: 2,
  },
  {
    id: 'laparoscopia',
    kind: 'boolean',
    label: 'Cirurgia laparoscópica (> 45 minutos)',
    points: 2,
  },
  {
    id: 'neoplasia',
    kind: 'boolean',
    label: 'Neoplasia maligna atual ou prévia',
    points: 2,
  },
  {
    id: 'acamado',
    kind: 'boolean',
    label: 'Restrito ao leito por mais de 72 horas',
    points: 2,
  },
  {
    id: 'gesso',
    kind: 'boolean',
    label: 'Imobilização gessada nos últimos 30 dias',
    points: 2,
  },
  {
    id: 'cateter_central',
    kind: 'boolean',
    label: 'Acesso venoso central',
    hint: 'Inclui cateter central de inserção periférica (PICC) e cateter de hemodiálise.',
    points: 2,
  },

  // --------------------------------------------------------------- 3 pontos
  {
    id: 'tev_previo',
    kind: 'boolean',
    label: 'Tromboembolismo venoso prévio',
    points: 3,
  },
  {
    id: 'historia_familiar',
    kind: 'boolean',
    label: 'História familiar de tromboembolismo venoso',
    points: 3,
  },
  {
    id: 'fator_v_leiden',
    kind: 'boolean',
    label: 'Fator V de Leiden',
    points: 3,
  },
  {
    id: 'protrombina',
    kind: 'boolean',
    label: 'Mutação G20210A da protrombina',
    points: 3,
  },
  {
    id: 'anticoagulante_lupico',
    kind: 'boolean',
    label: 'Anticoagulante lúpico',
    points: 3,
  },
  {
    id: 'anticardiolipina',
    kind: 'boolean',
    label: 'Anticorpo anticardiolipina',
    points: 3,
  },
  {
    id: 'homocisteina',
    kind: 'boolean',
    label: 'Homocisteína sérica elevada',
    points: 3,
  },
  {
    id: 'hit',
    kind: 'boolean',
    label: 'Trombocitopenia induzida por heparina (HIT)',
    hint: 'História documentada de HIT: contraindica heparina e heparina de baixo peso molecular na profilaxia.',
    points: 3,
  },
  {
    id: 'outra_trombofilia',
    kind: 'boolean',
    label: 'Outra trombofilia congênita ou adquirida',
    hint: 'Deficiência de antitrombina, de proteína C ou de proteína S, entre outras.',
    points: 3,
  },

  // --------------------------------------------------------------- 5 pontos
  {
    id: 'avc',
    kind: 'boolean',
    label: 'AVC nos últimos 30 dias',
    points: 5,
  },
  {
    id: 'artroplastia',
    kind: 'boolean',
    label: 'Artroplastia eletiva de quadril ou joelho',
    points: 5,
  },
  {
    id: 'fratura',
    kind: 'boolean',
    label: 'Fratura de quadril, pelve ou membro inferior nos últimos 30 dias',
    points: 5,
  },
  {
    id: 'politrauma',
    kind: 'boolean',
    label: 'Politraumatismo nos últimos 30 dias',
    points: 5,
  },
  {
    id: 'lesao_medular',
    kind: 'boolean',
    label: 'Lesão medular aguda com paralisia nos últimos 30 dias',
    points: 5,
  },
];

interface Faixa {
  label: string;
  severity: 'baixo' | 'moderado' | 'alto' | 'critico';
  risco: string;
  interpretation: string;
  nextSteps: string;
}

function faixa(pontos: number): Faixa {
  if (pontos === 0) {
    return {
      label: 'Risco muito baixo',
      severity: 'baixo',
      risco: 'Menos de 0,5%',
      interpretation:
        'Risco muito baixo de tromboembolismo venoso. Nenhum fator de risco identificado além do próprio procedimento.',
      nextSteps:
        'Deambulação precoce e agressiva no pós-operatório é suficiente. Não há indicação de profilaxia farmacológica nem mecânica específica.\nGaranta hidratação adequada e evite imobilização desnecessária.',
    };
  }
  if (pontos <= 2) {
    return {
      label: 'Risco baixo',
      severity: 'baixo',
      risco: 'Cerca de 1,5%',
      interpretation:
        'Risco baixo de tromboembolismo venoso. A profilaxia mecânica basta na maioria dos casos.',
      nextSteps:
        'Profilaxia mecânica, de preferência compressão pneumática intermitente, mantida durante a internação e enquanto o paciente estiver restrito ao leito.\nDeambulação precoce. A profilaxia farmacológica de rotina não é recomendada nessa faixa.',
    };
  }
  if (pontos <= 4) {
    return {
      label: 'Risco moderado',
      severity: 'moderado',
      risco: 'Cerca de 3,0%',
      interpretation:
        'Risco moderado de tromboembolismo venoso. A escolha entre profilaxia farmacológica e mecânica depende do risco de sangramento.',
      nextSteps:
        'Sem risco elevado de sangramento: heparina de baixo peso molecular (enoxaparina 40 mg por via subcutânea a cada 24 horas) ou heparina não fracionada 5.000 UI por via subcutânea a cada 8 a 12 horas. A compressão pneumática intermitente é alternativa aceitável.\nCom risco elevado de sangramento ou consequência grave de um sangramento: profilaxia mecânica, de preferência compressão pneumática intermitente, até que o risco diminua.',
    };
  }
  if (pontos <= 8) {
    return {
      label: 'Risco alto',
      severity: 'alto',
      risco: 'Cerca de 6,0%',
      interpretation:
        'Risco alto de tromboembolismo venoso. Está indicada profilaxia farmacológica associada à mecânica, salvo contraindicação.',
      nextSteps:
        'Profilaxia farmacológica com heparina de baixo peso molecular ou heparina não fracionada, associada a meia elástica de compressão graduada ou compressão pneumática intermitente.\nCom risco elevado de sangramento: use apenas profilaxia mecânica e reavalie diariamente, iniciando o anticoagulante assim que possível.\nEm cirurgia oncológica abdominal ou pélvica, considere estender a profilaxia com heparina de baixo peso molecular por 4 semanas após a alta.',
    };
  }
  return {
    label: 'Risco muito alto',
    severity: 'critico',
    risco: 'Acima de 6%',
    interpretation:
      'Acúmulo expressivo de fatores de risco. Risco de tromboembolismo venoso equivalente ou superior ao das faixas mais altas descritas nas coortes de validação.',
    nextSteps:
      'Profilaxia farmacológica com heparina de baixo peso molecular associada à profilaxia mecânica, salvo contraindicação absoluta.\nConsidere profilaxia estendida por até 4 semanas após a alta, sobretudo em cirurgia oncológica abdominopélvica, artroplastia de quadril e fratura de quadril.\nDiscuta o caso com a hematologia quando houver trombofilia documentada, HIT prévia ou TEV recorrente em vigência de anticoagulação.',
  };
}

const calculator: Calculator = {
  slug: 'caprini',
  title: 'Escore de Caprini: risco de tromboembolismo venoso em pacientes cirúrgicos',
  shortTitle: 'Escore de Caprini',
  subtitle:
    'Estratifica o risco de tromboembolismo venoso no paciente cirúrgico e orienta a escolha entre profilaxia mecânica, farmacológica ou ambas.',
  specialties: ['Cirurgia', 'Hematologia', 'Ortopedia', 'Anestesiologia'],
  kind: 'Escore de risco',
  popular: true,
  keywords: [
    'caprini',
    'TEV',
    'tromboembolismo venoso',
    'trombose venosa profunda',
    'TVP',
    'embolia pulmonar',
    'profilaxia',
    'tromboprofilaxia',
    'pré-operatório',
    'cirurgia',
    'enoxaparina',
  ],

  whenToUse: [
    'Avaliação pré-operatória de adultos submetidos a cirurgia geral, vascular, urológica, plástica, torácica ou ortopédica, para definir a estratégia de tromboprofilaxia.',
    'Reavaliação no pós-operatório, quando surgem fatores novos: infecção, imobilização prolongada, cateter venoso central ou reoperação.',
    'Não é o instrumento adequado para pacientes clínicos internados: nesses use o escore de Pádua.',
    'Não se aplica a pacientes já anticoagulados por outra indicação, nem substitui os protocolos específicos de artroplastia e de cirurgia bariátrica, que têm recomendações próprias.',
  ],

  whyUse:
    'O risco de tromboembolismo venoso no paciente cirúrgico varia mais de dez vezes entre extremos, e nenhum fator isolado explica essa variação. O Caprini soma os fatores em uma única escala, e é o modelo que o American College of Chest Physicians usa para ancorar as recomendações de profilaxia em cirurgia não ortopédica.',

  pearls: [
    'O corte de obesidade do modelo original é IMC > 25 kg/m², e não 30: é o erro mais comum ao aplicar o escore. Boa parte dos pacientes cirúrgicos ganha esse ponto.',
    'O escore mede risco de trombose, não de sangramento. Sempre avalie em paralelo as contraindicações: sangramento ativo, plaquetopenia grave, coagulopatia, neurocirurgia ou cirurgia oftalmológica recente e bloqueio neuroaxial em curso.',
    'Com anestesia neuroaxial ou cateter peridural, respeite os intervalos de segurança: pelo menos 12 horas entre a dose profilática de heparina de baixo peso molecular e a punção ou retirada do cateter, e 4 horas entre a retirada e a dose seguinte.',
    'Neoplasia maligna vale 2 pontos mesmo quando é prévia e já tratada: o item original é "malignidade atual ou prévia".',
    'Um item de 5 pontos (AVC recente, artroplastia eletiva, fratura de quadril, pelve ou membro inferior, politrauma, lesão medular aguda) coloca o paciente na faixa de alto risco sozinho.',
    'As incidências observadas na coorte de validação de Michigan (0% na faixa baixa, 0,70% na moderada, 0,97% na alta e 1,94% na mais alta, em 30 dias) são menores que os riscos "sem profilaxia" estimados pelo ACCP, porque a maioria dos pacientes já recebia profilaxia. Não confunda as duas séries de números.',
    'Existem várias versões do escore (1991, 2005, 2010 e 2013). Esta é a de 2005, que é a mais usada e a que sustenta as recomendações do ACCP. Comparar escores obtidos em versões diferentes não é válido.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const pontos = sumPoints(FIELDS, values);
    const resultado = faixa(pontos);

    return {
      value: pontos,
      unit: pontos === 1 ? 'ponto' : 'pontos',
      label: resultado.label,
      severity: resultado.severity,
      interpretation: resultado.interpretation,
      details: [
        {
          label: 'Risco estimado de TEV sintomático sem profilaxia',
          value: resultado.risco,
          hint: 'Estimativas do ACCP, 9ª edição (Gould, 2012), para cirurgia não ortopédica',
        },
        {
          label: 'Faixa do escore',
          value:
            pontos === 0
              ? '0 ponto'
              : pontos <= 2
                ? '1 a 2 pontos'
                : pontos <= 4
                  ? '3 a 4 pontos'
                  : pontos <= 8
                    ? '5 a 8 pontos'
                    : '9 pontos ou mais',
        },
      ],
      nextSteps: resultado.nextSteps,
    };
  },

  formula: `Soma dos pontos de todos os fatores presentes (versão de 2005).

1 ponto cada: idade 41 a 60 anos · cirurgia de pequeno porte programada · cirurgia de grande porte no último mês · varizes · doença inflamatória intestinal · edema de membros inferiores · IMC > 25 kg/m² · infarto agudo do miocárdio · insuficiência cardíaca no último mês · sepse no último mês · doença pulmonar grave ou pneumonia no último mês · função pulmonar anormal (DPOC) · paciente clínico em repouso no leito · anticoncepcional oral ou reposição hormonal · gestação ou puerpério no último mês · história obstétrica desfavorável

2 pontos cada: idade 61 a 74 anos · cirurgia artroscópica · cirurgia aberta de grande porte (> 45 min) · cirurgia laparoscópica (> 45 min) · neoplasia maligna atual ou prévia · restrito ao leito por mais de 72 h · imobilização gessada no último mês · acesso venoso central

3 pontos cada: idade ≥ 75 anos · TEV prévio · história familiar de TEV · fator V de Leiden · mutação G20210A da protrombina · anticoagulante lúpico · anticorpo anticardiolipina · homocisteína elevada · HIT · outra trombofilia congênita ou adquirida

5 pontos cada: AVC no último mês · artroplastia eletiva de quadril ou joelho · fratura de quadril, pelve ou membro inferior no último mês · politraumatismo no último mês · lesão medular aguda com paralisia no último mês

Faixas usadas pelo ACCP: 0 = risco muito baixo · 1 a 2 = baixo · 3 a 4 = moderado · ≥ 5 = alto`,

  evidence:
    'O modelo foi proposto por Joseph Caprini a partir de uma revisão dos fatores de risco de tromboembolismo venoso, na versão consolidada em 2005. A validação mais citada é a de Bahl e colaboradores, que aplicou o escore a 8.216 pacientes cirúrgicos do National Surgical Quality Improvement Program da Universidade de Michigan: a incidência global de TEV em 30 dias foi de 1,4%, subindo de 0% na faixa de risco baixo para 0,70% na moderada, 0,97% na alta e 1,94% na mais alta. Como a maior parte da coorte já recebia profilaxia, esses valores subestimam o risco basal; as estimativas de risco sem profilaxia adotadas pelo American College of Chest Physicians na 9ª edição das diretrizes (menos de 0,5%, cerca de 1,5%, cerca de 3% e cerca de 6% para as faixas muito baixa, baixa, moderada e alta) são as que sustentam as recomendações de conduta. Estudos posteriores em cirurgia plástica, torácica e de cabeça e pescoço reproduziram o gradiente de risco, ainda que com incidências absolutas diferentes conforme a especialidade.',

  creator: {
    name: 'Joseph A. Caprini',
    bio: 'Cirurgião vascular norte-americano, professor emérito da Northwestern University, em Chicago, que desenvolveu o modelo de avaliação de risco de tromboembolismo venoso que leva seu nome.',
  },

  updatedAt: '2026-07-26',

  references: [
    {
      citation:
        'Caprini JA. Thrombosis risk assessment as a guide to quality patient care. Dis Mon. 2005;51(2-3):70-8.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/15900257/',
      primary: true,
    },
    {
      citation:
        'Bahl V, Hu HM, Henke PK, Wakefield TW, Campbell DA Jr, Caprini JA. A validation study of a retrospective venous thromboembolism risk scoring method. Ann Surg. 2010;251(2):344-50.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/19779324/',
    },
    {
      citation:
        'Gould MK, Garcia DA, Wren SM, et al. Prevention of VTE in nonorthopedic surgical patients: Antithrombotic Therapy and Prevention of Thrombosis, 9th ed: American College of Chest Physicians Evidence-Based Clinical Practice Guidelines. Chest. 2012;141(2 Suppl):e227S-e277S.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/22315263/',
    },
  ],
};

export default calculator;
