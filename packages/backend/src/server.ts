import 'dotenv/config'
import http from 'http'
import express from 'express'
import { WebSocketServer } from 'ws'
import { handleConnection } from './wsHandler.js'
import { startGC } from './roomManager.js'

const app = express()
const PORT = process.env['PORT'] ?? 3001

app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'okay' })
})

const server = http.createServer(app)
const wss = new WebSocketServer({ noServer: true })

// Handle WebSocket upgrades for /ws/:roomId
server.on('upgrade', (req, socket, head) => {
  const url = req.url ?? ''
  const match = url.match(/^\/ws\/([^/?]+)/)

  if (!match) {
    socket.destroy()
    return
  }

  const roomId = match[1]

  wss.handleUpgrade(req, socket, head, (ws) => {
    if (!roomId) {
      socket.destroy()
      return
    }
    handleConnection(ws, roomId)
  })
})

startGC()

server.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`)
})
