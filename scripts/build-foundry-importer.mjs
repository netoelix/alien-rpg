import { build } from 'vite';
import { mkdir, copyFile } from 'node:fs/promises';
const output = 'outputs/alien-blueprint-importer';
await build({
  configFile: false,
  build: {
    outDir: output,
    emptyOutDir: false,
    lib: {
      entry: 'src/blueprints/foundry/module-entry.js',
      formats: ['es'],
      fileName: () => 'main.js',
    },
    minify: false,
  },
});
await mkdir(output, { recursive: true });
await copyFile('foundry/blueprint-importer/module.json', `${output}/module.json`);
await copyFile('foundry/blueprint-importer/README.md', `${output}/README.md`);
