import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.argv[2] || 5173);
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};
const server = http.createServer(async (request, response) => {
    try {
        if (!['GET','HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
        const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
        const filename = path.resolve(root, '.' + (pathname.endsWith('/') ? pathname + 'index.html' : pathname));
        const relative = path.relative(root, filename);
        if (relative.startsWith('..') || path.isAbsolute(relative) || relative.split(path.sep).some(part => part.startsWith('.')) || !mime[path.extname(filename)]) {
            response.writeHead(404); response.end('Not found'); return;
        }
        const content = await fs.readFile(filename);
        response.writeHead(200, {'Content-Type':mime[path.extname(filename)],'Cache-Control':'no-cache'});
        response.end(request.method === 'HEAD' ? undefined : content);
    } catch (_) { response.writeHead(404); response.end('Not found'); }
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`AstroGuardian: http://127.0.0.1:${port}`));
