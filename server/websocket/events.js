/**
 * Multiplayer room event names, shared between the socket server and the
 * frontend hooks. Client -> server requests use an ack callback and resolve
 * with `{ ok: true, ...data }` or `{ ok: false, error: { code, message } }`.
 */
export const EVENTS = {
  // Client -> server
  CREATE_ROOM: "CREATE_ROOM",
  JOIN_ROOM: "JOIN_ROOM",
  LEAVE_ROOM: "LEAVE_ROOM",
  PLAYER_READY: "PLAYER_READY",
  START_SIMULATION: "START_SIMULATION",
  PLAYER_ACTION: "PLAYER_ACTION",
  CLOSE_ROOM: "CLOSE_ROOM",

  // Server -> client (broadcast)
  ROOM_STATE: "ROOM_STATE",
  PLAYER_JOINED: "PLAYER_JOINED",
  PLAYER_LEFT: "PLAYER_LEFT",
  SIMULATOR_STATE_UPDATE: "SIMULATOR_STATE_UPDATE",
  ROOM_CLOSED: "ROOM_CLOSED",
};
