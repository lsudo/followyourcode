// Local preview that answers like the live site: /dir/ serves dir/index.html,
// /dir redirects to /dir/, a missing page gets 404.html with status 404.
// Nothing is cached, so a refresh always shows the files as they are on disk.
// Usage: node scripts/serve.mjs [port] [dir]   (defaults: 8000, the repository root)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const port = Number(process.argv[2] || 8000);
const root = resolve(process.argv[3] || fileURLToPath(new URL('..', import.meta.url)));
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.pdf': 'application/pdf',
};

const isFile = async (p) => (await stat(p).catch(() => null))?.isFile() ?? false;
const isDir = async (p) => (await stat(p).catch(() => null))?.isDirectory() ?? false;

createServer(async (req, res) => {
  const send = async (status, file) => {
    res.writeHead(status, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(await readFile(file));
  };
  const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).normalize('NFC');
  const file = join(root, normalize(path));
  if (!file.startsWith(root)) return send(404, join(root, '404.html'));
  if (path.endsWith('/') && await isFile(join(file, 'index.html'))) return send(200, join(file, 'index.html'));
  if (!path.endsWith('/') && await isFile(file)) return send(200, file);
  if (!path.endsWith('/') && await isDir(file)) {
    res.writeHead(301, { Location: encodeURI(path + '/'), 'Cache-Control': 'no-store' });
    return res.end();
  }
  send(404, join(root, '404.html'));
}).listen(port, '127.0.0.1', () => console.log(`Serving ${root} at http://127.0.0.1:${port}/`));
