#!/usr/bin/env node
/**
 * Confere as referências do catálogo contra o PubMed.
 *
 * Para cada link `pubmed.ncbi.nlm.nih.gov/<pmid>`, consulta a API E-utilities
 * do NCBI e compara o registro real com o texto da citação: sobrenome do
 * primeiro autor e ano de publicação. Um PMID que não existe, ou que aponta
 * para outro artigo, é o tipo de erro que passa despercebido na revisão de
 * texto e destrói a credibilidade da página.
 *
 * Precisa de rede. Não entra no `npm test` por isso; rode manualmente ao
 * adicionar calculadoras:  node scripts/check-references.mjs
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'src/data/calculators');

const ESUMMARY = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi';
const LOTE = 100;

/** Captura o par (citação, PMID) de cada entrada do array `references`. */
const REFERENCIA = /citation:\s*\n?\s*'((?:[^'\\]|\\.)*)'[\s\S]{0,160}?pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/g;

function extrair() {
  const encontradas = [];
  for (const arquivo of readdirSync(dir)) {
    if (!arquivo.endsWith('.ts') || ['index.ts', 'lazy.ts'].includes(arquivo)) continue;
    const fonte = readFileSync(join(dir, arquivo), 'utf8');
    for (const match of fonte.matchAll(REFERENCIA)) {
      encontradas.push({
        arquivo,
        citacao: match[1].replace(/\\'/g, "'"),
        pmid: match[2],
      });
    }
  }
  return encontradas;
}

/** Normaliza para comparar nomes com e sem acento. */
function semAcento(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/**
 * Fração das palavras significativas do título do PubMed que aparecem na
 * citação. Tolera diferença de pontuação, aspas e maiúsculas.
 */
function razaoDeTitulo(titulo, citacao) {
  const alvo = semAcento(citacao).replace(/[^a-z0-9 ]/g, ' ');
  const palavras = semAcento(titulo)
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((p) => p.length > 3);
  if (palavras.length === 0) return 1;
  const presentes = palavras.filter((p) => alvo.includes(p)).length;
  return presentes / palavras.length;
}

async function buscar(pmids) {
  const registros = {};
  for (let i = 0; i < pmids.length; i += LOTE) {
    const fatia = pmids.slice(i, i + LOTE);
    const url = `${ESUMMARY}?db=pubmed&retmode=json&id=${fatia.join(',')}`;
    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error(`PubMed respondeu ${resposta.status}`);
    const dados = await resposta.json();
    Object.assign(registros, dados.result ?? {});
    // Respeita o limite de 3 requisições por segundo do NCBI.
    if (i + LOTE < pmids.length) await new Promise((r) => setTimeout(r, 400));
  }
  return registros;
}

const referencias = extrair();
const pmids = [...new Set(referencias.map((r) => r.pmid))];

console.log(`${referencias.length} referências com PMID (${pmids.length} únicos). Consultando o PubMed...\n`);

const registros = await buscar(pmids);

const problemas = [];

for (const ref of referencias) {
  const registro = registros[ref.pmid];

  if (!registro || registro.error) {
    problemas.push({ ...ref, tipo: 'inexistente', real: null });
    continue;
  }

  const citacao = semAcento(ref.citacao);
  const ano = (registro.pubdate ?? '').match(/\d{4}/)?.[0] ?? '';

  // Sinal 1: sobreposição de título. Robusto para autoria institucional e
  // sobrenomes curtos ou compostos, que quebram a comparação por autor.
  const tituloBate = razaoDeTitulo(registro.title ?? '', ref.citacao) >= 0.6;

  // Sinal 2: autor + ano + periódico. Cobre os casos em que o título do
  // PubMed não bate com o da citação: expansão de sigla entre parênteses e
  // artigos brasileiros indexados com o título vertido para o inglês.
  const nome = registro.authors?.[0]?.name ?? '';
  const partes = nome.split(' ');
  const sobrenome = semAcento(partes.length > 1 ? partes.slice(0, -1).join(' ') : nome);
  const periodico = semAcento(registro.source ?? '');
  const metadadosBatem =
    sobrenome.length > 1 &&
    citacao.includes(sobrenome) &&
    Boolean(ano) &&
    ref.citacao.includes(ano) &&
    periodico.length > 3 &&
    citacao.includes(periodico);

  if (!tituloBate && !metadadosBatem) {
    problemas.push({
      ...ref,
      tipo: 'artigo diferente',
      real: `${nome || '(institucional)'} | ${registro.pubdate} | ${registro.source} | ${registro.title}`,
    });
  }
}

if (problemas.length === 0) {
  console.log(`✓ ${referencias.length} referências conferem com o registro do PubMed.`);
  process.exit(0);
}

console.error(`✗ ${problemas.length} referência(s) com problema:\n`);
for (const p of problemas) {
  console.error(`[${p.tipo}] ${p.arquivo} — PMID ${p.pmid}`);
  console.error(`  citado: ${p.citacao.slice(0, 130)}`);
  if (p.real) console.error(`  real  : ${p.real.slice(0, 130)}`);
  console.error('');
}
process.exit(1);
