/**
 * Núcleo de tipos do MedCálculo.
 *
 * Toda calculadora do catálogo é um objeto `Calculator`. O motor de interface
 * (`CalculatorRunner`) renderiza os campos a partir de `fields` e chama
 * `compute` sempre que os valores mudam.
 */

/** Valor bruto de um campo, do jeito que o formulário guarda. */
export type FieldValue = number | string | boolean | null;

/** Mapa `id do campo -> valor`. */
export type Values = Record<string, FieldValue>;

/** Opção de um campo de escolha (botões) ou de lista suspensa. */
export interface Option {
  /** Texto exibido ao usuário. */
  label: string;
  /** Valor guardado. Quase sempre é a própria pontuação do item. */
  value: number | string;
  /** Texto auxiliar exibido abaixo do rótulo. */
  hint?: string;
  /** Sufixo curto exibido à direita do rótulo (ex.: "+2"). */
  badge?: string;
}

interface FieldBase {
  /** Identificador usado em `Values` e nas fórmulas. */
  id: string;
  /** Pergunta / rótulo principal. */
  label: string;
  /** Explicação curta abaixo do rótulo. */
  hint?: string;
  /** Bloco de ajuda expansível ("Dica"). */
  help?: string;
  /** Campo opcional não bloqueia o cálculo. Padrão: obrigatório. */
  optional?: boolean;
  /** Só aparece quando a função devolve `true`. */
  showIf?: (values: Values) => boolean;
}

/** Entrada numérica com unidade (peso, creatinina, PAS...). */
export interface NumberField extends FieldBase {
  kind: 'number';
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  /** Faixa considerada normal, exibida como referência. */
  normalRange?: string;
  /** Permite alternar a unidade (ex.: mg/dL <-> µmol/L). */
  unitToggle?: {
    /** Unidade alternativa. */
    alt: string;
    /** Converte do valor alternativo para a unidade base. */
    toBase: (v: number) => number;
    /** Converte da unidade base para a alternativa. */
    fromBase: (v: number) => number;
  };
}

/** Grupo de botões: o controle padrão dos escores de pontuação. */
export interface ChoiceField extends FieldBase {
  kind: 'choice';
  options: Option[];
  /** `stack` força uma opção por linha; `auto` deixa fluir. */
  layout?: 'auto' | 'stack';
}

/** Atalho para o par Não / Sim, que é de longe o campo mais comum. */
export interface BooleanField extends FieldBase {
  kind: 'boolean';
  /** Pontos somados quando "Sim". Padrão: 1. */
  points?: number;
  /** Pontos somados quando "Não". Padrão: 0. */
  pointsIfNo?: number;
  /** Rótulos personalizados no lugar de "Não"/"Sim". */
  labels?: [string, string];
}

/** Lista suspensa, para conjuntos grandes de opções. */
export interface SelectField extends FieldBase {
  kind: 'select';
  options: Option[];
  placeholder?: string;
}

export type Field = NumberField | ChoiceField | BooleanField | SelectField;

/** Gravidade do resultado: define a cor do painel. */
export type Severity = 'info' | 'baixo' | 'moderado' | 'alto' | 'critico';

/** Linha extra exibida junto ao resultado principal. */
export interface ResultDetail {
  label: string;
  value: string;
  hint?: string;
}

export interface Result {
  /** Número ou texto principal exibido em destaque. */
  value: number | string;
  /** Unidade do valor principal (ex.: "pontos", "mL/min/1,73m²"). */
  unit?: string;
  /** Classificação curta (ex.: "Risco alto"). */
  label?: string;
  severity?: Severity;
  /** Leitura clínica do resultado. Aceita várias linhas. */
  interpretation: string;
  /** Valores secundários (mortalidade estimada, faixas, subescores...). */
  details?: ResultDetail[];
  /** Conduta sugerida pela literatura. */
  nextSteps?: string;
}

export interface Reference {
  /** Citação completa, no formato do artigo original. */
  citation: string;
  url?: string;
  /** Marca o artigo de derivação/validação original. */
  primary?: boolean;
}

export interface Creator {
  name: string;
  bio?: string;
}

/** Especialidades usadas na navegação. */
export type Specialty =
  | 'Cardiologia'
  | 'Pneumologia'
  | 'Neurologia'
  | 'Nefrologia'
  | 'Gastroenterologia'
  | 'Hepatologia'
  | 'Emergência'
  | 'Terapia Intensiva'
  | 'Infectologia'
  | 'Hematologia'
  | 'Endocrinologia'
  | 'Obstetrícia'
  | 'Pediatria'
  | 'Psiquiatria'
  | 'Ortopedia'
  | 'Oncologia'
  | 'Cirurgia'
  | 'Reumatologia'
  | 'Urologia'
  | 'Geriatria'
  | 'Anestesiologia'
  | 'Clínica Médica'
  | 'Otorrinolaringologia'
  | 'Toxicologia';

/** Tipo de instrumento, exibido como etiqueta no cartão. */
export type CalcKind =
  | 'Escore de risco'
  | 'Regra de decisão'
  | 'Fórmula'
  | 'Classificação'
  | 'Escala'
  | 'Critérios diagnósticos'
  | 'Dosagem';

export interface Calculator {
  /** Identificador na URL: /calculadora/<slug> */
  slug: string;
  /** Nome completo, como aparece no cabeçalho da página. */
  title: string;
  /** Nome curto para cartões e listas. Padrão: `title`. */
  shortTitle?: string;
  /** Uma linha descrevendo o que o instrumento estima. */
  subtitle: string;
  specialties: Specialty[];
  kind: CalcKind;
  /** Termos alternativos que a busca deve encontrar. */
  keywords?: string[];
  /** Situações clínicas em que o instrumento se aplica. */
  whenToUse: string[];
  /** Por que vale a pena usar: o diferencial do instrumento. */
  whyUse?: string;
  /** Aviso de armadilhas, populações excluídas, limitações. */
  pearls?: string[];
  fields: Field[];
  /** Recebe os valores e devolve o resultado. Deve ser pura. */
  compute: (values: Values) => Result;
  /** Explicação da conta, em texto/markdown simples. */
  formula?: string;
  /** Resumo da evidência que sustenta o instrumento. */
  evidence?: string;
  creator?: Creator;
  references: Reference[];
  /** Destaca na página inicial. */
  popular?: boolean;
}
