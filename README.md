# SpyRooms

Edge-native, server-authoritative multiplayer word game engine (CodeNames-inspired).

This repository is a **pnpm workspace monorepo** with:

- `apps/client` — React + Vite SPA
- `apps/server` — Cloudflare Worker + Durable Objects (WebSocket room router)
- `packages/protocol` — shared wire protocol, schemas, and ID rules

## Status

The project is under active development. The current focus is **Issue #8: Room ID generation & WebSocket routing**.

## Quick start (local)

### Prerequisites

- Node.js (LTS recommended)
- `pnpm` (managed via Corepack)

Enable Corepack and install dependencies:

```bash
corepack enable
pnpm install
```

### Run both apps (recommended)

```bash
pnpm dev
```

- Client dev server: printed by Vite (typically `http://localhost:5173`)
- Server dev (Wrangler): `http://localhost:8787`

### Run apps individually

```bash
pnpm dev:client
pnpm dev:server
```

### Build

```bash
pnpm build
```

## WebSocket room routing (current)

The server routes WebSocket upgrades on:

- `GET /room/:roomId` (WebSocket upgrade)

Room IDs are validated using the shared constraints exported from `@spyrooms/protocol` (see `packages/protocol`).

### Manual WS test

Install a WebSocket CLI client:

```bash
npm i -g wscat
```

Connect:

```bash
wscat -c ws://127.0.0.1:8787/room/<roomId>
```

Send a ping message:

```json
{"type":"ping","nonce":"123"}
```

You should receive:

```json
{"type":"pong","nonce":"123"}
```

## Deploy (dev)

The frontend is deployed **through the Cloudflare Worker** (the Worker serves the built SPA assets via the `ASSETS` binding).

### Prerequisites

- Cloudflare account
- Wrangler authenticated:

```bash
wrangler login
```

### Deploy steps

1. Build the client:

   ```bash
   pnpm --filter @spyrooms/client build
   ```

2. Deploy the Worker (which serves the client build output):

   ```bash
   pnpm --filter @spyrooms/server deploy
   ```

Wrangler will print the deployed URL.

## Project structure

```text
apps/
  client/        # React SPA
  server/        # Worker router + Durable Objects
packages/
  protocol/      # Shared types/schemas/ID rules
docs/            # Architecture and contribution docs
```

## Docs

- `docs/board-game-architecture.md` — architecture overview
- `docs/CONTRIBUTING.md` — contribution guidelines
- `docs/STYLEGUIDE.md` — TypeScript style guide
