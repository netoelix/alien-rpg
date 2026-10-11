import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const checkout = fileURLToPath(new URL('../', import.meta.url));
const root = process.argv.includes('--dist') ? path.join(checkout, 'dist') : checkout;
const port = Number(process.env.PORT || 3841);
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ttf': 'font/ttf' };
const allowed = new Set(['index.html', 'app.js', 'style.css']);
const server = http.createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405).end(); return; }
  let route;
  try { route = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); } catch { response.writeHead(400).end(); return; }
  if (['/', '/about', '/players', '/timeline'].includes(route)) route = '/index.html';
  const relative = route.slice(1);
  const file = path.resolve(root, relative);
  if (!file.startsWith(path.resolve(root) + path.sep) || !mime[path.extname(file)] || !(allowed.has(relative) || relative.startsWith('assets/') || relative.startsWith('data/'))) { response.writeHead(404).end(); return; }
  try {
    if (!(await stat(file)).isFile()) { response.writeHead(404).end(); return; }
    const content = await readFile(file);
    response.writeHead(200, { 'Content-Type': mime[path.extname(file)], 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch { response.writeHead(404).end(); }
});
server.listen(port, '127.0.0.1', () => console.log(`Alien RPG v3: http://127.0.0.1:${port}`));
process.on('SIGINT', () => server.close(() => process.exit(0)));
