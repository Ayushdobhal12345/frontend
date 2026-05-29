import { useEffect, useRef, useCallback, useState } from 'react'
import { WS_URL } from '../utils/api'

export function usePollSocket(pollId, onMessage) {
  const ws = useRef(null)
  const [connected, setConnected] = useState(false)
  const reconnectTimer = useRef(null)
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

  const connect = useCallback(() => {
    if (!pollId) return
    ws.current = new WebSocket(`${WS_URL}/ws/${pollId}`)

    ws.current.onopen = () => setConnected(true)

    ws.current.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        onMessageRef.current(msg)
      } catch {}
    }

    ws.current.onclose = () => {
      setConnected(false)
      // Reconnect after 2s
      reconnectTimer.current = setTimeout(connect, 2000)
    }

    ws.current.onerror = () => ws.current?.close()
  }, [pollId])

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(reconnectTimer.current)
      ws.current?.close()
    }
  }, [connect])

  return { connected }
}
