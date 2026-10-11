import { readFile, mkdir, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { validateCampaign } from '../data/schema.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const data = JSON.parse(await readFile(path.join(root, 'data/fragmentos-da-guerra.json'), 'utf8'));
const errors = validateCampaign(data);
if (errors.length) throw new Error(errors.join('\n'));
const output = path.resolve(root, 'dist');
if (path.dirname(output) !== path.resolve(root)) throw new Error('Diretório de saída inválido.');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const name of ['index.html', 'app.js', 'style.css', 'data', 'assets']) await cp(path.join(root, name), path.join(output, name), { recursive: true });
console.log('Build concluído: dist/ (site estático, sem servidor de produção).');
