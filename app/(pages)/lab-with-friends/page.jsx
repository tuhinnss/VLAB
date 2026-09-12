"use client";
import Link from "next/link";
export default function LabWithFriendsPage() {
  return <main className="friends-page friends-page--landing"><section className="friends-landing"><p className="friends-kicker">Collaborative experiments</p><h1>Lab with Friends</h1><p>Perform virtual lab experiments together with your friends in real time.</p><div className="friends-actions"><Link className="ph-btn ph-btn--primary" href="/lab-with-friends/create">Create Room</Link><Link className="ph-btn ph-btn--ghost" href="/lab-with-friends/join">Join Room</Link></div></section></main>;
}
