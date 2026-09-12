/**
 * In-memory room store — a `Map<roomId, room>` as recommended for the first
 * version of multiplayer rooms. Rooms only need to exist while a session is
 * active, so nothing here is persisted.
 *
 * Kept behind this small module (rather than reaching into a bare Map from
 * everywhere) so it can later be swapped for a Redis/DB-backed store without
 * touching `roomService.js` or the websocket layer.
 */

const rooms = new Map();

const ROOM_ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O or 1/I
const ROOM_ID_LENGTH = 5;

export function normalizeRoomId(roomId) {
  return String(roomId ?? "").trim().toUpperCase();
}

/** Generates a unique `VL-XXXXX` room code, e.g. `VL-7K29Q`. */
export function generateRoomId() {
  let roomId;
  do {
    let code = "";
    for (let i = 0; i < ROOM_ID_LENGTH; i++) {
      code += ROOM_ID_ALPHABET[Math.floor(Math.random() * ROOM_ID_ALPHABET.length)];
    }
    roomId = `VL-${code}`;
  } while (rooms.has(roomId));
  return roomId;
}

export function getRoom(roomId) {
  return rooms.get(normalizeRoomId(roomId));
}

export function setRoom(roomId, room) {
  rooms.set(normalizeRoomId(roomId), room);
  return room;
}

export function deleteRoom(roomId) {
  rooms.delete(normalizeRoomId(roomId));
}

export function roomCount() {
  return rooms.size;
}
