import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
const file=process.argv[2]||'out/relay-circuit/circuit.html';
createServer((req,res)=>{if(req.url.startsWith('/favicon')){res.writeHead(404).end();return;}res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(readFileSync(file));}).listen(4184,'127.0.0.1',()=>console.log('Circuit isolated: http://127.0.0.1:4184/'));
