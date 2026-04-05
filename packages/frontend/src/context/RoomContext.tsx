import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import { useWebSocket } from '../hooks/useWebSocket'
import type {
  ConnectionStatus,
  ParticipantPublic,
  ParticipantRevealed,
  PointValue,
  ServerMessage,
} from '../hooks/useWebSocket'

interface RoomState {
  participants: ParticipantPublic[]
  revealedParticipants: ParticipantRevealed[] | null
  revealed: boolean
  allMatch: boolean
  myVote: PointValue | null
}

type RoomAction =
  | { type: 'room_state'; participants: ParticipantPublic[] }
  | { type: 'revealed'; participants: ParticipantRevealed[]; allMatch: boolean }
  | { type: 'reset' }
  | { type: 'set_my_vote'; points: PointValue | null }

function reducer(state: RoomState, action: RoomAction): RoomState {
  switch (action.type) {
    case 'room_state':
      return { ...state, participants: action.participants, revealed: false, revealedParticipants: null }
    case 'revealed':
      return { ...state, revealed: true, revealedParticipants: action.participants, allMatch: action.allMatch }
    case 'reset':
      return {
        ...state,
        participants: state.participants.map((p) => ({ ...p, hasVoted: false })),
        revealed: false,
        revealedParticipants: null,
        allMatch: false,
        myVote: null,
      }
    case 'set_my_vote':
      return { ...state, myVote: action.points }
  }
}

interface RoomContextValue {
  participants: ParticipantPublic[]
  revealedParticipants: ParticipantRevealed[] | null
  revealed: boolean
  allMatch: boolean
  myVote: PointValue | null
  status: ConnectionStatus
  sendVote: (points: PointValue | null) => void
  sendReveal: () => void
  sendReset: () => void
  updateProfile: (name: string, avatar: string) => void
}

const RoomContext = createContext<RoomContextValue | null>(null)

interface Props {
  roomId: string
  userId: string
  name: string
  avatar: string
  children: ReactNode
}

export function RoomProvider({ roomId, userId, name, avatar, children }: Props) {
  const [state, dispatch] = useReducer(reducer, {
    participants: [],
    revealedParticipants: null,
    revealed: false,
    allMatch: false,
    myVote: null,
  })

  const handleMessage = useCallback((msg: ServerMessage) => {
    dispatch(msg as RoomAction)
  }, [])

  const { status, sendJoin, sendVote: wsSendVote, sendUnvote, sendReveal, sendReset } = useWebSocket({
    roomId,
    userId,
    name,
    avatar,
    onMessage: handleMessage,
  })

  const sendVote = useCallback(
    (points: PointValue | null) => {
      if (points === null) {
        sendUnvote()
      } else {
        wsSendVote(points)
      }
      dispatch({ type: 'set_my_vote', points })
    },
    [wsSendVote, sendUnvote],
  )

  const updateProfile = useCallback(
    (newName: string, newAvatar: string) => {
      sendJoin(newName, newAvatar)
    },
    [sendJoin],
  )

  const value = useMemo<RoomContextValue>(
    () => ({ ...state, status, sendVote, sendReveal, sendReset, updateProfile }),
    [state, status, sendVote, sendReveal, sendReset, updateProfile],
  )

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>
}

export function useRoom(): RoomContextValue {
  const ctx = useContext(RoomContext)
  if (!ctx) throw new Error('useRoom must be used inside RoomProvider')
  return ctx
}
