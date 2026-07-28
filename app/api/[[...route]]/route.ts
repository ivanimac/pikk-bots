import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handle } from 'hono/vercel';

const app = new Hono().basePath('/api');

app.use('*', cors());

// ─── Health ──────────────────────────────────────────────────────────────────
app.get('/health', (c) => c.json({ status: 'ok', version: '0.1.0', timestamp: Date.now() }));

// ─── Webhooks ────────────────────────────────────────────────────────────────
app.all('/webhooks/:channel', (c) => {
  const channel = c.req.param('channel');
  return c.json({ received: true, channel, timestamp: Date.now() });
});

// ─── Metrics ─────────────────────────────────────────────────────────────────
app.get('/metrics', (c) => c.json({ leads: 0, messages: 0, conversations: 0, health_score: 100 }));

// ─── Cron ────────────────────────────────────────────────────────────────────
app.get('/cron/purge-messages', (c) => c.json({ purged: true, timestamp: Date.now() }));
app.get('/cron/health-check', (c) => c.json({ healthy: true, timestamp: Date.now() }));

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
