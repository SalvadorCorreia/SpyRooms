/**
 * Server entrypoint (wiring + route contract).
 *
 * Responsibilities of this file:
 * - Declare the Cloudflare Worker `fetch()` handler and route high-level requests.
 * - Export Durable Object classes so Wrangler can bind them.
 *
 * Where behavior lives:
 * - Room URL parsing / RoomId validation: `src/http/roomRouting.ts`
 * - Room WebSocket + protocol handling + idle timeout: `src/do/GameRoom.ts`
 *
 * Route contract (canonical):
 * - WebSocket upgrade: `/room/:roomId` (proxied to the room Durable Object)
 * - Everything else: handled by the Worker (e.g. assets SPA fallback), depending on current router logic.
 *
 * NOTE: This file should stay small and read like a table-of-contents.
 */

import type { ExportedHandler } from "@cloudflare/workers-types";
import { isRoomWebSocketRequest, proxyRoomWebSocketToDO } from "./http/roomRouting";
import { GameRoom } from "./do/GameRoom";

/**
 * Durable Object export required by Wrangler `durable_objects.bindings[].class_name`.
 * (Keep the name aligned with `apps/server/wrangler.jsonc`.)
 */
export { GameRoom };

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// Room WebSocket upgrade -> room-specific Durable Object
		if (isRoomWebSocketRequest(request)) {
			return proxyRoomWebSocketToDO(request, env);
		}

		// Fallback: leave existing behavior to your current router/asset logic.
		// If you already serve SPA assets via ASSETS binding, keep doing so here.
		//
		// (Intentionally no behavior changes in this refactor-only commit.)
		if (env.ASSETS) {
			return env.ASSETS.fetch(request);
		}

		return new Response("Not Found", { status: 404 });
	},
} satisfies ExportedHandler<Env>;
