const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, 'dist');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpeg':'image/jpeg','.jpg':'image/jpeg','.mp4':'video/mp4'};

// Ensure uploaded photos are synced into dist/
const uploads = [
  {
    src: 'C:/Users/Hemanth Pelluru/.gemini/antigravity/brain/e994a276-962b-4bbe-ac65-e1d556465630/.user_uploaded/media_1790878102678.jpg',
    dest: path.join(root, 'memory-new-year.jpeg')
  },
  {
    src: 'C:/Users/Hemanth Pelluru/.gemini/antigravity/brain/e994a276-962b-4bbe-ac65-e1d556465630/.user_uploaded/media_1790960959674.jpg',
    dest: path.join(root, 'memory-celebration.jpeg')
  },
  {
    src: 'C:/Users/Hemanth Pelluru/.gemini/antigravity/brain/e994a276-962b-4bbe-ac65-e1d556465630/.user_uploaded/media_1791001743544.jpg',
    dest: path.join(root, 'memory-festival-group.jpg')
  }
];
uploads.forEach(u => {
  try {
    if (fs.existsSync(u.src) && !fs.existsSync(u.dest)) {
      fs.copyFileSync(u.src, u.dest);
    }
  } catch (e) {}
});

http.createServer((req,res)=>{
  const pathname = new URL(req.url,'http://localhost').pathname;
  const file = path.resolve(root, '.' + (pathname==='/'?'/index.html':decodeURIComponent(pathname)));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  fs.readFile(file,(error,data)=>{
    if(error){
      const filename = path.basename(file);
      const match = uploads.find(u => path.basename(u.dest) === filename);
      if (match && fs.existsSync(match.src)) {
        try { fs.copyFileSync(match.src, file); } catch(e){}
        const imgData = fs.readFileSync(match.src);
        res.writeHead(200,{'Content-Type':types[path.extname(file)]||'image/jpeg', 'Cache-Control': 'public, max-age=31536000'});
        return res.end(imgData);
      }
      res.writeHead(404);return res.end('Not found');
    }
    const ext = path.extname(file);
    const isMedia = ['.jpeg','.jpg','.png','.mp4','.webp'].includes(ext);
    const headers = {'Content-Type':types[ext]||'application/octet-stream'};
    if (isMedia) headers['Cache-Control'] = 'public, max-age=31536000';
    res.writeHead(200,headers);
    res.end(data);
  });
}).listen(4173,'127.0.0.1',()=>console.log('Birthday surprise running at http://localhost:4173'));
