import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../utils/api'

export default function Home() {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/polls')
      .then(d => setPolls(d.polls))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const S = {
    page: { maxWidth: 780, margin: '0 auto', padding: '2rem 1.5rem' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' },
    title: { fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 },
    accent: { color: 'var(--accent)' },
    newBtn: { padding: '0.75rem 1.5rem', background: 'var(--fg)', color: 'var(--bg)', border: 'none', borderRadius: 8, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'none', display: 'inline-block', whiteSpace: 'nowrap' },
    grid: { display: 'grid', gap: '1rem' },
    card: { background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '1.25rem 1.5rem', textDecoration: 'none', color: 'var(--fg)', display: 'block', transition: 'border-color 0.15s, transform 0.15s' },
    cardQ: { fontWeight: 700, fontSize: '1.05rem', marginBottom: 6, letterSpacing: '-0.01em' },
    cardMeta: { fontSize: '0.75rem', color: 'var(--muted)', fontFamily: "'DM Mono', monospace", display: 'flex', gap: '1rem', alignItems: 'center' },
    closedTag: { fontSize: '0.65rem', padding: '2px 8px', background: '#fee2e2', color: '#b91c1c', borderRadius: 99, fontFamily: "'Syne', sans-serif" },
    empty: { textAlign: 'center', padding: '4rem 1rem', color: 'var(--muted)' },
    liveTag: { fontSize: '0.65rem', padding: '2px 8px', background: '#dcfce7', color: '#15803d', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 4 },
  }

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Poll<span style={S.accent}>Wave</span></h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 4, fontFamily: "'DM Mono', monospace" }}>
            // real-time polling engine
          </p>
        </div>
        <Link to="/create" style={S.newBtn}>+ New Poll</Link>
      </div>

      {loading && <p style={{ color: 'var(--muted)', fontFamily: "'DM Mono', monospace" }}>Loading polls…</p>}

      {!loading && polls.length === 0 && (
        <div style={S.empty}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗳️</p>
          <p style={{ fontWeight: 600 }}>No public polls yet</p>
          <p style={{ fontSize: '0.875rem', marginTop: 4 }}>Be the first — create one!</p>
        </div>
      )}

      <div style={S.grid}>
        {polls.map(poll => (
          <Link
            key={poll.id}
            to={`/poll/${poll.id}`}
            style={S.card}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={S.cardQ}>{poll.question}</div>
            <div style={S.cardMeta}>
              <span>{poll.options.length} options</span>
              <span>{poll.total_votes} votes</span>
              <span>{new Date(poll.created_at).toLocaleDateString()}</span>
              {poll.isClosed
                ? <span style={S.closedTag}>CLOSED</span>
                : <span style={S.liveTag}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} /> LIVE</span>
              }
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
