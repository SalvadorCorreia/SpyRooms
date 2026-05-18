export { GameRoom } from "./do/GameRoom";
import { getRoomIdFromPath, isValidRoomId } from "./http/roomRouting";


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
