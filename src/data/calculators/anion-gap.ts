import type { Calculator, Field, ResultDetail, Values } from '@/lib/types';
import { n, num } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'sodio',
    kind: 'number',
    label: 'Sódio sérico',
    unit: 'mEq/L',
    min: 100,
    max: 190,
    step: 1,
    normalRange: '135 a 145 mEq/L',
    hint: 'mEq/L e mmol/L são numericamente iguais para o sódio.',
  },
  {
    id: 'cloro',
    kind: 'number',
    label: 'Cloro sérico',
    unit: 'mEq/L',
    min: 60,
    max: 140,
    step: 1,
    normalRange: '98 a 107 mEq/L',
    hint: 'Use o cloro da mesma amostra do sódio. Cloro dosado em gasometria e em bioquímica podem diferir alguns pontos.',
  },
  {
    id: 'bicarbonato',
    kind: 'number',
    label: 'Bicarbonato',
    unit: 'mEq/L',
    min: 1,
    max: 50,
    step: 0.1,
    normalRange: '22 a 26 mEq/L',
    hint: 'Pode ser o HCO₃⁻ calculado da gasometria ou o CO₂ total da bioquímica; a diferença entre eles é de 1 a 2 mEq/L.',
  },
  {
    id: 'albumina',
    kind: 'number',
    label: 'Albumina sérica',
    unit: 'g/dL',
    min: 0.5,
    max: 6,
    step: 0.1,
    optional: true,
    normalRange: '3,5 a 5,0 g/dL',
    hint: 'Opcional, mas fortemente recomendada em pacientes graves: cada 1 g/dL de albumina abaixo de 4 g/dL reduz o ânion gap medido em cerca de 2,5 mEq/L.',
  },
  {
    id: 'potassio',
    kind: 'number',
    label: 'Potássio sérico',
    unit: 'mEq/L',
    min: 1.5,
    max: 9,
    step: 0.1,
    optional: true,
    hint: 'Opcional. Só é usado para exibir a variante do ânion gap que inclui o potássio, cuja faixa de referência é diferente (12 a 20 mEq/L).',
  },
];

/** Lê um campo opcional, devolvendo null quando não preenchido. */
function opcional(values: Values, id: string): number | null {
  const value = values[id];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** Leitura clínica da relação delta/delta (delta ratio). */
function lerDeltaRatio(razao: number): string {
  if (razao < 0.4) {
    return 'Delta/delta abaixo de 0,4: a queda do bicarbonato é muito maior que o aumento do ânion gap; há um componente hiperclorêmico dominante (acidose de ânion gap normal) sobreposto.';
  }
  if (razao < 1) {
    return 'Delta/delta entre 0,4 e 1,0: sugere acidose mista, com componente de ânion gap alto e componente hiperclorêmico. É o padrão típico da cetoacidose diabética já em reposição com soro fisiológico e da acidose urêmica.';
  }
  if (razao <= 2) {
    return 'Delta/delta entre 1,0 e 2,0: padrão de acidose metabólica de ânion gap alto pura, sem distúrbio metabólico associado.';
  }
  return 'Delta/delta acima de 2,0: a elevação do ânion gap é desproporcional à queda do bicarbonato; há alcalose metabólica concomitante ou acidose respiratória crônica prévia, que já mantinha o bicarbonato alto.';
}

const calculator: Calculator = {
  slug: 'anion-gap',
  title: 'Ânion gap (com correção pela albumina e delta/delta)',
  shortTitle: 'Ânion gap',
  subtitle:
    'Calcula o ânion gap sérico, corrige pela albumina e estima a relação delta/delta para separar as acidoses metabólicas de ânion gap alto das hiperclorêmicas.',
  specialties: ['Nefrologia', 'Terapia Intensiva', 'Emergência'],
  kind: 'Fórmula',
  popular: true,
  keywords: [
    'anion gap',
    'ânion gap',
    'AG',
    'hiato aniônico',
    'acidose metabólica',
    'delta delta',
    'delta ratio',
    'MUDPILES',
    'GOLD MARK',
    'gasometria',
    'distúrbio ácido-base',
  ],

  whenToUse: [
    'Todo paciente com acidose metabólica (bicarbonato baixo ou excesso de base negativo), para separar as causas de ânion gap alto das de ânion gap normal.',
    'Investigação de intoxicações exógenas com acidose metabólica, especialmente por metanol, etilenoglicol e salicilatos.',
    'Avaliação de distúrbios ácido-base mistos em pacientes graves, em conjunto com a relação delta/delta e a pCO₂ esperada.',
    'Sempre corrija pela albumina em pacientes de terapia intensiva, cirróticos e nefropatas: a hipoalbuminemia pode mascarar um ânion gap francamente elevado.',
  ],

  whyUse:
    'O ânion gap é o primeiro passo, e o mais barato, da investigação de qualquer acidose metabólica: divide o diagnóstico diferencial em dois grupos com condutas completamente diferentes. Corrigido pela albumina e combinado ao delta/delta, ele também revela distúrbios mistos que a gasometria isolada não mostra.',

  pearls: [
    'A faixa de referência mudou com a tecnologia do laboratório. Os textos clássicos usam 12 ± 4 mEq/L, valor obtido com métodos antigos; com os eletrodos íon-seletivos atuais, que medem cloro mais alto, o normal costuma ficar entre 3 e 11 mEq/L. Confirme a faixa do seu laboratório antes de chamar de normal um gap de 12.',
    'Hipoalbuminemia é a causa mais frequente de ânion gap falsamente normal. Um paciente de UTI com albumina 2,0 g/dL e ânion gap de 12 tem, na verdade, um gap corrigido de 17: francamente elevado.',
    'Sódio e cloro devem vir da MESMA amostra. Misturar o sódio da bioquímica com o cloro da gasometria produz gaps espúrios de vários mEq/L.',
    'Ânion gap muito baixo ou negativo não é erro de conta: pense em hipoalbuminemia grave, mieloma múltiplo com paraproteína catiônica, intoxicação por lítio ou por brometo (que o eletrodo lê como cloro) e hipercalcemia ou hipermagnesemia acentuadas.',
    'Na cetoacidose diabética, o ânion gap pode normalizar antes do bicarbonato porque o soro fisiológico gera acidose hiperclorêmica: o delta/delta abaixo de 1 identifica isso e evita prolongar desnecessariamente a insulina venosa.',
    'A relação delta/delta só faz sentido quando o ânion gap está elevado e o bicarbonato, baixo. Ela é uma aproximação grosseira, não um teste diagnóstico: use-a como pista para procurar um segundo distúrbio, não como conclusão.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const sodio = n(values, 'sodio');
    const cloro = n(values, 'cloro');
    const bicarbonato = n(values, 'bicarbonato');
    const albumina = opcional(values, 'albumina');
    const potassio = opcional(values, 'potassio');

    const ag = sodio - (cloro + bicarbonato);
    const agCorrigido = albumina !== null ? ag + 2.5 * (4 - albumina) : ag;
    const agEfetivo = agCorrigido;

    const details: ResultDetail[] = [];

    if (albumina !== null) {
      details.push({
        label: 'Ânion gap corrigido pela albumina',
        value: `${num(agCorrigido, 1)} mEq/L`,
        hint: `Ânion gap medido ${num(ag, 1)} + 2,5 × (4,0 − ${num(albumina, 1)} g/dL). É este o valor a interpretar.`,
      });
    } else {
      details.push({
        label: 'Ânion gap corrigido pela albumina',
        value: 'Albumina não informada',
        hint: 'Sem a albumina, um gap aparentemente normal pode estar mascarado. Informe a albumina em pacientes graves, cirróticos e nefropatas.',
      });
    }

    if (potassio !== null) {
      details.push({
        label: 'Ânion gap incluindo o potássio',
        value: `${num(ag + potassio, 1)} mEq/L`,
        hint: '(Na + K) − (Cl + HCO₃). Faixa de referência dessa variante: 12 a 20 mEq/L.',
      });
    }

    // Delta/delta: só interpretável quando há acidose metabólica de gap alto.
    let deltaTexto = '';
    if (agEfetivo > 12 && bicarbonato < 24) {
      const razao = (agEfetivo - 12) / (24 - bicarbonato);
      deltaTexto = lerDeltaRatio(razao);
      details.push({
        label: 'Relação delta/delta',
        value: num(razao, 2),
        hint: '(ânion gap − 12) ÷ (24 − bicarbonato). < 0,4 acidose hiperclorêmica associada · 0,4 a 1,0 acidose mista · 1,0 a 2,0 gap alto pura · > 2,0 alcalose metabólica ou acidose respiratória crônica associada.',
      });
    }

    // pCO2 esperada na acidose metabólica (fórmula de Winter).
    if (bicarbonato < 22) {
      const pco2 = 1.5 * bicarbonato + 8;
      details.push({
        label: 'pCO₂ esperada (Winter)',
        value: `${num(pco2 - 2, 0)} a ${num(pco2 + 2, 0)} mmHg`,
        hint: 'pCO₂ acima do previsto indica acidose respiratória associada; abaixo, alcalose respiratória associada.',
      });
    }

    let label: string;
    let severity: 'info' | 'baixo' | 'moderado' | 'alto' | 'critico';
    let interpretation: string;
    let nextSteps: string;

    if (agEfetivo < 3) {
      label = 'Ânion gap baixo';
      severity = 'info';
      interpretation =
        'Ânion gap abaixo do esperado. Antes de considerar erro laboratorial, pense em hipoalbuminemia grave, mieloma múltiplo com paraproteína catiônica, intoxicação por lítio ou por brometo (que o eletrodo interpreta como cloro) e hipercalcemia ou hipermagnesemia importantes.';
      nextSteps =
        'Repita os eletrólitos na mesma amostra e confira a albumina.\nSe o valor se confirmar, investigue paraproteína (eletroforese de proteínas e imunofixação) e uso de lítio ou de brometo.';
    } else if (agEfetivo <= 12) {
      label = 'Ânion gap normal';
      severity = bicarbonato < 22 ? 'moderado' : 'info';
      interpretation =
        bicarbonato < 22
          ? 'Acidose metabólica com ânion gap normal (hiperclorêmica). As causas principais são perdas digestivas de bicarbonato (diarreia, fístula ou drenagem de delgado, ureterossigmoidostomia), acidoses tubulares renais tipos 1, 2 e 4, infusão de grandes volumes de soro fisiológico, acetazolamida e doença renal crônica inicial.'
          : 'Ânion gap dentro da faixa de referência. Isso não exclui distúrbio ácido-base: interprete junto com o pH, a pCO₂ e o bicarbonato da gasometria.';
      nextSteps =
        bicarbonato < 22
          ? 'Calcule o ânion gap urinário (Na urinário + K urinário − Cl urinário) para separar perda digestiva (gap urinário negativo) de acidose tubular renal (gap urinário positivo).\nRevise o balanço de cloro das soluções infundidas e considere trocar soro fisiológico por solução balanceada.'
          : 'Interprete a gasometria completa antes de descartar distúrbio ácido-base.\nEm paciente grave, confirme a albumina: ela é indispensável para dar sentido a um gap "normal".';
    } else if (agEfetivo <= 16) {
      label = 'Ânion gap levemente elevado';
      severity = 'moderado';
      interpretation =
        'Ânion gap discretamente elevado. Nos laboratórios que usam eletrodos íon-seletivos modernos, esse valor já costuma ser anormal. As causas mais comuns nessa faixa são acidose lática leve, cetose e uremia.';
      nextSteps =
        'Dose lactato, cetonas (preferencialmente beta-hidroxibutirato sérico), glicemia, ureia e creatinina.\nReavalie o gap após a estabilização hemodinâmica, já que a hipoperfusão isolada pode explicá-lo.';
    } else if (agEfetivo <= 24) {
      label = 'Ânion gap elevado';
      severity = 'alto';
      interpretation =
        'Ânion gap claramente elevado, indicando acúmulo de ânions não medidos. Use o mnemônico GOLD MARK: Glicóis (etilenoglicol, propilenoglicol), Oxoprolina (piroglutâmico, no uso crônico de paracetamol), L-lactato, D-lactato, Metanol, AAS e outros salicilatos, Renal (uremia) e Cetoacidose (diabética, alcoólica ou de jejum).';
      nextSteps =
        'Dose lactato, cetonas, glicemia, ureia, creatinina e, conforme a história, salicilato sérico.\nCalcule o gap osmolar sempre que houver suspeita de intoxicação por álcool tóxico.\nTrate a causa: a reposição de bicarbonato raramente é o tratamento e não substitui volume, insulina, diálise ou antídoto.';
    } else {
      label = 'Ânion gap muito elevado';
      severity = 'critico';
      interpretation =
        'Ânion gap muito elevado, quase sempre por acidose lática de hipoperfusão, cetoacidose grave, uremia avançada ou intoxicação exógena (metanol, etilenoglicol, salicilatos). É um marcador de gravidade e exige investigação e tratamento imediatos.';
      nextSteps =
        'Colha lactato, cetonas, função renal, gasometria arterial, osmolalidade sérica medida e nível de salicilato conforme a suspeita.\nCalcule o gap osmolar: valores acima de 10 mOsm/kg apontam para álcool tóxico e podem indicar fomepizol, etanol e hemodiálise.\nAcione a terapia intensiva e considere a diálise precocemente na uremia, na intoxicação por metanol ou etilenoglicol e na acidose refratária.';
    }

    if (deltaTexto) {
      interpretation = `${interpretation}\n\n${deltaTexto}`;
    }

    return {
      value: num(ag, 1),
      unit: 'mEq/L',
      label,
      severity,
      interpretation,
      details,
      nextSteps,
    };
  },

  formula: `Ânion gap = Na⁺ − (Cl⁻ + HCO₃⁻)

Faixa de referência: 3 a 11 mEq/L com eletrodos íon-seletivos modernos (os textos clássicos usam 12 ± 4 mEq/L).

Corrigido pela albumina (Figge):
Ânion gap corrigido = ânion gap + 2,5 × (4,0 − albumina em g/dL)

Variante com potássio:
Ânion gap = (Na⁺ + K⁺) − (Cl⁻ + HCO₃⁻), referência de 12 a 20 mEq/L

Relação delta/delta:
Δ/Δ = (ânion gap − 12) ÷ (24 − HCO₃⁻)

pCO₂ esperada na acidose metabólica (Winter):
pCO₂ = 1,5 × HCO₃⁻ + 8 (± 2 mmHg)`,

  evidence:
    'O uso clínico sistemático do ânion gap foi consolidado por Emmett e Narins em 1977, em revisão que analisou as causas de elevação e de redução do gap e propôs a faixa de referência de 12 ± 4 mEq/L usada por décadas. Com a substituição dos métodos de dosagem de cloro por eletrodos íon-seletivos, a faixa de normalidade caiu para cerca de 3 a 11 mEq/L, como revisto por Kraut e Madias em 2007: mudança que continua sendo fonte frequente de erro de interpretação à beira do leito. A correção pela albumina foi quantificada por Figge e colaboradores em 1998: cada grama por decilitro de albumina abaixo do normal reduz o ânion gap medido em aproximadamente 2,5 mEq/L, o que explica por que pacientes críticos hipoalbuminêmicos podem ter acidose orgânica significativa com gap aparentemente normal.',

  references: [
    {
      citation: 'Emmett M, Narins RG. Clinical use of the anion gap. Medicine (Baltimore). 1977;56(1):38-54.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/401925/',
      primary: true,
    },
    {
      citation:
        'Kraut JA, Madias NE. Serum anion gap: its uses and limitations in clinical medicine. Clin J Am Soc Nephrol. 2007;2(1):162-74.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/17699401/',
    },
    {
      citation: 'Figge J, Jabor A, Kazda A, Fencl V. Anion gap and hypoalbuminemia. Crit Care Med. 1998;26(11):1807-10.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/9824071/',
    },
    {
      citation:
        'Kraut JA, Madias NE. Metabolic acidosis: pathophysiology, diagnosis and management. Nat Rev Nephrol. 2010;6(5):274-85.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/20308999/',
    },
  ],
};

export default calculator;
