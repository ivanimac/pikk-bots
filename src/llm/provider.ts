/**
 * llm/provider.ts — LLM provider abstraction layer.
 * Soporta Anthropic (default), OpenAI, xAI.
 * BYO-LLM: el dueño puede traer su propia API key.
 */

import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createXai } from '@ai-sdk/xai';
import type { LanguageModelV1 } from 'ai';
import type { AppEnv } from '../env';

export type ProviderName = 'anthropic' | 'openai' | 'xai';

export interface ProviderConfig {
  name: ProviderName;
  model: LanguageModelV1;
  tier: 'fast' | 'smart';
}

/**
 * Selecciona el provider y modelo según las claves configuradas y el tier.
 * Orden de preferencia: Anthropic → OpenAI → xAI.
 */
export function resolveProvider(env: AppEnv): ProviderConfig {
  const tier = env.vars.BOT_TIER === 'pro' ? 'smart' : 'fast';

  if (env.secrets.ANTHROPIC_API_KEY) {
    const anthropic = createAnthropic({ apiKey: env.secrets.ANTHROPIC_API_KEY });
    const model = tier === 'smart'
      ? anthropic('claude-sonnet-4-6')
      : anthropic('claude-haiku-4-5-20251001');
    return { name: 'anthropic', model, tier };
  }

  if (env.secrets.OPENAI_API_KEY) {
    const openai = createOpenAI({ apiKey: env.secrets.OPENAI_API_KEY });
    const model = tier === 'smart'
      ? openai('gpt-4o')
      : openai('gpt-4o-mini');
    return { name: 'openai', model, tier };
  }

  if (env.secrets.XAI_API_KEY) {
    const xai = createXai({ apiKey: env.secrets.XAI_API_KEY });
    return { name: 'xai', model: xai('grok-2'), tier: 'fast' };
  }

  throw new Error(
    'No AI provider configured.\n' +
    'Set one of: ANTHROPIC_API_KEY, OPENAI_API_KEY, or XAI_API_KEY in your Vercel env vars.'
  );
}

/**
 * Fallback: si el provider primario falla, intenta el siguiente.
 */
export function resolveFallback(env: AppEnv, failedProvider: ProviderName): ProviderConfig | null {
  const order: ProviderName[] = ['anthropic', 'openai', 'xai'];
  const idx = order.indexOf(failedProvider);
  if (idx < 0) return null;

  for (let i = idx + 1; i < order.length; i++) {
    const next = order[i];
    if (next === 'anthropic' && env.secrets.ANTHROPIC_API_KEY) {
      const anthropic = createAnthropic({ apiKey: env.secrets.ANTHROPIC_API_KEY });
      return { name: 'anthropic', model: anthropic('claude-haiku-4-5-20251001'), tier: 'fast' };
    }
    if (next === 'openai' && env.secrets.OPENAI_API_KEY) {
      const openai = createOpenAI({ apiKey: env.secrets.OPENAI_API_KEY });
      return { name: 'openai', model: openai('gpt-4o-mini'), tier: 'fast' };
    }
    if (next === 'xai' && env.secrets.XAI_API_KEY) {
      const xai = createXai({ apiKey: env.secrets.XAI_API_KEY });
      return { name: 'xai', model: xai('grok-2'), tier: 'fast' };
    }
  }

  return null; // No hay fallback disponible
}
