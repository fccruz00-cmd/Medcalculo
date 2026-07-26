import type { Calculator, Field, Values } from '@/lib/types';
import { sumPoints } from '@/lib/utils';

const FIELDS: Field[] = [
  {
    id: 'idade',
    kind: 'boolean',
    label: 'Idade acima de 65 anos',
    hint: 'Estritamente maior que 65 anos.',
    points: 1,
  },
  {
    id: 'tevPrevio',
    kind: 'boolean',
    label: 'TVP ou TEP prévios',
    hint: 'Diagnóstico objetivo anterior, confirmado por imagem.',
    points: 3,
  },
  {
    id: 'cirurgiaFratura',
    kind: 'boolean',
    label: 'Cirurgia com anestesia geral ou fratura de membro inferior no último mês',
    points: 2,
  },
  {
    id: 'cancer',
    kind: 'boolean',
    label: 'Neoplasia maligna ativa',
    hint: 'Tumor sólido ou hematológico, em atividade ou considerado curado há menos de 1 ano.',
    points: 2,
  },
  {
    id: 'dorUnilateral',
    kind: 'boolean',
    label: 'Dor unilateral em membro inferior',
    hint: 'Relatada pelo paciente. É diferente do item de dor à palpação, avaliado adiante.',
    points: 3,
  },
  {
    id: 'hemoptise',
    kind: 'boolean',
    label: 'Hemoptise',
    points: 2,
  },
  {
    id: 'fc',
    kind: 'choice',
    label: 'Frequência cardíaca',
    hint: 'Use a frequência aferida na admissão, antes de analgesia ou de betabloqueador.',
    layout: 'stack',
    options: [
      { label: 'Menos de 75 bpm', value: 0 },
      { label: '75 a 94 bpm', value: 3, badge: '+3' },
      { label: '95 bpm ou mais', value: 5, badge: '+5' },
    ],
  },
  {
    id: 'palpacaoEdema',
    kind: 'boolean',
    label: 'Dor à palpação do trajeto venoso profundo E edema unilateral do membro inferior',
    hint: 'Exige os dois achados simultaneamente. Apenas um deles não pontua.',
    points: 4,
  },
];

const calculator: Calculator = {
  slug: 'genebra-revisado',
  title: 'Escore de Genebra revisado',
  shortTitle: 'Genebra revisado',
  subtitle:
    'Estima a probabilidade pré-teste de tromboembolismo pulmonar usando apenas variáveis objetivas, sem nenhum item de julgamento subjetivo.',
  specialties: ['Emergência', 'Pneumologia', 'Clínica Médica', 'Cardiologia'],
  kind: 'Regra de decisão',
  keywords: [
    'genebra',
    'geneva',
    'escore de Genebra revisado',
    'revised Geneva score',
    'embolia pulmonar',
    'tromboembolismo pulmonar',
    'TEP',
    'probabilidade pré-teste',
    'd-dímero',
    'Le Gal',
  ],

  whenToUse: [
    'Adultos atendidos no pronto-socorro com suspeita de tromboembolismo pulmonar, para definir a probabilidade pré-teste antes de solicitar D-dímero ou angiotomografia.',
    'Especialmente útil quando o avaliador não é especialista, quando o caso será estratificado por protocolo institucional ou em pesquisa: porque nenhum item depende da impressão do examinador sobre "diagnósticos alternativos".',
    'Não se aplica a pacientes hemodinamicamente instáveis: na suspeita de TEP com choque ou hipotensão persistente, vá direto ao ecocardiograma à beira do leito ou à angiotomografia.',
    'Não foi derivado nem validado em gestantes, em pacientes já anticoagulados nem em pacientes que estavam internados quando surgiu a suspeita: a coorte original é de pacientes ambulatoriais do pronto-socorro.',
  ],

  whyUse:
    'A principal crítica ao escore de Wells é o item "diagnóstico alternativo menos provável que TEP", que vale 3 pontos e depende do julgamento de quem avalia: o que reduz a concordância entre examinadores e permite manipular a categoria do paciente. O Genebra revisado usa oito variáveis inteiramente objetivas: idade, história, sinais de membro inferior e frequência cardíaca. Isso o torna reprodutível e aplicável por protocolo, com desempenho equivalente ao do Wells.',

  pearls: [
    'Os itens de membro inferior são dois, e são diferentes: "dor unilateral" (3 pontos) é sintoma relatado; "dor à palpação venosa profunda com edema unilateral" (4 pontos) é achado de exame e exige os dois componentes juntos. Um paciente com TVP evidente pontua nos dois, somando 7.',
    'A frequência cardíaca é a única variável graduada e vale até 5 pontos: mais que qualquer outro item. Registre a FC da admissão: taquicardia tratada com analgesia ou betabloqueador antes da avaliação subestima o escore.',
    'A faixa de 75 a 94 bpm já vale 3 pontos. Isso surpreende quem está acostumado ao Wells, em que só acima de 100 bpm pontua: uma FC de 80 bpm, aparentemente normal, contribui de forma relevante aqui.',
    'A idade pontua acima de 65 anos, não a partir de 65. Um paciente com exatamente 65 anos não marca esse item.',
    'Ser objetivo não torna o escore melhor: metanálises mostram desempenho semelhante ao do Wells. A vantagem é a reprodutibilidade, não a acurácia.',
    'O escore sozinho não exclui TEP. Só a combinação de probabilidade baixa ou intermediária com D-dímero negativo permite alta sem imagem. Na categoria de probabilidade alta, o D-dímero não deve ser usado para excluir o diagnóstico.',
    'Os dois esquemas de leitura divergem na faixa de 6 a 10 pontos: pelo esquema de três níveis o paciente é de probabilidade intermediária e pode seguir com D-dímero; pelo dicotomizado ele é "TEP provável" e vai direto à angiotomografia. Defina qual esquema o serviço usa e mantenha-o: alternar entre eles conforme o resultado desejado é o que mais compromete a segurança do algoritmo.',
    'Existe uma versão simplificada (Klok, 2008) em que todos os itens valem 1 ponto, exceto a frequência cardíaca (1 ponto entre 75 e 94 bpm, 2 pontos a partir de 95). Os pontos de corte são diferentes: não misture as duas versões.',
  ],

  fields: FIELDS,

  compute(values: Values) {
    const pontos = sumPoints(FIELDS, values);

    // Dicotomização usada nos algoritmos com D-dímero: 0 a 5 = TEP improvável.
    const provavel = pontos >= 6;

    let nivel: string;
    let prevalencia: string;
    let severity: 'baixo' | 'moderado' | 'alto';

    if (pontos <= 3) {
      nivel = 'Probabilidade baixa';
      prevalencia = '8%';
      severity = 'baixo';
    } else if (pontos <= 10) {
      nivel = 'Probabilidade intermediária';
      prevalencia = '28%';
      severity = 'moderado';
    } else {
      nivel = 'Probabilidade alta';
      prevalencia = '74%';
      severity = 'alto';
    }

    const nextSteps = provavel
      ? 'Grupo "TEP provável": solicite angiotomografia de artérias pulmonares diretamente. O D-dímero não deve ser usado para excluir TEP nesse grupo.\nSe houver contraindicação ao contraste, considere cintilografia de ventilação/perfusão ou ultrassonografia venosa de membros inferiores: TVP proximal confirmada já justifica anticoagulação.\nConsidere anticoagulação empírica enquanto aguarda o exame, se o risco de sangramento for aceitável.'
      : 'Grupo "TEP improvável": solicite D-dímero de alta sensibilidade, com ponto de corte ajustado por idade em maiores de 50 anos (idade × 10 µg/L em unidades FEU).\nD-dímero negativo exclui TEP: o paciente pode receber alta sem angiotomografia e sem anticoagulação.\nD-dímero positivo indica angiotomografia de artérias pulmonares.';

    return {
      value: pontos,
      unit: pontos === 1 ? 'ponto' : 'pontos',
      label: `${nivel} · TEP ${provavel ? 'provável' : 'improvável'}`,
      severity,
      interpretation: `${nivel} de tromboembolismo pulmonar. Na coorte de validação externa de Le Gal (2006), a prevalência de TEP nessa faixa foi de ${prevalencia}.\nNa versão dicotomizada, o paciente é classificado como TEP ${provavel ? 'provável (6 pontos ou mais)' : 'improvável (5 pontos ou menos)'}, é essa leitura que orienta a conduta sugerida abaixo.\nEntre 6 e 10 pontos as duas leituras divergem: o esquema de três níveis chamaria o paciente de probabilidade intermediária, em que o D-dímero ainda é aceitável. Escolha um dos esquemas e siga-o até o fim, sem alternar.`,
      details: [
        {
          label: 'Prevalência esperada de TEP',
          value: prevalencia,
          hint: 'Coorte de validação externa de Le Gal (Ann Intern Med, 2006), 756 pacientes',
        },
        {
          label: 'Classificação dicotômica',
          value: provavel ? 'TEP provável (≥ 6 pontos)' : 'TEP improvável (≤ 5 pontos)',
        },
        {
          label: 'Exame indicado',
          value: provavel ? 'Angiotomografia de tórax' : 'D-dímero de alta sensibilidade',
          hint: 'Conforme o esquema dicotomizado',
        },
      ],
      nextSteps,
    };
  },

  formula: `Soma dos pontos (máximo 22):

Idade > 65 anos: +1
TVP ou TEP prévios: +3
Cirurgia com anestesia geral ou fratura de membro inferior no último mês: +2
Neoplasia maligna ativa (ou curada há menos de 1 ano): +2
Dor unilateral em membro inferior: +3
Hemoptise: +2
Frequência cardíaca 75 a 94 bpm: +3 · ≥ 95 bpm: +5
Dor à palpação venosa profunda com edema unilateral: +4

Interpretação em 3 níveis (Le Gal, 2006 - prevalências da coorte de validação externa):
0 a 3 pontos - probabilidade baixa (8%)
4 a 10 pontos - probabilidade intermediária (28%)
≥ 11 pontos - probabilidade alta (74%)

Interpretação dicotomizada:
0 a 5 pontos - TEP improvável → D-dímero
≥ 6 pontos - TEP provável`,

  evidence:
    'Le Gal e colaboradores publicaram o escore em 2006, no Annals of Internal Medicine, derivado em 965 pacientes consecutivos com suspeita de TEP atendidos nos prontos-socorros de três hospitais universitários da Suíça e da França e validado externamente em 756 pacientes independentes. A prevalência global de embolia pulmonar na coorte de derivação foi de 23%. O modelo, construído apenas com variáveis objetivas, teve área sob a curva ROC de 0,74 nas duas coortes e separou os pacientes em probabilidade baixa, intermediária e alta: na coorte de validação, a prevalência de TEP foi de 8% na faixa baixa, 28% na intermediária e 74% na alta. Validações posteriores e metanálises mostraram desempenho equivalente ao do escore de Wells, com a vantagem da reprodutibilidade entre examinadores. Em 2008, Klok e colaboradores propuseram a versão simplificada, em que os pesos são reduzidos a 1 ponto por item (2 pontos para frequência cardíaca ≥ 95 bpm), sem perda de acurácia. As diretrizes da Sociedade Europeia de Cardiologia de 2019 aceitam Wells e Genebra revisado como alternativas equivalentes para a estratificação pré-teste.',

  creator: {
    name: 'Grégoire Le Gal e Arnaud Perrier',
    bio: 'Internistas e pesquisadores em tromboembolismo venoso; Le Gal desenvolveu o escore em Brest e Genebra e hoje é professor da Universidade de Ottawa.',
  },

  references: [
    {
      citation:
        'Le Gal G, Righini M, Roy PM, et al. Prediction of pulmonary embolism in the emergency department: the revised Geneva score. Ann Intern Med. 2006;144(3):165-71.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/16461960/',
      primary: true,
    },
    {
      citation:
        'Klok FA, Mos ICM, Nijkeuter M, et al. Simplification of the revised Geneva score for assessing clinical probability of pulmonary embolism. Arch Intern Med. 2008;168(19):2131-6.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/18955643/',
    },
    {
      citation:
        'Ceriani E, Combescure C, Le Gal G, et al. Clinical prediction rules for pulmonary embolism: a systematic review and meta-analysis. J Thromb Haemost. 2010;8(5):957-70.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/20149072/',
    },
    {
      citation:
        'Konstantinides SV, Meyer G, Becattini C, et al. 2019 ESC Guidelines for the diagnosis and management of acute pulmonary embolism developed in collaboration with the European Respiratory Society (ERS). Eur Heart J. 2020;41(4):543-603.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/31504429/',
    },
  ],
};

export default calculator;
