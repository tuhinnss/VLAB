"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../../../(core)/components/AuthProvider.jsx";
import { useRoom } from "../../../(core)/hooks/useRoom.js";
import { describeRoomError } from "../../../(core)/utils/roomErrors.js";

export default function JoinRoomPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { status, joinRoom } = useRoom(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (!user) {
      if (loading) setError("Signing you in — please try again in a moment.");
      else router.push("/signin");
      return;
    }
    if (!code.trim()) {
      setError("Enter a room ID.");
      return;
    }
    if (status !== "connected") {
      setError("Connecting to the multiplayer service — please try again in a moment.");
      return;
    }

    setBusy(true);
    try {
      const room = await joinRoom(code.trim());
      router.push(`/lab-with-friends/room/${room.roomId}`);
    } catch (submitError) {
      setError(describeRoomError(submitError));
      setBusy(false);
    }
  };

  return (
    <main className="friends-page">
      <section className="friends-panel">
        <Link className="friends-back" href="/lab-with-friends">
          Back to Lab with Friends
        </Link>
        <p className="friends-kicker">Join a collaboration</p>
        <h1>Join a Room</h1>
        {!loading && !user ? <p className="friends-note">Sign in is required to join a room.</p> : null}
        <form className="friends-form" onSubmit={submit}>
          <label>
            <span>Room ID</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="VL-7K29Q"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
            />
          </label>
          {error ? (
            <p className="friends-error" role="alert">
              {error}
            </p>
          ) : null}
          <button className="ph-btn ph-btn--primary friends-submit" disabled={busy || loading}>
            {busy ? "Joining..." : "Join Room"}
          </button>
        </form>
      </section>
    </main>
  );
}
