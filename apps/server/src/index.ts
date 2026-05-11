import { DurableObject } from "cloudflare:workers";
import { zClientMessage, type ClientMessage, type ClientMessageParsed } from "@spyrooms/protocol";
import { URL } from "node:url";

/** Durable Object used for RPC demonstration and future room state logic. */
export class GameRoom extends DurableObject<Env> {
    constructor(ctx: DurableObjectState, env: Env) {
        super(ctx, env);
    }

    /** Returns a greeting string for the given name. */
    async sayHello(name: string): Promise<string> {
        return `Hello, ${name}!`;
    }

    private connections = new Set<WebSocket>();
    private lastActivityBySocket = new WeakMap<WebSocket, number>();
    private reaperIntervalId: number | null = null;

    private static readonly IDLE_TIMEOUT_MS = 60_000;
    private static readonly REAPER_TICK_MS = 15_000;

    private markActive(ws: WebSocket): void {
        this.lastActivityBySocket.set(ws, Date.now());
    }

    private startReaperIfNeeded(): void {
        if (this.reaperIntervalId !== null) return;

        this.reaperIntervalId = setInterval(() => {
            this.reapIdleConnections();
        }, GameRoom.REAPER_TICK_MS) as unknown as number;
    }

    private stopReaperIfIdle(): void {
        if (this.connections.size > 0) return;
        if (this.reaperIntervalId === null) return;

        clearInterval(this.reaperIntervalId);
        this.reaperIntervalId = null;
    }

    private reapIdleConnections(): void {
        const now = Date.now();

        for (const ws of this.connections) {
            const last = this.lastActivityBySocket.get(ws) ?? now;
            if (now - last > GameRoom.IDLE_TIMEOUT_MS) {
                try {
                    ws.close(1000, "idle_timeout");
                } catch {
                    // If close throws for any reason, remove it to avoid spinning forever.
                    this.connections.delete(ws);
                }
            }
        }

        this.stopReaperIfIdle();
    }

    async fetch(request: Request): Promise<Response> {
        const upgrade = request.headers.get("Upgrade");
        if (upgrade?.toLowerCase() !== "websocket") {
            return new Response("Expected WebSocket upgrade", { status: 426 });
        }

        const pair = new WebSocketPair();
        const [client, server] = Object.values(pair);

        server.accept();

        this.connections.add(server);
        this.markActive(server);
        this.startReaperIfNeeded();

        server.addEventListener("close", (ev) => {
            console.log("ws close", ev.code, ev.reason);
            this.connections.delete(server);
            this.stopReaperIfIdle();
        });

        server.addEventListener("error", (ev) => {
            console.log("ws error", ev);
            this.connections.delete(server);
            this.stopReaperIfIdle();
        });

        server.addEventListener("message", (ev) => {
            try {
                if (typeof ev.data !== "string") {
                    server.send(
                        JSON.stringify({
                            type: "error",
                            code: "invalid_message",
                            message: "Expected text frame",
                        }),
                    );
                    return;
                }

                const MAX_WS_MESSAGE_CHARS = 4 * 1024;

                if (ev.data.length > MAX_WS_MESSAGE_CHARS) {
                    server.send(JSON.stringify({
                        type: "error",
                        code: "invalid_message",
                        message: "Message too large",
                    }));
                    return;
                }

                const parsedJson = JSON.parse(ev.data);
                const parsed = zClientMessage.safeParse(parsedJson);

                if (!parsed.success) {
                    server.send(
                        JSON.stringify({
                            type: "error",
                            code: "invalid_message",
                            message: parsed.error.message,
                        }),
                    );
                    return;
                }

                const msg: ClientMessageParsed = parsed.data;
                this.markActive(server);

                if (msg.type === "ping") {
                    server.send(JSON.stringify({ type: "pong", nonce: msg.nonce }));
                    return;
                }


                console.log("validated message", msg.type);
            } catch (err) {
                server.send(
                    JSON.stringify({
                        type: "error",
                        code: "invalid_message",
                        message: err instanceof Error ? err.message : "Unknown parse error",
                    }),
                );
            }
        });



        return new Response(null, { status: 101, webSocket: client });
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
