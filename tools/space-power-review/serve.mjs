import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
const root=process.argv[2]||'out/space-selected-review', port=+(process.argv[3]||4188);
const files = {
  '/': root+'/index.html',
  '/carrier.html': root+'/carrier.html',
  '/circuit.html': root+'/circuit/circuit.html',
  '/forge.html': root+'/forge/forge.html',
};
createServer((req, res) => {
  const path = new URL(req.url, 'http://127.0.0.1').pathname;
  if (!files[path]) { res.writeHead(404).end(); return; }
  try {
    res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.setHeader('Cache-Control', 'no-store');
    res.end(readFileSync(files[path]));
  } catch { res.writeHead(503).end('Preview is being rebuilt.'); }
}).listen(port, '127.0.0.1', () => console.log(`Playtest: http://127.0.0.1:${port}/`));
