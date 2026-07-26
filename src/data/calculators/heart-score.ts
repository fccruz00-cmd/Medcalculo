import type { Calculator, Field, Values } from '@/lib/types';
import { sumPoints } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'historia',
    kind: 'choice',
    label: 'História (H: History)',
    hint: 'Impressão global do médico sobre o quanto a anamnese sugere origem coronariana.',
    help: 'Elementos que tornam a história mais suspeita: dor retroesternal em aperto ou peso, irradiação para mandíbula, ombro ou membro superior esquerdo, desencadeada por esforço, aliviada por repouso ou nitrato, acompanhada de sudorese, náusea ou dispneia, com duração de minutos. Elementos que a tornam menos suspeita: dor em pontada, muito bem localizada, reprodutível à palpação, ventilatório-dependente, com duração de segundos ou de vários dias, sem relação com esforço.',
    layout: 'stack',
    options: [
      { label: 'Pouco suspeita', value: 0, hint: 'Predomínio de características não anginosas.' },
      {
        label: 'Moderadamente suspeita',
        value: 1,
        badge: '+1',
        hint: 'Mistura de características típicas e atípicas.',
      },
      {
        label: 'Altamente suspeita',
        value: 2,
        badge: '+2',
        hint: 'Predomínio de características tipicamente anginosas.',
      },
    ],
  },
  {
    id: 'ecg',
    kind: 'choice',
    label: 'ECG (E: Electrocardiogram)',
    layout: 'stack',
    options: [
      { label: 'Normal', value: 0, hint: 'Eletrocardiograma sem alterações.' },
      {
        label: 'Alteração inespecífica da repolarização',
        value: 1,
        badge: '+1',
        hint: 'Bloqueio de ramo, marca-passo, hipertrofia de VE, alterações de ST-T por digital ou alterações inalteradas em relação a traçados prévios.',
      },
      {
        label: 'Desvio significativo do segmento ST',
        value: 2,
        badge: '+2',
        hint: 'Infra ou supradesnivelamento de ST não atribuível a bloqueio de ramo, hipertrofia ou digital.',
      },
    ],
  },
  {
    id: 'idade',
    kind: 'choice',
    label: 'Idade (A: Age)',
    options: [
      { label: 'Menos de 45 anos', value: 0 },
      { label: '45 a 64 anos', value: 1, badge: '+1' },
      { label: '65 anos ou mais', value: 2, badge: '+2' },
    ],
  },
  {
    id: 'fatores',
    kind: 'choice',
    label: 'Fatores de risco (R: Risk factors)',
    hint: 'Conte: hipertensão, dislipidemia, diabetes, obesidade (IMC > 30), tabagismo atual ou cessado há menos de 3 meses, história familiar de doença coronariana antes dos 65 anos.',
    layout: 'stack',
    options: [
      { label: 'Nenhum fator de risco', value: 0 },
      { label: '1 ou 2 fatores de risco', value: 1, badge: '+1' },
      {
        label: '3 ou mais fatores, ou doença aterosclerótica conhecida',
        value: 2,
        badge: '+2',
        hint: 'Doença aterosclerótica: infarto prévio, angioplastia ou revascularização cirúrgica, AVC ou AIT, doença arterial periférica.',
      },
    ],
  },
  {
    id: 'troponina',
    kind: 'choice',
    label: 'Troponina (T: Troponin)',
    hint: 'Use o limite superior de referência (percentil 99) do ensaio do seu laboratório, e não um valor absoluto.',
    layout: 'stack',
    options: [
      { label: 'Menor ou igual ao limite de referência', value: 0 },
      { label: '1 a 3 vezes o limite de referência', value: 1, badge: '+1' },
      { label: 'Mais de 3 vezes o limite de referência', value: 2, badge: '+2' },
    ],
  },
];

/** MACE em 6 semanas (%) por faixa: validação prospectiva de Backus (2013). */
const MACE_6_SEMANAS: Record<'baixo' | 'moderado' | 'alto', number> = {
  baixo: 1.7,
  moderado: 16.6,
  alto: 50.1,
};

const calculator: Calculator = {
  slug: 'heart-score',
  title: 'HEART Score para dor torácica',
  shortTitle: 'HEART Score',
  subtitle:
    'Estratifica o risco de evento cardíaco maior em 6 semanas em adultos com dor torácica no pronto-socorro e orienta alta precoce, observação ou investigação invasiva.',
  specialties: ['Emergência', 'Cardiologia', 'Clínica Médica'],
  kind: 'Escore de risco',
  popular: true,
  keywords: [
    'heart',
    'dor torácica',
    'dor no peito',
    'MACE',
    'pronto-socorro',
    'síndrome coronariana aguda',
    'SCA',
    'troponina',
  ],

  whenToUse: [
    'Adultos que chegam ao pronto-socorro com dor torácica em que a síndrome coronariana aguda é uma hipótese, mas o diagnóstico não está estabelecido.',
    'Para decidir entre alta precoce, observação com nova troponina ou estratégia invasiva precoce.',
    'Não se aplica quando já há supradesnivelamento de ST com indicação de reperfusão imediata, instabilidade hemodinâmica ou diagnóstico alternativo definido (dissecção de aorta, tromboembolismo pulmonar, pneumotórax).',
    'Não foi derivado para dor torácica de causa evidentemente traumática nem para pacientes com menos de 21 anos.',
  ],

  whyUse:
    'Diferente do TIMI e do GRACE, que foram criados em pacientes com síndrome coronariana já confirmada, o HEART foi desenvolvido justamente na população indiferenciada do pronto-socorro. Ele identifica um grupo de risco muito baixo, cerca de 1,7% de eventos em 6 semanas, que pode receber alta sem investigação adicional, e um grupo de alto risco que se beneficia de estratégia invasiva.',

  pearls: [
    'O domínio "História" é subjetivo e é o que mais varia entre examinadores. Registre no prontuário quais características você considerou típicas ou atípicas: isso torna o escore auditável.',
    'A alteração de ECG só vale 2 pontos se o desvio de ST não puder ser explicado por bloqueio de ramo, hipertrofia de ventrículo esquerdo ou uso de digital. Nesses casos, pontue 1.',
    'A troponina é lida como múltiplo do limite superior de referência do ensaio local, não como valor absoluto. Ensaios ultrassensíveis têm limites em ng/L; ensaios convencionais, em ng/mL: confundir as escalas muda o escore em até 2 pontos.',
    'O escore usa a primeira troponina. A maioria dos protocolos brasileiros exige uma segunda dosagem seriada (0 e 1 h ou 0 e 3 h) antes da alta: o HEART não substitui esse algoritmo, apenas o complementa. A variante HEART Pathway combina o escore ≤ 3 com duas troponinas negativas.',
    'Idade é o único domínio que não pode ser alterado pelo julgamento clínico; note que já a partir dos 65 anos o paciente parte de 2 pontos, o que praticamente exclui a faixa de baixo risco quando há qualquer outro achado.',
    'Escore baixo não é sinônimo de "não é o coração": significa risco baixo de evento em 6 semanas. Dor persistente, recorrente ou com achados de alarme justifica investigação independentemente do escore.',
    'Obesidade e tabagismo entram como fatores de risco; sexo masculino e história familiar tardia (após os 65 anos) não entram.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const pontos = sumPoints(FIELDS, values);

    let faixa: 'baixo' | 'moderado' | 'alto';
    let label: string;
    let severity: 'baixo' | 'moderado' | 'alto';
    let interpretation: string;
    let nextSteps: string;

    if (pontos <= 3) {
      faixa = 'baixo';
      label = 'Risco baixo';
      severity = 'baixo';
      interpretation =
        'Risco baixo de evento cardíaco maior (morte, infarto ou revascularização) em 6 semanas. Nessa faixa, o valor preditivo negativo é alto o suficiente para considerar alta do pronto-socorro sem investigação isquêmica adicional.';
      nextSteps =
        'Considere alta com seguimento ambulatorial, desde que a troponina seriada esteja negativa e o paciente esteja assintomático.\nOriente retorno imediato se a dor recorrer, e investigue causas não coronarianas (musculoesquelética, refluxo, ansiedade, pleuropulmonar).';
    } else if (pontos <= 6) {
      faixa = 'moderado';
      label = 'Risco moderado';
      severity = 'moderado';
      interpretation =
        'Risco intermediário de evento cardíaco maior em 6 semanas. Alta direta do pronto-socorro não é segura nessa faixa.';
      nextSteps =
        'Mantenha em observação com troponina seriada e monitorização eletrocardiográfica.\nProgramar teste não invasivo (teste ergométrico, cintilografia, ecocardiograma de estresse ou angiotomografia de coronárias) antes ou logo após a alta.\nIniciar AAS e considerar antianginosos conforme a suspeita clínica.';
    } else {
      faixa = 'alto';
      label = 'Risco alto';
      severity = 'alto';
      interpretation =
        'Risco alto de evento cardíaco maior em 6 semanas. Na coorte de validação, cerca de metade desses pacientes apresentou morte, infarto ou necessidade de revascularização.';
      nextSteps =
        'Interne em unidade coronariana ou leito monitorizado e acione a cardiologia.\nInicie terapia antitrombótica e anti-isquêmica conforme protocolo de síndrome coronariana aguda sem supra de ST.\nEstratégia invasiva precoce (cateterismo em até 24 a 72 horas, ou imediata se houver instabilidade, dor refratária ou alterações dinâmicas de ST).';
    }

    return {
      value: pontos,
      unit: pontos === 1 ? 'ponto' : 'pontos',
      label,
      severity,
      interpretation,
      details: [
        {
          label: 'Risco de MACE em 6 semanas',
          value: `${MACE_6_SEMANAS[faixa].toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`,
          hint: 'Validação prospectiva multicêntrica, 2.440 pacientes (Backus, 2013)',
        },
        {
          label: 'Conduta sugerida',
          value:
            faixa === 'baixo'
              ? 'Alta com seguimento'
              : faixa === 'moderado'
                ? 'Observação e teste não invasivo'
                : 'Internação e estratégia invasiva',
        },
      ],
      nextSteps,
    };
  },

  formula: `Cada domínio vale 0, 1 ou 2 pontos (total de 0 a 10):

H - História: pouco suspeita 0 · moderadamente suspeita 1 · altamente suspeita 2
E - ECG: normal 0 · alteração inespecífica de repolarização 1 · desvio significativo de ST 2
A - Idade: < 45 anos 0 · 45 a 64 anos 1 · ≥ 65 anos 2
R - Fatores de risco: nenhum 0 · 1 a 2 fatores 1 · ≥ 3 fatores ou doença aterosclerótica conhecida 2
T - Troponina: ≤ limite de referência 0 · 1 a 3× o limite 1 · > 3× o limite 2

Faixas: 0 a 3 risco baixo · 4 a 6 risco moderado · 7 a 10 risco alto`,

  evidence:
    'O HEART Score foi proposto por Six, Backus e Kelder em 2008, a partir de 122 pacientes com dor torácica em um pronto-socorro holandês. A validação decisiva veio em 2013, com um estudo prospectivo multicêntrico de 2.440 pacientes em dez hospitais da Holanda: eventos cardíacos maiores em 6 semanas ocorreram em 1,7% dos pacientes com 0 a 3 pontos, 16,6% dos que tinham 4 a 6 pontos e 50,1% dos que tinham 7 a 10 pontos. A área sob a curva ROC foi de aproximadamente 0,83, superior à do TIMI e à do GRACE nessa população indiferenciada. O ensaio randomizado HEART Pathway (Mahler, 2015) mostrou que usar o escore ≤ 3 associado a duas troponinas negativas reduziu testes de estresse e tempo de permanência, sem eventos perdidos em 30 dias.',

  creator: {
    name: 'Barbra E. Backus e A. Jacob Six',
    bio: 'Emergencistas e cardiologistas holandeses, do Erasmus MC de Roterdã e do Hospital Universitário de Utrecht, autores da derivação e da validação prospectiva do escore.',
  },

  updatedAt: '2026-07-26',

  references: [
    {
      citation:
        'Six AJ, Backus BE, Kelder JC. Chest pain in the emergency room: value of the HEART score. Neth Heart J. 2008;16(6):191-6.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/18665203/',
      primary: true,
    },
    {
      citation:
        'Backus BE, Six AJ, Kelder JC, et al. A prospective validation of the HEART score for chest pain patients at the emergency department. Int J Cardiol. 2013;168(3):2153-8.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/23465250/',
    },
    {
      citation:
        'Mahler SA, Riley RF, Hiestand BC, et al. The HEART Pathway randomized trial: identifying emergency department patients with acute chest pain for early discharge. Circ Cardiovasc Qual Outcomes. 2015;8(2):195-203.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/25737484/',
    },
    {
      citation:
        'Nicolau JC, Feitosa Filho GS, Petriz JL, et al. Diretrizes da Sociedade Brasileira de Cardiologia sobre Angina Instável e Infarto Agudo do Miocárdio sem Supradesnível do Segmento ST: 2021. Arq Bras Cardiol. 2021;117(1):181-264.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/34320090/',
    },
  ],
};

export default calculator;
