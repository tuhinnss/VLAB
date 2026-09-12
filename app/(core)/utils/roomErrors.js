/** Human-readable copy for the room error codes the socket server returns. */
const MESSAGES = {
  ROOM_NOT_FOUND: "We couldn't find a room with that ID. Double-check the code and try again.",
  ROOM_FULL: "That room is already full (4/4 players).",
  SIMULATION_ALREADY_STARTED: "That room's simulation has already started.",
  NOT_HOST: "Only the host can do that.",
  NOT_ROOM_MEMBER: "You're not a member of this room.",
  NOT_ENOUGH_PLAYERS: "At least 2 players are needed to start.",
  PLAYERS_NOT_READY: "Everyone needs to be ready before starting.",
  INVALID_SIMULATOR: "Please choose a valid simulator.",
  INVALID_ACTION: "That action couldn't be applied.",
  NOT_CONNECTED: "Not connected to the multiplayer service. Check your connection and try again.",
  UNAUTHENTICATED: "Please sign in to use Lab with Friends.",
};

export function describeRoomError(error) {
  if (!error) return "";
  return MESSAGES[error.code] || error.message || "Something went wrong. Please try again.";
}
