"use client";

import { useEffect, useState } from "react";

type Player = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  ageGroup: string;
  pubgId: string;
  community: string;
};

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/players");
    const data = await res.json();
    setPlayers(data.players || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Bu oyuncuyu silmek istedigine emin misin?")) return;
    await fetch("/api/players", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold">Oyuncu Yonetimi</h1>
      {loading ? (
        <p className="text-neutral-500">Yukleniyor...</p>
      ) : players.length === 0 ? (
        <p className="text-neutral-500">Henuz kayitli oyuncu yok.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-bg-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg-soft text-neutral-400">
              <tr>
                <th className="px-4 py-3">Ad Soyad</th>
                <th className="px-4 py-3">Yas</th>
                <th className="px-4 py-3">Grup</th>
                <th className="px-4 py-3">PUBG ID</th>
                <th className="px-4 py-3">Topluluk</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => (
                <tr key={p.id} className="border-t border-bg-border">
                  <td className="px-4 py-3">
                    {p.firstName} {p.lastName}
                  </td>
                  <td className="px-4 py-3">{p.age}</td>
                  <td className="px-4 py-3 text-neon-yellow">{p.ageGroup}</td>
                  <td className="px-4 py-3">{p.pubgId}</td>
                  <td className="px-4 py-3 capitalize">{p.community}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="rounded-md border border-red-800 px-3 py-1 text-xs text-red-400 hover:bg-red-950"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
