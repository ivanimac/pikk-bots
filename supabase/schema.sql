-- Supabase Schema: PIKK Bots
-- Ejecutar con: supabase db push
-- O manualmente en SQL Editor de Supabase

-- ─── Extensiones ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── Conversaciones ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL UNIQUE,    -- userId del canal
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'telegram', 'instagram', 'messenger', 'manychat', 'twilio')),
  customer_name TEXT,
  customer_phone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'spam')),
  last_message_at TIMESTAMPTZ DEFAULT now(),
  unread_count INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_conversations_channel ON conversations(channel);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_last_msg ON conversations(last_message_at DESC);

-- ─── Mensajes ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('in', 'out')),
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'audio', 'video', 'document', 'location')),
  media_url TEXT,
  user_id TEXT NOT NULL,
  user_name TEXT,
  tokens_used INT,
  provider TEXT,                          -- anthropic / openai / xai
  model TEXT,                             -- claude-haiku-4-5 / gpt-4o-mini / etc.
  cost_cents NUMERIC(10, 5) DEFAULT 0,   -- costo en centavos
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_messages_created ON messages(created_at);
CREATE INDEX idx_messages_user ON messages(user_id);

-- Auto-actualizar last_message_at en conversations
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations SET last_message_at = NEW.created_at, updated_at = now()
  WHERE conversation_id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_conversation ON messages;
CREATE TRIGGER trg_update_conversation
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION update_conversation_timestamp();

-- ─── Leads ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  interest TEXT,
  source TEXT DEFAULT 'chatbot' CHECK (source IN ('chatbot', 'web', 'manual', 'campaign')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  conversation_id TEXT REFERENCES conversations(conversation_id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_leads_business ON leads(business_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created ON leads(created_at DESC);

-- ─── Base de Conocimiento (KB) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kb_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT DEFAULT 'manual',
  chunks INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_kb_business ON kb_documents(business_id);

-- Tabla de chunks con embeddings para RAG
CREATE TABLE IF NOT EXISTS kb_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES kb_documents(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536),                -- OpenAI text-embedding-3-small
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_kb_chunks_doc ON kb_chunks(document_id);
CREATE INDEX idx_kb_chunks_embedding ON kb_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Función RPC para búsqueda semántica
CREATE OR REPLACE FUNCTION search_kb(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.3,
  match_count INT DEFAULT 3
)
RETURNS TABLE (
  title TEXT,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kd.title,
    kc.content,
    1 - (kc.embedding <=> query_embedding) AS similarity
  FROM kb_chunks kc
  JOIN kb_documents kd ON kd.id = kc.document_id
  WHERE 1 - (kc.embedding <=> query_embedding) > match_threshold
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ─── Configuración del Bot ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bot_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT NOT NULL UNIQUE,
  settings JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Insights de Conversaciones ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversation_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT NOT NULL,
  conversation_id TEXT REFERENCES conversations(conversation_id) ON DELETE CASCADE,
  score INT CHECK (score >= 1 AND score <= 5),       -- 1-5 calidad
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  topics TEXT[],
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_insights_business ON conversation_insights(business_id);

-- ─── Seguimiento y Campañas ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  trigger_event TEXT NOT NULL,             -- 'after_lead', 'after_appointment', 'inactive_7d'
  message TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_followups_scheduled ON followups(scheduled_for) WHERE NOT sent;

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT NOT NULL,
  name TEXT NOT NULL,
  segment TEXT NOT NULL,
  template TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'whatsapp',
  total_sent INT DEFAULT 0,
  total_delivered INT DEFAULT 0,
  total_read INT DEFAULT 0,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Cron: Auto-purge de mensajes a 90 días ─────────────────────────────────
CREATE OR REPLACE FUNCTION purge_old_messages()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM messages WHERE created_at < now() - INTERVAL '90 days';
  DELETE FROM conversations WHERE last_message_at < now() - INTERVAL '90 days' AND status = 'archived';
END;
$$;

-- ─── RLS básico (opcional, activar si se usa Supabase Auth) ─────────────────
-- ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
