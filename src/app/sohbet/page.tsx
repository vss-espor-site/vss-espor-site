"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";

type ChatMsg = {
  id: string;
  pubgId: string;
  displayName: string;
  content: string;
  createdAt: string;
};

const COOLDOWN_MS = 5000;

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

type Room = "yas" | "vss";

export default function SohbetPage() {
  const { data: session, status } = useSession();
  const [player, setPlayer] = useState<{ firstName: string; lastName: string; pubgId: string; ageGroup: string } | null>(null);
  const [playerError, setPlayerError] = useState("");
  const [loadingPlayer, setLoadingPlayer] = useState(false);

  const [room, setRoom] = useState<Room>("yas");
  const [vssStatus, setVssStatus] = useState<string>("none");
  const [vssStatusLoading, setVssStatusLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sendError, setSendError] = useState("");
  const [cooldownLeft, setCooldownLeft] = useState(0);

  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    setLoadingPlayer(true);
    fetch("/api/me")
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) {
          setPlayerError(d.error || "Oyuncu bulunamadi");
          return;
        }
        setPlayer(d.player);
      })
      .finally(() => setLoadingPlayer(false));

    fetch("/api/vss-chat/request")
      .then((r) => r.json())
      .then((d) => setVssStatus(d.status || "none"))
      .catch(() => {});
  }, [status]);

  async function fetchMessages() {
    const url = room === "yas"
      ? `/api/chat-room/messages?ageGroup=${encodeURIComponent(player?.ageGroup || "")}`
      : `/api/vss-chat/messages`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {
      // sessizce gec
    }
  }

  useEffect(() => {
    if (!player) return;
    if (room === "vss" && vssStatus !== "approved") return;
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 2500);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player?.ageGroup, room, vssStatus]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function startCooldown() {
    setCooldownLeft(COOLDOWN_MS / 1000);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldownLeft((c) => {
        if (c <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  async function handleSend() {
    setSendError("");
    if (!input.trim() || !player) return;
    if (cooldownLeft > 0) return;
    const url = room === "yas" ? "/api/chat-room/messages" : "/api/vss-chat/messages";
    const body = room === "yas" ? { pubgId: player.pubgId, content: input.trim() } : { content: input.trim() };
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setSendError(data.error || "Mesaj gönderilemedi");
        if (res.status === 429 && data.waitMs) {
          setCooldownLeft(Math.ceil(data.waitMs / 1000));
        }
        return;
      }
      setInput("");
      startCooldown();
      fetchMessages();
    } catch {
      setSendError("Bağlantı hatası");
    }
  }

  async function requestVssAccess() {
    setVssStatusLoading(true);
    try {
      const res = await fetch("/api/vss-chat/request", { method: "POST" });
      const data = await res.json();
      setVssStatus(data.status || "pending");
    } finally {
      setVssStatusLoading(false);
    }
  }

  if (status === "loading") {
    return <p className="text-center text-neutral-500">Yükleniyor...</p>;
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-md">
        <div className="hud-panel p-8 text-center">
          <Image src="/logo.png" alt="VSS E-Sports" width={72} height={72} className="mx-auto mb-4" />
          <p className="hud-label mb-2 text-neon-orange">Kanal Erişimi</p>
          <h1 className="mb-3 font-display text-2xl font-bold">
            Sohbet <span className="neon-text">Odaları</span>
          </h1>
          <p className="mb-6 text-sm text-neutral-400">
            Sohbete katılmak için Google hesabınla giriş yap.
          </p>
          <button
            onClick={() => signIn("google")}
            className="w-full rounded-sm bg-white py-3 font-semibold text-black shadow transition hover:scale-[1.02]"
          >
            Google ile Giriş Yap
          </button>
        </div>
      </div>
    );
  }

  if (loadingPlayer) {
    return <p className="text-center text-neutral-500">Profil kontrol ediliyor...</p>;
  }

  if (playerError) {
    return (
      <div className="mx-auto max-w-md">
        <div className="hud-panel p-8 text-center">
          <p className="mb-4 text-red-400">{playerError}</p>
          <a href="/register" className="inline-block rounded-sm bg-neon-green px-5 py-2 font-hud text-sm font-bold uppercase tracking-wider text-black">
            Kayıt Ol
          </a>
        </div>
      </div>
    );
  }

  if (!player) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="hud-panel mb-4 flex items-center gap-4 p-5">
        <Image src="/logo.png" alt="VSS E-Sports" width={44} height={44} />
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold">Sohbet Odaları</h1>
          <p className="font-hud text-[11px] uppercase tracking-wider text-neutral-500">
            <span className="text-neon-green">● Bağlısın</span> · {player.firstName} {player.lastName}
          </p>
        </div>
        <button onClick={() => signOut()} className="font-hud text-[10px] uppercase text-neutral-500 underline hover:text-neon-yellow">
          Çıkış
        </button>
      </div>

      {/* ODA SECICI */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setRoom("yas")}
          className={`flex-1 rounded-sm px-4 py-2 font-hud text-xs font-bold uppercase tracking-wider transition ${
            room === "yas" ? "bg-neon-green text-black" : "border border-bg-border text-neutral-400"
          }`}
        >
          {player.ageGroup} Yaş Grubu
        </button>
        <button
          onClick={() => setRoom("vss")}
          className={`flex-1 rounded-sm px-4 py-2 font-hud text-xs font-bold uppercase tracking-wider transition ${
            room === "vss" ? "bg-neon-yellow text-black" : "border border-neon-yellow gold-text"
          }`}
        >
          🔒 VSS Ailesi
        </button>
      </div>

      {room === "vss" && vssStatus !== "approved" ? (
        <div className="hud-panel hud-panel-gold p-8 text-center">
          {vssStatus === "pending" ? (
            <>
              <p className="mb-2 font-display text-lg font-bold gold-text">Onay Bekleniyor</p>
              <p className="text-sm text-neutral-400">
                Katılım isteğin admin'e iletildi. Onaylandığında bu odaya erişebileceksin.
              </p>
            </>
          ) : (
            <>
              <p className="mb-2 font-display text-lg font-bold gold-text">VSS Ailesi'ne Katıl</p>
              <p className="mb-5 text-sm text-neutral-400">
                Bu, sadece onaylanmış VSS üyelerinin girebildiği özel bir sohbet alanı. Katılmak için istek gönder.
              </p>
              <button
                onClick={requestVssAccess}
                disabled={vssStatusLoading}
                className="rounded-sm bg-neon-yellow px-6 py-2.5 font-hud text-sm font-bold uppercase tracking-wider text-black disabled:opacity-50"
              >
                {vssStatusLoading ? "Gönderiliyor..." : "Katılım İste"}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className={`hud-panel flex h-[440px] flex-col overflow-hidden p-0 ${room === "vss" ? "hud-panel-gold" : ""}`}>
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            {messages.length === 0 && (
              <p className="mt-16 text-center text-sm text-neutral-600">Henüz mesaj yok, ilk yazan sen ol! 🎮</p>
            )}
            {messages.map((m) => (
              <div key={m.id} className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg-soft font-hud text-[11px] font-bold text-neon-green">
                  {initials(m.displayName)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-sm font-bold text-neutral-200">{m.displayName}</span>
                    <span className="font-hud text-[10px] text-neutral-600">
                      {new Date(m.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="break-words text-sm text-neutral-300">{m.content}</p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {sendError && (
            <p className="border-t border-bg-border px-5 py-2 text-xs text-red-400">{sendError}</p>
          )}

          <div className="flex gap-2 border-t border-bg-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Bir mesaj yaz..."
              maxLength={300}
              className="flex-1 rounded-sm border border-bg-border bg-bg-soft px-4 py-2 text-sm outline-none focus:border-neon-green"
            />
            <button
              onClick={handleSend}
              disabled={cooldownLeft > 0 || !input.trim()}
              className={`min-w-[80px] rounded-sm font-hud text-xs font-bold uppercase tracking-wider transition ${
                cooldownLeft > 0 ? "cursor-default bg-bg-border text-neutral-500" : "bg-neon-green text-black shadow-neon hover:scale-105"
              }`}
            >
              {cooldownLeft > 0 ? `${cooldownLeft}s` : "Gönder"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
