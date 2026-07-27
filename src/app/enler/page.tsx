"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { upload } from "@vercel/blob/client";
import { useSession, signIn } from "next-auth/react";

type MapId = "erangel" | "miramar" | "sanhok" | "rondo";
type Section = MapId | "en-iyi-vurus";

const MAPS: { id: MapId; label: string }[] = [
  { id: "erangel", label: "Erangel" },
  { id: "miramar", label: "Miramar" },
  { id: "sanhok", label: "Sanhok" },
  { id: "rondo", label: "Rondo" },
];

type LeaderRow = {
  id: string;
  pubgId: string;
  instagram: string;
  killCount: number;
  screenshot: string;
};

type BestPlay = {
  id: string;
  pubgId: string;
  displayName: string;
  videoUrl: string;
  caption: string | null;
  createdAt: string;
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
  const { data: session } = useSession();
  const [section, setSection] = useState<Section>("erangel");
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

  // En Iyi Vurus (video) state
  const [plays, setPlays] = useState<BestPlay[]>([]);
  const [playsLoading, setPlaysLoading] = useState(false);
  const [caption, setCaption] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoMsg, setVideoMsg] = useState("");
  const videoInputRef = useRef<HTMLInputElement>(null);

  const isMap = section !== "en-iyi-vurus";
  const activeMap = isMap ? (section as MapId) : "erangel";

  const fetchLeaderboard = useCallback(async () => {
    if (!isMap) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/kills?map=${activeMap}&month=${selectedMonth}`);
      const data = await res.json();
      setTop3(data.top3 || []);
      setChampion(data.champion || null);
    } finally {
      setLoading(false);
    }
  }, [activeMap, selectedMonth, isMap]);

  const fetchPlays = useCallback(async () => {
    setPlaysLoading(true);
    try {
      const res = await fetch("/api/best-plays");
      const data = await res.json();
      setPlays(data.plays || []);
    } finally {
      setPlaysLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isMap) fetchLeaderboard();
    else fetchPlays();
  }, [section, fetchLeaderboard, fetchPlays, isMap]);

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
          month: months[0],
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

  async function handleVideoUpload() {
    setVideoMsg("");
    if (!session) {
      setVideoMsg("Video yuklemek icin once giris yapmalisin.");
      return;
    }
    if (!videoFile) {
      setVideoMsg("Lutfen bir video sec.");
      return;
    }
    if (videoFile.size > 100 * 1024 * 1024) {
      setVideoMsg("Video 100 MB'dan kucuk olmali.");
      return;
    }
    setVideoUploading(true);
    setVideoProgress(0);
    try {
      const newBlob = await upload(videoFile.name, videoFile, {
        access: "public",
        handleUploadUrl: "/api/best-plays/upload",
        onUploadProgress: (p) => setVideoProgress(Math.round(p.percentage)),
      });

      const res = await fetch("/api/best-plays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: newBlob.url, caption: caption.trim() || null }),
      });

      if (!res.ok) {
        const d = await res.json();
        setVideoMsg(d.error || "Kaydedilemedi");
      } else {
        setVideoMsg("Video basariyla yuklendi!");
        setCaption("");
        setVideoFile(null);
        if (videoInputRef.current) videoInputRef.current.value = "";
        fetchPlays();
      }
    } catch (e) {
      setVideoMsg("Yukleme basarisiz oldu, tekrar dene.");
    } finally {
      setVideoUploading(false);
      setVideoProgress(0);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 30, fontWeight: 900, marginBottom: 8 }}>Enler</h1>
      <p style={{ color: "#aaa", marginBottom: 24 }}>
        Her harita icin ayin en cok kill alan oyuncusu, ve en iyi vurus anlari.
      </p>

      {/* Ana kategoriler */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <button
          onClick={() => setSection("erangel")}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "1px solid #2D6BFF",
            background: isMap ? "#2D6BFF" : "#1a1a1a",
            color: isMap ? "#000" : "#2D6BFF",
            fontWeight: 800,
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          🎯 En Fazla Kill
        </button>
        <button
          onClick={() => setSection("en-iyi-vurus")}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "1px solid #D4AF37",
            background: !isMap ? "#D4AF37" : "#1a1a1a",
            color: !isMap ? "#000" : "#D4AF37",
            fontWeight: 800,
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          🎬 En Iyi Vurus
        </button>
      </div>

      {/* Harita alt sekmeleri - sadece "En Fazla Kill" acikken gorunur */}
      {isMap && (
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", paddingLeft: 4 }}>
          {MAPS.map((m) => (
            <button
              key={m.id}
              onClick={() => setSection(m.id)}
              style={{
                padding: "7px 16px",
                borderRadius: 6,
                border: "1px solid #333",
                background: section === m.id ? "#1F4FD6" : "#111",
                color: section === m.id ? "#fff" : "#aaa",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}

      {isMap ? (
        <>
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
                border: "1px solid #2D6BFF",
                background: "linear-gradient(180deg, rgba(34,197,94,0.12), rgba(0,0,0,0))",
                marginBottom: 28,
              }}
            >
              <div style={{ fontSize: 13, letterSpacing: 3, color: "#2D6BFF", fontWeight: 700, marginBottom: 10 }}>
                {MAPS.find((m) => m.id === activeMap)?.label.toUpperCase()} - {monthLabel(selectedMonth).toUpperCase()} SAMPIYONU
              </div>
              <div style={{ fontSize: 34, fontWeight: 900, marginBottom: 6 }}>{champion.pubgId}</div>
              <div style={{ fontSize: 20, color: "#D4AF37", fontWeight: 700, marginBottom: 14 }}>
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
              {formMsg && <p style={{ color: formMsg.includes("basariyla") ? "#2D6BFF" : "#F2D16B" }}>{formMsg}</p>}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: "#2D6BFF",
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
        </>
      ) : (
        <>
          {/* EN IYI VURUS - video galerisi */}
          <div style={{ marginBottom: 28 }}>
            {!session && (
              <div
                style={{
                  padding: 16,
                  borderRadius: 10,
                  border: "1px solid #D4AF37",
                  marginBottom: 20,
                  textAlign: "center",
                }}
              >
                <p style={{ color: "#D4AF37", marginBottom: 10 }}>Video yuklemek icin giris yapmalisin.</p>
                <button
                  onClick={() => signIn("google")}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "none",
                    background: "#fff",
                    color: "#000",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Google ile Giris Yap
                </button>
              </div>
            )}

            {session && (
              <div style={{ borderTop: "1px solid #333", borderBottom: "1px solid #333", padding: "20px 0", marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>En Iyi Vurusunu Paylas</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    style={{ color: "#ccc" }}
                  />
                  <input
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Kisa bir aciklama (opsiyonel)"
                    maxLength={200}
                    style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #444", background: "#111", color: "#fff" }}
                  />
                  {videoUploading && (
                    <div style={{ height: 6, borderRadius: 3, background: "#222", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${videoProgress}%`, background: "#D4AF37", transition: "width 0.2s" }} />
                    </div>
                  )}
                  {videoMsg && (
                    <p style={{ color: videoMsg.includes("basariyla") ? "#2D6BFF" : "#F2D16B" }}>{videoMsg}</p>
                  )}
                  <button
                    onClick={handleVideoUpload}
                    disabled={videoUploading}
                    style={{
                      padding: "10px 16px",
                      borderRadius: 8,
                      border: "none",
                      background: "#D4AF37",
                      color: "#000",
                      fontWeight: 700,
                      cursor: videoUploading ? "default" : "pointer",
                      opacity: videoUploading ? 0.6 : 1,
                    }}
                  >
                    {videoUploading ? `Yukleniyor... %${videoProgress}` : "Videoyu Yukle"}
                  </button>
                </div>
              </div>
            )}

            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: "#ccc" }}>
              Topluluğun En Iyi Vurusları
            </h3>
            {playsLoading ? (
              <p style={{ color: "#888" }}>Yukleniyor...</p>
            ) : plays.length === 0 ? (
              <p style={{ color: "#888" }}>Henuz video yok, ilk paylasan sen ol!</p>
            ) : (
              <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
                {plays.map((p) => (
                  <div key={p.id} style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #333", background: "#111" }}>
                    <video
                      src={p.videoUrl}
                      controls
                      playsInline
                      style={{ width: "100%", display: "block", background: "#000", maxHeight: 360 }}
                    />
                    <div style={{ padding: "10px 12px" }}>
                      <p style={{ fontWeight: 700, marginBottom: 4 }}>{p.displayName}</p>
                      <p style={{ fontSize: 12, color: "#888" }}>{p.pubgId}</p>
                      {p.caption && <p style={{ fontSize: 13, color: "#ccc", marginTop: 6 }}>{p.caption}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
