import {createServer} from 'node:http';
import {readFile,realpath} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
const base=await realpath(resolve('.'));
const site=await realpath(resolve('site'));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.md':'text/plain; charset=utf-8','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{
 try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname.includes('\0')||pathname.includes('\\'))throw new Error('Bad path');
  const doc=pathname.startsWith('/docs/')||['/README.md','/LICENSE','/CREDITS.md','/CONTRIBUTING.md'].includes(pathname);
  const root=doc?base:site;
  const file=await realpath(resolve(root,'.'+(pathname==='/'?'/index.html':pathname)));
  if(!file.startsWith(root+sep)||doc&&pathname.startsWith('/docs/')&&!file.startsWith(resolve(base,'docs')+sep))throw new Error('Forbidden');
  const contents=await readFile(file);
  res.writeHead(200,{'Content-Type':types[extname(file)]||'text/plain; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"});res.end(req.method==='HEAD'?undefined:contents);
 }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('未找到文件');}
});
server.on('error',error=>{console.error(`启动失败：${error.message}。可用 PORT 环境变量指定其他端口。`);process.exitCode=1;});
server.listen(Number(process.env.PORT||4173),'127.0.0.1',()=>console.log(`AI Infra Lab: http://127.0.0.1:${server.address().port}`));
