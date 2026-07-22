"use client";

import { useEffect, useState } from "react";

type Announcement = {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: string;
};

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", content: "", pinned: false });
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/announcements");
    const data = await res.json();
    setItems(data.announcements || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Hata olustu");
      return;
    }
    setForm({ title: "", content: "", pinned: false });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu duyuruyu silmek istedigine emin misin?")) return;
    await fetch("/api/announcements", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold">Duyuru Yonetimi</h1>

      <form onSubmit={handleCreate} className="mb-8 grid gap-3 rounded-lg border border-bg-border bg-bg-card p-5">
        <input
          required
          placeholder="Baslik"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="rounded-md border border-bg-border bg-bg-soft px-3 py-2 text-sm outline-none focus:border-neon-green"
        />
        <textarea
          required
          placeholder="Icerik"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="rounded-md border border-bg-border bg-bg-soft px-3 py-2 text-sm outline-none focus:border-neon-green"
        />
        <label className="flex items-center gap-2 text-sm text-neutral-400">
          <input
            type="checkbox"
            checked={form.pinned}
            onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
          />
          Sabitlensin (en ustte gorunur)
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          className="rounded-md bg-neon-green py-2 font-display font-bold text-black shadow-neon"
        >
          DUYURU YAYINLA
        </button>
      </form>

      {loading ? (
        <p className="text-neutral-500">Yukleniyor...</p>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a.id} className="flex items-start justify-between gap-4 rounded-lg border border-bg-border bg-bg-card p-4">
              <div>
                <p className="font-display font-bold">
                  {a.pinned && "📌 "}
                  {a.title}
                </p>
                <p className="mt-1 text-sm text-neutral-400">{a.content}</p>
              </div>
              <button
                onClick={() => handleDelete(a.id)}
                className="shrink-0 rounded-md border border-red-800 px-3 py-1 text-xs text-red-400 hover:bg-red-950"
              >
                Sil
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
