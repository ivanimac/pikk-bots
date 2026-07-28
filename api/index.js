/**
 * api/index.js — PIKK Bots Vercel Function (Node.js).
 * Entry point autónomo sin dependencias de src/ durante el build.
 */

// Lazy imports — solo se cargan en runtime, no en build
let app;

async function getApp() {
  if (app) return app;

  const { Hono } = await import('hono');
  const { cors } = await import('hono/cors');
  app = new Hono();

  app.use('*', cors());

  // Health
  app.get('/api/health', (c) => c.json({ status: 'ok', version: '0.1.0', timestamp: Date.now() }));

  // Webhooks — placeholder (se activan con el agente real en Fase 1)
  app.all('/webhooks/:channel', (c) => {
    const channel = c.req.param('channel');
    return c.json({ received: true, channel, timestamp: Date.now() });
  });

  // API
  app.get('/api/metrics', (c) => c.json({ leads: 0, messages: 0, conversations: 0, health_score: 100 }));
  app.get('/api/cron/purge-messages', (c) => c.json({ purged: true, timestamp: Date.now() }));
  app.get('/api/cron/health-check', (c) => c.json({ healthy: true, timestamp: Date.now() }));

  // Dashboard placeholder
  app.get('/admin', (c) => c.html(`<!DOCTYPE html><html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>PIKK Bots — Dashboard</title>
<style>body{background:#0A0A0F;color:#E0E0E0;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
.card{text-align:center;padding:48px;border:1px solid #5CC9BE22;border-radius:16px;max-width:480px}
h1{color:#5CC9BE;font-size:2rem;margin:0 0 8px}p{color:#888;margin:0 0 24px}
.badge{display:inline-block;background:#5CC9BE22;color:#5CC9BE;padding:6px 16px;border-radius:20px;font-size:.85rem}</style></head>
<body><div class="card"><h1>&#x1f528; PIKK Bots</h1><p>Dashboard en construccion — Fase 1</p>
<div class="badge">v0.1.0 · Online</div></div></body></html>`));

  // Root
  app.get('/', (c) => c.json({ name: 'PIKK Bots', version: '0.1.0', status: 'online', docs: 'https://github.com/ivanimac/pikk-bots' }));

  return app;
}

// Vercel Node.js handler
export default async function handler(req, res) {
  try {
    const hono = await getApp();
    const url = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
    const webReq = new Request(url, {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    const webRes = await hono.fetch(webReq);

    res.statusCode = webRes.status;
    webRes.headers.forEach((value, key) => res.setHeader(key, value));

    if (webRes.headers.get('content-type')?.includes('text/html')) {
      res.end(await webRes.text());
    } else {
      res.end(JSON.stringify(await webRes.json()));
    }
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Internal server error', status: 'error' }));
  }
}
