/**
 * channels/telegram.ts — Channel Adapter para Telegram Bot API.
 * Webhook: POST /webhooks/telegram
 */

import type { ChannelAdapter, IncomingMessage, OutgoingReply, AppEnv } from '../env';

const TG_API = 'https://api.telegram.org';

async function tgCall(method: string, body: Record<string, unknown>, token: string): Promise<Response> {
  return fetch(`${TG_API}/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export const telegramAdapter: ChannelAdapter = {
  async parseIncoming(req: Request, env: AppEnv): Promise<IncomingMessage | null> {
    const token = env.secrets.TELEGRAM_BOT_TOKEN;
    if (!token) return null;

    const body = await req.json().catch(() => null);
    if (!body?.message) return null;

    const msg = body.message;
    return {
      channel: 'telegram',
      userId: String(msg.chat?.id ?? ''),
      userName: msg.chat?.first_name ?? msg.from?.first_name,
      text: msg.text ?? msg.caption,
      mediaUrl: msg.photo?.[msg.photo.length - 1]?.file_id,
      mediaType: msg.photo ? 'image' : msg.voice ? 'audio' : msg.video ? 'video' : undefined,
      timestamp: Date.now(),
      raw: body,
    };
  },

  async sendReply(reply: OutgoingReply, env: AppEnv): Promise<void> {
    const token = env.secrets.TELEGRAM_BOT_TOKEN;
    if (!token) return;
    await tgCall('sendMessage', { chat_id: reply.userId, text: reply.text }, token);
  },

  async showTyping(userId: string, env: AppEnv): Promise<void> {
    const token = env.secrets.TELEGRAM_BOT_TOKEN;
    if (!token) return;
    await tgCall('sendChatAction', { chat_id: userId, action: 'typing' }, token);
  },
};
