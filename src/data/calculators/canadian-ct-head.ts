import type { Calculator, Field, Values } from '@/lib/types';
import { n } from '@/lib/utils';

/** Fatores de alto risco: preveem necessidade de intervenção neurocirúrgica. */
const ALTO_RISCO = ['gcs2h', 'fraturaAberta', 'baseCranio', 'vomitos', 'idade65'];

/** Fatores de risco médio: preveem lesão encefálica clinicamente importante na TC. */
const RISCO_MEDIO = ['amnesia30', 'mecanismo'];

const FIELDS: Field[] = [
  {
    id: 'elegivel',
    kind: 'choice',
    label:
      'Trauma cranioencefálico nas últimas 24 horas, com Glasgow 13 a 15 e perda de consciência, amnésia do evento ou desorientação testemunhada?',
    hint: 'Pré-requisito absoluto. É essa a definição de "trauma cranioencefálico leve" usada na derivação da regra.',
    help: 'Traumas cranianos sem nenhum desses três achados foram classificados como "trauma mínimo" e ficaram fora do estudo: a regra não foi construída para eles e não deve ser usada para liberá-los nem para indicar tomografia.',
    layout: 'stack',
    options: [
      { label: 'Sim: trauma cranioencefálico leve', value: 'sim' },
      { label: 'Não: trauma mínimo, sem perda de consciência, amnésia ou desorientação', value: 'nao' },
    ],
  },
  {
    id: 'exclusao',
    kind: 'choice',
    label: 'Alguma condição de exclusão está presente?',
    hint: 'Idade menor que 16 anos · uso de anticoagulante oral ou distúrbio de coagulação conhecido · convulsão após o trauma · déficit neurológico focal agudo · ferimento penetrante ou afundamento evidente do crânio · instabilidade hemodinâmica por politrauma · gestação · retorno para reavaliação do mesmo trauma.',
    help: 'Esses pacientes foram excluídos do estudo de derivação: a regra nunca foi testada neles e não pode ser usada para dispensar a tomografia. Na prática, quase todos têm indicação de imagem por outros motivos.',
    layout: 'stack',
    options: [
      { label: 'Não: nenhuma exclusão', value: 'nao' },
      { label: 'Sim: pelo menos uma exclusão', value: 'sim' },
    ],
  },
  {
    id: 'gcs2h',
    kind: 'boolean',
    label: 'Glasgow menor que 15 duas horas após o trauma',
    hint: 'Alto risco. É o Glasgow reavaliado às 2 horas, não o da chegada.',
    points: 1,
    showIf: (values) => values.elegivel === 'sim' && values.exclusao === 'nao',
  },
  {
    id: 'fraturaAberta',
    kind: 'boolean',
    label: 'Suspeita de fratura de crânio aberta ou com afundamento',
    hint: 'Alto risco. Afundamento evidente ou exposição óssea já é critério de exclusão da regra e vai direto para a imagem.',
    points: 1,
    showIf: (values) => values.elegivel === 'sim' && values.exclusao === 'nao',
  },
  {
    id: 'baseCranio',
    kind: 'boolean',
    label: 'Qualquer sinal de fratura de base de crânio',
    hint: 'Alto risco. Hemotímpano, equimose periorbital bilateral (olhos de guaxinim), sinal de Battle (equimose retroauricular), otorreia ou rinorreia de líquor.',
    points: 1,
    showIf: (values) => values.elegivel === 'sim' && values.exclusao === 'nao',
  },
  {
    id: 'vomitos',
    kind: 'boolean',
    label: 'Dois ou mais episódios de vômito',
    hint: 'Alto risco. Um único episódio não preenche o critério.',
    points: 1,
    showIf: (values) => values.elegivel === 'sim' && values.exclusao === 'nao',
  },
  {
    id: 'idade65',
    kind: 'boolean',
    label: 'Idade igual ou maior que 65 anos',
    hint: 'Alto risco.',
    points: 1,
    showIf: (values) => values.elegivel === 'sim' && values.exclusao === 'nao',
  },
  {
    id: 'amnesia30',
    kind: 'boolean',
    label: 'Amnésia retrógrada de 30 minutos ou mais antes do impacto',
    hint: 'Risco médio. Refere-se ao intervalo de tempo ANTERIOR ao trauma de que o paciente não se lembra.',
    points: 1,
    showIf: (values) => values.elegivel === 'sim' && values.exclusao === 'nao',
  },
  {
    id: 'mecanismo',
    kind: 'boolean',
    label: 'Mecanismo perigoso',
    hint: 'Risco médio. Atropelamento por veículo automotor, ejeção de veículo, queda de altura igual ou maior que 3 pés (cerca de 0,9 m) ou de 5 ou mais degraus.',
    help: 'A definição é fechada: queda da própria altura, mesmo em idoso, não é mecanismo perigoso pela regra. Colisão de veículo em alta velocidade sem ejeção também não entra nessa lista.',
    points: 1,
    showIf: (values) => values.elegivel === 'sim' && values.exclusao === 'nao',
  },
];

const calculator: Calculator = {
  slug: 'canadian-ct-head',
  title: 'Regra canadense para tomografia de crânio',
  shortTitle: 'Canadian CT Head Rule',
  subtitle:
    'Sete critérios que definem quais adultos com trauma cranioencefálico leve precisam de tomografia de crânio, sem perder lesões de tratamento neurocirúrgico.',
  specialties: ['Emergência', 'Neurologia'],
  kind: 'Regra de decisão',
  keywords: [
    'canadian ct head rule',
    'CCHR',
    'tomografia de crânio',
    'TC de crânio',
    'TCE leve',
    'traumatismo cranioencefálico',
    'trauma de crânio',
    'concussão',
    'Stiell',
  ],

  whenToUse: [
    'Adultos com 16 anos ou mais, com trauma cranioencefálico nas últimas 24 horas, Glasgow de 13 a 15 na avaliação e pelo menos um destes: perda de consciência testemunhada, amnésia do evento ou desorientação testemunhada.',
    'Quando a dúvida é solicitar ou não tomografia de crânio sem contraste em um paciente que parece bem no exame neurológico.',
    'NÃO se aplica a trauma craniano mínimo: sem perda de consciência, sem amnésia e sem desorientação, , situação em que a regra não foi estudada.',
    'NÃO se aplica a: menores de 16 anos (use o PECARN), uso de anticoagulante oral ou coagulopatia conhecida, convulsão após o trauma, déficit neurológico focal agudo, ferimento penetrante ou afundamento evidente, instabilidade hemodinâmica por politrauma, gestantes e retornos para reavaliação do mesmo trauma.',
  ],

  whyUse:
    'A grande maioria dos pacientes com trauma cranioencefálico leve tem tomografia normal, e o excesso de exames gera radiação, custo e superlotação. A regra canadense mantém sensibilidade de 100% para lesões que exigem intervenção neurocirúrgica e é a mais específica entre as regras disponíveis: na comparação direta com os New Orleans Criteria, identificou os mesmos casos graves solicitando muito menos tomografias.',

  pearls: [
    'A regra tem dois níveis com finalidades diferentes: os cinco fatores de ALTO RISCO preveem a necessidade de intervenção neurocirúrgica; os dois de RISCO MÉDIO preveem lesão encefálica clinicamente importante na tomografia. Qualquer fator presente indica o exame.',
    'As exclusões são a parte mais negligenciada. Anticoagulação oral, convulsão após o trauma, déficit focal e idade abaixo de 16 anos anulam a regra: esses pacientes nunca foram testados nela e não podem ser liberados com base nela.',
    'Idosos em uso de varfarina ou de anticoagulantes diretos ficaram fora da derivação. Como a hemorragia intracraniana pode ser tardia e paucissintomática, a maioria dos protocolos indica tomografia de rotina e período de observação, mesmo com exame neurológico normal.',
    'O critério de Glasgow é aferido DUAS HORAS após o trauma, e não na chegada. Um paciente que chega com 14 e melhora para 15 às duas horas não preenche esse item.',
    'São necessários DOIS ou mais episódios de vômito. Um único vômito, isolado, não preenche o critério.',
    '"Mecanismo perigoso" tem definição fechada: atropelamento, ejeção de veículo, queda de altura igual ou maior que 3 pés (cerca de 0,9 m) ou de 5 ou mais degraus. Repare que os limiares são inclusivos: uma queda de 95 cm ou de exatamente 5 degraus já preenche o critério. Queda da própria altura não entra: o que costuma surpreender quem aplica a regra em idosos, embora eles já pontuem pelo critério da idade.',
    'A regra prevê achados tomográficos, não sintomas. Regra negativa não afasta concussão nem síndrome pós-concussional: oriente repouso relativo, retorno gradual às atividades e sinais de alarme na alta.',
    'A alta com tomografia negativa exige acompanhante orientado e capacidade de retornar. Vômitos repetidos, cefaleia progressiva, sonolência, déficit focal ou convulsão são motivos para voltar imediatamente.',
    'Os New Orleans Criteria são mais sensíveis para qualquer achado tomográfico, mas muito menos específicos: na comparação direta, gerariam quase o dobro de tomografias sem ganho na detecção de lesões que mudam a conduta.',
    'Em crianças e adolescentes abaixo de 16 anos, use a regra do PECARN, derivada e validada especificamente nessa faixa etária.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const elegivel = values.elegivel === 'sim';
    const excluido = values.exclusao === 'sim';

    if (!elegivel) {
      return {
        value: 'Regra não se aplica',
        label: 'Trauma craniano mínimo',
        severity: 'info' as const,
        interpretation:
          'A regra canadense foi derivada apenas em pacientes com Glasgow 13 a 15 associado a perda de consciência, amnésia do evento ou desorientação testemunhada. Sem nenhum desses achados, o trauma é classificado como mínimo e a regra não se aplica: nem para indicar, nem para dispensar a tomografia.',
        details: [
          { label: 'Critério de aplicação', value: 'Não preenchido' },
        ],
        nextSteps:
          'Decida a imagem clinicamente. No trauma craniano mínimo, com exame neurológico normal e sem fatores de risco, a tomografia geralmente é dispensável.\nMantenha atenção a anticoagulação, idade avançada, alcoolismo e mecanismo de alta energia, situações em que o limiar para tomografar deve ser mais baixo.\nOriente sinais de alarme na alta e garanta acompanhante.',
      };
    }

    if (excluido) {
      return {
        value: 'Regra não se aplica',
        label: 'Paciente excluído da regra',
        severity: 'moderado' as const,
        interpretation:
          'Há pelo menos uma condição de exclusão. Esses pacientes foram deliberadamente retirados do estudo de derivação, e a regra nunca demonstrou segurança neles.\nUsar a regra para dispensar a tomografia nesse cenário é o erro mais grave de aplicação.',
        details: [
          { label: 'Critério de aplicação', value: 'Excluído' },
          {
            label: 'Exclusões da regra',
            value: 'Idade < 16 anos, anticoagulação ou coagulopatia, convulsão, déficit focal, ferimento penetrante ou afundamento, instabilidade hemodinâmica, gestação, reavaliação do mesmo trauma',
          },
        ],
        nextSteps:
          'Decida a tomografia clinicamente: na maior parte dessas situações ela está indicada.\nAnticoagulação oral ou coagulopatia: tomografia de crânio sem contraste e observação, pela possibilidade de sangramento tardio; reveja a necessidade de reversão do anticoagulante se houver hemorragia.\nDéficit focal, convulsão ou ferimento penetrante: tomografia imediata e contato com a neurocirurgia.\nMenores de 16 anos: aplique a regra do PECARN.',
      };
    }

    const altoRisco = ALTO_RISCO.filter((id) => n(values, id) > 0).length;
    const riscoMedio = RISCO_MEDIO.filter((id) => n(values, id) > 0).length;

    if (altoRisco > 0) {
      return {
        value: 'Tomografia indicada',
        label: 'Alto risco',
        severity: 'alto' as const,
        interpretation:
          `${altoRisco === 1 ? 'Um fator de alto risco presente' : `${altoRisco} fatores de alto risco presentes`}. Os fatores de alto risco foram selecionados por preverem a necessidade de intervenção neurocirúrgica, com sensibilidade de 100% na coorte de derivação.\nA tomografia de crânio sem contraste está indicada.`,
        details: [
          { label: 'Fatores de alto risco', value: `${altoRisco} de 5` },
          { label: 'Fatores de risco médio', value: `${riscoMedio} de 2` },
          {
            label: 'Sensibilidade para intervenção neurocirúrgica',
            value: '100%',
            hint: 'Derivação de Stiell (2001), 3.121 pacientes; IC 95% 92% a 100%',
          },
        ],
        nextSteps:
          'Solicite tomografia de crânio sem contraste com prioridade.\nMantenha o paciente em observação com reavaliação neurológica seriada e registro dos três componentes do Glasgow.\nAcione a neurocirurgia diante de hematoma extradural, subdural com desvio de linha média, contusão volumosa ou fratura com afundamento.\nEvite hipotensão e hipoxemia enquanto aguarda o exame.',
      };
    }

    if (riscoMedio > 0) {
      return {
        value: 'Tomografia indicada',
        label: 'Risco médio',
        severity: 'moderado' as const,
        interpretation:
          `Nenhum fator de alto risco, mas ${riscoMedio === 1 ? 'um fator de risco médio presente' : 'os dois fatores de risco médio presentes'}. Esses fatores foram selecionados por preverem lesão encefálica clinicamente importante na tomografia, embora raramente exijam neurocirurgia.\nA tomografia de crânio sem contraste está indicada.`,
        details: [
          { label: 'Fatores de alto risco', value: '0 de 5' },
          { label: 'Fatores de risco médio', value: `${riscoMedio} de 2` },
          {
            label: 'Sensibilidade para lesão clinicamente importante',
            value: '98,4%',
            hint: 'Derivação de Stiell (2001) com os 7 fatores; especificidade 49,6%',
          },
        ],
        nextSteps:
          'Solicite tomografia de crânio sem contraste.\nMantenha observação com reavaliação neurológica enquanto aguarda o exame.\nTomografia normal e exame neurológico normal permitem alta com acompanhante e orientação escrita de sinais de alarme.',
      };
    }

    return {
      value: 'Tomografia dispensável',
      label: 'Regra negativa',
      severity: 'baixo' as const,
      interpretation:
        'Nenhum dos sete fatores está presente. O risco de lesão encefálica clinicamente importante é muito baixo, e o risco de lesão com necessidade de neurocirurgia é próximo de zero.\nA tomografia de crânio pode ser dispensada com segurança neste paciente.',
      details: [
        { label: 'Fatores de alto risco', value: '0 de 5' },
        { label: 'Fatores de risco médio', value: '0 de 2' },
        {
          label: 'Redução potencial de tomografias',
          value: 'Cerca de 46%',
          hint: 'Com os 7 fatores, a regra exigiria TC em 54% dos pacientes (Stiell, 2001)',
        },
      ],
      nextSteps:
        'Tomografia não é necessária pela regra. Reavalie o exame neurológico antes da alta.\nDê alta com acompanhante orientado e com orientação escrita: retornar imediatamente se houver vômitos repetidos, cefaleia progressiva, sonolência excessiva, confusão, déficit focal, alteração visual ou convulsão.\nOriente repouso relativo e retorno gradual às atividades físicas e cognitivas: a regra afasta lesão estrutural, não sintomas pós-concussionais.',
    };
  },

  formula: `Aplicar apenas em: TCE nas últimas 24 h, Glasgow 13 a 15, com perda de consciência,
amnésia do evento ou desorientação testemunhada, em pacientes com 16 anos ou mais.

FATORES DE ALTO RISCO (preveem necessidade de intervenção neurocirúrgica)
1. Glasgow < 15 duas horas após o trauma
2. Suspeita de fratura de crânio aberta ou com afundamento
3. Qualquer sinal de fratura de base de crânio (hemotímpano, olhos de guaxinim,
   sinal de Battle, otorreia ou rinorreia de líquor)
4. Dois ou mais episódios de vômito
5. Idade ≥ 65 anos

FATORES DE RISCO MÉDIO (preveem lesão encefálica clinicamente importante na TC)
6. Amnésia retrógrada ≥ 30 minutos antes do impacto
7. Mecanismo perigoso: atropelamento, ejeção de veículo, queda de altura igual ou
   maior que 3 pés (cerca de 0,9 m) ou de 5 ou mais degraus

Qualquer fator presente → tomografia de crânio sem contraste.
Nenhum fator presente → tomografia dispensável.

EXCLUSÕES (a regra não se aplica): idade < 16 anos · anticoagulação oral ou
coagulopatia · convulsão após o trauma · déficit neurológico focal agudo ·
ferimento penetrante ou afundamento evidente · instabilidade hemodinâmica por
politrauma · gestação · retorno para reavaliação do mesmo trauma.`,

  evidence:
    'A regra foi derivada por Stiell e colaboradores em 10 prontos-socorros canadenses e publicada na Lancet em 2001, com 3.121 adultos com trauma cranioencefálico leve. Os cinco fatores de alto risco tiveram sensibilidade de 100% (IC 95% 92% a 100%) para a necessidade de intervenção neurocirúrgica, com especificidade de 68,7%, o que exigiria tomografia em 32% dos pacientes. Acrescentando os dois fatores de risco médio, a sensibilidade para lesão encefálica clinicamente importante foi de 98,4%, com especificidade de 49,6% e tomografia em 54% dos pacientes. Em 2005, um estudo publicado na JAMA comparou a regra canadense aos New Orleans Criteria em 1.822 pacientes com Glasgow 15: as duas regras identificaram todos os casos que precisaram de neurocirurgia, mas a especificidade da regra canadense foi muito maior, o uso dos New Orleans Criteria levaria a quase o dobro de tomografias sem detectar nenhuma lesão adicional relevante. Validações europeias posteriores reproduziram a sensibilidade alta para desfechos neurocirúrgicos, e as diretrizes do NICE incorporaram critérios muito próximos aos da regra canadense.',

  creator: {
    name: 'Ian G. Stiell',
    bio: 'Emergencista canadense, professor da Universidade de Ottawa e autor das regras de Ottawa para tornozelo e joelho, da regra canadense para tomografia de crânio e da Canadian C-Spine Rule.',
  },

  references: [
    {
      citation:
        'Stiell IG, Wells GA, Vandemheen K, et al. The Canadian CT Head Rule for patients with minor head injury. Lancet. 2001;357(9266):1391-6.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/11356436/',
      primary: true,
    },
    {
      citation:
        'Stiell IG, Clement CM, Rowe BH, et al. Comparison of the Canadian CT Head Rule and the New Orleans Criteria in patients with minor head injury. JAMA. 2005;294(12):1511-8.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/16189364/',
    },
    {
      citation:
        'Teasdale G, Jennett B. Assessment of coma and impaired consciousness. A practical scale. Lancet. 1974;2(7872):81-4.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/4136544/',
    },
  ],
};

export default calculator;
