#!/usr/bin/env node
/**
 * Teste de fumaça do catálogo.
 *
 * Empacota o registro com o esbuild (para resolver o alias `@/`) e depois:
 *  - valida os metadados de cada calculadora;
 *  - preenche os campos de várias formas e executa `compute`, conferindo que
 *    ela nunca lança exceção e sempre devolve um resultado utilizável.
 *
 * Uso: node scripts/smoke-test.mjs
 */
import { build } from 'esbuild';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const ESPECIALIDADES = new Set([
  'Cardiologia', 'Pneumologia', 'Neurologia', 'Nefrologia', 'Gastroenterologia',
  'Hepatologia', 'Emergência', 'Terapia Intensiva', 'Infectologia', 'Hematologia',
  'Endocrinologia', 'Obstetrícia', 'Pediatria', 'Psiquiatria', 'Ortopedia',
  'Oncologia', 'Cirurgia', 'Reumatologia', 'Urologia', 'Geriatria',
  'Anestesiologia', 'Clínica Médica', 'Otorrinolaringologia', 'Toxicologia',
]);

const TIPOS = new Set([
  'Escore de risco', 'Regra de decisão', 'Fórmula', 'Classificação', 'Escala',
  'Critérios diagnósticos', 'Dosagem',
]);

const SEVERIDADES = new Set(['info', 'baixo', 'moderado', 'alto', 'critico']);

const problemas = [];
function falha(slug, mensagem) {
  problemas.push(`${slug}: ${mensagem}`);
}

/** Gerador determinístico, para que a bateria seja reproduzível. */
function lcg(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/** Valor plausível para um campo numérico. */
function valorNumerico(field, fracao) {
  const min = typeof field.min === 'number' ? field.min : 1;
  const max = typeof field.max === 'number' ? field.max : Math.max(min + 100, 100);
  const bruto = min + (max - min) * fracao;
  return field.step === 1 ? Math.round(bruto) : Math.round(bruto * 100) / 100;
}

/** Monta um conjunto de respostas para todos os campos visíveis. */
function preencher(fields, escolher) {
  const values = {};
  // Duas passadas: campos revelados por `showIf` dependem de respostas anteriores.
  for (let passada = 0; passada < 2; passada += 1) {
    for (const field of fields) {
      if (field.showIf && !field.showIf(values)) continue;
      if (field.id in values) continue;
      switch (field.kind) {
        case 'boolean': {
          const sim = field.points ?? 1;
          const nao = field.pointsIfNo ?? 0;
          values[field.id] = escolher([nao, sim]);
          break;
        }
        case 'choice':
        case 'select':
          values[field.id] = escolher(field.options.map((option) => option.value));
          break;
        case 'number':
          values[field.id] = valorNumerico(field, escolher([0.15, 0.5, 0.85]));
          break;
      }
    }
  }
  return values;
}

async function main() {
  const dir = mkdtempSync(join(tmpdir(), 'medcalculo-'));
  const saida = join(dir, 'registry.mjs');

  await build({
    entryPoints: [join(root, 'src/data/registry.ts')],
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile: saida,
    logLevel: 'silent',
    tsconfig: join(root, 'tsconfig.json'),
  });

  const { allCalculators } = await import(pathToFileURL(saida).href);
  rmSync(dir, { recursive: true, force: true });

  const slugs = new Set();

  for (const calc of allCalculators) {
    const { slug } = calc;

    if (slugs.has(slug)) falha(slug, 'slug duplicado');
    slugs.add(slug);

    if (!calc.title?.trim()) falha(slug, 'título vazio');
    if (!calc.subtitle?.trim()) falha(slug, 'subtítulo vazio');
    if (!Array.isArray(calc.whenToUse) || calc.whenToUse.length === 0) {
      falha(slug, 'whenToUse vazio');
    }
    if (!Array.isArray(calc.references) || calc.references.length === 0) {
      falha(slug, 'sem referências');
    }
    if (!TIPOS.has(calc.kind)) falha(slug, `kind inválido: ${calc.kind}`);
    for (const especialidade of calc.specialties ?? []) {
      if (!ESPECIALIDADES.has(especialidade)) {
        falha(slug, `especialidade inválida: ${especialidade}`);
      }
    }
    if (!calc.specialties?.length) falha(slug, 'sem especialidade');

    if (!Array.isArray(calc.fields) || calc.fields.length === 0) {
      falha(slug, 'sem campos');
      continue;
    }

    const ids = new Set();
    for (const field of calc.fields) {
      if (ids.has(field.id)) falha(slug, `id de campo duplicado: ${field.id}`);
      ids.add(field.id);
      if (!field.label?.trim()) falha(slug, `campo ${field.id} sem rótulo`);
      if ((field.kind === 'choice' || field.kind === 'select') && !field.options?.length) {
        falha(slug, `campo ${field.id} sem opções`);
      }
    }

    // Bateria: extremos + combinações pseudoaleatórias.
    const random = lcg(slug.length * 7919 + 13);
    const estrategias = [
      (opcoes) => opcoes[0],
      (opcoes) => opcoes[opcoes.length - 1],
      ...Array.from({ length: 12 }, () => (opcoes) => opcoes[Math.floor(random() * opcoes.length)]),
    ];

    for (const escolher of estrategias) {
      const values = preencher(calc.fields, escolher);
      let resultado;
      try {
        resultado = calc.compute(values);
      } catch (erro) {
        falha(slug, `compute lançou exceção: ${erro.message} · valores: ${JSON.stringify(values)}`);
        break;
      }

      if (!resultado || typeof resultado !== 'object') {
        falha(slug, 'compute não devolveu um objeto');
        break;
      }
      if (resultado.value === undefined || resultado.value === null) {
        falha(slug, `resultado sem "value" · valores: ${JSON.stringify(values)}`);
        break;
      }
      if (typeof resultado.value === 'number' && !Number.isFinite(resultado.value)) {
        falha(slug, `valor não finito (${resultado.value}) · valores: ${JSON.stringify(values)}`);
        break;
      }
      if (typeof resultado.value === 'string' && /NaN|Infinity|undefined/.test(resultado.value)) {
        falha(slug, `valor com texto inválido "${resultado.value}" · valores: ${JSON.stringify(values)}`);
        break;
      }
      if (!resultado.interpretation?.trim()) {
        falha(slug, `resultado sem interpretação · valores: ${JSON.stringify(values)}`);
        break;
      }
      if (resultado.severity && !SEVERIDADES.has(resultado.severity)) {
        falha(slug, `severity inválida: ${resultado.severity}`);
        break;
      }
      for (const detalhe of resultado.details ?? []) {
        if (/NaN|Infinity|undefined/.test(String(detalhe.value))) {
          falha(slug, `detalhe "${detalhe.label}" com valor inválido: ${detalhe.value}`);
        }
      }
    }
  }

  if (problemas.length > 0) {
    console.error(`\n✗ ${problemas.length} problema(s) encontrado(s):\n`);
    for (const problema of problemas) console.error(`  · ${problema}`);
    process.exit(1);
  }

  console.log(`✓ ${allCalculators.length} calculadoras validadas: metadados e compute sem falhas.`);
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
