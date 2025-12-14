const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');
const fsp = require('node:fs/promises');

const { URL } = require('node:url');

function htmlPage({ title, scriptSrc }) {
  return [
    '<!doctype html>',
    '<html>',
    '<head>',
    '  <meta charset="utf-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1" />',
    `  <title>${title}</title>`,
    '</head>',
    '<body>',
    `  <script src="${scriptSrc}"></script>`,
    '</body>',
    '</html>',
    '',
  ].join('\n');
}

async function startE2EServer({ distDir }) {
  const sseClients = new Set();

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || '/', 'http://127.0.0.1');

      if (url.pathname === '/') {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        res.end(
          htmlPage({
            title: 'jsgui3-client e2e',
            scriptSrc: '/assets/window-basic.js',
          })
        );
        return;
      }

      if (url.pathname === '/window-basic') {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        res.end(htmlPage({ title: 'window-basic', scriptSrc: '/assets/window-basic.js' }));
        return;
      }

      if (url.pathname === '/window-binding-counter') {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        res.end(htmlPage({ title: 'window-binding-counter', scriptSrc: '/assets/window-binding-counter.js' }));
        return;
      }

      if (url.pathname === '/window-binding-sse') {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        res.end(htmlPage({ title: 'window-binding-sse', scriptSrc: '/assets/window-binding-sse.js' }));
        return;
      }

      if (url.pathname.startsWith('/assets/')) {
        const filename = path.basename(url.pathname);
        const filePath = path.join(distDir, filename);

        try {
          await fsp.access(filePath, fs.constants.R_OK);
        } catch {
          res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
          res.end('Not found');
          return;
        }

        res.writeHead(200, { 'content-type': 'application/javascript; charset=utf-8' });
        fs.createReadStream(filePath).pipe(res);
        return;
      }

      if (url.pathname === '/sse/value') {
        res.writeHead(200, {
          'content-type': 'text/event-stream; charset=utf-8',
          'cache-control': 'no-cache, no-transform',
          connection: 'keep-alive',
        });
        res.write(`data: ${JSON.stringify({ value: 0 })}\n\n`);
        sseClients.add(res);
        req.on('close', () => {
          sseClients.delete(res);
        });
        return;
      }

      if (url.pathname === '/api/sse-push') {
        const rawValue = url.searchParams.get('value');
        const parsed = rawValue === null ? Date.now() : Number(rawValue);
        const value = Number.isFinite(parsed) ? parsed : rawValue;
        const payload = { value };
        const msg = `data: ${JSON.stringify(payload)}\n\n`;
        for (const client of Array.from(sseClients)) {
          try {
            client.write(msg);
          } catch {
            sseClients.delete(client);
          }
        }
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: true, clients: sseClients.size, payload }));
        return;
      }

      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Not found');
    } catch (err) {
      res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
      res.end(String(err && err.stack ? err.stack : err));
    }
  });

  await new Promise((resolve, reject) => {
    server.listen(0, '127.0.0.1', () => resolve());
    server.on('error', reject);
  });

  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : undefined;
  if (!port) {
    server.close();
    throw new Error('Failed to bind test server port');
  }

  const baseUrl = `http://127.0.0.1:${port}`;

  return {
    baseUrl,
    close: () =>
      new Promise((resolve) => {
        for (const client of Array.from(sseClients)) {
          try {
            client.end();
          } catch {}
        }
        server.close(() => resolve());
      }),
  };
}

module.exports = { startE2EServer };

