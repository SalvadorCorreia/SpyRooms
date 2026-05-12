import { z } from "zod";
import type { PlayerId, Role, RoomId, Team } from "./messages.ts";
import { zRoomIdString, zPlayerIdString } from "./ids.ts";

/** Shared domain models and schemas used by client and server. */
export const zTeam = z.enum(["red", "blue"]);
export const zRole = z.enum(["spymaster", "guesser", "spectator"]);

/** Parsed team literal inferred from `zTeam`. */
export type TeamParsed = z.infer<typeof zTeam>;
/** Parsed role literal inferred from `zRole`. */
export type RoleParsed = z.infer<typeof zRole>;

/** Branded IDs are strings at runtime; branding is compile-time only. */
const zRoomId = zRoomIdString as unknown as z.ZodType<RoomId>;
const zPlayerId = zPlayerIdString as unknown as z.ZodType<PlayerId>;

/** A single player in a room. */
export type Player = {
    playerId: PlayerId;
    name: string;
    team: Team | null;
    role: Role;
    connected: boolean;
};

/** Runtime schema for `Player`. */
export const zPlayer = z.object({
    playerId: zPlayerId,
    name: z.string().trim().min(1).max(32),
    team: zTeam.nullable(),
    role: zRole,
    connected: z.boolean(),
}) satisfies z.ZodType<Player>;

/** Public-facing card kind (Codename-style). */
export type CardKind = Team | "neutral" | "assassin";
/** Runtime schema for `CardKind`. */
export const zCardKind = z.enum(["red", "blue", "neutral", "assassin"]) satisfies z.ZodType<CardKind>;

/** A card shown on the room board. */
export type Card = {
    cardId: string;
    word: string;
    kind: CardKind;
    revealed: boolean;
};

/** Runtime schema for `Card`. */
export const zCard = z.object({
    cardId: z.string().min(1).max(64),
    word: z.string().trim().min(1).max(64),
    kind: zCardKind,
    revealed: z.boolean(),
}) satisfies z.ZodType<Card>;

/** High-level game phase. */
export type GamePhase = "lobby" | "setup" | "playing" | "finished";
/** Runtime schema for `GamePhase`. */
export const zGamePhase = z.enum(["lobby", "setup", "playing", "finished"]);

/** Canonical state snapshot for a room. */
export type GameState = {
    roomId: RoomId;
    phase: GamePhase;
    players: Player[];
    board: Card[];
};

/** Runtime schema for `GameState`. */
export const zGameState = z.object({
    roomId: zRoomId,
    phase: zGamePhase,
    players: z.array(zPlayer),
    board: z.array(zCard),
}) satisfies z.ZodType<GameState>;
