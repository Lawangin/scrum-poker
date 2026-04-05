import type { WebSocket } from 'ws'

// Point values including the "?" card
export type PointValue = 0 | 1 | 2 | 3 | 5 | 8 | 13 | 21 | '?'

// A participant's state within a room
export interface Participant {
  userId: string
  name: string
  avatar: string
  hasVoted: boolean
  points?: PointValue
}

// Internal room state (server-side only)
export interface RoomState {
  participants: Map<string, Participant>
  connections: Map<string, WebSocket>
  revealed: boolean
  lastActivityAt: number
}

// --- Client → Server messages ---

export interface JoinMessage {
  type: 'join'
  userId: string
  name: string
  avatar: string
}

export interface VoteMessage {
  type: 'vote'
  userId: string
  points: PointValue
}

export interface RevealMessage {
  type: 'reveal'
}

export interface UnvoteMessage {
  type: 'unvote'
  userId: string
}

export interface ResetMessage {
  type: 'reset'
}

export type ClientMessage = JoinMessage | VoteMessage | UnvoteMessage | RevealMessage | ResetMessage

// --- Server → Client messages ---

// Sent on join/leave/vote — points intentionally omitted
export interface ParticipantPublic {
  userId: string
  name: string
  avatar: string
  hasVoted: boolean
}

export interface RoomStateMessage {
  type: 'room_state'
  participants: ParticipantPublic[]
}

// Sent on reveal — points included
export interface ParticipantRevealed extends ParticipantPublic {
  points: PointValue | undefined
}

export interface RevealedMessage {
  type: 'revealed'
  participants: ParticipantRevealed[]
  allMatch: boolean
}

export interface ResetBroadcast {
  type: 'reset'
}

export type ServerMessage = RoomStateMessage | RevealedMessage | ResetBroadcast
