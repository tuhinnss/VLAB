"use client";

import { useSocketContext } from "../context/SocketProvider.jsx";

/**
 * The app's shared multiplayer socket connection: `{ socket, status }`.
 * `status` is one of "disconnected" | "connecting" | "connected" | "error".
 * Use `useRoom` for anything room-specific — this is the low-level piece.
 */
export function useWebSocket() {
  return useSocketContext();
}
