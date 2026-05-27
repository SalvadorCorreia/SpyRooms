import { ROOM_ID_MAX_LEN, ROOM_ID_MIN_LEN, ROOM_ID_RE } from "@spyrooms/protocol";

/**
 * Canonical room route prefix.
 * Room routes are always: /room/:roomId
 */
export const ROOM_ROUTE_PREFIX = "room";

/**
 * Extracts a roomId from a pathname if it matches `/room/:roomId`.
 *
 * Examples:
 * - "/room/abc"        -> "abc"
 * - "/room/abc/extra"  -> null
 * - "/"                -> null
 */
export function getRoomIdFromPath(pathname: string): string | null {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length !== 2) return null;
    if (parts[0] !== ROOM_ROUTE_PREFIX) return null;
    return parts[1];
}

/**
 * Validates the *string form* of a room id using the shared protocol policy.
 *
 * Keep this function purely about the URL segment.
 * Any "room exists" semantics should live in the Durable Object (storage), not here.
 */
export function isValidRoomId(roomId: string): boolean {
    if (roomId.length < ROOM_ID_MIN_LEN || roomId.length > ROOM_ID_MAX_LEN) return false;
    return ROOM_ID_RE.test(roomId);
}
