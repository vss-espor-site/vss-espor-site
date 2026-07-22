"use client";

import { useEffect, useState } from "react";

type Tournament = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  status: string;
  maxParticipants: number | null;
  participants: unknown[];
};

export default function AdminTournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "", startDate: "", maxParticipants: "" });
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/tournaments");
    const data = await res.json();
    setTournaments(data.tournaments || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/tournaments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Hata olustu");
      return;
    }
    setForm({ title: "", description: "", startDate: "", maxParticipants: "" });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu turnuvayi silmek istedigine emin misin?")) return;
    await fetch("/api/tournaments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  async function handleStatusChange(id: string, status: string) {
    await fetch("/api/tournaments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold">Turnuva Yonetimi</h1>

      <form onSubmit={handleCreate} className="mb-8 grid gap-3 rounded-lg border border-bg-border bg-bg-card p-5 sm:grid-cols-2">
        <input
          required
          placeholder="Turnuva basligi"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="rounded-md border border-bg-border bg-bg-soft px-3 py-2 text-sm outline-none focus:border-neon-green sm:col-span-2"
        />
        <textarea
          required
          placeholder="Aciklama"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="rounded-md border border-bg-border bg-bg-soft px-3 py-2 text-sm outline-none focus:border-neon-green sm:col-span-2"
        />
        <input
          required
          type="datetime-local"
          value={form.startDate}
          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          className="rounded-md border border-bg-border bg-bg-soft px-3 py-2 text-sm outline-none focus:border-neon-green"
        />
        <input
          type="number"
          placeholder="Maks. katilimci (opsiyonel)"
          value={form.maxParticipants}
          onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })}
          className="rounded-md border border-bg-border bg-bg-soft px-3 py-2 text-sm outline-none focus:border-neon-green"
        />
        {error && <p className="text-sm text-red-400 sm:col-span-2">{error}</p>}
        <button
          type="submit"
          className="rounded-md bg-neon-green py-2 font-display font-bold text-black shadow-neon sm:col-span-2"
        >
          TURNUVA OLUSTUR
        </button>
      </form>

      {loading ? (
        <p className="text-neutral-500">Yukleniyor...</p>
      ) : (
        <div className="space-y-3">
          {tournaments.map((t) => (
            <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-bg-border bg-bg-card p-4">
              <div>
                <p className="font-display font-bold">{t.title}</p>
                <p className="text-xs text-neutral-500">
                  {new Date(t.startDate).toLocaleString("tr-TR")} — {t.participants.length}
                  {t.maxParticipants ? `/${t.maxParticipants}` : ""} katilimci
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={t.status}
                  onChange={(e) => handleStatusChange(t.id, e.target.value)}
                  className="rounded-md border border-bg-border bg-bg-soft px-2 py-1 text-xs"
                >
                  <option value="upcoming">Yaklasan</option>
                  <option value="active">Aktif</option>
                  <option value="completed">Tamamlandi</option>
                </select>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="rounded-md border border-red-800 px-3 py-1 text-xs text-red-400 hover:bg-red-950"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
