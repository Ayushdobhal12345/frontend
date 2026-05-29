import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { apiFetch, getVoterId, API } from '../utils/api'
import { usePollSocket } from '../hooks/usePollSocket'

const COLORS = ['#e84c1e', '#2563eb', '#16a34a', '#d97706', '#7c3aed', '#0891b2', '#be185d', '#065f46', '#92400e', '#1e3a5f']

function Bar({ option, count, percent, color, selected, onClick, disabled, isClosed }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        marginBottom: '0.875rem',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled && !selected ? 0.75 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
        <span style={{ fontWeight: selected ? 700 : 500, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          {selected && <span style={{ color, fontSize: '0.75rem' }}>✔</span>}
          {option}
        </span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem', color: 'var(--muted)' }}>
          {count} {count === 1 ? 'vote' : 'votes'} · {percent}%
        </span>
      </div>
      <div style={{ height: 10, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${percent}%`,
          background: color,
          borderRadius: 99,
          transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          opacity: hover && !disabled ? 0.85 : 1,
        }} />
      </div>
    </div>
  )
}

export default function PollView() {
  const { id } = useParams()
  const [poll, setPoll] = useState(null)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [votedFor, setVotedFor] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const voterId = getVoterId()

  const fetchPoll = useCallback(async () => {
    try {
      const data = await apiFetch(`/polls/${id}`)
      setPoll(data)
    } catch {
      setError('Poll not found.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchPoll() }, [fetchPoll])

  // WebSocket for real-time updates
  const { connected } = usePollSocket(id, useCallback((msg) => {
    if (msg.type === 'init' || msg.type === 'update') setPoll(msg.data)
    if (msg.type === 'closed') setPoll(msg.data)
    if (msg.type === 'deleted') setError('This poll has been deleted.')
  }, []))

  async function vote(optionIdx) {
    if (votedFor !== null || voting) return
    setVoting(true)
    setError('')
    try {
      const res = await apiFetch(`/polls/${id}/vote`, {
        method: 'POST',
        body: { optionIdx, voterId },
      })
      setVotedFor(optionIdx)
      setPoll(res.results)
    } catch (e) {
      if (e.message === 'Already voted') setVotedFor(optionIdx)
      else setError(e.message)
    } finally {
      setVoting(false)
    }
  }

  async function closePoll() {
    try {
      await apiFetch(`/polls/${id}/close`, { method: 'POST' })
    } catch (e) { setError(e.message) }
  }

  function copyLink() {
    const url = `${window.location.origin}/poll/${id}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)' }}>Loading poll…</div>
  if (error && !poll) return <div style={{ textAlign: 'center', padding: '4rem', color: '#b91c1c' }}>{error}</div>

  const hasVoted = votedFor !== null
  const isOwner = poll.created_by === voterId
  const shareUrl = `${window.location.origin}/poll/${id}`

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* Status bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'var(--muted)', fontSize: '0.85rem', fontFamily: "'DM Mono', monospace" }}>
          ← polls
        </Link>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: connected ? '#16a34a' : '#d97706', display: 'inline-block' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: "'DM Mono', monospace" }}>
            {connected ? 'live' : 'reconnecting'}
          </span>
          {poll.isClosed && (
            <span style={{ fontSize: '0.75rem', padding: '2px 10px', background: '#fee2e2', color: '#b91c1c', borderRadius: 99 }}>
              CLOSED
            </span>
          )}
        </div>
      </div>

      {/* Question */}
      <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '0.5rem' }}>
        {poll.question}
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: '0.8rem', fontFamily: "'DM Mono', monospace", marginBottom: '2rem' }}>
        {poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''} · created by {poll.created_by === voterId ? 'you' : 'someone'}
        {poll.closes_at && !poll.isClosed && ` · closes ${new Date(poll.closes_at).toLocaleString()}`}
      </p>

      {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: 8, fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</div>}

      {/* Options / Bars */}
      <div style={{ marginBottom: '2rem' }}>
        {poll.results.map((r, i) => (
          <Bar
            key={i}
            option={r.option}
            count={r.count}
            percent={r.percent}
            color={COLORS[i % COLORS.length]}
            selected={votedFor === i}
            onClick={() => vote(i)}
            disabled={hasVoted || poll.isClosed || voting}
            isClosed={poll.isClosed}
          />
        ))}
      </div>

      {/* Voted message */}
      {hasVoted && (
        <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.75rem 1rem', borderRadius: 8, fontSize: '0.875rem', marginBottom: '1.5rem', fontWeight: 500 }}>
          ✓ Your vote has been recorded. Results update in real-time.
        </div>
      )}
      {poll.isClosed && !hasVoted && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: 8, fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          This poll is closed. Voting is no longer available.
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={copyLink}
          style={{ padding: '0.6rem 1.25rem', border: '1.5px solid var(--border)', borderRadius: 8, background: 'var(--card)', cursor: 'pointer', fontFamily: "'Syne', sans-serif", fontSize: '0.875rem', fontWeight: 600 }}
        >
          {copied ? '✓ Copied!' : '🔗 Share'}
        </button>

        {isOwner && !poll.isClosed && (
          <button
            onClick={closePoll}
            style={{ padding: '0.6rem 1.25rem', border: '1.5px solid #fca5a5', borderRadius: 8, background: '#fff', cursor: 'pointer', fontFamily: "'Syne', sans-serif", fontSize: '0.875rem', fontWeight: 600, color: '#b91c1c' }}
          >
            Close Poll
          </button>
        )}
      </div>
    </div>
  )
}
