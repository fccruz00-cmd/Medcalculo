# Como escrever uma calculadora

Cada calculadora é **um arquivo TypeScript** em `src/data/calculators/<slug>.ts`.
O nome do arquivo tem de ser idêntico ao campo `slug`: o gerador de índice
rejeita a divergência.

Depois de adicionar ou remover arquivos, rode:

```bash
npm test    # regenera index.ts e lazy.ts, confere a tipagem e roda o teste de fumaça
```

O teste de fumaça preenche os campos de várias formas e executa `compute`,
falhando se alguma combinação lançar exceção, devolver `NaN` ou ficar sem
interpretação.

## Esqueleto obrigatório

```ts
import type { Calculator, Field, Values } from '@/lib/types';
import { n, sumPoints } from '@/lib/utils';

// Os campos ficam no escopo do módulo para que `compute` possa somá-los
// sem depender de `this`, que não é tipado dentro do objeto.
const FIELDS: Field[] = [ /* ... */ ];

const calculator: Calculator = {
  slug: 'exemplo',          // igual ao nome do arquivo
  title: '...',
  subtitle: '...',
  specialties: ['Cardiologia'],
  kind: 'Escore de risco',
  whenToUse: ['...'],
  fields: FIELDS,
  compute(values: Values) { /* ... */ },
  references: [{ citation: '...', url: '...', primary: true }],
};

export default calculator;
```

Use `src/data/calculators/cha2ds2-vasc.ts` (escore somado),
`curb-65.ts` (escore com desfecho tabelado) e `tfg-ckd-epi.ts` (fórmula
contínua) como modelos.

## Regras que o código precisa respeitar

1. **Nunca use `this` dentro de `compute`.** Referencie a constante `FIELDS`.
2. `compute` é **pura**: sem acesso a `Date`, `Math.random`, rede ou DOM.
3. Só é chamada quando todos os campos obrigatórios estão preenchidos: ainda
   assim, proteja divisões e logaritmos contra zero e valores negativos.
4. Campos com `optional: true` não bloqueiam o cálculo e podem chegar `null`.
5. `showIf` esconde campos dependentes; campos escondidos não entram em
   `sumPoints` nem contam como obrigatórios.
6. Nos campos de pontuação, o `value` da opção **é** a pontuação do item.
   Assim `sumPoints(FIELDS, values)` devolve o escore.
7. Quando o escore não é uma soma simples (fórmulas, pesos, subescores), leia
   os valores com `n(values, 'id')` e faça a conta explicitamente.

## Tipos de campo

| `kind` | Uso | Observações |
| --- | --- | --- |
| `boolean` | Sim / Não | `points` = pontos do "Sim" (padrão 1); `pointsIfNo` para pontuação negativa ou não nula; `labels: ['Ausente', 'Presente']` troca os rótulos |
| `choice` | Botões com 3+ opções | `value` numérico = pontos; `layout: 'stack'` para rótulos longos |
| `select` | Lista suspensa | Para conjuntos grandes (mais de 6 opções) |
| `number` | Valor medido | Sempre com `unit`; use `unitToggle` quando a literatura internacional usa outra unidade |

## Regras de conteúdo

- **Tudo em português do Brasil.** Inclusive rótulos, dicas e interpretações.
  Nomes próprios de escores permanecem no original (HAS-BLED, qSOFA).
- **Unidades brasileiras.** Creatinina em mg/dL, glicemia em mg/dL, ureia (não
  BUN). Onde a literatura usa outra unidade, explicite a equivalência na `hint`
  ou ofereça `unitToggle`.
- `whenToUse`: a população em que o instrumento foi **derivado e validado**, e
  em quem ele **não** se aplica.
- `pearls`: as armadilhas reais, erros previsíveis, populações excluídas,
  confusões frequentes de unidade. É a seção mais útil da página; não a
  preencha com generalidades.
- `interpretation`: o que o número significa clinicamente. `nextSteps`: a
  conduta que a literatura sustenta.
- `severity` escolhe a cor do painel: `baixo`, `moderado`, `alto`, `critico`,
  `info`. Reflita o risco do paciente, não o valor bruto do escore.
- `references`: citação completa no formato Vancouver, com link do PubMed
  quando existir. Marque `primary: true` no artigo de derivação. Prefira
  diretrizes brasileiras quando existirem. **Não invente referências**: se não
  tiver certeza da citação exata, use uma que você conheça com segurança.
- `details`: valores secundários que o clínico quer ver (mortalidade estimada,
  subescores, faixa de referência).

## Números precisam estar certos

Confira a pontuação item a item contra o artigo original antes de escrever.
Percentuais de risco e mortalidade devem vir de uma coorte identificada, citada
no campo `hint` do `details` ou no texto de `evidence`. Quando os dados variam
entre estudos, escolha a coorte de derivação e diga qual é.
