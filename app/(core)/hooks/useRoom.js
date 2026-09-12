"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWebSocket } from "./useWebSocket.js";
import { EVENTS } from "../../../server/websocket/events.js";

function request(socket, event, payload = {}) {
  return new Promise((resolve, reject) => {
    if (!socket?.connected) {
      reject(Object.assign(new Error("Not connected to the multiplayer service."), { code: "NOT_CONNECTED" }));
      return;
    }
    socket.emit(event, payload, (response) => {
      if (response?.ok) resolve(response);
      else reject(Object.assign(new Error(response?.error?.message || "Request failed."), { code: response?.error?.code }));
    });
  });
}

/**
 * Multiplayer room state + actions for the current user.
 *
 * Pass `roomId: null` to just get a bare connection for creating a room
 * (before one exists). Pass a real `roomId` and this joins (or rejoins) it
 * automatically whenever the shared socket is connected, and keeps `room` in
 * sync with the server's ROOM_STATE broadcasts — the server is the single
 * source of truth, so this never merges state locally.
 */
export function useRoom(roomId, { onSimulatorStateUpdate, onStartSimulation, onRoomClosed } = {}) {
  const { socket, status } = useWebSocket();
  const [room, setRoom] = useState(null);
  const [error, setError] = useState(null);
  const callbacksRef = useRef({});
  callbacksRef.current = { onSimulatorStateUpdate, onStartSimulation, onRoomClosed };

  useEffect(() => {
    if (!socket || !roomId) return undefined;
    let cancelled = false;

    const join = () => {
      request(socket, EVENTS.JOIN_ROOM, { roomId })
        .then(({ room: nextRoom }) => {
          if (cancelled) return;
          setRoom(nextRoom);
          setError(null);
        })
        .catch((err) => {
          if (cancelled) return;
          setError({ code: err.code, message: err.message });
        });
    };

    if (socket.connected) join();
    socket.on("connect", join);

    return () => {
      cancelled = true;
      socket.off("connect", join);
    };
  }, [socket, roomId]);

  useEffect(() => {
    if (!socket) return undefined;

    const handleRoomState = (nextRoom) => setRoom(nextRoom);
    const handleClosed = (payload) => {
      setRoom(null);
      callbacksRef.current.onRoomClosed?.(payload);
    };
    const handleStart = (payload) => callbacksRef.current.onStartSimulation?.(payload);
    const handleSimulatorState = (payload) => callbacksRef.current.onSimulatorStateUpdate?.(payload);

    socket.on(EVENTS.ROOM_STATE, handleRoomState);
    socket.on(EVENTS.ROOM_CLOSED, handleClosed);
    socket.on(EVENTS.START_SIMULATION, handleStart);
    socket.on(EVENTS.SIMULATOR_STATE_UPDATE, handleSimulatorState);

    return () => {
      socket.off(EVENTS.ROOM_STATE, handleRoomState);
      socket.off(EVENTS.ROOM_CLOSED, handleClosed);
      socket.off(EVENTS.START_SIMULATION, handleStart);
      socket.off(EVENTS.SIMULATOR_STATE_UPDATE, handleSimulatorState);
    };
  }, [socket]);

  const createRoom = useCallback(
    (simulatorId) =>
      request(socket, EVENTS.CREATE_ROOM, { simulatorId }).then(({ room: newRoom }) => {
        setRoom(newRoom);
        return newRoom;
      }),
    [socket]
  );

  const joinRoom = useCallback(
    (targetRoomId) =>
      request(socket, EVENTS.JOIN_ROOM, { roomId: targetRoomId }).then(({ room: joinedRoom }) => {
        setRoom(joinedRoom);
        return joinedRoom;
      }),
    [socket]
  );

  const setReady = useCallback((isReady) => request(socket, EVENTS.PLAYER_READY, { isReady }), [socket]);
  const startSimulation = useCallback(() => request(socket, EVENTS.START_SIMULATION), [socket]);
  const sendPlayerAction = useCallback((action) => request(socket, EVENTS.PLAYER_ACTION, { action }), [socket]);
  const closeRoom = useCallback(() => request(socket, EVENTS.CLOSE_ROOM), [socket]);
  const leaveRoom = useCallback(() => request(socket, EVENTS.LEAVE_ROOM).catch(() => {}), [socket]);

  return {
    room,
    status,
    error,
    createRoom,
    joinRoom,
    setReady,
    startSimulation,
    sendPlayerAction,
    closeRoom,
    leaveRoom,
  };
}
