// Data access layer — queries reales a Supabase
import { createServerClient } from './supabase';
import type { Conversation, Message, Lead } from './supabase';

export async function getConversations(): Promise<Conversation[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('conversations')
    .select('*')
    .order('last_message_at', { ascending: false })
    .limit(50);
  return (data ?? []) as Conversation[];
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(100);
  return (data ?? []) as Message[];
}

export async function getLeads(): Promise<Lead[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  return (data ?? []) as Lead[];
}

export async function getMetrics() {
  const supabase = createServerClient();

  const [{ count: msgCount }, { count: convCount }, { count: leadCount }] = await Promise.all([
    supabase.from('messages').select('*', { count: 'exact', head: true }),
    supabase.from('conversations').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
  ]);

  return {
    messages: msgCount ?? 0,
    conversations: convCount ?? 0,
    leads: leadCount ?? 0,
    health_score: 100,
  };
}

export async function getKbDocuments() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('kb_documents')
    .select('*')
    .order('updated_at', { ascending: false });
  return data ?? [];
}
