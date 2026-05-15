import { GameRoom } from "./do/GameRoom.ts";
export { GameRoom } from "./do/GameRoom";
import { zClientMessage, type ClientMessage, type ClientMessageParsed } from "@spyrooms/protocol";
import { ROOM_ID_MIN_LEN, ROOM_ID_MAX_LEN, ROOM_ID_RE } from "@spyrooms/protocol";
import { URL } from "node:url";


const ROOM_WS_PREFIX = "room";

export default {
    /** Handles requests and proxies a call to the Durable Object instance. */
    async fetch(request, env, ctx): Promise<Response> {
        const url = new URL(request.url);

        const roomId = getRoomIdFromPath(url.pathname);
        if (roomId !== null) {
            if (!isValidRoomId(roomId)) {
                return new Response("Invalid room id.", { status: 400 });
            }
            const id = env.GAME_ROOM.idFromName(roomId);
            const stub = env.GAME_ROOM.get(id);

            return stub.fetch(request);
        }
        const stub = env.GAME_ROOM.getByName("foo");
        const greeting = await stub.sayHello("world");
        return new Response(greeting);
    },
} satisfies ExportedHandler<Env>;

function getRoomIdFromPath(pathname: string): string | null {
    // Expected: /room/<roomId>
    // Split carefully to avoid empty segments.
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length !== 2) return null;
    if (parts[0] !== ROOM_WS_PREFIX) return null;
    return parts[1];
}

function isValidRoomId(roomId: string): boolean {
    if (roomId.length < ROOM_ID_MIN_LEN || roomId.length > ROOM_ID_MAX_LEN) return false;
    return ROOM_ID_RE.test(roomId);
}

/** Parses and validates an untrusted client payload with the shared schema. */
function parseClientMessage(raw: unknown): ClientMessage {
    return zClientMessage.parse(raw);
}
