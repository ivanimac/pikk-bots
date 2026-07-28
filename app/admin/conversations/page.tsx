import { getConversations } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function ConversationsPage() {
  const conversations = await getConversations().catch(() => []);

  return (
    <div>
      <h1 style={{ color: 'var(--accent)', fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>Conversaciones</h1>
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {conversations.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
            💬 No hay conversaciones. Los mensajes de tus clientes aparecerán aquí.
          </div>
        ) : (
          conversations.map((c) => (
            <div key={c.id} style={{
              padding: '16px 20px', borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <strong>{c.customer_name ?? c.id.slice(-8)}</strong>
                <span style={{ color: 'var(--muted)', marginLeft: 8, fontSize: '0.85rem' }}>
                  {c.channel} · {new Date(c.last_message_at).toLocaleString('es-ES')}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {c.unread_count > 0 && (
                  <span style={{ background: 'var(--accent-dim)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 10, fontSize: '0.8rem' }}>
                    {c.unread_count} nuevo{c.unread_count > 1 ? 's' : ''}
                  </span>
                )}
                <span style={{
                  padding: '2px 10px', borderRadius: 10, fontSize: '0.8rem',
                  background: c.status === 'active' ? 'rgba(16,185,129,0.15)' : 'var(--border)',
                  color: c.status === 'active' ? 'var(--success)' : 'var(--muted)',
                }}>{c.status}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
