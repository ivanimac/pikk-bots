/**
 * db/messages.ts — Message and lead repository (Supabase).
 */

import type { SupabaseClient } from '@supabase/supabase-js';

interface MessageRow {
  conversationId: string;
  channel: string;
  direction: 'in' | 'out';
  content: string;
  userId: string;
  userName?: string;
}

export async function recordMessage(row: MessageRow): Promise<void> {
  // En producción usaríamos el cliente Supabase real
  // Por ahora, la estructura está lista para integrar
  if (process.env.NODE_ENV === 'test') return;
  // const { error } = await supabase.from('messages').insert([{ ... }]);
  // if (error) console.error('recordMessage error:', error);
}

interface LeadRow {
  name: string;
  phone?: string;
  interest?: string;
  businessId: string;
}

export async function recordLead(row: LeadRow): Promise<void> {
  if (process.env.NODE_ENV === 'test') return;
  // const { error } = await supabase.from('leads').insert([{ ... }]);
}

/**
 * Obtiene los últimos N mensajes de una conversación para contexto del LLM.
 */
export async function getRecentMessages(conversationId: string, limit = 20): Promise<Array<{
  direction: 'in' | 'out';
  content: string;
  created_at: string;
}>> {
  if (process.env.NODE_ENV === 'test') return [];
  return [];
  // const { data } = await supabase
  //   .from('messages')
  //   .select('direction, content, created_at')
  //   .eq('conversation_id', conversationId)
  //   .order('created_at', { ascending: false })
  //   .limit(limit);
  // return (data ?? []).reverse();
}
