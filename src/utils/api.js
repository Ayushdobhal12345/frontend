export const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'

// Generate or retrieve a persistent voter ID (acts as session fingerprint)
export function getVoterId() {
  let id = localStorage.getItem('pollwave_voter_id')
  if (!id) {
    id = 'v_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('pollwave_voter_id', id)
  }
  return id
}

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}
