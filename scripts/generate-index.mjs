#!/usr/bin/env node
/**
 * Varre `src/data/calculators/` e regenera dois arquivos:
 *
 *   index.ts : array com todas as definições (usado no servidor: listagens,
 *               busca, rotas estáticas e conteúdo das páginas).
 *   lazy.ts  : mapa `slug -> import dinâmico`, para o navegador baixar
 *               apenas a calculadora que está sendo usada.
 *
 * Rode após adicionar ou remover uma calculadora:  node scripts/generate-index.mjs
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'src/data/calculators');

const GENERATED = ['index.ts', 'lazy.ts'];

const files = readdirSync(dir)
  .filter((file) => file.endsWith('.ts') && !GENERATED.includes(file))
  .sort();

if (files.length === 0) {
  console.error('Nenhuma calculadora encontrada em src/data/calculators/');
  process.exit(1);
}

const modules = files.map((file) => {
  const name = file.replace(/\.ts$/, '');
  const source = readFileSync(join(dir, file), 'utf8');

  const slugMatch = source.match(/slug:\s*'([^']+)'/);
  if (!slugMatch) {
    console.error(`✗ ${file}: não encontrei o campo "slug".`);
    process.exit(1);
  }
  if (!/export default/.test(source)) {
    console.error(`✗ ${file}: falta "export default".`);
    process.exit(1);
  }
  if (slugMatch[1] !== name) {
    console.error(`✗ ${file}: slug "${slugMatch[1]}" difere do nome do arquivo "${name}".`);
    process.exit(1);
  }

  // Identificador válido em JS a partir do nome do arquivo em kebab-case.
  const ident = name.replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase());
  return { name, ident };
});

const duplicates = modules
  .map((module) => module.name)
  .filter((name, position, list) => list.indexOf(name) !== position);
if (duplicates.length > 0) {
  console.error(`✗ Slugs duplicados: ${duplicates.join(', ')}`);
  process.exit(1);
}

const header = `// ARQUIVO GERADO: não edite à mão.\n// Rode \`node scripts/generate-index.mjs\` após alterar o catálogo.\n\n`;

const indexSource =
  header +
  `import type { Calculator } from '@/lib/types';\n\n` +
  modules.map((module) => `import ${module.ident} from './${module.name}';`).join('\n') +
  `\n\nexport const calculators: Calculator[] = [\n` +
  modules.map((module) => `  ${module.ident},`).join('\n') +
  `\n];\n`;

const lazySource =
  header +
  `import type { Calculator } from '@/lib/types';\n\n` +
  `/** Importes dinâmicos: o navegador baixa só a calculadora aberta. */\n` +
  `export const lazyCalculators: Record<string, () => Promise<Calculator>> = {\n` +
  modules
    .map(
      (module) =>
        `  '${module.name}': () => import('./${module.name}').then((m) => m.default),`,
    )
    .join('\n') +
  `\n};\n`;

writeFileSync(join(dir, 'index.ts'), indexSource);
writeFileSync(join(dir, 'lazy.ts'), lazySource);

console.log(`✓ ${modules.length} calculadoras registradas em index.ts e lazy.ts`);
