#!/usr/bin/env node
/**
 * Casos clínicos de valor conhecido.
 *
 * O teste de fumaça garante que `compute` não quebra e o de regressão garante
 * que ela não muda. Este é o único que verifica se ela está CERTA: cada caso
 * de `tests/casos-clinicos.json` traz uma entrada e o resultado esperado,
 * conferido à mão contra a definição do instrumento.
 *
 * Ao adicionar uma calculadora, escreva ao menos dois casos: o mínimo e o
 * máximo do escore, ou um exemplo publicado no artigo original.
 *
 * Uso: node scripts/golden-test.mjs
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { carregarCatalogo, raiz } from './lib/catalogo.mjs';

const casos = JSON.parse(readFileSync(join(raiz, 'tests/casos-clinicos.json'), 'utf8'));
const catalogo = await carregarCatalogo();
const porSlug = new Map(catalogo.map((c) => [c.slug, c]));

/**
 * Converte o valor exibido para número. O resultado sai formatado no padrão
 * brasileiro ("22,9", "1.234"), então a vírgula é decimal e o ponto é milhar.
 */
function paraNumero(valor) {
  if (typeof valor === 'number') return valor;
  const limpo = String(valor).replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
  return Number(limpo);
}

const falhas = [];

for (const caso of casos) {
  const calc = porSlug.get(caso.slug);
  if (!calc) {
    falhas.push(`${caso.slug}: calculadora não existe no catálogo`);
    continue;
  }

  let resultado;
  try {
    resultado = calc.compute(caso.entrada);
  } catch (erro) {
    falhas.push(`${caso.slug} — ${caso.descricao}\n    compute lançou: ${erro.message}`);
    continue;
  }

  const esperado = caso.esperado;

  if (esperado.valor !== undefined) {
    const obtido = paraNumero(resultado.value);
    const tolerancia = esperado.tolerancia ?? 0;
    if (!Number.isFinite(obtido) || Math.abs(obtido - esperado.valor) > tolerancia) {
      falhas.push(
        `${caso.slug} — ${caso.descricao}\n` +
          `    esperado: ${esperado.valor}${tolerancia ? ` (±${tolerancia})` : ''}\n` +
          `    obtido  : ${resultado.value}`,
      );
      continue;
    }
  }

  if (esperado.rotulo && !String(resultado.label ?? '').includes(esperado.rotulo)) {
    falhas.push(
      `${caso.slug} — ${caso.descricao}\n` +
        `    rótulo esperado: "${esperado.rotulo}"\n` +
        `    rótulo obtido  : "${resultado.label ?? '(nenhum)'}"`,
    );
  }
}

const cobertas = new Set(casos.map((c) => c.slug));

if (falhas.length > 0) {
  console.error(`✗ ${falhas.length} caso(s) clínico(s) falharam:\n`);
  for (const f of falhas) console.error(`  · ${f}\n`);
  process.exit(1);
}

console.log(
  `✓ ${casos.length} casos clínicos conferem (${cobertas.size} de ${catalogo.length} calculadoras cobertas).`,
);
