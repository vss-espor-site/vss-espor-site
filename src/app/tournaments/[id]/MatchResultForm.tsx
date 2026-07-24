"use client";

import { useState } from "react";

async function resizeImage(file: File, maxWidth = 900, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("canvas error");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function MatchResultForm({ tournamentId }: { tournamentId: string }) {
  const [teamName, setTeamName] = useState("");
  const [placement, setPlacement] = useState("");
  const [killCount, setKillCount] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!teamName.trim() || !placement || !killCount || !file) {
      setMsg({ type: "err", text: "Lütfen tüm alanları doldur ve ekran görüntüsü ekle." });
      return;
    }
    setLoading(true);
    try {
      const screenshot = await resizeImage(file);
      const res = await fetch(`/api/tournaments/${tournamentId}/match-result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: teamName.trim(),
          placement: parseInt(placement, 10),
          killCount: parseInt(killCount, 10),
          screenshot,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: "err", text: data.error || "Bir hata oluştu." });
        return;
      }
      setMsg({ type: "ok", text: "Maç sonucun puan tablosuna eklendi!" });
      setTeamName("");
      setPlacement("");
      setKillCount("");
      setFile(null);
    } catch {
      setMsg({ type: "err", text: "Bağlantı hatası, tekrar dene." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="hud-panel flex flex-col gap-3 p-5">
      <h3 className="font-display text-lg font-bold">Maç Sonucu Ekle</h3>
      <input
        required
        placeholder="Takım Adı"
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        className="rounded-sm border border-bg-border bg-bg-soft px-3 py-2 text-sm outline-none focus:border-neon-green"
      />
      <div className="flex gap-3">
        <input
          required
          type="number"
          min={1}
          max={20}
          placeholder="Sıralama (ör: 1)"
          value={placement}
          onChange={(e) => setPlacement(e.target.value)}
          className="w-1/2 rounded-sm border border-bg-border bg-bg-soft px-3 py-2 text-sm outline-none focus:border-neon-green"
        />
        <input
          required
          type="number"
          min={0}
          placeholder="Kill Sayısı"
          value={killCount}
          onChange={(e) => setKillCount(e.target.value)}
          className="w-1/2 rounded-sm border border-bg-border bg-bg-soft px-3 py-2 text-sm outline-none focus:border-neon-green"
        />
      </div>
      <input
        required
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="text-sm text-neutral-400"
      />
      {msg && (
        <p className={`text-sm ${msg.type === "ok" ? "text-neon-green" : "text-red-400"}`}>{msg.text}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="rounded-sm bg-neon-green px-5 py-2 font-hud text-sm font-bold uppercase tracking-wider text-black shadow-neon disabled:opacity-50"
      >
        {loading ? "Gönderiliyor..." : "Sonucu Gönder"}
      </button>
    </form>
  );
}
