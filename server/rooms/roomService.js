import { getRoom, setRoom, deleteRoom, generateRoomId } from "./roomStore.js";
import { isValidSimulatorId, MAX_PLAYERS, MIN_PLAYERS_TO_START } from "./roomValidation.js";

/**
 * The room/player business logic. Everything here is server-authoritative:
 * the websocket layer only calls into this module with the *verified*
 * Firebase user for the connection — never with data the client claims about
 * itself or anyone else.
 */

export class RoomError extends Error {
  constructor(code, message) {
    super(message || code);
    this.code = code;
  }
}

function displayNameFor(user) {
  return user.name || (user.email ? user.email.split("@")[0] : "Player");
}

function playerFromUser(user, socketId) {
  return {
    userId: user.uid,
    displayName: displayNameFor(user),
    photoURL: user.picture || null,
    socketId,
    isHost: false,
    isReady: false,
    connected: true,
  };
}

/** Strips server-only fields (socketId) before a room is sent to clients. */
export function toPublicRoom(room) {
  if (!room) return null;
  return {
    roomId: room.roomId,
    hostId: room.hostId,
    simulatorId: room.simulatorId,
    createdAt: room.createdAt,
    status: room.status,
    maxPlayers: room.maxPlayers,
    simulationStarted: room.simulationStarted,
    // eslint-disable-next-line no-unused-vars -- destructured out to strip the server-only field
    players: room.players.map(({ socketId, ...player }) => player),
  };
}

export function createRoom({ user, simulatorId, socketId }) {
  if (!isValidSimulatorId(simulatorId)) {
    throw new RoomError("INVALID_SIMULATOR", "Please choose a valid simulator.");
  }

  const host = playerFromUser(user, socketId);
  host.isHost = true;

  const room = {
    roomId: generateRoomId(),
    hostId: user.uid,
    simulatorId,
    createdAt: Date.now(),
    status: "lobby", // lobby | active | closed
    maxPlayers: MAX_PLAYERS,
    simulationStarted: false,
    simulatorState: {}, // last known value per synced parameter, for late (re)joiners
    players: [host],
  };

  setRoom(room.roomId, room);
  return room;
}

/**
 * Adds `user` to the room, or — if they are already a member (a page
 * navigation or a reconnect after a dropped connection) — just re-attaches
 * their new socket id. This is what makes reconnection and in-app navigation
 * between the lobby and the simulation page work without losing a seat.
 */
export function joinRoom({ user, roomId, socketId }) {
  const room = getRoom(roomId);
  if (!room || room.status === "closed") {
    throw new RoomError("ROOM_NOT_FOUND", "That room doesn't exist or has closed.");
  }

  const existing = room.players.find((player) => player.userId === user.uid);
  if (existing) {
    existing.socketId = socketId;
    existing.connected = true;
    return room;
  }

  if (room.simulationStarted) {
    throw new RoomError("SIMULATION_ALREADY_STARTED", "This room's simulation has already started.");
  }
  if (room.players.length >= room.maxPlayers) {
    throw new RoomError("ROOM_FULL", "This room is full.");
  }

  room.players.push(playerFromUser(user, socketId));
  return room;
}

export function setPlayerReady({ roomId, uid, isReady }) {
  const room = requireRoom(roomId);
  const player = requireMember(room, uid);
  player.isReady = Boolean(isReady);
  return room;
}

export function startSimulation({ roomId, uid }) {
  const room = requireRoom(roomId);
  if (room.hostId !== uid) {
    throw new RoomError("NOT_HOST", "Only the host can start the simulation.");
  }
  if (room.simulationStarted) {
    throw new RoomError("SIMULATION_ALREADY_STARTED", "The simulation has already started.");
  }

  const connectedPlayers = room.players.filter((player) => player.connected);
  if (connectedPlayers.length < MIN_PLAYERS_TO_START) {
    throw new RoomError("NOT_ENOUGH_PLAYERS", `At least ${MIN_PLAYERS_TO_START} players are needed to start.`);
  }
  if (!connectedPlayers.every((player) => player.isReady)) {
    throw new RoomError("PLAYERS_NOT_READY", "Everyone needs to be ready first.");
  }

  room.simulationStarted = true;
  room.status = "active";
  return room;
}

/**
 * Validates and applies one PLAYER_ACTION. Actions are intentionally
 * open-shaped so new simulators can introduce new action types later; the
 * only thing enforced here is that the sender is really a room member and
 * the action has a `type`. `{ parameter, value }` actions are additionally
 * cached on the room so a client that (re)joins mid-session can catch up.
 */
export function applyPlayerAction({ roomId, uid, action }) {
  const room = requireRoom(roomId);
  requireMember(room, uid);

  if (!action || typeof action.type !== "string") {
    throw new RoomError("INVALID_ACTION", "Invalid action payload.");
  }
  if (typeof action.parameter === "string") {
    room.simulatorState[action.parameter] = action.value;
  }

  return room;
}

export function closeRoom({ roomId, uid }) {
  const room = requireRoom(roomId);
  if (room.hostId !== uid) {
    throw new RoomError("NOT_HOST", "Only the host can close the room.");
  }
  deleteRoom(roomId);
  return room;
}

/**
 * Removes `uid` from the room — used for both an explicit LEAVE_ROOM and a
 * socket disconnect (tab closed, network drop). Migrates the host and
 * deletes the room once it's empty so rooms never linger in memory.
 */
export function leaveRoom({ roomId, uid }) {
  const room = getRoom(roomId);
  if (!room) return { room: null, closed: true };

  const index = room.players.findIndex((player) => player.userId === uid);
  if (index === -1) return { room, closed: false };

  room.players.splice(index, 1);

  if (room.players.length === 0) {
    deleteRoom(roomId);
    return { room: null, closed: true };
  }

  if (room.hostId === uid) {
    const nextHost = room.players.find((player) => player.connected) || room.players[0];
    room.players.forEach((player) => {
      player.isHost = player.userId === nextHost.userId;
    });
    room.hostId = nextHost.userId;
  }

  return { room, closed: false };
}

function requireRoom(roomId) {
  const room = getRoom(roomId);
  if (!room) throw new RoomError("ROOM_NOT_FOUND", "That room doesn't exist or has closed.");
  return room;
}

function requireMember(room, uid) {
  const player = room.players.find((p) => p.userId === uid);
  if (!player) throw new RoomError("NOT_ROOM_MEMBER", "You are not a member of this room.");
  return player;
}
