import { ROOM_ID_MIN_LEN, ROOM_ID_MAX_LEN, ROOM_ID_RE } from "@spyrooms/protocol";

export const ROOM_WS_PREFIX = "room";

export function getRoomIdFromPath(pathname: string): string | null {
    // Expected: /room/<roomId>
    // Split carefully to avoid empty segments.
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length !== 2) return null;
    if (parts[0] !== ROOM_WS_PREFIX) return null;
    return parts[1];
}

export function isValidRoomId(roomId: string): boolean {
    if (roomId.length < ROOM_ID_MIN_LEN || roomId.length > ROOM_ID_MAX_LEN) return false;
    return ROOM_ID_RE.test(roomId);
}
