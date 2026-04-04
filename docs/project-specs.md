# Scrum Pointing Poker — System Design & Architecture Summary

> This document captures all architecture, infrastructure, and implementation decisions for building a scrum pointing poker app (similar to scrumjam.app). It is intended to be consumed by an AI assistant to provide full context when helping build the application.

---

## 1. Product Requirements (MVP)

- Generate a shareable room link (e.g. `yourapp.com/room/abc-xyz-123`)
- Users enter a name and select an avatar from a predefined list
- First person to join a room starts the session; others join via the shared link
- Name and avatar persist across tab closes and browser sessions (no login required)
- Users select story points from a predefined Fibonacci scale: `0, 1, 2, 3, 5, 8, 13, 21, ?`
- Selecting a point value updates the user's card to show they have voted, without revealing the value to others
- A "Reveal" button shows all votes simultaneously
- Fireworks animation triggers when all votes are unanimous
- A "Reset" button clears all votes for a new round

---

## 2. Tech Stack

| Layer            | Technology                         | Notes                                                                   |
| ---------------- | ---------------------------------- | ----------------------------------------------------------------------- |
| Frontend         | React + TypeScript + Rsbuild       | Rsbuild chosen over Vite as the bundler. Outputs static `/dist` folder. |
| Styling          | Tailwind CSS                       | With shadcn/ui or Radix for component primitives                        |
| Routing          | React Router                       | `/` for landing page, `/room/:id` for session rooms                     |
| Realtime         | Native WebSocket (`ws` library)    | Simpler than Socket.io for this scope                                   |
| Backend          | Node.js + Express + TypeScript     | Express serves the WebSocket upgrade endpoint                           |
| State            | In-memory `Map<roomId, RoomState>` | Rooms are ephemeral. No database needed for MVP.                        |
| User persistence | `localStorage`                     | Stores `{ userId, name, avatar }`. Survives tab and browser closes.     |
| Animations       | `canvas-confetti`                  | Lightweight, zero-dependency fireworks on unanimous votes               |

---

## 3. Architecture Overview

```
┌─────────────────┐        WebSocket         ┌────────────────────┐
│   React SPA      │◄──────────────────────► │   Node.js Server    │
│   (Rsbuild)      │                          │   (Express + ws)    │
│                   │                          │                     │
│   Hosted on       │                          │   Hosted on         │
│   S3 + CloudFront │                          │   EC2 (t3.micro)    │
└─────────────────┘                          └────────────────────┘
                                                      │
                                                In-memory Map
                                              (rooms & participants)
```

- The frontend is a fully static SPA. No server-side rendering.
- The backend is a single Node.js process handling HTTP health checks and WebSocket connections.
- No database. Room state lives in memory and is discarded when rooms become inactive.

---

## 4. Room & Session Flow

1. User lands on `/` → enters name, picks avatar → clicks "Create Room"
2. Frontend generates a `roomId` (use `nanoid` — short, URL-safe, e.g. `abc-xyz-123`)
3. Frontend navigates to `/room/:roomId` and opens a WebSocket connection to `wss://api.yourapp.com/ws/:roomId`
4. Server lazily creates the room in its in-memory Map when the first connection arrives
5. User shares the URL. Others open it → enter name/avatar (or auto-filled from localStorage) → connect to the same WebSocket room
6. Server broadcasts updated participant list on every join/leave/vote/reveal/reset

There is no explicit "create session" API call. Rooms are created on first connection and garbage-collected after a period of inactivity.

---

## 5. User Identity & Persistence

On first visit, generate a UUID (`crypto.randomUUID()`) and store it in localStorage alongside the user profile:

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Lawangin",
  "avatar": "ninja"
}
```

- `userId` is the stable identifier. Two users with the same name won't collide.
- localStorage persists across tab closes and browser restarts. It only clears if the user manually clears browser data.
- On reconnect (e.g. network drop), the WebSocket hook re-sends the `join` message with the same `userId`. The server recognizes the ID and restores their state instead of creating a duplicate participant.

---

## 6. WebSocket Message Protocol

All messages are JSON with a `type` field.

### Client → Server

```json
{ "type": "join", "userId": "...", "name": "...", "avatar": "..." }
{ "type": "vote", "userId": "...", "points": 5 }
{ "type": "reveal" }
{ "type": "reset" }
```

### Server → All Clients

**Room state update** (sent on join, leave, vote):

```json
{
  "type": "room_state",
  "participants": [
    { "userId": "...", "name": "...", "avatar": "...", "hasVoted": true }
  ]
}
```

Note: `points` is intentionally omitted before reveal. Votes are hidden server-side, not just visually hidden on the client.

**Reveal** (sent when someone clicks Reveal):

```json
{
  "type": "revealed",
  "participants": [
    {
      "userId": "...",
      "name": "...",
      "avatar": "...",
      "hasVoted": true,
      "points": 5
    }
  ],
  "allMatch": true
}
```

`allMatch: true` triggers the fireworks animation on all clients.

**Reset** (sent when someone clicks Reset):

```json
{ "type": "reset" }
```

Clients clear all local vote state and return to the voting phase.

---

## 7. Frontend Structure

```
packages/frontend/
├── src/
│   ├── pages/
│   │   ├── LandingPage.tsx        # Name/avatar entry + "Create Room" button
│   │   └── Room.tsx               # Main poker room view
│   ├── components/
│   │   ├── AvatarPicker.tsx       # Grid of selectable avatar options
│   │   ├── ParticipantCard.tsx    # Shows avatar, name, voted indicator; flips on reveal
│   │   ├── PointSelector.tsx      # Row of tappable point cards (0,1,2,3,5,8,13,21,?)
│   │   └── FireworksOverlay.tsx   # canvas-confetti triggered on allMatch === true
│   ├── hooks/
│   │   ├── useWebSocket.ts        # Connection management, auto-reconnect, message dispatch
│   │   └── useLocalUser.ts        # Read/write localStorage for user identity
│   ├── context/
│   │   └── RoomContext.tsx         # Room state (participants, revealed, etc.) shared via context
│   ├── App.tsx
│   └── index.tsx
├── public/
├── package.json
├── rsbuild.config.ts
└── tsconfig.json
```

### Key UX Details

- **Card flip mechanic:** Each ParticipantCard shows the avatar with a "voted" indicator (checkmark overlay) once they've submitted. On reveal, card flips with `transform: rotateY(180deg)` CSS transition to show the point value.
- **Point scale:** Fibonacci — `0, 1, 2, 3, 5, 8, 13, 21, ?`. The `?` means "I need more context." Render as tappable cards, not a dropdown.
- **Fireworks:** Use `canvas-confetti`. Trigger on the client side when `revealed` message arrives with `allMatch: true`.
- **Reconnection:** `useWebSocket` hook should auto-reconnect on disconnect and re-send the `join` message with the existing `userId` from localStorage.

---

## 8. Backend Structure

```
packages/backend/
├── src/
│   ├── server.ts              # Express app + WebSocket upgrade setup
│   ├── wsHandler.ts           # WebSocket message router (join/vote/reveal/reset)
│   ├── roomManager.ts         # In-memory Map<roomId, RoomState>, room lifecycle, GC
│   └── types.ts               # Shared TypeScript types (messages, room state, participant)
├── package.json
└── tsconfig.json
```

### Room Manager

- `rooms: Map<string, RoomState>` where `RoomState` contains participants, their votes, and whether the room is in "revealed" state.
- Garbage collection: periodically sweep rooms with no connections for > N minutes and delete them.
- On WebSocket close, remove the participant from the room and broadcast updated state. If room is empty, mark it for GC.

---

## 9. Project Structure (Monorepo)

```
scrum-poker/
├── packages/
│   ├── frontend/              # React + Rsbuild (see section 7)
│   └── backend/               # Node + Express + ws (see section 8)
├── .github/
│   └── workflows/
│       ├── deploy-frontend.yml    # Build → S3 sync → CloudFront invalidation
│       └── deploy-backend.yml     # Deploy to EC2 (SSH or CodeDeploy)
├── docs/
│   └── infrastructure.md         # Manual record of all AWS resources
├── package.json                   # Root workspace configuration (npm workspaces)
└── README.md
```

- npm workspaces manage the monorepo. Root `package.json` defines `"workspaces": ["packages/*"]`.
- Each package has its own `package.json`, `tsconfig.json`, and independent dependency tree.
- No Docker files. Run directly during development (`npm run dev` in each package).

---

## 10. Deployment & Infrastructure (AWS — Strategy B)

### Frontend: S3 + CloudFront

- Rsbuild builds to `packages/frontend/dist/`
- `aws s3 sync dist/ s3://your-bucket-name --delete`
- CloudFront distribution in front of S3 for HTTPS and caching
- **Critical:** Configure CloudFront custom error responses to return `index.html` for 403/404 errors. This enables client-side routing so that `/room/abc-xyz-123` works on page refresh instead of returning a 404.
- Estimated cost: < $1/month at low traffic

### Backend: EC2

- Single `t3.micro` instance (free tier eligible for 12 months, ~$8/month after)
- Run Node.js directly with PM2 as the process manager (auto-restart on crash)
- Caddy as a reverse proxy on the instance for automatic HTTPS via Let's Encrypt (no ALB needed, saving ~$16-22/month)
- Elastic IP assigned so the instance address doesn't change on reboot
- Security group: allow inbound 443 (HTTPS), 80 (HTTP redirect), 22 (SSH from your IP only)
- Backend domain: `api.yourapp.com` pointing at the Elastic IP
- WebSocket connections go to `wss://api.yourapp.com/ws/:roomId`

### No ALB, No Database, No Kubernetes

- ALB was rejected to save $16-22/month. Caddy on the instance handles TLS.
- No database needed. Room state is in-memory and ephemeral.
- Kubernetes (EKS) was evaluated and rejected. EKS control plane alone costs ~$70-75/month, which is disproportionate for a low-traffic single-service app.

### CI/CD: GitHub Actions

**`deploy-frontend.yml`** — triggers on push to `main` (changes in `packages/frontend/`):

1. Install dependencies
2. Run `rsbuild build`
3. `aws s3 sync` the dist folder to the S3 bucket
4. Invalidate CloudFront cache

**`deploy-backend.yml`** — triggers on push to `main` (changes in `packages/backend/`):

1. SSH into EC2 (or use AWS CodeDeploy)
2. Pull latest code
3. Install dependencies
4. Restart the Node process via PM2

### Infrastructure Provisioning

- AWS resources are created manually via the AWS Console (not Terraform)
- All resource details (bucket name, CloudFront distribution ID, EC2 instance ID, security group rules, Elastic IP) are documented in `docs/infrastructure.md`
- Terraform was evaluated and deferred. For ~5 resources created once by a solo developer, the learning curve and state management overhead don't pay off. Can be adopted later if the infra grows or needs to be replicated.

### Estimated Monthly Cost

| Resource                    | Cost                  |
| --------------------------- | --------------------- |
| S3 + CloudFront             | < $1                  |
| EC2 t3.micro                | $0 (free tier) or ~$8 |
| Elastic IP (while attached) | $0                    |
| Route 53 hosted zone        | ~$0.50                |
| **Total**                   | **~$1–10/month**      |

---

## 11. Key Technical Considerations

- **WebSocket + CORS:** The frontend on `yourapp.com` connects to `api.yourapp.com`. The WebSocket handshake is an HTTP upgrade and doesn't follow standard CORS, but if you add any REST endpoints, configure Express CORS middleware.
- **Vote secrecy:** Votes must be hidden server-side. The `room_state` broadcast before reveal must not include point values. Don't rely on client-side hiding — that's trivially inspectable.
- **Single point of failure:** One EC2 instance means downtime if it crashes. Acceptable for MVP. If needed later, place the instance in an Auto Scaling Group of size 1 for automatic replacement.
- **WebSocket scaling limitation:** All room state is in-memory on one process. If you ever need multiple backend instances, you'd need Redis pub/sub to share state. Not needed for MVP.
- **Room cleanup:** Implement a periodic sweep (e.g. every 5 minutes) that deletes rooms with no active WebSocket connections for longer than a threshold (e.g. 30 minutes).
