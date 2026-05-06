export type {
	RoomId,
	PlayerId,
	Team,
	Role,
	ClientMessage,
	ServerMessage,
} from "./messages.ts";

export type {
	Player,
	Card,
	CardKind,
	GameState,
	GamePhase,
} from "./domain.ts";

export { zTeam, zRole, zPlayer, zCard, zGameState, zGamePhase, zCardKind } from "./domain.ts";

export { zClientMessage } from "./schema.ts";
export type { ClientMessageParsed } from "./schema.ts";
