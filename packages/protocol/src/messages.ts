/** Shared wire protocol types used by client and server messages. */
export type RoomId = string & { readonly __brand: "RoomId" };
export type PlayerId = string & { readonly __brand: "PlayerId" };

/** Team assignment used by game entities and role selection. */
export type Team = "red" | "blue";
/** Role assignment supported by the game. */
export type Role = "spymaster" | "guesser" | "spectator";

/** Union of intents sent from client to server. */
export type ClientMessage =
	| {
			type: "join_room";
			roomId: string;
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

/** Union of events emitted from server to client. */
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
