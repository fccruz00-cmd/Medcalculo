import type { Calculator, Field, Values } from '@/lib/types';
import { n, num } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'creatinina',
    kind: 'number',
    label: 'Creatinina sérica',
    unit: 'mg/dL',
    min: 0.1,
    max: 25,
    step: 0.01,
    normalRange: '0,6 a 1,2 mg/dL',
    hint: 'Dosagem padronizada por espectrometria de massa com diluição isotópica (IDMS).',
    unitToggle: {
      alt: 'µmol/L',
      toBase: (value) => value / 88.4,
      fromBase: (value) => value * 88.4,
    },
  },
  {
    id: 'idade',
    kind: 'number',
    label: 'Idade',
    unit: 'anos',
    min: 18,
    max: 120,
    step: 1,
    hint: 'A equação foi desenvolvida e validada em adultos. Em menores de 18 anos, use a fórmula de Schwartz.',
  },
  {
    id: 'sexo',
    kind: 'choice',
    label: 'Sexo',
    options: [
      { label: 'Masculino', value: 'M' },
      { label: 'Feminino', value: 'F' },
    ],
  },
];

/** Estágios de doença renal crônica segundo o KDIGO. */
function estagio(tfg: number): { codigo: string; texto: string } {
  if (tfg >= 90) return { codigo: 'G1', texto: 'Normal ou elevada' };
  if (tfg >= 60) return { codigo: 'G2', texto: 'Levemente reduzida' };
  if (tfg >= 45) return { codigo: 'G3a', texto: 'Redução leve a moderada' };
  if (tfg >= 30) return { codigo: 'G3b', texto: 'Redução moderada a grave' };
  if (tfg >= 15) return { codigo: 'G4', texto: 'Redução grave' };
  return { codigo: 'G5', texto: 'Falência renal' };
}

const calculator: Calculator = {
  slug: 'tfg-ckd-epi',
  title: 'Taxa de filtração glomerular: CKD-EPI 2021',
  shortTitle: 'TFG (CKD-EPI 2021)',
  subtitle:
    'Estima a taxa de filtração glomerular a partir da creatinina sérica, sem o coeficiente de raça, e classifica o estágio da doença renal crônica.',
  specialties: ['Nefrologia', 'Clínica Médica', 'Geriatria'],
  kind: 'Fórmula',
  popular: true,
  keywords: [
    'ckd epi',
    'ckdepi',
    'TFG',
    'RFG',
    'filtração glomerular',
    'clearance',
    'função renal',
    'doença renal crônica',
    'DRC',
    'creatinina',
  ],

  whenToUse: [
    'Estimar a função renal de adultos em situação clínica estável, para diagnóstico e estadiamento de doença renal crônica.',
    'Acompanhar a evolução da função renal ao longo do tempo.',
    'Ajustar doses de medicamentos quando a bula usa TFG estimada: atenção, pois muitas bulas ainda se baseiam no clearance de Cockcroft-Gault.',
  ],

  whyUse:
    'A equação CKD-EPI de 2021 removeu o coeficiente de raça, que não tem base biológica, e é hoje a recomendada pelo KDIGO e pelas sociedades brasileiras de nefrologia. É mais precisa que a MDRD, sobretudo em valores de filtração acima de 60 mL/min/1,73 m².',

  pearls: [
    'A estimativa não é válida em lesão renal aguda: com a creatinina em ascensão ou em queda, o resultado subestima ou superestima a função real.',
    'Massa muscular muito alta ou muito baixa distorce o resultado: amputados, pessoas com sarcopenia, atletas e pacientes com cirrose têm creatinina pouco confiável. Nesses casos, considere a cistatina C.',
    'O resultado é normalizado para 1,73 m² de superfície corporal. Para ajustar dose de quimioterápicos ou de antimicrobianos em pacientes com peso extremo, desnormalize para a superfície corporal real.',
    'O estadiamento completo da doença renal crônica exige também a albuminúria (categorias A1 a A3) e a confirmação em pelo menos dois exames com intervalo de três meses.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const creatinina = n(values, 'creatinina');
    const idade = n(values, 'idade');
    const feminino = values.sexo === 'F';

    if (creatinina <= 0 || idade <= 0) {
      return {
        value: '-',
        interpretation: 'Informe uma creatinina e uma idade válidas.',
        severity: 'info' as const,
      };
    }

    const kappa = feminino ? 0.7 : 0.9;
    const alpha = feminino ? -0.241 : -0.302;
    const razao = creatinina / kappa;

    const tfg =
      142 *
      Math.pow(Math.min(razao, 1), alpha) *
      Math.pow(Math.max(razao, 1), -1.2) *
      Math.pow(0.9938, idade) *
      (feminino ? 1.012 : 1);

    const arredondada = Math.round(tfg);
    const fase = estagio(arredondada);

    let severity: 'baixo' | 'moderado' | 'alto' | 'critico';
    let interpretation: string;
    let nextSteps: string;

    if (arredondada >= 60) {
      severity = 'baixo';
      interpretation =
        'Filtração glomerular preservada ou apenas levemente reduzida. Isoladamente, esse valor não define doença renal crônica: o diagnóstico exige alteração estrutural ou albuminúria persistente por mais de três meses.';
      nextSteps =
        'Solicite relação albumina/creatinina urinária para completar o estadiamento.\nControle os fatores de risco: pressão arterial, glicemia e uso de nefrotóxicos.';
    } else if (arredondada >= 30) {
      severity = 'moderado';
      interpretation =
        'Redução moderada da filtração glomerular, compatível com doença renal crônica estágio 3 quando persistente por mais de três meses.';
      nextSteps =
        'Investigue e trate as complicações: anemia, distúrbio mineral e ósseo, acidose metabólica e hiperpotassemia.\nRevise as doses de todos os medicamentos, evite anti-inflamatórios e considere encaminhamento ao nefrologista, sobretudo no estágio G3b.\nEm diabetes ou albuminúria, considere inibidor de SGLT2 e bloqueio do sistema renina-angiotensina.';
    } else if (arredondada >= 15) {
      severity = 'alto';
      interpretation =
        'Redução grave da filtração glomerular (estágio G4). Risco elevado de progressão para falência renal e de eventos cardiovasculares.';
      nextSteps =
        'Encaminhamento ao nefrologista é obrigatório.\nInicie a preparação para terapia renal substitutiva: orientação sobre modalidades, avaliação de acesso vascular e encaminhamento para transplante quando elegível.\nEvite contraste iodado e nefrotóxicos sempre que possível.';
    } else {
      severity = 'critico';
      interpretation =
        'Falência renal (estágio G5). Há indicação de avaliação imediata para terapia renal substitutiva.';
      nextSteps =
        'Avaliação nefrológica imediata para início de diálise ou transplante, conforme sintomas urêmicos, sobrecarga volêmica, hiperpotassemia e acidose refratárias.';
    }

    return {
      value: num(arredondada),
      unit: 'mL/min/1,73 m²',
      label: `Estágio ${fase.codigo}`,
      severity,
      interpretation,
      details: [
        { label: 'Estágio KDIGO', value: `${fase.codigo}: ${fase.texto}` },
        { label: 'Valor sem arredondamento', value: `${num(tfg, 1)} mL/min/1,73 m²` },
      ],
      nextSteps,
    };
  },

  formula: `TFG = 142 × min(Cr/κ, 1)^α × max(Cr/κ, 1)^−1,200 × 0,9938^idade × 1,012 (se feminino)

Onde:
κ = 0,7 para mulheres e 0,9 para homens
α = −0,241 para mulheres e −0,302 para homens
Cr = creatinina sérica em mg/dL
Resultado em mL/min/1,73 m²

Estágios KDIGO:
G1 ≥ 90 · G2 60-89 · G3a 45-59 · G3b 30-44 · G4 15-29 · G5 < 15`,

  evidence:
    'A equação CKD-EPI foi publicada em 2009 por Levey e colaboradores e superou a MDRD em exatidão, especialmente em taxas de filtração acima de 60 mL/min/1,73 m². Em 2021, uma força-tarefa conjunta da National Kidney Foundation e da American Society of Nephrology recomendou remover o coeficiente de raça, por não haver base biológica que justificasse ajustar a estimativa por autodeclaração racial. A equação de 2021 foi desenvolvida em uma população de mais de 8.000 participantes e mantém desempenho adequado, com viés pequeno em ambos os grupos. O KDIGO e a Sociedade Brasileira de Nefrologia adotam essa versão como padrão.',

  creator: {
    name: 'Andrew S. Levey e Lesley A. Inker',
    bio: 'Nefrologistas do Tufts Medical Center, em Boston, responsáveis pelo desenvolvimento das equações MDRD e CKD-EPI.',
  },

  updatedAt: '2026-07-26',

  references: [
    {
      citation:
        'Inker LA, Eneanya ND, Coresh J, et al. New Creatinine- and Cystatin C-Based Equations to Estimate GFR without Race. N Engl J Med. 2021;385(19):1737-49.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/34554658/',
      primary: true,
    },
    {
      citation:
        'Levey AS, Stevens LA, Schmid CH, et al. A new equation to estimate glomerular filtration rate. Ann Intern Med. 2009;150(9):604-12.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/19414839/',
    },
    {
      citation:
        'Kidney Disease: Improving Global Outcomes (KDIGO) CKD Work Group. KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease. Kidney Int. 2024;105(4S):S117-S314.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/38490803/',
    },
  ],
};

export default calculator;
