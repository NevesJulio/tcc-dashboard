import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const source = process.argv[2];
if (!source) throw new Error('Informe o diretório do TCC: npm run research:sync -- "/caminho/VQ-VAE-ECG-main"');
const directory = path.resolve(source, 'configs/experiments');
const files = (await readdir(directory)).filter(file => /\.ya?ml$/.test(file)).sort();
const configs = await Promise.all(files.map(async file => {
  const content = await readFile(path.join(directory, file), 'utf8');
  const name = content.match(/^experiment:\s*\r?\n\s+name:\s*([^\r\n#]+)/m)?.[1]?.trim();
  return { file: `configs/experiments/${file}`, name: name || file.replace(/\.ya?ml$/, '') };
}));
// Export only configuration names and relative paths, never exam data or reports.
const destination = fileURLToPath(new URL('../src/data/research-catalog.json', import.meta.url));
await writeFile(destination, JSON.stringify({ configs }, null, 2) + '\n');
console.log(`${configs.length} configurações sincronizadas.`);
