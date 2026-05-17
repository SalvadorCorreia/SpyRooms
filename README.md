# SpyRooms

Edge-native, server-authoritative multiplayer word game engine (CodeNames-inspired).

## Deploy (current / dev)

Right now the frontend is deployed **through the Cloudflare Worker** (the Worker serves the built SPA assets).

### Prerequisites
- Node.js (LTS recommended)
- Cloudflare account
- Wrangler CLI authenticated (`wrangler login`)

### Deploy steps
1. Build the client:
   ```bash
   cd apps/client
   npm install
   npm run build
   ```

2. Deploy the Worker (which serves the client build output):
   ```bash
   cd ../server
   npm install
   wrangler deploy
   ```

Wrangler will print the deployed URL. Open it to see the placeholder frontend.
API endpoints (for now) are served from the same deployment (e.g. `/api/hello`).

## Local development (quick)
- Worker:
  ```bash
  cd apps/server
  npm install
  wrangler dev
  ```
- Client:
  ```bash
  cd apps/client
  npm install
  npm run dev
  ```

Alternative pnpm approaches are also possible