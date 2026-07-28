import { getMetrics, getConversations, getLeads } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  let metrics = { messages: 0, conversations: 0, leads: 0, health_score: 100 };
  let conversations: Array<{ id: string; customer_name?: string; channel: string; status: string; last_message_at: string; unread_count: number }> = [];
  let leads: Array<{ id: string; name: string; status: string; created_at: string }> = [];

  try {
    [metrics, conversations, leads] = await Promise.all([
      getMetrics(),
      getConversations(),
      getLeads(),
    ]);
  } catch { /* Supabase no configurado aún — mostrar ceros */ }

  const statCards = [
    { label: 'Mensajes', value: metrics.messages, icon: '💬' },
    { label: 'Conversaciones', value: metrics.conversations, icon: '📨' },
    { label: 'Leads', value: metrics.leads, icon: '👤' },
    { label: 'Health Score', value: `${metrics.health_score}%`, icon: '🟢' },
  ];

  return (
    <div>
      <h1 style={{ color: 'var(--accent)', fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>Resumen</h1>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {statCards.map(({ label, value, icon }) => (
          <div key={label} style={{
            background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: 20,
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent)' }}>{value}</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Recent Conversations */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>Conversaciones recientes</h2>
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          {conversations.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>
              No hay conversaciones todavía. Conecta un canal para empezar.
            </div>
          ) : (
            conversations.slice(0, 5).map((c) => (
              <div key={c.id} style={{
                padding: '12px 20px', borderBottom: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <strong>{c.customer_name ?? c.id.slice(-8)}</strong>
                  <span style={{ color: 'var(--muted)', marginLeft: 8, fontSize: '0.85rem' }}>{c.channel}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {c.unread_count > 0 && (
                    <span style={{ background: 'var(--accent-dim)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 10, fontSize: '0.8rem' }}>
                      {c.unread_count}
                    </span>
                  )}
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: c.status === 'active' ? 'var(--success)' : 'var(--muted)',
                  }} />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Recent Leads */}
      <section>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>Leads recientes</h2>
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          {leads.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>
              No hay leads todavía. Cuando el bot capture un lead, aparecerá aquí.
            </div>
          ) : (
            leads.slice(0, 5).map((l) => (
              <div key={l.id} style={{
                padding: '12px 20px', borderBottom: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <strong>{l.name}</strong>
                  <span style={{ color: 'var(--muted)', marginLeft: 8, fontSize: '0.85rem' }}>
                    {new Date(l.created_at).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <span style={{
                  padding: '2px 10px', borderRadius: 10, fontSize: '0.8rem',
                  background: l.status === 'new' ? 'var(--accent-dim)' : 'var(--border)',
                  color: l.status === 'new' ? 'var(--accent)' : 'var(--muted)',
                }}>{l.status}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
