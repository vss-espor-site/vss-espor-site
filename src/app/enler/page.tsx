"use client";

import { useEffect, useState, useCallback } from "react";

type MapId = "erangel" | "miramar" | "sanhok";

const MAPS: { id: MapId; label: string }[] = [
  { id: "erangel", label: "Erangel" },
  { id: "miramar", label: "Miramar" },
  { id: "sanhok", label: "Sanhok" },
];

type LeaderRow = {
  id: string;
  pubgId: string;
  instagram: string;
  killCount: number;
  screenshot: string;
};

const TR_MONTHS = [
  "Ocak", "Subat", "Mart", "Nisan", "Mayis", "Haziran",
  "Temmuz", "Agustos", "Eylul", "Ekim", "Kasim", "Aralik",
];

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [y, m] = key.split("-");
  return `${TR_MONTHS[parseInt(m, 10) - 1]} ${y}`;
}

function lastMonths(count: number): string[] {
  const arr: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    arr.push(monthKey(d));
  }
  return arr;
}

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

export default function EnlerPage() {
  const [activeMap, setActiveMap] = useState<MapId>("erangel");
  const months = lastMonths(12);
  const [selectedMonth, setSelectedMonth] = useState(months[0]);

  const [top3, setTop3] = useState<LeaderRow[]>([]);
  const [champion, setChampion] = useState<LeaderRow | null>(null);
  const [loading, setLoading] = useState(false);

  const [pubgId, setPubgId] = useState("");
  const [instagram, setInstagram] = useState("");
  const [killCount, setKillCount] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState("");

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/kills?map=${activeMap}&month=${selectedMonth}`);
      const data = await res.json();
      setTop3(data.top3 || []);
      setChampion(data.champion || null);
    } finally {
      setLoading(false);
    }
  }, [activeMap, selectedMonth]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  async function handleSubmit() {
    setFormMsg("");
    if (!pubgId.trim() || !instagram.trim() || !killCount || !file) {
      setFormMsg("Lutfen tum alanlari doldurun ve ekran goruntusu ekleyin");
      return;
    }
    const kc = parseInt(killCount, 10);
    if (isNaN(kc) || kc < 0) {
      setFormMsg("Gecerli bir kill sayisi girin");
      return;
    }
    setSubmitting(true);
    try {
      const screenshot = await resizeImage(file);
      const res = await fetch("/api/kills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mapName: activeMap,
          pubgId: pubgId.trim(),
          instagram: instagram.trim(),
          killCount: kc,
          screenshot,
          month: months[0], // her zaman icinde bulunulan aya kaydedilir
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setFormMsg(d.error || "Bir hata olustu");
      } else {
        setFormMsg("Kaydin basariyla eklendi!");
        setPubgId("");
        setInstagram("");
        setKillCount("");
        setFile(null);
        if (selectedMonth === months[0]) fetchLeaderboard();
      }
    } catch {
      setFormMsg("Bir hata olustu, tekrar deneyin");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 30, fontWeight: 900, marginBottom: 8 }}>Enler</h1>
      <p style={{ color: "#aaa", marginBottom: 24 }}>
        Her harita icin ayin en cok kill alan oyuncusu. Kendi rekorunu ekran goruntusuyle yukle!
      </p>

      {/* Harita sekmeleri */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {MAPS.map((m) => (
          <button
            key={m.id}
            onClick={() => setActiveMap(m.id)}
            style={{
              padding: "8px 18px",
              borderRadius: 6,
              border: "1px solid #444",
              background: activeMap === m.id ? "#22c55e" : "#1a1a1a",
              color: activeMap === m.id ? "#000" : "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Ay secici */}
      <div style={{ marginBottom: 24 }}>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #444",
            background: "#111",
            color: "#fff",
          }}
        >
          {months.map((m) => (
            <option key={m} value={m}>
              {monthLabel(m)}
            </option>
          ))}
        </select>
      </div>

      {/* Sampiyon */}
      {loading ? (
        <p style={{ color: "#888" }}>Yukleniyor...</p>
      ) : champion ? (
        <div
          style={{
            textAlign: "center",
            padding: "32px 16px",
            borderRadius: 16,
            border: "1px solid #22c55e",
            background: "linear-gradient(180deg, rgba(34,197,94,0.12), rgba(0,0,0,0))",
            marginBottom: 28,
          }}
        >
          <div style={{ fontSize: 13, letterSpacing: 3, color: "#22c55e", fontWeight: 700, marginBottom: 10 }}>
            {MAPS.find((m) => m.id === activeMap)?.label.toUpperCase()} - {monthLabel(selectedMonth).toUpperCase()} SAMPIYONU
          </div>
          <div style={{ fontSize: 34, fontWeight: 900, marginBottom: 6 }}>{champion.pubgId}</div>
          <div style={{ fontSize: 20, color: "#eab308", fontWeight: 700, marginBottom: 14 }}>
            @{champion.instagram}
          </div>
          <div style={{ fontSize: 16, color: "#ccc", marginBottom: 16 }}>{champion.killCount} Kill</div>
          {champion.screenshot && (
            <img
              src={champion.screenshot}
              alt="mac sonucu"
              style={{ maxWidth: "100%", borderRadius: 10, border: "1px solid #333" }}
            />
          )}
        </div>
      ) : (
        <p style={{ color: "#888", marginBottom: 28 }}>Bu ay icin henuz kayit yok.</p>
      )}

      {/* Ilk 3 tablosu */}
      {top3.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: "#ccc" }}>Ilk 3</h3>
          <ol style={{ paddingLeft: 20 }}>
            {top3.map((row) => (
              <li key={row.id} style={{ marginBottom: 6, color: "#eee" }}>
                <strong>{row.pubgId}</strong> (@{row.instagram}) - {row.killCount} kill
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Yukleme formu */}
      <div style={{ borderTop: "1px solid #333", paddingTop: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
          {MAPS.find((m) => m.id === activeMap)?.label} icin kill kaydi yukle ({monthLabel(months[0])})
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            value={pubgId}
            onChange={(e) => setPubgId(e.target.value)}
            placeholder="Oyuncu ID (pubgId)"
            style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #444", background: "#111", color: "#fff" }}
          />
          <input
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="Instagram kullanici adi (@ olmadan)"
            style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #444", background: "#111", color: "#fff" }}
          />
          <input
            value={killCount}
            onChange={(e) => setKillCount(e.target.value)}
            placeholder="Kill sayisi"
            type="number"
            style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #444", background: "#111", color: "#fff" }}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={{ color: "#ccc" }}
          />
          {formMsg && <p style={{ color: formMsg.includes("basariyla") ? "#22c55e" : "#f87171" }}>{formMsg}</p>}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: "#22c55e",
              color: "#000",
              fontWeight: 700,
              cursor: submitting ? "default" : "pointer",
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? "Yukleniyor..." : "Kaydi Yukle"}
          </button>
        </div>
      </div>
    </div>
  );
}
