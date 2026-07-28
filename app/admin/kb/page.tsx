import { getKbDocuments } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function KbPage() {
  const docs = await getKbDocuments().catch(() => []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ color: 'var(--accent)', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Base de Conocimiento</h1>
        <span style={{ background: 'var(--accent-dim)', color: 'var(--accent)', padding: '4px 12px', borderRadius: 12, fontSize: '0.85rem' }}>
          {docs.length} documento{docs.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
          <h3 style={{ margin: '0 0 8px' }}>📤 Añadir documento</h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: '0 0 16px' }}>
            Sube PDFs, archivos de texto, o pega contenido directamente. El bot buscará aquí antes de responder.
          </p>
          <form style={{ display: 'flex', gap: 8 }}>
            <input type="text" placeholder="Título del documento" style={{
              flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8,
              padding: '10px 16px', color: 'var(--text)', fontSize: '0.9rem',
            }} />
            <button type="submit" style={{
              background: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: 8,
              padding: '10px 20px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
            }}>Añadir</button>
          </form>
          <textarea placeholder="Contenido del documento..." style={{
            width: '100%', minHeight: 120, marginTop: 12, background: 'var(--bg)',
            border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px',
            color: 'var(--text)', fontSize: '0.9rem', resize: 'vertical', fontFamily: 'inherit',
          }} />
        </div>
      </div>

      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {docs.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
            📚 Sin documentos. Añade FAQs, políticas y guías para que el bot aprenda.
          </div>
        ) : (
          docs.map((d: { id: string; title: string; chunks: number; updated_at: string }) => (
            <div key={d.id} style={{
              padding: '16px 20px', borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <strong>{d.title}</strong>
                <span style={{ color: 'var(--muted)', marginLeft: 12, fontSize: '0.85rem' }}>
                  {d.chunks} chunks · {new Date(d.updated_at).toLocaleDateString('es-ES')}
                </span>
              </div>
              <button style={{
                background: 'transparent', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: '0.85rem',
              }}>Eliminar</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
