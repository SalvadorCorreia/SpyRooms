import { z } from "zod";

/**
 * Canonical ID policies shared across router + protocol validation.
 *
 * NOTE:
 * - These schemas validate the *string form*.
 * - Branding (RoomId / PlayerId) is compile-time only in your current setup.
 * - Keep regexes non-global so RegExp.test() is safe.
 */

/* ----------------------------- Room IDs ----------------------------- */

export const ROOM_ID_MIN_LEN = 1;
export const ROOM_ID_MAX_LEN = 16;
export const ROOM_ID_RE = /^[a-z0-9-]+$/;

export const zRoomIdString = z
	.string()
	.trim()
	.min(ROOM_ID_MIN_LEN)
	.max(ROOM_ID_MAX_LEN)
	.regex(ROOM_ID_RE, "Invalid room id format (expected lowercase a-z, 0-9, '-')");

/* ---------------------------- Player IDs ---------------------------- */
/**
 * Player IDs are server-generated; they don’t need to be human-friendly.
 * Keep them URL-safe and reasonably short.
 *
 * If you generate them as UUIDs later, you can update this policy without touching
 * router code (router shouldn’t accept PlayerId directly anyway).
 */
export const PLAYER_ID_MIN_LEN = 1;
export const PLAYER_ID_MAX_LEN = 64;
// Conservative URL-safe charset (base64url-ish without padding)
export const PLAYER_ID_RE = /^[A-Za-z0-9_-]+$/;

export const zPlayerIdString = z
	.string()
	.min(PLAYER_ID_MIN_LEN)
	.max(PLAYER_ID_MAX_LEN)
	.regex(PLAYER_ID_RE, "Invalid player id format");
