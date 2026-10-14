import { defineConfig } from 'vite';
import { localEditorPlugin } from './scripts/editor-plugin.mjs';

export default defineConfig(({ mode }) => ({
  plugins: mode === 'editor' ? [localEditorPlugin()] : [],
  esbuild: { jsx: 'automatic' },
  server: { host: '127.0.0.1', port: 3841, strictPort: true },
  preview: { host: '127.0.0.1', port: 3841, strictPort: true },
}));
