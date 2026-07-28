/**
 * channels/whatsapp.ts — Channel Adapter para WhatsApp via Evolution API (Baileys).
 * Webhook: POST /webhooks/whatsapp
 */

import type { ChannelAdapter, IncomingMessage, OutgoingReply, AppEnv } from '../env';

interface EvolutionSendBody {
  number: string;
  text: string;
  delay?: number;
}

async function evolutionSend(body: EvolutionSendBody, env: AppEnv): Promise<void> {
  const baseUrl = env.secrets.EVOLUTION_SERVER_URL || 'http://localhost:8080';
  const instance = env.secrets.EVOLUTION_INSTANCE || 'default';
  const apiKey = env.secrets.EVOLUTION_API_KEY;

  if (!apiKey) return;

  await fetch(`${baseUrl}/message/sendText/${instance}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': apiKey,
    },
    body: JSON.stringify(body),
  });
}

export const whatsappAdapter: ChannelAdapter = {
  async parseIncoming(req: Request, _env: AppEnv): Promise<IncomingMessage | null> {
    const body = await req.json().catch(() => null);
    if (!body) return null;

    // Evolution API webhook format: { data: { key: { remoteJid, fromMe }, message: {...} } }
    const data = body.data ?? body;

    // Ignorar mensajes salientes (fromMe)
    if (data?.key?.fromMe) return null;

    const msg = data?.message;
    const conversation = msg?.conversation;
    const extendedText = msg?.extendedTextMessage?.text;
    const caption = msg?.imageMessage?.caption ?? msg?.videoMessage?.caption;
    const text = conversation ?? extendedText ?? caption;

    const jid = data?.key?.remoteJid ?? data?.from;
    if (!jid) return null;

    // Ignorar mensajes de grupo y status broadcast
    if (jid.includes('@g.us') || jid.includes('@broadcast')) return null;

    // Determinar tipo de media
    let mediaType: IncomingMessage['mediaType'];
    if (msg?.imageMessage) mediaType = 'image';
    else if (msg?.audioMessage || msg?.voiceMessage) mediaType = 'audio';
    else if (msg?.videoMessage) mediaType = 'video';
    else if (msg?.documentMessage) mediaType = 'document';

    return {
      channel: 'whatsapp',
      userId: jid.replace(/@.*$/, ''),
      userName: data?.pushName ?? data?.data?.pushName,
      text: text,
      mediaUrl: msg?.imageMessage?.url ?? msg?.videoMessage?.url ?? msg?.audioMessage?.url,
      mediaType,
      timestamp: Date.now(),
      raw: body,
    };
  },

  async sendReply(reply: OutgoingReply, env: AppEnv): Promise<void> {
    await evolutionSend({ number: reply.userId, text: reply.text }, env);
  },

  async showTyping(userId: string, env: AppEnv): Promise<void> {
    const baseUrl = env.secrets.EVOLUTION_SERVER_URL || 'http://localhost:8080';
    const instance = env.secrets.EVOLUTION_INSTANCE || 'default';
    const apiKey = env.secrets.EVOLUTION_API_KEY;
    if (!apiKey) return;

    await fetch(`${baseUrl}/chat/sendPresence/${instance}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: apiKey },
      body: JSON.stringify({ number: userId, presence: 'composing' }),
    });
  },
};
