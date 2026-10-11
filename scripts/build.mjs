import { readFile } from 'node:fs/promises';
import { build } from 'vite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { validateArchive } from '../data/archive-schema.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const data = JSON.parse(await readFile(path.join(root, 'data/archive.json'), 'utf8'));
const errors = validateArchive(data);
if (errors.length) throw new Error(errors.join('\n'));
const output = path.resolve(root, 'dist');
if (path.dirname(output) !== path.resolve(root)) throw new Error('Diretório de saída inválido.');
await build({ root, build: { outDir: output } });
console.log('Build concluído: dist/ (site estático, sem servidor de produção).');
