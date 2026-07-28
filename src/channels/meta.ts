/**
 * channels/meta.ts — Channel Adapter para Instagram + Messenger via Meta Graph API.
 * Webhook: GET/POST /webhooks/meta
 */

import type { ChannelAdapter, IncomingMessage, OutgoingReply, AppEnv } from '../env';

interface MetaSendBody {
  recipient: { id: string };
  message: { text: string };
  messaging_type?: string;
}

async function metaSend(body: MetaSendBody, env: AppEnv): Promise<void> {
  const token = env.secrets.META_PAGE_TOKEN;
  if (!token) return;
  const pageId = env.secrets.META_PAGE_TOKEN?.split('|')[0] ?? token;
  await fetch(`https://graph.facebook.com/v21.0/${pageId}/messages?access_token=${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export const metaAdapter: ChannelAdapter = {
  async parseIncoming(req: Request, env: AppEnv): Promise<IncomingMessage | null> {
    // GET = verification handshake
    if (req.method === 'GET') {
      return null;
    }

    const secret = env.secrets.META_APP_SECRET;
    const body = await req.json().catch(() => null);
    if (!body?.entry?.[0]?.messaging?.[0]) return null;

    const event = body.entry[0].messaging[0];

    // Ignorar ecos y read receipts
    if (event.message?.is_echo) return null;
    if (event.read) return null;

    const senderId = event.sender?.id;
    const recipientId = event.recipient?.id;
    if (!senderId || !recipientId) return null;

    const text = event.message?.text;
    const attachments = event.message?.attachments?.[0];

    // Detectar si es Instagram o Messenger por el sender ID
    const channel = senderId.includes('ig') ? 'instagram' : 'messenger';

    return {
      channel,
      userId: senderId,
      userName: undefined,
      text: text,
      mediaUrl: attachments?.payload?.url,
      mediaType: attachments?.type === 'image' ? 'image' :
        attachments?.type === 'video' ? 'video' :
          attachments?.type === 'audio' ? 'audio' : undefined,
      timestamp: event.timestamp ? event.timestamp * 1000 : Date.now(),
      raw: body,
    };
  },

  async sendReply(reply: OutgoingReply, env: AppEnv): Promise<void> {
    await metaSend({
      recipient: { id: reply.userId },
      message: { text: reply.text },
      messaging_type: 'RESPONSE',
    }, env);
  },

  async showTyping(userId: string, env: AppEnv): Promise<void> {
    const token = env.secrets.META_PAGE_TOKEN;
    if (!token) return;
    const pageId = env.secrets.META_PAGE_TOKEN?.split('|')[0] ?? token;
    await fetch(`https://graph.facebook.com/v21.0/${pageId}/messages?access_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: userId },
        sender_action: 'typing_on',
      }),
    });
  },
};
