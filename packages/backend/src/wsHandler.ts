import type { WebSocket } from 'ws'
import type { ClientMessage } from './types.js'
import {
  addParticipant,
  removeParticipant,
  vote,
  reveal,
  reset,
  broadcast,
  buildRoomStateMessage,
  buildRevealedMessage,
  buildResetBroadcast,
} from './roomManager.js'

export function handleConnection(ws: WebSocket, roomId: string): void {
  let connectedUserId: string | null = null

  ws.on('message', (data) => {
    let message: ClientMessage
    try {
      message = JSON.parse(data.toString()) as ClientMessage
    } catch {
      return
    }

    switch (message.type) {
      case 'join': {
        connectedUserId = message.userId
        addParticipant(roomId, message.userId, message.name, message.avatar, ws)
        broadcast(roomId, buildRoomStateMessage(roomId))
        break
      }

      case 'vote': {
        vote(roomId, message.userId, message.points)
        broadcast(roomId, buildRoomStateMessage(roomId))
        break
      }

      case 'reveal': {
        reveal(roomId)
        broadcast(roomId, buildRevealedMessage(roomId))
        break
      }

      case 'reset': {
        reset(roomId)
        broadcast(roomId, buildResetBroadcast())
        break
      }
    }
  })

  ws.on('close', () => {
    if (connectedUserId) {
      removeParticipant(roomId, connectedUserId)
      broadcast(roomId, buildRoomStateMessage(roomId))
    }
  })
}
