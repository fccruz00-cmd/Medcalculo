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
  },
  {
    id: 'glicemia',
    kind: 'number',
    label: 'Glicemia',
    unit: 'mg/dL',
    min: 20,
    max: 2000,
    step: 1,
    normalRange: '70 a 99 mg/dL em jejum',
    unitToggle: {
      alt: 'mmol/L',
      toBase: (value) => value * 18,
      fromBase: (value) => value / 18,
    },
  },
  {
    id: 'ureia',
    kind: 'number',
    label: 'Ureia',
    unit: 'mg/dL',
    min: 5,
    max: 500,
    step: 1,
    normalRange: '15 a 40 mg/dL',
    hint: 'Ureia, do jeito que os laboratórios brasileiros liberam: não BUN. Se o seu resultado for BUN (nitrogênio ureico), troque a unidade no seletor: ureia = BUN × 2,14.',
    unitToggle: {
      alt: 'BUN (mg/dL)',
      toBase: (value) => value * 2.14,
      fromBase: (value) => value / 2.14,
    },
  },
  {
    id: 'osmolalidadeMedida',
    kind: 'number',
    label: 'Osmolalidade sérica medida',
    unit: 'mOsm/kg',
    min: 200,
    max: 450,
    step: 1,
    optional: true,
    hint: 'Opcional, mas indispensável para calcular o gap osmolar. Exija do laboratório o método de depressão do ponto de congelamento: a osmometria por pressão de vapor não detecta álcoois voláteis e anula o exame.',
  },
  {
    id: 'etanol',
    kind: 'number',
    label: 'Etanol sérico',
    unit: 'mg/dL',
    min: 0,
    max: 600,
    step: 1,
    optional: true,
    hint: 'Opcional. Serve para descontar a contribuição do etanol do gap osmolar, já que a coingestão de bebida alcoólica é a regra nas intoxicações por álcoois tóxicos.',
  },
];

/** Lê um campo opcional, devolvendo null quando não preenchido. */
function opcional(values: Values, id: string): number | null {
  const value = values[id];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

const calculator: Calculator = {
  slug: 'osmolaridade-serica',
  title: 'Osmolaridade sérica e gap osmolar',
  shortTitle: 'Osmolaridade e gap osmolar',
  subtitle:
    'Calcula a osmolaridade sérica estimada e, com a osmolalidade medida, o gap osmolar: a principal pista laboratorial de intoxicação por álcoois tóxicos.',
  specialties: ['Nefrologia', 'Toxicologia', 'Emergência'],
  kind: 'Fórmula',
  keywords: [
    'osmolaridade',
    'osmolalidade',
    'gap osmolar',
    'hiato osmolar',
    'metanol',
    'etilenoglicol',
    'etileno glicol',
    'álcool tóxico',
    'intoxicação',
    'isopropanol',
    'propilenoglicol',
  ],

  whenToUse: [
    'Suspeita de intoxicação por metanol, etilenoglicol, isopropanol ou propilenoglicol: sobretudo diante de acidose metabólica de ânion gap alto sem causa evidente, alteração visual, rebaixamento do sensório ou cristalúria de oxalato.',
    'Acidose metabólica de ânion gap elevado inexplicada, em conjunto com lactato, cetonas e salicilato.',
    'Avaliação da tonicidade em hiponatremia, para separar as hiponatremias hipotônicas das isotônicas e hipertônicas.',
    'Não use o gap osmolar isoladamente para descartar intoxicação: a variabilidade do valor basal entre indivíduos é grande e o gap normaliza nas apresentações tardias.',
  ],

  whyUse:
    'O gap osmolar é o exame mais rápido e disponível para levantar a suspeita de álcool tóxico enquanto a dosagem específica de metanol ou de etilenoglicol, que poucos serviços no Brasil realizam e que demora horas, não fica pronta. Um gap muito elevado pode antecipar em horas a decisão de iniciar antídoto e hemodiálise, o que muda o desfecho visual e neurológico.',

  pearls: [
    'Ureia não é BUN. A fórmula clássica divide o BUN por 2,8; com a ureia dos laboratórios brasileiros, o divisor correto é 6,0 (porque ureia = BUN × 2,14). Usar ureia/2,8 infla a osmolaridade calculada em dezenas de mOsm e apaga o gap osmolar.',
    'Gap osmolar normal NÃO exclui intoxicação por álcool tóxico. Na apresentação tardia, o álcool-mãe já foi metabolizado nos ácidos fórmico ou glicólico: o gap osmolar volta ao normal exatamente quando o ânion gap dispara. Sempre interprete os dois juntos ao longo do tempo.',
    'O valor "normal" de −10 a +10 mOsm/kg é uma média populacional. Como não se conhece o basal do paciente, um gap de 9 em quem normalmente tem −5 já representa uma variação relevante: a sensibilidade em pontos de corte baixos é ruim.',
    'Exija osmometria por depressão do ponto de congelamento. A osmometria por pressão de vapor não mede solutos voláteis como metanol e etanol e devolve um gap falsamente normal.',
    'Calculamos osmolaridade (mOsm/L, a partir de concentrações) e medimos osmolalidade (mOsm/kg de água). Rigorosamente, o gap subtrai grandezas diferentes; na prática clínica isso é aceito, mas ajuda a explicar parte da imprecisão do método.',
    'Gap osmolar elevado não é exclusivo de álcool tóxico: cetoacidose (por acetona e glicerol), acidose lática grave, doença renal crônica avançada, choque, manitol, sorbitol, contraste iodado, imunoglobulina endovenosa e infusões que usam propilenoglicol como veículo (lorazepam, diazepam, fenobarbital e fenitoína endovenosos) também o elevam.',
    'A pseudo-hiponatremia da hipertrigliceridemia e da hiperproteinemia grave cursa com gap osmolar elevado e osmolalidade medida normal: outra razão para medir, e não só calcular.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const sodio = n(values, 'sodio');
    const glicemia = n(values, 'glicemia');
    const ureia = n(values, 'ureia');
    const medida = opcional(values, 'osmolalidadeMedida');
    const etanol = opcional(values, 'etanol');

    // Ureia brasileira (mg/dL) dividida por 6,0: equivale a BUN/2,8.
    const osmCalculada = 2 * sodio + glicemia / 18 + ureia / 6;
    const tonicidade = 2 * sodio + glicemia / 18;
    const etanolOsm = etanol !== null && etanol > 0 ? etanol / 4.6 : 0;

    const details: ResultDetail[] = [
      {
        label: 'Osmolaridade calculada',
        value: `${num(osmCalculada, 1)} mOsm/L`,
        hint: '2 × sódio + glicemia/18 + ureia/6. Faixa de referência de 275 a 295 mOsm/L.',
      },
      {
        label: 'Osmolalidade efetiva (tonicidade)',
        value: `${num(tonicidade, 0)} mOsm/kg`,
        hint: '2 × sódio + glicemia/18. Exclui a ureia, que atravessa livremente as membranas e não gera gradiente osmótico efetivo.',
      },
    ];

    if (etanol !== null && etanol > 0) {
      details.push({
        label: 'Contribuição osmótica do etanol',
        value: `${num(etanolOsm, 1)} mOsm/kg`,
        hint: `Etanol ÷ 4,6 (peso molecular). Pela fórmula empírica de Purssell (etanol ÷ 3,7), a contribuição seria de ${num(etanol / 3.7, 1)} mOsm/kg: usar 4,6 é a opção mais conservadora, porque deixa um gap residual maior.`,
      });
    }

    if (medida === null) {
      // Sem osmolalidade medida não existe gap: o resultado principal é a
      // osmolaridade calculada.
      let severity: 'info' | 'moderado' | 'alto';
      let label: string;
      let interpretation: string;

      if (osmCalculada < 275) {
        severity = 'moderado';
        label = 'Osmolaridade baixa';
        interpretation =
          'Osmolaridade calculada abaixo da faixa de referência, compatível com estado hipotônico: em geral hiponatremia hipotônica verdadeira.';
      } else if (osmCalculada <= 295) {
        severity = 'info';
        label = 'Osmolaridade normal';
        interpretation = 'Osmolaridade calculada dentro da faixa de referência (275 a 295 mOsm/L).';
      } else if (osmCalculada <= 320) {
        severity = 'moderado';
        label = 'Osmolaridade elevada';
        interpretation =
          'Osmolaridade calculada acima da faixa de referência. Verifique se a elevação vem do sódio, da glicemia ou da ureia: a ureia eleva a osmolaridade sem elevar a tonicidade.';
      } else {
        severity = 'alto';
        label = 'Osmolaridade muito elevada';
        interpretation =
          'Osmolaridade calculada bastante elevada. Em paciente com rebaixamento do sensório e tonicidade acima de 320 mOsm/kg, considere estado hiperglicêmico hiperosmolar.';
      }

      return {
        value: num(osmCalculada, 1),
        unit: 'mOsm/L',
        label,
        severity,
        interpretation: `${interpretation}\n\nSem a osmolalidade sérica medida não é possível calcular o gap osmolar. Se houver qualquer suspeita de intoxicação por álcool tóxico, solicite a osmolalidade medida por depressão do ponto de congelamento.`,
        details,
        nextSteps:
          'Para investigar álcoois tóxicos, solicite osmolalidade sérica medida, gasometria com ânion gap, lactato, cetonas e etanol sérico.\nRepita os exames algumas horas depois: o gap osmolar cai e o ânion gap sobe à medida que o álcool-mãe é metabolizado.',
      };
    }

    const gapBruto = medida - osmCalculada;
    const gap = gapBruto - etanolOsm;

    details.push({
      label: 'Osmolalidade medida',
      value: `${num(medida, 0)} mOsm/kg`,
    });

    if (etanolOsm > 0) {
      details.push({
        label: 'Gap osmolar sem descontar o etanol',
        value: `${num(gapBruto, 1)} mOsm/kg`,
      });
    }

    if (gap > 10) {
      details.push({
        label: 'Concentração estimada se todo o gap fosse de um único álcool',
        value: `Metanol ${num(gap * 3.2, 0)} mg/dL · Etilenoglicol ${num(gap * 6.2, 0)} mg/dL · Isopropanol ${num(gap * 6.0, 0)} mg/dL`,
        hint: 'Cada mOsm/kg corresponde a peso molecular ÷ 10 mg/dL. É uma estimativa grosseira: só vale se o gap se dever inteiramente àquele álcool.',
      });
    }

    let label: string;
    let severity: 'info' | 'baixo' | 'moderado' | 'alto' | 'critico';
    let interpretation: string;
    let nextSteps: string;

    if (gap < -10) {
      label = 'Gap osmolar negativo';
      severity = 'info';
      interpretation =
        'Gap osmolar bastante negativo. Isso costuma indicar problema pré-analítico ou de método: amostras colhidas em momentos diferentes, osmometria por pressão de vapor, hiperlipidemia intensa ou erro de digitação de uma das variáveis.';
      nextSteps =
        'Repita a osmolalidade medida e os eletrólitos na mesma amostra, confirmando o método de osmometria com o laboratório.\nConfira o seletor de unidade da ureia: informar um valor já em ureia com o seletor em "BUN (mg/dL)" multiplica o número por 2,14, infla a osmolaridade calculada em vários mOsm e empurra o gap para valores negativos.';
    } else if (gap <= 10) {
      label = 'Gap osmolar normal';
      severity = 'baixo';
      interpretation =
        'Gap osmolar dentro da faixa de referência (−10 a +10 mOsm/kg). Isso torna menos provável a presença de metanol ou etilenoglicol em concentração alta no momento da coleta, mas NÃO descarta a intoxicação: numa apresentação tardia o álcool-mãe já foi metabolizado e o que resta é ânion gap alto com gap osmolar normal.';
      nextSteps =
        'Interprete junto com o ânion gap e com a história. Se houver acidose metabólica de ânion gap alto sem explicação, mantenha a suspeita e acione o Centro de Informação e Assistência Toxicológica (CIATox, 0800 722 6001).\nRepita gasometria, ânion gap e gap osmolar em algumas horas para observar a tendência.';
    } else if (gap < 25) {
      label = 'Gap osmolar elevado: indeterminado';
      severity = 'moderado';
      interpretation =
        'Gap osmolar elevado, porém em faixa indeterminada. Pode representar intoxicação precoce ou de baixa dose por álcool tóxico, mas também aparece na cetoacidose, na acidose lática grave, na doença renal crônica avançada, no choque e em infusões que contêm propilenoglicol, manitol ou sorbitol.';
      nextSteps =
        'Revise as infusões em curso, especialmente lorazepam, diazepam, fenobarbital e fenitoína endovenosos, que usam propilenoglicol como veículo.\nConfira o seletor de unidade da ureia: lançar um BUN no campo de ureia sem acionar o seletor subestima a osmolaridade calculada e infla o gap em alguns mOsm.\nDose lactato, cetonas e etanol; calcule o ânion gap.\nAcione o CIATox (0800 722 6001) e solicite dosagem específica de metanol e etilenoglicol se a história sugerir ingestão.\nRepita os exames em 2 a 4 horas para acompanhar a tendência dos dois gaps.';
    } else {
      label = 'Gap osmolar muito elevado';
      severity = 'critico';
      interpretation =
        'Gap osmolar muito elevado, achado fortemente sugestivo de intoxicação por álcool tóxico, metanol, etilenoglicol, isopropanol ou propilenoglicol, quando não há explicação alternativa evidente. Na presença de acidose metabólica de ânion gap alto, alteração visual ou cristalúria de oxalato de cálcio, trate como intoxicação até prova em contrário.';
      nextSteps =
        'Acione imediatamente o CIATox (0800 722 6001) e a terapia intensiva.\nInicie o bloqueio da álcool-desidrogenase sem esperar a dosagem específica: fomepizol quando disponível ou, na indisponibilidade, situação frequente no Brasil, , etanol por via oral ou endovenosa com alvo de alcoolemia em torno de 100 a 150 mg/dL.\nAdministre os cofatores conforme o agente suspeito: ácido folínico ou ácido fólico no metanol; tiamina e piridoxina no etilenoglicol.\nIndique hemodiálise diante de acidose metabólica grave, alteração visual, lesão renal aguda ou concentração elevada do álcool.\nO isopropanol é a exceção: causa gap osmolar alto com cetose sem acidose e não exige bloqueio da álcool-desidrogenase.';
    }

    return {
      value: num(gap, 1),
      unit: 'mOsm/kg',
      label,
      severity,
      interpretation,
      details,
      nextSteps,
    };
  },

  formula: `Osmolaridade calculada (mOsm/L) = 2 × Na⁺ + glicemia ÷ 18 + ureia ÷ 6

Atenção à unidade da ureia: a forma internacional da fórmula é 2 × Na⁺ + glicose/18 + BUN/2,8. Como ureia (mg/dL) = BUN (mg/dL) × 2,14, o divisor equivalente para a ureia brasileira é 6,0.

Gap osmolar = osmolalidade medida (mOsm/kg) − osmolaridade calculada (mOsm/L)
Faixa de referência: −10 a +10 mOsm/kg

Desconto do etanol = etanol (mg/dL) ÷ 4,6

Conversão do gap em concentração (peso molecular ÷ 10, por mOsm/kg):
Metanol × 3,2 mg/dL · Etilenoglicol × 6,2 mg/dL · Isopropanol × 6,0 mg/dL · Propilenoglicol × 7,6 mg/dL

Osmolalidade efetiva (tonicidade) = 2 × Na⁺ + glicemia ÷ 18`,

  evidence:
    'A fórmula 2 × Na + glicose/18 + BUN/2,8 e o conceito de gap osmolar como ferramenta clínica foram popularizados por Smithline e Gardner em 1976, no artigo em que discutiram lado a lado o gap aniônico e o osmolar. A faixa de referência de −10 a +10 mOsm/kg vem de estudos como o de Glasser e colaboradores, que mediram a osmolalidade sérica em pacientes com e sem intoxicação. Comparações posteriores mostraram que existem mais de uma dezena de fórmulas de osmolaridade calculada, com gaps de referência diferentes entre si: motivo pelo qual não faz sentido comparar gaps obtidos por fórmulas distintas. Purssell e colaboradores, em 2001, derivaram e validaram que a contribuição do etanol ao gap osmolar é mais bem estimada pela divisão da etanolemia por 3,7 do que pelo peso molecular (4,6). A revisão de Kraut e Kurtz de 2008 consolidou a recomendação de interpretar sempre o gap osmolar em conjunto com o ânion gap ao longo do tempo, já que os dois se movem em direções opostas conforme o álcool-mãe é convertido em seus metabólitos ácidos.',

  creator: {
    name: 'Neil Smithline e Kenneth D. Gardner Jr.',
    bio: 'Nefrologistas norte-americanos, autores do artigo de 1976 no JAMA que sistematizou o uso conjunto do gap aniônico e do gap osmolar na avaliação de distúrbios metabólicos e intoxicações.',
  },

  references: [
    {
      citation: 'Smithline N, Gardner KD Jr. Gaps: anionic and osmolal. JAMA. 1976;236(14):1594-7.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/989118/',
      primary: true,
    },
    {
      citation:
        'Purssell RA, Pudek M, Brubacher J, Abu-Laban RB. Derivation and validation of a formula to calculate the contribution of ethanol to the osmolal gap. Ann Emerg Med. 2001;38(6):653-9.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/11719744/',
    },
    {
      citation:
        'Kraut JA, Kurtz I. Toxic alcohol ingestions: clinical features, diagnosis, and management. Clin J Am Soc Nephrol. 2008;3(1):208-25.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/18045860/',
    },
    {
      citation:
        'Glasser L, Sternglanz PD, Combie J, Robinson A. Serum osmolality and its applicability to drug overdose. Am J Clin Pathol. 1973;60(5):695-9.',
    },
  ],
};

export default calculator;
