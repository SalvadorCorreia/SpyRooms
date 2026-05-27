import { DurableObject } from "cloudflare:workers";
import { zClientMessage, type ClientMessageParsed, type ServerMessage } from "@spyrooms/protocol";

/**
 * GameRoom Durable Object
 *
 * Responsibilities:
 * - Accept WebSocket upgrades for a single room instance (roomId is the DO name).
 * - Validate Client -> Server messages at runtime using shared Zod schemas.
 * - Apply strict realtime cost controls:
 *   - track last activity per socket
 *   - close idle sockets after a timeout
 *   - run reaper only while sockets exist
 *
 * NOTE: "Room existence" is not yet enforced here; this DO currently accepts upgrades
 * whenever routed to. If you later add a "created" flag in storage, this is the place
 * to reject upgrades for non-created rooms.
 */
export class GameRoom extends DurableObject<Env> {
    private connections = new Set<WebSocket>();
    private lastActivityBySocket = new WeakMap<WebSocket, number>();
    private reaperIntervalId: number | null = null;

    private static readonly IDLE_TIMEOUT_MS = 60_000;
    private static readonly REAPER_TICK_MS = 15_000;
    private static readonly MAX_WS_MESSAGE_CHARS = 4 * 1024;

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
                    // If close throws, remove it to avoid spinning forever.
                    this.connections.delete(ws);
                }
            }
        }

        this.stopReaperIfIdle();
    }

    private cleanupSocket(ws: WebSocket): void {
        this.connections.delete(ws);
        this.stopReaperIfIdle();
    }

    private send(ws: WebSocket, msg: ServerMessage): void {
        ws.send(JSON.stringify(msg));
    }

    private sendProtocolError(ws: WebSocket, message: string): void {
        this.send(ws, {
            type: "error",
            code: "invalid_message",
            message,
        });
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
            this.cleanupSocket(server);
        });

        server.addEventListener("error", (ev) => {
            console.log("ws error", ev);
            this.cleanupSocket(server);
        });

        server.addEventListener("message", (ev) => {
            try {
                if (typeof ev.data !== "string") {
                    this.sendProtocolError(server, "Expected text frame");
                    return;
                }

                if (ev.data.length > GameRoom.MAX_WS_MESSAGE_CHARS) {
                    this.sendProtocolError(server, "Message too large");
                    return;
                }

                const parsedJson = JSON.parse(ev.data);
                const parsed = zClientMessage.safeParse(parsedJson);

                if (!parsed.success) {
                    this.sendProtocolError(server, parsed.error.message);
                    return;
                }

                const msg: ClientMessageParsed = parsed.data;
                this.markActive(server);

                switch (msg.type) {
                    case "ping":
                        this.send(server, { type: "pong", nonce: msg.nonce });
                        return;

                    default:
                        // For now we only log other validated intents. This keeps the DO
                        // strict about validation without committing to game semantics yet.
                        console.log("validated message", msg.type);
                        return;
                }
            } catch (err) {
                this.sendProtocolError(
                    server,
                    err instanceof Error ? err.message : "Unknown parse error",
                );
            }
        });

        return new Response(null, { status: 101, webSocket: client });
    }
}
