import dotenv from "dotenv";
import { createServer } from "node:http";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { createSocketServer } from "./websocket/socketServer.js";

dotenv.config({ path: ".env.local" });

const credential = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  ? cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON))
  : null;
if (!credential) {
  throw new Error("Set FIREBASE_SERVICE_ACCOUNT_JSON before starting the socket server.");
}

const adminApp = getApps().length ? getApps()[0] : initializeApp({ credential });
const auth = getAuth(adminApp);

const httpServer = createServer();
createSocketServer(httpServer, {
  corsOrigin: process.env.APP_ORIGIN || "http://localhost:3000",
  verifyToken: (token) => auth.verifyIdToken(token),
});

const port = Number(process.env.SOCKET_PORT || 3001);
httpServer.listen(port, () => console.log(`Multiplayer socket server listening on ${port}`));
