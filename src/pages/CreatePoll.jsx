import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch, getVoterId } from '../utils/api'

const S = {
  page: { maxWidth: 680, margin: '0 auto', padding: '2rem 1.5rem' },
  title: { fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1, marginBottom: '0.25rem', letterSpacing: '-0.02em' },
  subtitle: { color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '2.5rem', fontFamily: "'DM Mono', monospace", fontWeight: 300 },
  label: { display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--muted)' },
  input: { width: '100%', padding: '0.85rem 1rem', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '1rem', fontFamily: "'Syne', sans-serif", background: 'var(--card)', color: 'var(--fg)', outline: 'none', transition: 'border-color 0.15s' },
  field: { marginBottom: '1.5rem' },
  optionRow: { display: 'flex', gap: 8, marginBottom: 8 },
  removeBtn: { padding: '0 0.75rem', border: '1.5px solid var(--border)', background: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '1.2rem', color: 'var(--muted)' },
  addBtn: { background: 'none', border: '1.5px dashed var(--border)', borderRadius: 8, padding: '0.6rem 1rem', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.85rem', fontFamily: "'Syne', sans-serif", width: '100%', marginTop: 4 },
  row: { display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' },
  toggle: { display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' },
  submitBtn: { width: '100%', padding: '1rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'Syne', sans-serif", letterSpacing: '0.03em', transition: 'opacity 0.15s' },
  error: { background: '#fee2e2', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: 8, fontSize: '0.875rem', marginBottom: '1rem' },
}

export default function CreatePoll() {
  const nav = useNavigate()
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [isPrivate, setIsPrivate] = useState(false)
  const [closesAt, setClosesAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function addOption() { if (options.length < 10) setOptions([...options, '']) }
  function removeOption(i) { if (options.length > 2) setOptions(options.filter((_, idx) => idx !== i)) }
  function setOption(i, val) { setOptions(options.map((o, idx) => idx === i ? val : o)) }

  async function handleSubmit() {
    setError('')
    const filled = options.filter(o => o.trim())
    if (!question.trim()) return setError('Please enter a question.')
    if (filled.length < 2) return setError('Please enter at least 2 options.')

    setLoading(true)
    try {
      const poll = await apiFetch('/polls', {
        method: 'POST',
        body: { question, options: filled, createdBy: getVoterId(), isPrivate, closesAt: closesAt ? new Date(closesAt).toISOString() : null },
      })
      nav(`/poll/${poll.id}`)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={S.page}>
      <h1 style={S.title}>Create Poll</h1>
      <p style={S.subtitle}>// new_poll.js · real-time voting</p>

      {error && <div style={S.error}>{error}</div>}

      <div style={S.field}>
        <label style={S.label}>Question</label>
        <input
          style={S.input}
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="What do you want to ask?"
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      <div style={S.field}>
        <label style={S.label}>Options</label>
        {options.map((opt, i) => (
          <div key={i} style={S.optionRow}>
            <input
              style={{ ...S.input, marginBottom: 0 }}
              value={opt}
              onChange={e => setOption(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            {options.length > 2 && (
              <button style={S.removeBtn} onClick={() => removeOption(i)}>×</button>
            )}
          </div>
        ))}
        {options.length < 10 && (
          <button style={S.addBtn} onClick={addOption}>+ Add option</button>
        )}
      </div>

      <div style={S.row}>
        <div style={S.field}>
          <label style={S.label}>Close at (optional)</label>
          <input
            type="datetime-local"
            style={S.input}
            value={closesAt}
            onChange={e => setClosesAt(e.target.value)}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <label style={{ ...S.toggle, marginTop: '1.5rem', whiteSpace: 'nowrap' }}>
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={e => setIsPrivate(e.target.checked)}
            style={{ width: 18, height: 18, accentColor: 'var(--accent)', cursor: 'pointer' }}
          />
          Private poll
        </label>
      </div>

      <button style={{ ...S.submitBtn, opacity: loading ? 0.6 : 1 }} onClick={handleSubmit} disabled={loading}>
        {loading ? 'Creating…' : 'Create Poll →'}
      </button>
    </div>
  )
}
