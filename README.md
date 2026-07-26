# MedCálculo

Calculadoras e escores médicos em português: escores de risco, regras de decisão
clínica e fórmulas, cada um com interpretação do resultado, conduta sugerida pela
literatura e as referências originais.

## Rodando localmente

```bash
npm install
npm run dev      # http://localhost:3000
```

Outros comandos:

```bash
npm run build      # build de produção (gera as páginas estaticamente)
npm run typecheck  # tsc --noEmit
npm test           # regenera o índice, confere tipos e roda o teste de fumaça
```

`npm test` encadeia três verificações, que respondem a perguntas diferentes:

| Script | Pergunta |
| --- | --- |
| `smoke-test.mjs` | `compute` **quebra**? Executa 14 combinações por calculadora, falhando em exceção, `NaN` ou interpretação vazia. |
| `golden-test.mjs` | `compute` está **certa**? Confere `tests/casos-clinicos.json`, com entradas e resultados conferidos à mão contra a definição do instrumento. |
| `regression-test.mjs` | `compute` **mudou**? Compara 756 cenários com o instantâneo em `tests/instantaneos.json`. |

O de regressão é o que impede o pior defeito de um instrumento clínico: uma
pontuação que passa a responder outra coisa sem quebrar nada. Quando a mudança
for intencional, rode `npm run instantaneo` e **leia o diff** — cada linha
alterada é uma pontuação que mudou.

Há ainda `npm run test:referencias`, que confere cada link do PubMed contra a
API do NCBI comparando título, autor, ano e periódico com o texto da citação.
Precisa de rede, por isso fica fora do `npm test`.

## Publicação

O site é publicado no GitHub Pages pelo workflow `.github/workflows/deploy.yml`,
que roda a cada push: valida o catálogo com `npm test`, gera o HTML estático e
publica. Uma calculadora quebrada não chega ao ar.

O Pages é ativado pelo próprio workflow, via `enablement: true` no
`configure-pages`, não é preciso configurar nada em *Settings → Pages*.

As opções de export estático só entram quando `GITHUB_PAGES=true`, definido
apenas no workflow: então `npm run dev`, `npm run build` e `npm start`
continuam funcionando normalmente no ambiente local. Para reproduzir o build de
publicação:

```bash
GITHUB_PAGES=true PAGES_BASE_PATH=/Medcalculo npm run build
npx serve out    # ou qualquer servidor estático
```

## Estrutura

```
src/
  app/                       Rotas (App Router)
    calculadora/[slug]/      Página de uma calculadora
    especialidades/[slug]/   Catálogo por especialidade
    buscar/  favoritos/  sobre/  calculadoras/
  components/
    calculator/              Motor do formulário e painel de resultado
  data/
    calculators/             Uma calculadora por arquivo
      index.ts  lazy.ts      GERADOS: não edite à mão
    registry.ts              Consultas ao catálogo (servidor)
  lib/
    types.ts                 Contrato de uma calculadora
    search.ts                Busca (seguro para o cliente)
    utils.ts                 Helpers de pontuação e formatação
docs/
  ESPECIFICACAO-CALCULADORA.md
scripts/
  generate-index.mjs
```

### Como o catálogo é carregado

`registry.ts` importa todas as definições e é usado apenas no servidor: listagens,
busca, rotas estáticas e o conteúdo textual das páginas. O navegador recebe só um
índice enxuto para a busca.

A definição completa, que inclui as funções `compute` e `showIf`, chega ao
navegador por importe dinâmico (`lazy.ts`), então cada calculadora vira um chunk
separado e o usuário baixa apenas a que abriu.

## Adicionando uma calculadora

1. Crie `src/data/calculators/<slug>.ts` seguindo
   [a especificação](docs/ESPECIFICACAO-CALCULADORA.md). O nome do arquivo deve
   ser igual ao campo `slug`.
2. Regenere o índice e confira a tipagem:

   ```bash
   node scripts/generate-index.mjs
   npx tsc --noEmit
   ```

## Licença e propriedade intelectual

O código e os textos deste projeto estão sob licença MIT (`LICENSE`). Os
instrumentos clínicos pertencem a seus autores: são implementados a partir dos
artigos originais e citados em cada página.

Antes de adicionar uma calculadora, leia [AVISO-LEGAL.md](AVISO-LEGAL.md).
Em resumo: escreva tudo a partir da fonte primária, nunca adaptando texto de
outra ferramenta, e não inclua instrumentos com licenciamento restritivo (MMSE,
MoCA e questionários de qualidade de vida, entre outros).

## Aviso

Ferramenta de apoio à decisão destinada a profissionais de saúde, com finalidade
educacional. Os resultados não substituem a avaliação clínica individualizada nem
o julgamento do profissional assistente. Confira sempre os valores inseridos e as
referências originais antes de qualquer conduta.
