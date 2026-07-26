/**
 * Utilitários compartilhados pelos scripts que precisam executar o catálogo
 * fora do Next: teste de fumaça e teste de regressão.
 */
import { build } from 'esbuild';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const raiz = join(dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * Empacota o registro com o esbuild (para resolver o alias `@/`) e devolve o
 * catálogo já carregado.
 */
export async function carregarCatalogo() {
  const dir = mkdtempSync(join(tmpdir(), 'medcalculo-'));
  const saida = join(dir, 'registry.mjs');

  await build({
    entryPoints: [join(raiz, 'src/data/registry.ts')],
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile: saida,
    logLevel: 'silent',
    tsconfig: join(raiz, 'tsconfig.json'),
  });

  const modulo = await import(pathToFileURL(saida).href);
  rmSync(dir, { recursive: true, force: true });
  return modulo.allCalculators;
}

/**
 * Gerador congruente linear. Substitui Math.random para que a bateria seja
 * idêntica em toda execução, o que é requisito de um teste de regressão.
 */
export function lcg(semente) {
  let estado = semente;
  return () => {
    estado = (estado * 1664525 + 1013904223) % 4294967296;
    return estado / 4294967296;
  };
}

/** Valor plausível para um campo numérico, a partir da faixa declarada. */
export function valorNumerico(campo, fracao) {
  const min = typeof campo.min === 'number' ? campo.min : 1;
  const max = typeof campo.max === 'number' ? campo.max : Math.max(min + 100, 100);
  const bruto = min + (max - min) * fracao;
  return campo.step === 1 ? Math.round(bruto) : Math.round(bruto * 100) / 100;
}

/**
 * Monta um conjunto de respostas para todos os campos visíveis.
 * `escolher` recebe as opções disponíveis e devolve uma delas.
 */
export function preencher(campos, escolher) {
  const values = {};
  // Duas passadas: campos revelados por `showIf` dependem de respostas anteriores.
  for (let passada = 0; passada < 2; passada += 1) {
    for (const campo of campos) {
      if (campo.showIf && !campo.showIf(values)) continue;
      if (campo.id in values) continue;
      switch (campo.kind) {
        case 'boolean': {
          const sim = campo.points ?? 1;
          const nao = campo.pointsIfNo ?? 0;
          values[campo.id] = escolher([nao, sim]);
          break;
        }
        case 'choice':
        case 'select':
          values[campo.id] = escolher(campo.options.map((opcao) => opcao.value));
          break;
        case 'number':
          values[campo.id] = valorNumerico(campo, escolher([0.15, 0.5, 0.85]));
          break;
      }
    }
  }
  return values;
}

/**
 * Cenários determinísticos por calculadora: os dois extremos e um conjunto
 * reprodutível de combinações intermediárias.
 */
export function cenarios(calc, quantidade = 10) {
  const random = lcg(calc.slug.length * 7919 + 13);
  const estrategias = [
    (opcoes) => opcoes[0],
    (opcoes) => opcoes[opcoes.length - 1],
    ...Array.from(
      { length: quantidade },
      () => (opcoes) => opcoes[Math.floor(random() * opcoes.length)],
    ),
  ];
  return estrategias.map((escolher) => preencher(calc.fields, escolher));
}
