import type { Calculator, Field, Values } from '@/lib/types';
import { sumPoints } from '@/lib/utils';

/**
 * Risco de AVC (%) por faixa de escore, nas coortes de validação de
 * Johnston e colaboradores (Lancet, 2007; 4.809 pacientes com AIT).
 */
const RISCO: Record<'baixo' | 'moderado' | 'alto', { d2: number; d7: number; d90: number }> = {
  baixo: { d2: 1.0, d7: 1.2, d90: 3.1 },
  moderado: { d2: 4.1, d7: 5.9, d90: 9.8 },
  alto: { d2: 8.1, d7: 11.7, d90: 17.8 },
};

const FIELDS: Field[] = [
  {
    id: 'idade',
    kind: 'boolean',
    label: 'Idade ≥ 60 anos',
    points: 1,
  },
  {
    id: 'pa',
    kind: 'boolean',
    label: 'PA ≥ 140/90 mmHg na primeira aferição',
    hint: 'Basta a sistólica ≥ 140 mmHg ou a diastólica ≥ 90 mmHg na avaliação inicial, mesmo em paciente sem diagnóstico prévio de hipertensão.',
    points: 1,
  },
  {
    id: 'clinica',
    kind: 'choice',
    label: 'Características clínicas do episódio',
    hint: 'Considere os sintomas do próprio AIT, não os sintomas residuais.',
    layout: 'stack',
    options: [
      {
        label: 'Fraqueza unilateral (com ou sem alteração da fala)',
        value: 2,
        badge: '+2',
      },
      {
        label: 'Alteração da fala sem fraqueza unilateral',
        value: 1,
        badge: '+1',
        hint: 'Disartria ou afasia isoladas.',
      },
      {
        label: 'Outros sintomas',
        value: 0,
        badge: '0',
        hint: 'Alteração sensitiva isolada, sintomas visuais, tontura.',
      },
    ],
  },
  {
    id: 'duracao',
    kind: 'choice',
    label: 'Duração dos sintomas',
    layout: 'stack',
    options: [
      { label: '60 minutos ou mais', value: 2, badge: '+2' },
      { label: '10 a 59 minutos', value: 1, badge: '+1' },
      { label: 'Menos de 10 minutos', value: 0, badge: '0' },
    ],
  },
  {
    id: 'diabetes',
    kind: 'boolean',
    label: 'Diabetes mellitus',
    hint: 'Diagnóstico prévio ou em uso de hipoglicemiante oral ou insulina.',
    points: 1,
  },
];

const calculator: Calculator = {
  slug: 'abcd2',
  title: 'Escore ABCD²',
  shortTitle: 'ABCD²',
  subtitle:
    'Estima o risco de acidente vascular cerebral em 2, 7 e 90 dias após um ataque isquêmico transitório.',
  specialties: ['Neurologia', 'Emergência', 'Clínica Médica'],
  kind: 'Escore de risco',
  keywords: [
    'abcd2',
    'abcd 2',
    'AIT',
    'ataque isquêmico transitório',
    'AVC',
    'acidente vascular cerebral',
    'risco de AVC',
    'TIA',
  ],

  whenToUse: [
    'Adultos atendidos no pronto-socorro ou em ambulatório com quadro compatível com ataque isquêmico transitório, para estimar o risco de AVC nos dias seguintes.',
    'Comunicação de risco entre equipes e priorização de fluxo quando não é possível investigar todos os pacientes imediatamente.',
    'Não se aplica a AVC já estabelecido, a déficits com lesão isquêmica aguda documentada na ressonância, nem a sintomas não vasculares (crise epiléptica, enxaqueca com aura, síncope, hipoglicemia).',
    'Não deve ser usado como critério para dispensar investigação: o escore foi derivado antes da era do tratamento urgente do AIT e não incorpora estenose carotídea, fibrilação atrial nem restrição à difusão na ressonância.',
  ],

  whyUse:
    'O ABCD² unificou dois escores anteriores (ABCD e escore da Califórnia) e é o instrumento mais conhecido para transmitir, em um número, quão precoce é o risco de AVC depois de um AIT. Seu principal valor hoje é didático e de triagem grosseira: mostra que o risco se concentra nas primeiras 48 horas, período em que a intervenção muda o desfecho.',

  pearls: [
    'As diretrizes atuais recomendam investigação e prevenção secundária urgentes em TODO paciente com AIT, independentemente do escore: imagem cerebral e vascular e eletrocardiograma idealmente nas primeiras 24 a 48 horas. O ABCD² não autoriza mandar ninguém para casa sem investigar.',
    'O escore não enxerga as causas de maior risco: estenose carotídea sintomática, fibrilação atrial, dissecção arterial e AIT em crescendo podem ocorrer com escore 0 a 3 e têm risco de recorrência muito superior ao previsto.',
    'Restrição à difusão na ressonância em paciente com sintomas transitórios significa infarto, não AIT: esses pacientes têm risco maior e a conduta é a de AVC menor, com prevenção secundária imediata.',
    'Validações fora do contexto especializado mostraram discriminação apenas modesta, sobretudo quando o escore é aplicado por não neurologistas no pronto-socorro: o diagnóstico de AIT em si já é a etapa menos reprodutível.',
    'O estudo EXPRESS mostrou que iniciar antiagregação, estatina e controle pressórico no mesmo dia reduziu em cerca de 80% o risco de AVC recorrente em 90 dias. O tempo até o tratamento pesa mais que o escore.',
    'A pressão arterial usada é a da primeira aferição, no episódio agudo. Não substitua pela pressão habitual do paciente nem espere estabilizar para pontuar.',
    'Fraqueza unilateral vale 2 pontos mesmo quando acompanhada de alteração de fala; a alteração de fala só vale 1 ponto quando ocorre isolada: os itens não se somam.',
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
        'Faixa de menor risco na coorte de validação. Atenção: "baixo" é relativo; o risco de AVC em 90 dias ainda é várias vezes maior que o da população geral, e a maior parte dos eventos ocorre nas primeiras 48 horas.';
      nextSteps =
        'Investigue com urgência mesmo assim: neuroimagem, avaliação das artérias cervicais e intracranianas, eletrocardiograma com pesquisa de fibrilação atrial e exames metabólicos.\nInicie prevenção secundária no mesmo atendimento: antiagregação, estatina de alta potência e controle pressórico.\nSe houver estenose carotídea sintomática, fibrilação atrial, sintomas em crescendo ou lesão aguda na difusão, conduza como risco alto, independentemente do escore.';
    } else if (pontos <= 5) {
      faixa = 'moderado';
      label = 'Risco moderado';
      severity = 'moderado';
      interpretation =
        'Risco intermediário de AVC nos primeiros dias. A janela de maior benefício da prevenção secundária é imediata.';
      nextSteps =
        'Investigação em caráter de urgência, preferencialmente ainda no pronto-socorro ou em ambulatório de AIT no mesmo dia: neuroimagem com difusão, angiotomografia ou Doppler de carótidas e vertebrais, eletrocardiograma e monitorização do ritmo.\nInicie antiagregação imediatamente. Em AIT de alto risco, a dupla antiagregação (AAS + clopidogrel) por 21 a 90 dias reduz recorrência precoce.\nConsidere observação hospitalar quando a investigação ambulatorial rápida não estiver disponível.';
    } else {
      faixa = 'alto';
      label = 'Risco alto';
      severity = 'alto';
      interpretation =
        'Risco elevado de AVC nas primeiras 48 horas. Esses pacientes concentram os eventos precoces e são os que mais se beneficiam de avaliação e tratamento imediatos.';
      nextSteps =
        'Avaliação especializada imediata, com investigação completa sem alta até definição etiológica.\nNeuroimagem com difusão, imagem vascular cervical e intracraniana e monitorização cardíaca contínua.\nInicie prevenção secundária no atendimento: dupla antiagregação por 21 a 90 dias em AIT de alto risco, estatina de alta potência e controle pressórico.\nEm estenose carotídea sintomática ≥ 50%, encaminhe para revascularização precoce, idealmente nas primeiras duas semanas.';
    }

    const risco = RISCO[faixa];

    return {
      value: pontos,
      unit: pontos === 1 ? 'ponto' : 'pontos',
      label,
      severity,
      interpretation,
      details: [
        {
          label: 'Risco de AVC em 2 dias',
          value: `${risco.d2.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`,
          hint: 'Coortes de validação (Johnston, 2007)',
        },
        {
          label: 'Risco de AVC em 7 dias',
          value: `${risco.d7.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`,
          hint: 'Coortes de validação (Johnston, 2007)',
        },
        {
          label: 'Risco de AVC em 90 dias',
          value: `${risco.d90.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`,
          hint: 'Coortes de validação (Johnston, 2007)',
        },
        {
          label: 'Faixa do escore',
          value: pontos <= 3 ? '0 a 3' : pontos <= 5 ? '4 a 5' : '6 a 7',
        },
      ],
      nextSteps,
    };
  },

  formula: `Soma dos pontos (máximo 7):

A - Age: idade ≥ 60 anos: 1
B - Blood pressure: PA ≥ 140/90 mmHg na primeira aferição: 1
C - Clinical features: fraqueza unilateral 2 · alteração da fala sem fraqueza 1 · outros 0
D - Duration: ≥ 60 min 2 · 10 a 59 min 1 · < 10 min 0
D - Diabetes mellitus: 1

Faixas de risco:
0 a 3 - baixo · 4 a 5 - moderado · 6 a 7 - alto`,

  evidence:
    'Johnston e colaboradores publicaram o ABCD² em 2007, na Lancet, unificando o escore ABCD britânico e o escore da Califórnia. As quatro coortes de validação independentes somaram 2.893 pacientes com AIT (além das coortes de derivação), atendidos em serviços de emergência e ambulatórios dos Estados Unidos e do Reino Unido. O risco de AVC em dois dias foi de 1,0% no grupo de escore 0 a 3, 4,1% no grupo 4 a 5 e 8,1% no grupo 6 a 7; em 90 dias, foi de 3,1%, 9,8% e 17,8%, respectivamente. Estudos posteriores relativizaram bastante o desempenho do escore: em coortes de pronto-socorro avaliadas por não especialistas a discriminação foi apenas modesta, e o escore não identifica mecanismos de alto risco como estenose carotídea e fibrilação atrial. O estudo EXPRESS, publicado no mesmo ano, mostrou que a organização de um serviço de avaliação imediata do AIT, com tratamento iniciado no mesmo dia, reduziu o risco de AVC recorrente em 90 dias de 10,3% para 2,1%, o que deslocou o foco da estratificação para a rapidez do atendimento. No registro internacional TIAregistry.org, com atendimento especializado urgente, o risco de AVC em 90 dias caiu para cerca de 3,7%.',

  creator: {
    name: 'S. Claiborne Johnston e Peter M. Rothwell',
    bio: 'Neurologistas vasculares, Johnston, então na Universidade da Califórnia em São Francisco, e Rothwell, da Universidade de Oxford, responsáveis pelos escores da Califórnia e ABCD, unificados no ABCD² em 2007.',
  },

  references: [
    {
      citation:
        'Johnston SC, Rothwell PM, Nguyen-Huynh MN, et al. Validation and refinement of scores to predict very early stroke risk after transient ischaemic attack. Lancet. 2007;369(9558):283-92.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/17258668/',
      primary: true,
    },
    {
      citation:
        'Rothwell PM, Giles MF, Chandratheva A, et al. Effect of urgent treatment of transient ischaemic attack and minor stroke on early recurrent stroke (EXPRESS study): a prospective population-based sequential comparison. Lancet. 2007;370(9596):1432-42.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/17928046/',
    },
    {
      citation:
        'Amarenco P, Lavallée PC, Labreuche J, et al. One-Year Risk of Stroke after Transient Ischemic Attack or Minor Stroke. N Engl J Med. 2016;374(16):1533-42.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/27096581/',
    },
    {
      citation:
        'Kleindorfer DO, Towfighi A, Chaturvedi S, et al. 2021 Guideline for the Prevention of Stroke in Patients With Stroke and Transient Ischemic Attack: A Guideline From the American Heart Association/American Stroke Association. Stroke. 2021;52(7):e364-e467.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/34024117/',
    },
  ],
};

export default calculator;
