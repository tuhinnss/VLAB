"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown } from "@fortawesome/free-solid-svg-icons";

/**
 * Real-time player roster for a room lobby: connection dot, host crown,
 * ready state. `players` is the server's authoritative list (from
 * ROOM_STATE) — nothing here is computed locally.
 */
export default function PlayerList({ players, maxPlayers }) {
  return (
    <ul className="friends-players">
      {players.map((player) => (
        <li className="friends-player" key={player.userId}>
          <span
            className={`friends-player-dot ${player.connected ? "friends-player-dot--connected" : ""}`}
            aria-hidden="true"
          />
          {player.photoURL ? (
            <img className="friends-player-avatar" src={player.photoURL} alt="" />
          ) : (
            <span className="friends-player-avatar friends-player-avatar--placeholder">
              {player.displayName?.charAt(0).toUpperCase() || "?"}
            </span>
          )}
          <span className="friends-player-name">{player.displayName}</span>
          {player.isHost ? (
            <span className="friends-player-badge friends-player-badge--host">
              <FontAwesomeIcon icon={faCrown} /> Host
            </span>
          ) : null}
          <span
            className={`friends-player-badge ${
              player.isReady ? "friends-player-badge--ready" : "friends-player-badge--waiting"
            }`}
          >
            {player.isReady ? "Ready" : "Not ready"}
          </span>
        </li>
      ))}
      {Array.from({ length: Math.max(maxPlayers - players.length, 0) }).map((_, index) => (
        <li className="friends-player friends-player--empty" key={`empty-${index}`}>
          Waiting for players...
        </li>
      ))}
    </ul>
  );
}
