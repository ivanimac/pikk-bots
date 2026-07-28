/**
 * index.ts — PIKK Bots main entry point.
 * Hono app en Vercel Functions con:
 * - Webhooks para cada canal
 * - API de control plane (/api/*)
 * - Dashboard /admin
 * - Cron jobs
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { resolveChannel } from './channels/shared';
import { getAgent } from './agent';
import type { AppEnv } from './env';

// ─── App ──────────────────────────────────────────────────────────────────────

const app = new Hono();

app.use('*', cors());

// ─── Health check ────────────────────────────────────────────────────────────

app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: Date.now() }));

// ─── Webhooks ────────────────────────────────────────────────────────────────

// Telegram
app.all('/webhooks/telegram', async (c) => {
  const resolved = resolveChannel('/telegram');
  if (!resolved) return c.text('Not found', 404);

  const message = await resolved.adapter.parseIncoming(c.req.raw, {} as AppEnv);
  if (!message) return c.text('OK'); // GET verification o mensaje vacío

  const agent = getAgent(`telegram:${message.userId}`);
  const reply = await agent.ingest(message, {} as AppEnv);
  await resolved.adapter.sendReply({ userId: message.userId, text: reply, channel: 'telegram' }, {} as AppEnv);
  return c.text('OK');
});

// WhatsApp (Evolution API)
app.all('/webhooks/whatsapp', async (c) => {
  const resolved = resolveChannel('/whatsapp');
  if (!resolved) return c.text('Not found', 404);

  const message = await resolved.adapter.parseIncoming(c.req.raw, {} as AppEnv);
  if (!message) return c.text('OK');

  const agent = getAgent(`whatsapp:${message.userId}`);
  const reply = await agent.ingest(message, {} as AppEnv);
  await resolved.adapter.sendReply({ userId: message.userId, text: reply, channel: 'whatsapp' }, {} as AppEnv);
  return c.text('OK');
});

// Meta (Instagram + Messenger)
app.get('/webhooks/meta', (c) => {
  const verifyToken = c.req.query('hub.verify_token');
  const challenge = c.req.query('hub.challenge');
  // En prod: verifyToken === env.secrets.META_VERIFY_TOKEN
  if (challenge) return c.text(challenge);
  return c.text('Verification failed', 403);
});

app.post('/webhooks/meta', async (c) => {
  const resolved = resolveChannel('/meta');
  if (!resolved) return c.text('Not found', 404);

  const message = await resolved.adapter.parseIncoming(c.req.raw, {} as AppEnv);
  if (!message) return c.text('OK');

  const agent = getAgent(`meta:${message.userId}`);
  const reply = await agent.ingest(message, {} as AppEnv);
  await resolved.adapter.sendReply({ userId: message.userId, text: reply, channel: message.channel }, {} as AppEnv);
  return c.text('OK');
});

// ManyChat
app.all('/webhooks/manychat', async (c) => {
  return c.text('ManyChat webhook ready');
});

// ─── Control Plane API ───────────────────────────────────────────────────────

app.get('/api/metrics', async (c) => {
  return c.json({
    leads: 0,
    messages: 0,
    conversations: 0,
    health_score: 100,
    active_channels: [],
  });
});

// ─── Cron Jobs ────────────────────────────────────────────────────────────────

app.get('/api/cron/purge-messages', async (c) => {
  // En prod: ejecutar DELETE FROM messages WHERE created_at < now() - INTERVAL '90 days'
  return c.json({ purged: true, timestamp: Date.now() });
});

app.get('/api/cron/health-check', async (c) => {
  // En prod: watchdog — contar fallos, alertar al dueño si ≥ 3
  return c.json({ healthy: true, timestamp: Date.now() });
});

// ─── Dashboard (servido por Next.js en Fases 1+) ─────────────────────────────

app.all('/admin/*', (c) => {
  // En prod: servir el dashboard React/Next.js
  return c.text('PIKK Bots Dashboard — próximamente');
});

// ─── Export ───────────────────────────────────────────────────────────────────

export default app;

export const config = {
  runtime: 'nodejs',
};
