"use client";

import { useEffect, useState } from "react";

type PlayerRow = {
  id: string;
  firstName: string;
  lastName: string;
  pubgId: string;
  email: string | null;
  vssStatus: string;
};

export default function AdminVssRequestsPage() {
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/vss-requests");
    const data = await res.json();
    setPlayers(data.players || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function act(playerId: string, action: "approve" | "reject") {
    setActingId(playerId);
    await fetch("/api/admin/vss-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId, action }),
    });
    setActingId(null);
    load();
  }

  const pending = players.filter((p) => p.vssStatus === "pending");
  const approved = players.filter((p) => p.vssStatus === "approved");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 font-display text-2xl font-bold">
        <span className="neon-text">VSS Ailesi</span> Istekleri
      </h1>

      {loading ? (
        <p className="text-neutral-500">Yukleniyor...</p>
      ) : (
        <>
          <h2 className="mb-3 font-hud text-sm uppercase tracking-wider text-neon-orange">
            Bekleyen Istekler ({pending.length})
          </h2>
          {pending.length === 0 ? (
            <p className="mb-8 text-neutral-500">Bekleyen istek yok.</p>
          ) : (
            <div className="mb-8 space-y-3">
              {pending.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border border-bg-border bg-bg-card p-4">
                  <div>
                    <p className="font-semibold">{p.firstName} {p.lastName}</p>
                    <p className="text-xs text-neutral-500">PUBG ID: {p.pubgId} · {p.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => act(p.id, "approve")}
                      disabled={actingId === p.id}
                      className="rounded-md bg-neon-green px-3 py-1.5 text-xs font-bold text-black disabled:opacity-50"
                    >
                      Onayla
                    </button>
                    <button
                      onClick={() => act(p.id, "reject")}
                      disabled={actingId === p.id}
                      className="rounded-md border border-neon-orange px-3 py-1.5 text-xs font-bold text-neon-orange disabled:opacity-50"
                    >
                      Reddet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2 className="mb-3 font-hud text-sm uppercase tracking-wider text-neon-green">
            Onayli Uyeler ({approved.length})
          </h2>
          {approved.length === 0 ? (
            <p className="text-neutral-500">Henuz onayli uye yok.</p>
          ) : (
            <div className="space-y-2">
              {approved.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border border-bg-border bg-bg-card p-3 text-sm">
                  <span>{p.firstName} {p.lastName} · {p.pubgId}</span>
                  <button
                    onClick={() => act(p.id, "reject")}
                    className="text-xs text-neon-orange underline"
                  >
                    Kaldir
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
