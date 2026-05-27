export { GameRoom } from "./do/GameRoom";
import { getRoomIdFromPath, isValidRoomId } from "./http/roomRouting";

/**
 * SpyRooms Worker entrypoint.
 *
 * Responsibilities:
 * - Parse incoming HTTP requests.
 * - If request targets a room route (`/room/:roomId`), validate roomId and proxy
 *   the request to the room-specific Durable Object instance (`GAME_ROOM`).
 * - Otherwise, serve the SPA/static assets via the `ASSETS` binding.
 *
 * Room protocol & WebSocket behavior are implemented in: `src/do/GameRoom.ts`.
 */
export default {
    async fetch(request, env): Promise<Response> {
        const url = new URL(request.url);

        // Room routes: /room/:roomId (WS upgrades and any future per-room HTTP endpoints)
        const roomId = getRoomIdFromPath(url.pathname);
        if (roomId !== null) {
            if (!isValidRoomId(roomId)) {
                return new Response("Invalid room id.", { status: 400 });
            }

            const id = env.GAME_ROOM.idFromName(roomId);
            const stub = env.GAME_ROOM.get(id);

            // Delegate to the GameRoom Durable Object (handles WS upgrade + room logic).
            return stub.fetch(request);
        }

        // Non-room requests: serve the SPA / static assets.
        return env.ASSETS.fetch(request);
    },
} satisfies ExportedHandler<Env>;
