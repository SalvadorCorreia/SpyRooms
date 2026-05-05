import { z } from "zod";

/**
 * Note: We validate Client -> Server messages strictly.
 * Server -> Client messages are produced by us, so validation there is optional
 * (but can still be useful in tests).
 */

export const zTeam = z.enum(["red", "blue"]);
export const zRole = z.enum(["spymaster", "guesser", "spectator"]);

export const zClientMessage = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("join_room"),
		roomId: z.string().min(1).max(64),
	}),
	z.object({
		type: z.literal("set_name"),
		name: z.string().trim().min(1).max(32),
	}),
	z.object({
		type: z.literal("select_role"),
		team: zTeam,
		role: z.enum(["spymaster", "guesser"]),
	}),
	z.object({
		type: z.literal("leave_room"),
	}),
	z.object({
		type: z.literal("ping"),
		nonce: z.string().min(1).max(128),
	}),
]);

/** Convenience type: inferred from schema (always stays in sync). */
export type ClientMessageParsed = z.infer<typeof zClientMessage>;
