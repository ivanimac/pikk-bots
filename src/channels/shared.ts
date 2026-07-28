/**
 * channels/shared.ts — Funciones compartidas entre channel adapters.
 */

import type { ChannelAdapter } from '../env';
import { telegramAdapter } from './telegram';
import { whatsappAdapter } from './whatsapp';
import { metaAdapter } from './meta';

/** Todos los channel adapters registrados */
export const adapters: Record<string, ChannelAdapter> = {
  telegram: telegramAdapter,
  whatsapp: whatsappAdapter,
  meta: metaAdapter,
};

/** Mapea una ruta de webhook al adapter correspondiente */
export function resolveChannel(pathname: string): { adapter: ChannelAdapter; channel: string } | null {
  if (pathname.includes('/telegram')) return { adapter: telegramAdapter, channel: 'telegram' };
  if (pathname.includes('/whatsapp')) return { adapter: whatsappAdapter, channel: 'whatsapp' };
  if (pathname.includes('/meta')) return { adapter: metaAdapter, channel: 'meta' };
  return null;
}

/** Detecta qué canales tienen credenciales configuradas */
export function configuredChannels(env: { secrets: Record<string, string | undefined> }): string[] {
  const channels: string[] = [];
  if (env.secrets.TELEGRAM_BOT_TOKEN) channels.push('telegram');
  if (env.secrets.EVOLUTION_API_KEY) channels.push('whatsapp');
  if (env.secrets.META_PAGE_TOKEN) channels.push('instagram', 'messenger');
  return channels;
}
