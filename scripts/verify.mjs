import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const steps = [
  [
    'Formatação',
    [
      'node_modules/prettier/bin/prettier.cjs',
      '--check',
      'src',
      'data/*.js',
      'style.css',
      'vite.config.js',
      'scripts',
      'tests',
    ],
  ],
  ['Testes', ['--test']],
  ['Site para publicação', ['scripts/build.mjs']],
];

for (const [label, args] of steps) {
  console.log(`\n${label}`);
  const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit' });
  if (result.error) console.error(result.error.message);
  if (result.error || result.status !== 0) process.exit(result.status || 1);
}

console.log(
  '\nVerificação concluída. O site está em dist/. Nenhum arquivo foi enviado ou publicado.',
);
