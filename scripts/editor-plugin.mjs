import { fileURLToPath } from 'node:url';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { createEditorStore } from './editor-store.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const store = createEditorStore(root);
const endpoint = '/__local-editor/archive';

export function isLocalEditorRequest(request) {
  const expectedOrigin = 'http://127.0.0.1:3841';
  const peer = request.socket.remoteAddress;
  return (
    ['127.0.0.1', '::ffff:127.0.0.1'].includes(peer) &&
    request.headers.host === '127.0.0.1:3841' &&
    (!request.headers.origin || request.headers.origin === expectedOrigin) &&
    !['cross-site', 'same-site'].includes(request.headers['sec-fetch-site'])
  );
}

export function localEditorPlugin() {
  return {
    name: 'local-campaign-editor',
    handleHotUpdate(context) {
      // O editor mantém o retorno da gravação visível. A prévia é recarregada separadamente.
      if (path.resolve(context.file) === path.resolve(root, 'data', 'archive.json')) return [];
    },
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (request.url?.split('?')[0] !== endpoint) return next();
        response.setHeader('Content-Type', 'application/json; charset=utf-8');
        response.setHeader('Cache-Control', 'no-store');
        response.setHeader('X-Content-Type-Options', 'nosniff');
        const respond = (status, data) => {
          response.statusCode = status;
          response.end(JSON.stringify(data));
        };
        if (!isLocalEditorRequest(request))
          return respond(403, { error: 'Editor disponível apenas na origem local.' });
        try {
          if (request.method === 'GET') {
            const assets = (await readdir(path.join(root, 'public', 'assets'))).map(
              (name) => 'assets/' + name,
            );
            return respond(200, { ...(await store.load()), assets });
          }
          if (request.method !== 'PUT') return respond(405, { error: 'Método não permitido.' });
          if (
            request.headers.origin !== 'http://127.0.0.1:3841' ||
            request.headers['content-type']?.split(';')[0] !== 'application/json'
          ) {
            return respond(403, { error: 'Gravação deve partir do editor local.' });
          }
          const chunks = [];
          let size = 0;
          for await (const chunk of request) {
            size += chunk.length;
            if (size > 2 * 1024 * 1024)
              return respond(413, { error: 'Arquivo acima do limite de 2 MB.' });
            chunks.push(chunk);
          }
          const { archive, revision } = JSON.parse(Buffer.concat(chunks).toString('utf8'));
          return respond(200, await store.save(archive, revision));
        } catch (error) {
          return respond(error.status || (error instanceof SyntaxError ? 400 : 500), {
            error:
              error.status || error instanceof SyntaxError
                ? error.message
                : 'Não foi possível gravar o arquivo local.',
          });
        }
      });
    },
  };
}
