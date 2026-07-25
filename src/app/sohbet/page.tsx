"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type ChatMsg = {
  id: string;
  pubgId: string;
  displayName: string;
  content: string;
  createdAt: string;
};

const COOLDOWN_MS = 5000;

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function SohbetPage() {
  const [pubgIdInput, setPubgIdInput] = useState("");
  const [player, setPlayer] = useState<{ firstName: string; lastName: string; pubgId: string; ageGroup: string } | null>(null);
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sendError, setSendError] = useState("");
  const [cooldownLeft, setCooldownLeft] = useState(0);

  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function handleLogin() {
    setLoginError("");
    if (!pubgIdInput.trim()) {
      setLoginError("Lütfen Oyuncu ID gir");
      return;
    }
    setLoggingIn(true);
    try {
      const res = await fetch(`/api/quiz/player?pubgId=${encodeURIComponent(pubgIdInput.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Oyuncu bulunamadı");
        return;
      }
      setPlayer({
        firstName: data.player.firstName,
        lastName: data.player.lastName,
        pubgId: data.player.pubgId,
        ageGroup: data.player.ageGroup,
      });
    } catch {
      setLoginError("Bir hata oluştu, tekrar dene");
    } finally {
      setLoggingIn(false);
    }
  }

  async function fetchMessages(ageGroup: string) {
    try {
      const res = await fetch(`/api/chat-room/messages?ageGroup=${encodeURIComponent(ageGroup)}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {
      // sessizce gec
    }
  }

  useEffect(() => {
    if (!player) return;
    fetchMessages(player.ageGroup);
    pollRef.current = setInterval(() => fetchMessages(player.ageGroup), 2500);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player?.ageGroup]);

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
    try {
      const res = await fetch("/api/chat-room/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pubgId: player.pubgId, content: input.trim() }),
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
      fetchMessages(player.ageGroup);
    } catch {
      setSendError("Bağlantı hatası");
    }
  }

  if (!player) {
    return (
      <div className="mx-auto max-w-md">
        <div className="hud-panel p-8 text-center">
          <Image src="/logo.png" alt="VSS E-Sports" width={72} height={72} className="mx-auto mb-4" />
          <p className="hud-label mb-2 text-neon-orange">Kanal Erişimi</p>
          <h1 className="mb-3 font-display text-2xl font-bold">
            Yaş Grubu <span className="neon-text">Sohbeti</span>
          </h1>
          <p className="mb-6 text-sm text-neutral-400">
            Kayıtlı Oyuncu ID'ni gir, seni otomatik olarak kendi yaş grubunun sohbet odasına alalım.
          </p>
          <input
            value={pubgIdInput}
            onChange={(e) => setPubgIdInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Oyuncu ID (pubgId)"
            className="mb-3 w-full rounded-sm border border-bg-border bg-bg-soft px-4 py-3 text-center outline-none focus:border-neon-green"
          />
          {loginError && <p className="mb-3 text-sm text-red-400">{loginError}</p>}
          <button
            onClick={handleLogin}
            disabled={loggingIn}
            className="w-full rounded-sm bg-neon-green py-3 font-hud text-sm font-bold uppercase tracking-wider text-black shadow-neon transition hover:scale-[1.02] disabled:opacity-50"
          >
            {loggingIn ? "Kontrol ediliyor..." : "Sohbete Katıl"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="hud-panel mb-4 flex items-center gap-4 p-5">
        <Image src="/logo.png" alt="VSS E-Sports" width={44} height={44} />
        <div>
          <h1 className="font-display text-xl font-bold">
            <span className="gold-text">{player.ageGroup}</span> Yaş Grubu Sohbeti
          </h1>
          <p className="font-hud text-[11px] uppercase tracking-wider text-neutral-500">
            <span className="text-neon-green">● Bağlısın</span> · {player.firstName} {player.lastName} · Küfür yasak, mesaj başı 5sn bekleme
          </p>
        </div>
      </div>

      <div className="hud-panel flex h-[440px] flex-col overflow-hidden p-0">
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
              cooldownLeft > 0
                ? "cursor-default bg-bg-border text-neutral-500"
                : "bg-neon-green text-black shadow-neon hover:scale-105"
            }`}
          >
            {cooldownLeft > 0 ? `${cooldownLeft}s` : "Gönder"}
          </button>
        </div>
      </div>
    </div>
  );
}
