import { Server } from "socket.io";
import { registerRoomHandlers } from "./roomHandlers.js";

/**
 * Creates the Socket.IO server for multiplayer rooms.
 *
 * Authentication reuses the app's existing Firebase auth: the client sends
 * its Firebase ID token once at connect time (see useWebSocket.js), and
 * `verifyToken` (backed by firebase-admin) is the only source of truth for
 * who a connection belongs to. Nothing else the client sends is ever trusted
 * as an identity claim.
 */
export function createSocketServer(httpServer, { corsOrigin, verifyToken }) {
  const io = new Server(httpServer, {
    cors: { origin: corsOrigin },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) throw new Error("Authentication required.");
      const decoded = await verifyToken(token);
      socket.data.user = {
        uid: decoded.uid,
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
      };
      socket.data.roomId = null;
      next();
    } catch {
      next(new Error("UNAUTHENTICATED"));
    }
  });

  io.on("connection", (socket) => {
    registerRoomHandlers(io, socket);
  });

  return io;
}
