import { useCallback, useEffect, useRef, useState } from 'react'

export type PointValue = 0 | 1 | 2 | 3 | 5 | 8 | 13 | 21 | '?'

export interface ParticipantPublic {
  userId: string
  name: string
  avatar: string
  hasVoted: boolean
}

export interface ParticipantRevealed extends ParticipantPublic {
  points: PointValue | undefined
}

export type ServerMessage =
  | { type: 'room_state'; participants: ParticipantPublic[] }
  | { type: 'revealed'; participants: ParticipantRevealed[]; allMatch: boolean }
  | { type: 'reset' }

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

interface UseWebSocketOptions {
  roomId: string
  userId: string
  name: string
  avatar: string
  onMessage: (msg: ServerMessage) => void
}

const WS_URL = process.env.RSBUILD_WS_URL ?? 'ws://localhost:3001'
const RECONNECT_DELAY_MS = 2000
const MAX_RECONNECT_DELAY_MS = 30_000

export function useWebSocket({ roomId, userId, name, avatar, onMessage }: UseWebSocketOptions) {
  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectDelayRef = useRef(RECONNECT_DELAY_MS)
  const onMessageRef = useRef(onMessage)
  const isMountedRef = useRef(true)

  // Keep onMessage ref up-to-date without triggering reconnects
  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  const connect = useCallback(() => {
    if (!isMountedRef.current) return

    const ws = new WebSocket(`${WS_URL}/ws/${roomId}`)
    wsRef.current = ws
    setStatus('connecting')

    ws.onopen = () => {
      if (!isMountedRef.current) return
      reconnectDelayRef.current = RECONNECT_DELAY_MS
      setStatus('connected')
      ws.send(JSON.stringify({ type: 'join', userId, name, avatar }))
    }

    ws.onmessage = (event) => {
      if (!isMountedRef.current) return
      try {
        const msg = JSON.parse(event.data as string) as ServerMessage
        onMessageRef.current(msg)
      } catch {
        // ignore malformed messages
      }
    }

    ws.onclose = () => {
      if (!isMountedRef.current) return
      setStatus('disconnected')
      scheduleReconnect()
    }

    ws.onerror = () => {
      // onclose fires after onerror — no extra handling needed
    }
  }, [roomId, userId, name, avatar])

  function scheduleReconnect() {
    if (!isMountedRef.current) return
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectDelayRef.current = Math.min(
        reconnectDelayRef.current * 2,
        MAX_RECONNECT_DELAY_MS,
      )
      connect()
    }, reconnectDelayRef.current)
  }

  useEffect(() => {
    isMountedRef.current = true
    connect()

    return () => {
      isMountedRef.current = false
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
      wsRef.current?.close()
    }
  }, [connect])

  const sendJoin = useCallback((newName: string, newAvatar: string) => {
    wsRef.current?.send(JSON.stringify({ type: 'join', userId, name: newName, avatar: newAvatar }))
  }, [userId])

  const sendVote = useCallback((points: PointValue) => {
    wsRef.current?.send(JSON.stringify({ type: 'vote', userId, points }))
  }, [userId])

  const sendUnvote = useCallback(() => {
    wsRef.current?.send(JSON.stringify({ type: 'unvote', userId }))
  }, [userId])

  const sendReveal = useCallback(() => {
    wsRef.current?.send(JSON.stringify({ type: 'reveal' }))
  }, [])

  const sendReset = useCallback(() => {
    wsRef.current?.send(JSON.stringify({ type: 'reset' }))
  }, [])

  return { status, sendJoin, sendVote, sendUnvote, sendReveal, sendReset }
}
