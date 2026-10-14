import { defineConfig } from 'vite';
import { localEditorPlugin } from './scripts/editor-plugin.mjs';
import { publicArchivePlugin } from './scripts/public-archive-plugin.mjs';

export default defineConfig(({ mode }) => ({
  plugins: [publicArchivePlugin(), ...(mode === 'editor' ? [localEditorPlugin()] : [])],
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 3841, strictPort: true },
  preview: { host: '127.0.0.1', port: 3841, strictPort: true },
}));
