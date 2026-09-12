"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import chapters from "../../../(core)/data/chapters.js";
import { RETAINED_SIMULATION_LINKS } from "../../../(core)/data/retainedSimulations.js";
import { useAuth } from "../../../(core)/components/AuthProvider.jsx";
import { useRoom } from "../../../(core)/hooks/useRoom.js";
import { describeRoomError } from "../../../(core)/utils/roomErrors.js";

const retainedLinks = new Set(RETAINED_SIMULATION_LINKS);
const simulations = chapters.filter((chapter) => retainedLinks.has(chapter.link));

export default function CreateRoomPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { status, createRoom } = useRoom(null);
  const [simulatorId, setSimulatorId] = useState(simulations[0]?.link.split("/").pop() || "");
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
    if (status !== "connected") {
      setError("Connecting to the multiplayer service — please try again in a moment.");
      return;
    }

    setBusy(true);
    try {
      const room = await createRoom(simulatorId);
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
        <p className="friends-kicker">New collaboration</p>
        <h1>Create a Room</h1>
        {!loading && !user ? <p className="friends-note">Sign in is required to host a room.</p> : null}
        <form className="friends-form" onSubmit={submit}>
          <label>
            <span>Select Simulator</span>
            <select value={simulatorId} onChange={(e) => setSimulatorId(e.target.value)}>
              {simulations.map((item) => {
                const id = item.link.split("/").pop();
                return (
                  <option key={id} value={id}>
                    {item.name}
                  </option>
                );
              })}
            </select>
          </label>
          {error ? (
            <p className="friends-error" role="alert">
              {error}
            </p>
          ) : null}
          <button className="ph-btn ph-btn--primary friends-submit" disabled={busy || loading}>
            {busy ? "Creating..." : "Create Room"}
          </button>
        </form>
      </section>
    </main>
  );
}
