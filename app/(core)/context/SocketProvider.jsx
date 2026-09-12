"use client";

/**
 * Holds one authenticated Socket.IO connection for the whole app, shared via
 * context so navigating between "Lab with Friends" pages and a simulation
 * page reuses the same connection instead of reconnecting (and losing the
 * player's seat) on every page transition.
 *
 * The connection is created when a signed-in user shows up and torn down on
 * sign-out or actual disconnects (tab close, network loss) — genuine
 * disconnects, not in-app navigation.
 */

import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../components/AuthProvider.jsx";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

const SocketContext = createContext({ socket: null, status: "disconnected" });

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState("disconnected");

  useEffect(() => {
    if (!user) {
      setSocket(null);
      setStatus("disconnected");
      return undefined;
    }

    let cancelled = false;
    let instance;
    setStatus("connecting");

    user
      .getIdToken()
      .then((token) => {
        if (cancelled) return;
        instance = io(SOCKET_URL, { auth: { token }, reconnection: true });
        instance.on("connect", () => setStatus("connected"));
        instance.on("disconnect", () => setStatus("disconnected"));
        instance.on("connect_error", () => setStatus("error"));
        setSocket(instance);
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      instance?.disconnect();
      setSocket(null);
    };
  }, [user]);

  return <SocketContext.Provider value={{ socket, status }}>{children}</SocketContext.Provider>;
}

export function useSocketContext() {
  return useContext(SocketContext);
}
