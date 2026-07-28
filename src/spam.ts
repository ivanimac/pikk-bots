/**
 * spam.ts — Spam guardrails para el agente.
 * - 3 mensajes idénticos seguidos = 1 hora de cooldown
 * - 50 mensajes por día por usuario = 12 horas de snooze
 * - Daily turn cap con reset a medianoche
 */

interface SpamEntry {
  lastText: string;
  repeatCount: number;
  cooldownUntil: number;  // timestamp ms
  dailyCount: number;
  dailyReset: string;     // YYYY-MM-DD
}

const spamStore = new Map<string, SpamEntry>();

const MAX_REPEAT = 3;
const REPEAT_COOLDOWN_MS = 3600000; // 1 hora
const DAILY_CAP = 50;
const DAILY_SNOOZE_MS = 43200000;   // 12 horas

export function checkSpamGuard(userId: string, channel: string, text: string): {
  allowed: boolean;
  reason?: string;
} {
  const key = `${channel}:${userId}`;
  const now = Date.now();
  const today = new Date().toISOString().split('T')[0];

  let entry = spamStore.get(key);
  if (!entry || entry.dailyReset !== today) {
    entry = { lastText: '', repeatCount: 0, cooldownUntil: 0, dailyCount: 0, dailyReset: today };
  }

  // Cooldown activo
  if (entry.cooldownUntil > now) {
    const mins = Math.ceil((entry.cooldownUntil - now) / 60000);
    return { allowed: false, reason: `Cooldown activo (${mins} min restantes)` };
  }

  // Cooldown expirado — resetear
  if (entry.cooldownUntil > 0 && entry.cooldownUntil <= now) {
    entry.cooldownUntil = 0;
    entry.repeatCount = 0;
  }

  // Repetición de texto idéntico
  if (text && text === entry.lastText) {
    entry.repeatCount++;
    if (entry.repeatCount >= MAX_REPEAT) {
      entry.cooldownUntil = now + REPEAT_COOLDOWN_MS;
      spamStore.set(key, entry);
      return { allowed: false, reason: 'Texto repetido 3+ veces' };
    }
  } else {
    entry.lastText = text;
    entry.repeatCount = 1;
  }

  // Daily cap
  entry.dailyCount++;
  if (entry.dailyCount > DAILY_CAP) {
    entry.cooldownUntil = now + DAILY_SNOOZE_MS;
    spamStore.set(key, entry);
    return { allowed: false, reason: 'Límite diario alcanzado (50 mensajes)' };
  }

  spamStore.set(key, entry);
  return { allowed: true };
}
