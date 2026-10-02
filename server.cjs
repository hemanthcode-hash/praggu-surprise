const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, 'dist');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpeg':'image/jpeg','.jpg':'image/jpeg','.mp4':'video/mp4'};

// Ensure uploaded photo is synced into dist/
const uploadedSrc = 'C:/Users/Hemanth Pelluru/.gemini/antigravity/brain/e994a276-962b-4bbe-ac65-e1d556465630/.user_uploaded/media_1790878102678.jpg';
const destImg = path.join(root, 'memory-new-year.jpeg');
try {
  if (fs.existsSync(uploadedSrc) && !fs.existsSync(destImg)) {
    fs.copyFileSync(uploadedSrc, destImg);
  }
} catch (e) {}

http.createServer((req,res)=>{
  const pathname = new URL(req.url,'http://localhost').pathname;
  const file = path.resolve(root, '.' + (pathname==='/'?'/index.html':decodeURIComponent(pathname)));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);return res.end('Not found');}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data);});
}).listen(4173,'127.0.0.1',()=>console.log('Birthday surprise running at http://localhost:4173'));
