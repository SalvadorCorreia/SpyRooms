import { z } from "zod";
import type { PlayerId, Role, RoomId, Team } from "./messages";

/**
 * Shared domain models.
 *
 * These types represent canonical shapes used by both client and server.
 * Zod schemas are included so types can be inferred and (optionally) validated in tests.
 */

/** Ground-truth enums used across the repo. */
export const zTeam = z.enum(["red", "blue"]);
export const zRole = z.enum(["spymaster", "guesser", "spectator"]);

export type TeamParsed = z.infer<typeof zTeam>;
export type RoleParsed = z.infer<typeof zRole>;

/** Branded IDs are strings at runtime; branding is compile-time only. */
const zRoomId = z.string().min(1).max(64) as unknown as z.ZodType<RoomId>;
const zPlayerId = z.string().min(1).max(64) as unknown as z.ZodType<PlayerId>;

/** A single player in a room. */
export type Player = {
    playerId: PlayerId;
    name: string;
    team: Team | null;
    role: Role;
    connected: boolean;
};

export const zPlayer = z.object({
    playerId: zPlayerId,
    name: z.string().trim().min(1).max(32),
    team: zTeam.nullable(),
    role: zRole,
    connected: z.boolean(),
}) satisfies z.ZodType<Player>;

/** Public-facing card kind (Codename-style). */
export type CardKind = Team | "neutral" | "assassin";
export const zCardKind = z.enum(["red", "blue", "neutral", "assassin"]) satisfies z.ZodType<CardKind>;

export type Card = {
    cardId: string;
    word: string;
    kind: CardKind;
    revealed: boolean;
};

export const zCard = z.object({
    cardId: z.string().min(1).max(64),
    word: z.string().trim().min(1).max(64),
    kind: zCardKind,
    revealed: z.boolean(),
}) satisfies z.ZodType<Card>;

/** High-level game phase. */
export type GamePhase = "lobby" | "setup" | "playing" | "finished";
export const zGamePhase = z.enum(["lobby", "setup", "playing", "finished"]);

export type GameState = {
    roomId: RoomId;
    phase: GamePhase;
    players: Player[];
    board: Card[];
};

export const zGameState = z.object({
    roomId: zRoomId,
    phase: zGamePhase,
    players: z.array(zPlayer),
    board: z.array(zCard),
}) satisfies z.ZodType<GameState>;
