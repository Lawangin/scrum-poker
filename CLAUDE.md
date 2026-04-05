# Scrum Poker — Claude Code Guide

This is a real-time scrum planning poker app built as a pnpm monorepo. Full specs are in [docs/project-specs.md](docs/project-specs.md). Full design system is in [docs/Design.md](docs/Design.md).

---

## Monorepo Structure

```
scrum-poker/
├── packages/
│   ├── frontend/   # React + TypeScript + Rsbuild
│   └── backend/    # Node.js + Express + ws (WebSockets)
├── docs/
│   ├── project-specs.md
│   └── Design.md
└── package.json    # pnpm workspace root
```

Run both packages together from the root: `pnpm dev`

---

## Tech Stack

### Frontend (`packages/frontend/`)
- **React 19 + TypeScript**
- **Rsbuild** as the bundler (not Vite)
- **CSS Modules** for component styling — no Tailwind, no CSS-in-JS
- **React Router** for routing (`/` landing page, `/room/:id` session room)
- **canvas-confetti** for fireworks on unanimous votes
- **nanoid** for generating short, URL-safe room IDs

### Backend (`packages/backend/`)
- **Node.js + Express + TypeScript**
- **ws** library for native WebSockets (not Socket.io)
- **In-memory `Map<roomId, RoomState>`** — no database
- **PM2** in production as the process manager

---

## Frontend Architecture

```
src/
├── pages/
│   ├── LandingPage.tsx        # Name/avatar entry + "Create Room"
│   └── Room.tsx               # Main poker room view
├── components/
│   ├── AvatarPicker.tsx
│   ├── ParticipantCard.tsx    # Flips on reveal to show points
│   ├── PointSelector.tsx      # Fibonacci cards: 0,1,2,3,5,8,13,21,?
│   └── FireworksOverlay.tsx
├── hooks/
│   ├── useWebSocket.ts        # Connection, auto-reconnect, message dispatch
│   └── useLocalUser.ts        # Read/write localStorage for user identity
├── context/
│   └── RoomContext.tsx
├── tokens.css                 # Global CSS custom properties (design tokens)
├── App.tsx
└── index.tsx
```

---

## Styling Rules

**Use CSS Modules exclusively.** Name files `ComponentName.module.css` and import as `styles`.

**Never use:**
- Tailwind CSS (not installed, not used in this project)
- Inline styles (except for truly dynamic values)
- 1px solid borders for sectioning (see "No-Line Rule" in Design.md)
- Pure black (`#000000`) for text
- Generic blue — always use `var(--color-primary)`

**Always use the design tokens** defined in `src/tokens.css` as CSS variables. Key tokens:

```
Colors:        --color-background, --color-surface, --color-surface-container-*,
               --color-primary, --color-primary-container, --color-on-surface, etc.
Typography:    --font-display (Plus Jakarta Sans), --font-body (Manrope)
               --text-display-lg, --text-headline-sm, --text-title-md, --text-body-sm
Shadows:       --shadow-cloud
Radii:         --radius-md (cards), --radius-lg (containers), --radius-full (buttons)
Gradients:     --gradient-primary (primary action buttons)
Glassmorphism: --glass-bg, --glass-blur (floating modals/overlays)
```

**Key design patterns:**
- Depth via tonal layering, not shadows or borders (e.g. white card on lavender background)
- Selected voting card: fill with `--color-secondary-container`, text to `--color-on-secondary-container`
- Primary buttons: `--gradient-primary`, `--radius-full`, min horizontal padding `2rem`
- Input fields: `--color-surface-container-highest` background, bottom-only 2px accent in `--color-outline-variant`, transitions to `--color-primary` on focus
- Avatar hover: scale 1.1x + tooltip with `--color-inverse-surface` background
- Floating modals: glassmorphism (`--glass-bg` + `backdrop-filter: blur(var(--glass-blur))`)

---

## WebSocket Protocol

All messages are JSON with a `type` field.

**Client → Server:**
```json
{ "type": "join",   "userId": "...", "name": "...", "avatar": "..." }
{ "type": "vote",   "userId": "...", "points": 5 }
{ "type": "reveal" }
{ "type": "reset" }
```

**Server → Clients:**
```json
// Before reveal (points hidden server-side, not just visually)
{ "type": "room_state", "participants": [{ "userId": "...", "name": "...", "avatar": "...", "hasVoted": true }] }

// On reveal
{ "type": "revealed", "participants": [{ ..., "points": 5 }], "allMatch": true }

// On reset
{ "type": "reset" }
```

`allMatch: true` triggers the fireworks animation on all clients.

---

## User Identity

Stored in `localStorage` — no login required:
```json
{ "userId": "uuid-v4", "name": "Lawangin", "avatar": "ninja" }
```

On reconnect, the client re-sends `join` with the same `userId`. The server restores their state (no duplicate participants).

---

## Key Rules & Gotchas

- **Vote secrecy is server-side.** `room_state` broadcasts must never include `points` before reveal. Do not rely on client-side hiding.
- **Rooms are ephemeral.** No database. State lives in the server's in-memory Map and is lost on process restart.
- **Room IDs** are generated client-side with `nanoid` — no server API call needed to create a room.
- **CloudFront** must be configured to return `index.html` for 403/404 errors so `/room/:id` works on page refresh.
- **Point scale** is Fibonacci: `0, 1, 2, 3, 5, 8, 13, 21, ?`. Render as tappable cards, never a dropdown.
- **No dividers** between participants — use `1.5rem` vertical whitespace instead.
