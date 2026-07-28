import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client (service role — solo en API routes)
export function createServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY requeridas');
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

// Client-side Supabase client (anon key — seguro para el browser)
export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL y SUPABASE_ANON_KEY requeridas');
  return createClient(url, key);
}

// Tipos de la DB
export interface Conversation {
  id: string;
  conversation_id: string;
  channel: string;
  customer_name?: string;
  status: string;
  last_message_at: string;
  unread_count: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  direction: 'in' | 'out';
  content: string;
  user_name?: string;
  created_at: string;
}

export interface Lead {
  id: string;
  name: string;
  phone?: string;
  interest?: string;
  status: string;
  created_at: string;
}
