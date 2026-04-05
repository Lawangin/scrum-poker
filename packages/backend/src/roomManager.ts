import type { WebSocket } from 'ws'
import type {
  RoomState,
  Participant,
  PointValue,
  RoomStateMessage,
  RevealedMessage,
  ResetBroadcast,
  ServerMessage,
} from './types.js'

const rooms = new Map<string, RoomState>()

const GC_INTERVAL_MS = 5 * 60 * 1000   // sweep every 5 minutes
const GC_IDLE_THRESHOLD_MS = 30 * 60 * 1000  // delete rooms idle > 30 minutes

function getOrCreateRoom(roomId: string): RoomState {
  let room = rooms.get(roomId)
  if (!room) {
    room = {
      participants: new Map(),
      connections: new Map(),
      revealed: false,
      lastActivityAt: Date.now(),
    }
    rooms.set(roomId, room)
  }
  return room
}

export function addParticipant(
  roomId: string,
  userId: string,
  name: string,
  avatar: string,
  ws: WebSocket
): void {
  const room = getOrCreateRoom(roomId)

  // Reconnection: keep existing vote state if the user was already in the room
  const existing = room.participants.get(userId)
  room.participants.set(userId, {
    userId,
    name,
    avatar,
    hasVoted: existing?.hasVoted ?? false,
    ...(existing?.points !== undefined ? { points: existing.points } : {}),
  })

  room.connections.set(userId, ws)
  room.lastActivityAt = Date.now()
}

export function removeParticipant(roomId: string, userId: string): void {
  const room = rooms.get(roomId)
  if (!room) return

  room.participants.delete(userId)
  room.connections.delete(userId)
  room.lastActivityAt = Date.now()

  // Room stays in the Map — GC will clean it up if it stays empty
}

export function vote(roomId: string, userId: string, points: PointValue): void {
  const room = rooms.get(roomId)
  const participant = room?.participants.get(userId)
  if (!room || !participant) return

  participant.hasVoted = true
  participant.points = points
  room.lastActivityAt = Date.now()
}

export function reveal(roomId: string): void {
  const room = rooms.get(roomId)
  if (!room) return

  room.revealed = true
  room.lastActivityAt = Date.now()
}

export function reset(roomId: string): void {
  const room = rooms.get(roomId)
  if (!room) return

  for (const participant of room.participants.values()) {
    participant.hasVoted = false
    delete participant.points
  }
  room.revealed = false
  room.lastActivityAt = Date.now()
}

export function broadcast(roomId: string, message: ServerMessage): void {
  const room = rooms.get(roomId)
  if (!room) return

  const payload = JSON.stringify(message)
  for (const ws of room.connections.values()) {
    if (ws.readyState === ws.OPEN) {
      ws.send(payload)
    }
  }
}

export function buildRoomStateMessage(roomId: string): RoomStateMessage {
  const room = rooms.get(roomId)
  const participants = room
    ? [...room.participants.values()].map(({ userId, name, avatar, hasVoted }) => ({
        userId,
        name,
        avatar,
        hasVoted,
      }))
    : []

  return { type: 'room_state', participants }
}

export function buildRevealedMessage(roomId: string): RevealedMessage {
  const room = rooms.get(roomId)
  const participants: RevealedMessage['participants'] = room
    ? [...room.participants.values()].map(({ userId, name, avatar, hasVoted, points }) => ({
        userId,
        name,
        avatar,
        hasVoted,
        points,
      }))
    : []

  const everyoneVoted =
    participants.length > 0 && participants.every((p) => p.hasVoted)
  const votes = participants.map((p) => p.points)
  const allMatch = everyoneVoted && votes.every((v) => v === votes[0])

  return { type: 'revealed', participants, allMatch }
}

export function buildResetBroadcast(): ResetBroadcast {
  return { type: 'reset' }
}

// Garbage collection — called once on server start
export function startGC(): void {
  setInterval(() => {
    const now = Date.now()
    for (const [roomId, room] of rooms) {
      const isEmpty = room.connections.size === 0
      const idleTooLong = now - room.lastActivityAt > GC_IDLE_THRESHOLD_MS
      if (isEmpty && idleTooLong) {
        rooms.delete(roomId)
      }
    }
  }, GC_INTERVAL_MS)
}
