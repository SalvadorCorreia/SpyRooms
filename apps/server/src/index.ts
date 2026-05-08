import { DurableObject } from "cloudflare:workers";
import { zClientMessage, type ClientMessage } from "@spyrooms/protocol";
import { URL } from "node:url";

/** Durable Object used for RPC demonstration and future room state logic. */
export class MyDurableObject extends DurableObject<Env> {
    constructor(ctx: DurableObjectState, env: Env) {
        super(ctx, env);
    }

    /** Returns a greeting string for the given name. */
    async sayHello(name: string): Promise<string> {
        return `Hello, ${name}!`;
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);
        return new Response(`DO reached for path=${url.pathname}`, { status: 200 });
    }
}

export default {
    /** Handles requests and proxies a call to the Durable Object instance. */
    async fetch(request, env, ctx): Promise<Response> {
        const url = new URL(request.url);

        const roomId = getRoomIdFromPath(url.pathname);
        if (roomId !== null) {
            if (!isValidRoomId(roomId)) {
                return new Response("Invalid room id.", { status: 400 });
            }
            const id = env.MY_DURABLE_OBJECT.idFromName(roomId);
            const stub = env.MY_DURABLE_OBJECT.get(id);

            return stub.fetch(request);
        }
        const stub = env.MY_DURABLE_OBJECT.getByName("foo");
        const greeting = await stub.sayHello("world");
        return new Response(greeting);
    },
} satisfies ExportedHandler<Env>;

function getRoomIdFromPath(pathname: string): string | null {
    // Expected: /ws/<roomId>
    // Split carefully to avoid empty segments.
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length !== 2) return null;
    if (parts[0] !== "ws") return null;
    return parts[1];
}

function isValidRoomId(roomId: string): boolean {
    // Keep it strict and cheap.
    return /^[a-z0-9-]{1,16}$/.test(roomId);
}

/** Parses and validates an untrusted client payload with the shared schema. */
function parseClientMessage(raw: unknown): ClientMessage {
    return zClientMessage.parse(raw);
}
