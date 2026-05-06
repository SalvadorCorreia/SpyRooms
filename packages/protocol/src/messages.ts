/**
 * Shared wire protocol between client and server.
 *
 * Conventions:
 * - Every message must have a `type` discriminant.
 * - Messages are JSON-serializable.
 * - Client -> Server messages are treated as untrusted input and must be validated at runtime.
 */

/** Branded string types help prevent accidental mixing of IDs. */
export type RoomId = string & { readonly __brand: "RoomId" };
export type PlayerId = string & { readonly __brand: "PlayerId" };

export type Team = "red" | "blue";
export type Role = "spymaster" | "guesser" | "spectator";

/** Client -> Server 
 * The ClientMessage represents the "intent payload"
 */

export type ClientMessage =
	| {
			type: "join_room";
			roomId: string; // server validates and coerces to RoomId internally
	  }
	| {
			type: "set_name";
			name: string;
	  }
	| {
			type: "select_role";
			team: Team;
			role: Exclude<Role, "spectator">;
	  }
	| {
			type: "leave_room";
	  }
	| {
			type: "ping";
			nonce: string;
	  };

/** Server -> Client */
export type ServerMessage =
	| {
			type: "room_state";
			roomId: string;
			you: {
				playerId: string;
				name: string;
				team: Team | null;
				role: Role;
			};
			players: Array<{
				playerId: string;
				name: string;
				team: Team | null;
				role: Role;
				connected: boolean;
			}>;
	  }
	| {
			type: "presence_update";
			players: Array<{
				playerId: string;
				connected: boolean;
			}>;
	  }
	| {
			type: "pong";
			nonce: string;
	  }
	| {
			type: "error";
			code:
				| "invalid_message"
				| "invalid_room"
				| "not_in_room"
				| "unauthorized"
				| "internal";
			message: string;
	  };
