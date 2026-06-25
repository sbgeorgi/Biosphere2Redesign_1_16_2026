const fs = require('fs');
const http = require('http');
const path = require('path');

const root = path.resolve(__dirname, '..');
const types = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

const server = http.createServer((req, res) => {
  let requestPath = decodeURIComponent(req.url.split('?')[0]);
  if (requestPath === '/') requestPath = '/index.html';
  let file = path.join(root, requestPath);

  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    file = path.join(file, 'index.html');
  }

  if (!file.startsWith(root) || !fs.existsSync(file)) {
    res.statusCode = 404;
    res.end('missing');
    return;
  }

  res.setHeader('content-type', types[path.extname(file).toLowerCase()] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});

function getStatus(port, requestPath) {
  return new Promise((resolve) => {
    http.get({ host: '127.0.0.1', port, path: requestPath }, (res) => {
      res.resume();
      resolve(res.statusCode);
    }).on('error', () => resolve(0));
  });
}

server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  const routes = [
    '/',
    '/animation.html',
    '/about/history/',
    '/about/leadership/',
    '/research/data/',
    '/research/leo/',
    '/research/publications/',
    '/research/directory/',
    '/education/k12/',
    '/conference/spaces/',
    '/conference/inquiry/',
    '/media/press/',
    '/media/social/',
    '/media/spotlight/',
    '/visit/',
    '/visit/tours/',
  ];

  let ok = true;
  for (const route of routes) {
    const status = await getStatus(port, route);
    console.log(`${status} ${route}`);
    if (status !== 200) ok = false;
  }

  server.close(() => process.exit(ok ? 0 : 1));
});
