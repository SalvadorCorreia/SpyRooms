import { z } from "zod";
import { zRole, zTeam } from "./domain";

/** Runtime schema used to validate untrusted client intents. */
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
		role: zRole.extract(["spymaster", "guesser"]),
	}),
	z.object({
		type: z.literal("leave_room"),
	}),
	z.object({
		type: z.literal("ping"),
		nonce: z.string().min(1).max(128),
	}),
]);

/** Parsed client intent type inferred from `zClientMessage`. */
export type ClientMessageParsed = z.infer<typeof zClientMessage>;
