"use client";

import { useState } from "react";

export default function JoinTournamentForm({
  tournamentId,
  full,
}: {
  tournamentId: string;
  full: boolean;
}) {
  const [pubgId, setPubgId] = useState("");
  const [status, setStatus] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pubgId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: "err", msg: data.error || "Bir hata olustu." });
        return;
      }
      setStatus({ type: "ok", msg: "Turnuvaya basariyla katildin!" });
      setPubgId("");
    } catch {
      setStatus({ type: "err", msg: "Baglanti hatasi." });
    } finally {
      setLoading(false);
    }
  }

  if (full) {
    return (
      <p className="rounded-md border border-bg-border bg-bg-card px-4 py-3 text-sm text-neutral-400">
        Bu turnuvanin kontenjani dolmustur.
      </p>
    );
  }

  return (
    <form onSubmit={handleJoin} className="flex flex-col gap-3 rounded-lg border border-bg-border bg-bg-card p-5 sm:flex-row">
      <input
        required
        placeholder="PUBG ID'ni gir (once kayit olmalisin)"
        value={pubgId}
        onChange={(e) => setPubgId(e.target.value)}
        className="flex-1 rounded-md border border-bg-border bg-bg-soft px-3 py-2 text-sm outline-none focus:border-neon-green"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-neon-green px-5 py-2 font-display font-bold text-black shadow-neon disabled:opacity-50"
      >
        {loading ? "..." : "Turnuvaya Katil"}
      </button>
      {status && (
        <p className={`text-sm sm:ml-2 sm:self-center ${status.type === "ok" ? "text-neon-green" : "text-red-400"}`}>
          {status.msg}
        </p>
      )}
    </form>
  );
}
