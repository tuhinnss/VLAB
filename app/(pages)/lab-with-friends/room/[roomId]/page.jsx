"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";
import chapters from "../../../../(core)/data/chapters.js";
import { useAuth } from "../../../../(core)/components/AuthProvider.jsx";
import { useRoom } from "../../../../(core)/hooks/useRoom.js";
import { describeRoomError } from "../../../../(core)/utils/roomErrors.js";
import PlayerList from "../../../../(core)/components/multiplayer/PlayerList.jsx";

function simulatorName(simulatorId) {
  const chapter = chapters.find((c) => c.link.endsWith(`/${simulatorId}`));
  return chapter?.name || simulatorId;
}

export default function RoomLobbyPage() {
  const { roomId } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [copied, setCopied] = useState(false);
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);
  const [closedMessage, setClosedMessage] = useState("");

  const goToSimulation = ({ simulatorId, roomId: id }) =>
    router.replace(`/simulations/${simulatorId}?room=${id}`);

  const { room, status, error, setReady, startSimulation, leaveRoom, closeRoom } = useRoom(roomId, {
    onStartSimulation: goToSimulation,
    onRoomClosed: () => setClosedMessage("The host closed this room."),
  });

  // Covers refreshing the lobby after the simulation has already started.
  useEffect(() => {
    if (room?.simulationStarted && room.simulatorId) goToSimulation(room);
  }, [room]);

  if (!loading && !user) {
    router.replace("/signin");
    return <Message title="Sign in required" />;
  }

  if (closedMessage) {
    return (
      <Message title={closedMessage}>
        <Link className="ph-btn ph-btn--primary" href="/lab-with-friends">
          Back to Lab with Friends
        </Link>
      </Message>
    );
  }

  if (error) {
    return (
      <Message title={describeRoomError(error)}>
        <Link className="ph-btn ph-btn--primary" href="/lab-with-friends">
          Back to Lab with Friends
        </Link>
      </Message>
    );
  }

  if (!room) {
    return <Message title={status === "connecting" ? "Connecting..." : "Loading room..."} />;
  }

  const self = room.players.find((p) => p.userId === user?.uid);
  const isHost = self?.isHost || false;
  const connectedCount = room.players.filter((p) => p.connected).length;
  const canStart = connectedCount >= 2 && room.players.every((p) => !p.connected || p.isReady);

  const copyRoomId = async () => {
    try {
      await navigator.clipboard?.writeText(room.roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable — nothing useful to do, the ID is on screen either way.
    }
  };

  const toggleReady = async () => {
    setActionError("");
    try {
      await setReady(!self?.isReady);
    } catch (e) {
      setActionError(describeRoomError(e));
    }
  };

  const handleStart = async () => {
    setActionError("");
    setBusy(true);
    try {
      await startSimulation();
    } catch (e) {
      setActionError(describeRoomError(e));
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = async () => {
    await leaveRoom();
    router.push("/lab-with-friends");
  };

  const handleClose = async () => {
    setActionError("");
    setBusy(true);
    try {
      await closeRoom();
      router.push("/lab-with-friends");
    } catch (e) {
      setActionError(describeRoomError(e));
      setBusy(false);
    }
  };

  return (
    <main className="friends-page">
      <section className="friends-panel friends-lobby">
        <p className="friends-kicker">Room lobby</p>
        <h1>Lab with Friends</h1>

        <div className="friends-room-id">
          <div>
            <span className="friends-room-id-label">Room ID</span>
            <span className="friends-room-id-value">{room.roomId}</span>
          </div>
          <button className="ph-btn ph-btn--ghost friends-copy-btn" onClick={copyRoomId} type="button">
            <FontAwesomeIcon icon={copied ? faCheck : faCopy} /> {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="friends-section">
          <h2>Simulator</h2>
          <p>{simulatorName(room.simulatorId)}</p>
        </div>

        <div className="friends-section">
          <h2>
            Players ({room.players.length}/{room.maxPlayers})
          </h2>
          <PlayerList players={room.players} maxPlayers={room.maxPlayers} />
        </div>

        {actionError ? (
          <p className="friends-error" role="alert">
            {actionError}
          </p>
        ) : null}

        <div className="friends-lobby-actions">
          <button className="ph-btn ph-btn--ghost" onClick={toggleReady} disabled={status !== "connected"}>
            {self?.isReady ? "Not Ready" : "Ready"}
          </button>
          {isHost ? (
            <button
              className="ph-btn ph-btn--primary"
              onClick={handleStart}
              disabled={busy || !canStart || status !== "connected"}
            >
              Start Simulation
            </button>
          ) : null}
          <button className="ph-btn ph-btn--ghost" onClick={handleLeave}>
            Leave Room
          </button>
          {isHost ? (
            <button className="ph-btn ph-btn--ghost friends-btn--danger" onClick={handleClose} disabled={busy}>
              Close Room
            </button>
          ) : null}
        </div>

        {isHost && !canStart ? (
          <p className="friends-note">Waiting for everyone to be ready (at least 2 players)...</p>
        ) : null}
      </section>
    </main>
  );
}

function Message({ title, children }) {
  return (
    <main className="friends-page">
      <section className="friends-panel">
        <h1>{title}</h1>
        {children || (
          <Link className="ph-btn ph-btn--ghost" href="/lab-with-friends">
            Back
          </Link>
        )}
      </section>
    </main>
  );
}
