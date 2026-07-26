#!/usr/bin/env node
/**
 * Teste de fumaça do catálogo.
 *
 * Valida os metadados de cada calculadora e executa `compute` sob várias
 * combinações de respostas, conferindo que ela nunca lança exceção e sempre
 * devolve um resultado utilizável.
 *
 * Uso: node scripts/smoke-test.mjs
 */
import { carregarCatalogo, cenarios } from './lib/catalogo.mjs';

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

const catalogo = await carregarCatalogo();
const slugs = new Set();

for (const calc of catalogo) {
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

  for (const values of cenarios(calc, 12)) {
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

console.log(`✓ ${catalogo.length} calculadoras validadas: metadados e compute sem falhas.`);
