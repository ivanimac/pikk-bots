import { getLeads } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
  const leads = await getLeads().catch(() => []);

  const statusLabel: Record<string, string> = { new: 'Nuevo', contacted: 'Contactado', qualified: 'Calificado', converted: 'Convertido', lost: 'Perdido' };
  const statusColor: Record<string, string> = {
    new: 'var(--accent)', contacted: 'var(--warning)', qualified: '#60A5FA', converted: 'var(--success)', lost: 'var(--muted)',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ color: 'var(--accent)', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Leads</h1>
        <span style={{ background: 'var(--accent-dim)', color: 'var(--accent)', padding: '4px 12px', borderRadius: 12, fontSize: '0.85rem' }}>
          {leads.length} total
        </span>
      </div>
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {leads.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
            👤 No hay leads. Cuando el bot capture un cliente interesado, aparecerá aquí.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Nombre', 'Teléfono', 'Interés', 'Estado', 'Fecha'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 20px', color: 'var(--muted)', fontSize: '0.85rem', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 20px' }}><strong>{l.name}</strong></td>
                  <td style={{ padding: '12px 20px', color: 'var(--muted)' }}>{l.phone ?? '—'}</td>
                  <td style={{ padding: '12px 20px', color: 'var(--muted)' }}>{l.interest ?? '—'}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{ padding: '2px 10px', borderRadius: 10, fontSize: '0.8rem', background: 'rgba(92,201,190,0.12)', color: statusColor[l.status] ?? 'var(--muted)' }}>
                      {statusLabel[l.status] ?? l.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 20px', color: 'var(--muted)', fontSize: '0.85rem' }}>
                    {new Date(l.created_at).toLocaleDateString('es-ES')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
