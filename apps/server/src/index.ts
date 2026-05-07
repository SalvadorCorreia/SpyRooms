import { DurableObject } from "cloudflare:workers";
import { zClientMessage, type ClientMessage } from "@spyrooms/protocol";

/** Durable Object used for RPC demonstration and future room state logic. */
export class MyDurableObject extends DurableObject<Env> {
    constructor(ctx: DurableObjectState, env: Env) {
        super(ctx, env);
    }

    /** Returns a greeting string for the given name. */
    async sayHello(name: string): Promise<string> {
        return `Hello, ${name}!`;
    }
}

export default {
    /** Handles requests and proxies a call to the Durable Object instance. */
    async fetch(request, env, ctx): Promise<Response> {
        const stub = env.MY_DURABLE_OBJECT.getByName("foo");
        const greeting = await stub.sayHello("world");

        return new Response(greeting);
    },
} satisfies ExportedHandler<Env>;

/** Parses and validates an untrusted client payload with the shared schema. */
function parseClientMessage(raw: unknown): ClientMessage {
	return zClientMessage.parse(raw);
}
