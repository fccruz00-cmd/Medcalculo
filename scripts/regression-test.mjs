#!/usr/bin/env node
/**
 * Teste de regressão do catálogo.
 *
 * O teste de fumaça garante que `compute` não quebra. Este garante que ela não
 * MUDA sem que alguém perceba: para cada calculadora, executa um conjunto fixo
 * de combinações de respostas e compara o resultado com um instantâneo
 * versionado em `tests/instantaneos.json`.
 *
 * Sem isso, editar uma faixa de risco ou um peso de item altera pontuações em
 * silêncio. Num instrumento clínico, esse é o pior tipo de defeito: não quebra
 * nada, só passa a responder outra coisa.
 *
 *   node scripts/regression-test.mjs              confere
 *   node scripts/regression-test.mjs --atualizar  regrava o instantâneo
 *
 * Ao atualizar, LEIA o diff: cada linha alterada é uma pontuação que mudou.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { carregarCatalogo, cenarios, raiz } from './lib/catalogo.mjs';

const ARQUIVO = join(raiz, 'tests/instantaneos.json');
const atualizar = process.argv.includes('--atualizar');

const catalogo = await carregarCatalogo();

/** Resultado reduzido ao que importa comparar. */
function resumir(calc, values) {
  try {
    const r = calc.compute(values);
    return {
      entrada: values,
      valor: r.value,
      unidade: r.unit ?? null,
      rotulo: r.label ?? null,
      gravidade: r.severity ?? null,
      detalhes: (r.details ?? []).map((d) => `${d.label}=${d.value}`),
    };
  } catch (erro) {
    return { entrada: values, erro: erro.message };
  }
}

const atual = {};
for (const calc of catalogo) {
  atual[calc.slug] = cenarios(calc).map((values) => resumir(calc, values));
}

if (atualizar || !existsSync(ARQUIVO)) {
  mkdirSync(join(raiz, 'tests'), { recursive: true });
  writeFileSync(ARQUIVO, `${JSON.stringify(atual, null, 1)}\n`);
  const total = Object.values(atual).reduce((s, c) => s + c.length, 0);
  console.log(
    `✓ Instantâneo gravado: ${Object.keys(atual).length} calculadoras, ${total} cenários.\n` +
      '  Confira o diff antes de commitar: cada linha alterada é uma pontuação que mudou.',
  );
  process.exit(0);
}

const anterior = JSON.parse(readFileSync(ARQUIVO, 'utf8'));
const diferencas = [];

for (const slug of Object.keys(atual)) {
  if (!anterior[slug]) {
    diferencas.push(`${slug}: calculadora nova, sem instantâneo`);
    continue;
  }
  for (let i = 0; i < atual[slug].length; i += 1) {
    const a = JSON.stringify(anterior[slug][i]);
    const b = JSON.stringify(atual[slug][i]);
    if (a !== b) {
      diferencas.push(
        `${slug} [cenário ${i}]\n    antes: ${a?.slice(0, 200)}\n    agora: ${b.slice(0, 200)}`,
      );
    }
  }
}

for (const slug of Object.keys(anterior)) {
  if (!atual[slug]) diferencas.push(`${slug}: calculadora removida`);
}

if (diferencas.length > 0) {
  console.error(`✗ ${diferencas.length} resultado(s) mudaram desde o último instantâneo:\n`);
  for (const d of diferencas.slice(0, 40)) console.error(`  · ${d}\n`);
  if (diferencas.length > 40) console.error(`  ... e mais ${diferencas.length - 40}.`);
  console.error(
    'Se a mudança é intencional, rode `node scripts/regression-test.mjs --atualizar`\n' +
      'e confira o diff do instantâneo antes de commitar.',
  );
  process.exit(1);
}

const total = Object.values(atual).reduce((s, c) => s + c.length, 0);
console.log(`✓ ${total} cenários conferem com o instantâneo (${Object.keys(atual).length} calculadoras).`);
