import { EVENTS } from "./events.js";
import * as roomService from "../rooms/roomService.js";

function ack(callback, payload) {
  if (typeof callback === "function") callback(payload);
}

function errorPayload(error) {
  if (error instanceof roomService.RoomError) {
    return { code: error.code, message: error.message };
  }
  console.error("[rooms] unexpected error:", error);
  return { code: "INTERNAL_ERROR", message: "Something went wrong. Please try again." };
}

/**
 * Wires one connected, authenticated socket to the room service. `socket.data.user`
 * is set by the auth middleware in socketServer.js from a verified Firebase ID
 * token — every handler below trusts that and nothing the client sends about
 * its own identity.
 */
export function registerRoomHandlers(io, socket) {
  const user = socket.data.user;

  function broadcastRoomState(room) {
    io.to(room.roomId).emit(EVENTS.ROOM_STATE, roomService.toPublicRoom(room));
  }

  /** Leaves whatever room this socket is currently in, if any. */
  function leaveCurrentRoom() {
    const roomId = socket.data.roomId;
    if (!roomId) return;
    socket.data.roomId = null;
    socket.leave(roomId);

    const { room, closed } = roomService.leaveRoom({ roomId, uid: user.uid });
    if (closed || !room) return;
    broadcastRoomState(room);
    io.to(roomId).emit(EVENTS.PLAYER_LEFT, { userId: user.uid });
  }

  socket.on(EVENTS.CREATE_ROOM, ({ simulatorId } = {}, callback) => {
    try {
      const room = roomService.createRoom({ user, simulatorId, socketId: socket.id });
      socket.data.roomId = room.roomId;
      socket.join(room.roomId);
      ack(callback, { ok: true, room: roomService.toPublicRoom(room) });
    } catch (error) {
      ack(callback, { ok: false, error: errorPayload(error) });
    }
  });

  socket.on(EVENTS.JOIN_ROOM, ({ roomId } = {}, callback) => {
    try {
      const room = roomService.joinRoom({ user, roomId, socketId: socket.id });
      socket.data.roomId = room.roomId;
      socket.join(room.roomId);
      ack(callback, { ok: true, room: roomService.toPublicRoom(room) });
      broadcastRoomState(room);
      socket.to(room.roomId).emit(EVENTS.PLAYER_JOINED, { userId: user.uid });
    } catch (error) {
      ack(callback, { ok: false, error: errorPayload(error) });
    }
  });

  socket.on(EVENTS.LEAVE_ROOM, (_payload, callback) => {
    leaveCurrentRoom();
    ack(callback, { ok: true });
  });

  socket.on(EVENTS.PLAYER_READY, ({ isReady } = {}, callback) => {
    try {
      const room = roomService.setPlayerReady({ roomId: socket.data.roomId, uid: user.uid, isReady });
      ack(callback, { ok: true, room: roomService.toPublicRoom(room) });
      broadcastRoomState(room);
    } catch (error) {
      ack(callback, { ok: false, error: errorPayload(error) });
    }
  });

  socket.on(EVENTS.START_SIMULATION, (_payload, callback) => {
    try {
      const room = roomService.startSimulation({ roomId: socket.data.roomId, uid: user.uid });
      ack(callback, { ok: true, room: roomService.toPublicRoom(room) });
      broadcastRoomState(room);
      io.to(room.roomId).emit(EVENTS.START_SIMULATION, { roomId: room.roomId, simulatorId: room.simulatorId });
    } catch (error) {
      ack(callback, { ok: false, error: errorPayload(error) });
    }
  });

  socket.on(EVENTS.PLAYER_ACTION, ({ action } = {}, callback) => {
    try {
      const room = roomService.applyPlayerAction({ roomId: socket.data.roomId, uid: user.uid, action });
      ack(callback, { ok: true });
      // Broadcast to everyone else — the sender already applied it locally.
      socket.to(room.roomId).emit(EVENTS.SIMULATOR_STATE_UPDATE, { action, playerId: user.uid });
    } catch (error) {
      ack(callback, { ok: false, error: errorPayload(error) });
    }
  });

  socket.on(EVENTS.CLOSE_ROOM, (_payload, callback) => {
    try {
      const room = roomService.closeRoom({ roomId: socket.data.roomId, uid: user.uid });
      ack(callback, { ok: true });
      io.to(room.roomId).emit(EVENTS.ROOM_CLOSED, { roomId: room.roomId });
      io.in(room.roomId).socketsLeave(room.roomId);
    } catch (error) {
      ack(callback, { ok: false, error: errorPayload(error) });
    }
  });

  socket.on("disconnect", leaveCurrentRoom);
}
