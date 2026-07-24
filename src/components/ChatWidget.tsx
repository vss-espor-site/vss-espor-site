"use client";

import { useState, useRef, useEffect } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Selam! Ben VSS Amca. Turnuvalar, kayit sureci ya da toplulukla ilgili her seyi sorabilirsin." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const newMessages: Msg[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || data.error || "Bir hata olustu." },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Baglanti hatasi olustu." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 flex h-[28rem] w-80 flex-col overflow-hidden rounded-lg border border-bg-border bg-bg-card shadow-neon">
          <div className="flex items-center justify-between border-b border-bg-border bg-bg-soft px-4 py-3">
            <span className="font-display font-bold text-neon-green">VSS AMCA</span>
            <button
              onClick={() => setOpen(false)}
              className="text-neutral-400 hover:text-neon-yellow"
              aria-label="Kapat"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3 text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-md px-3 py-2 ${
                  m.role === "user"
                    ? "ml-auto bg-neon-green text-black"
                    : "bg-bg-soft text-neutral-200 border border-bg-border"
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="w-fit rounded-md border border-bg-border bg-bg-soft px-3 py-2 text-neutral-400">
                Yaziyor...
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="flex gap-2 border-t border-bg-border p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Bir soru yaz..."
              className="flex-1 rounded-md bg-bg-soft px-3 py-2 text-sm outline-none placeholder:text-neutral-500"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="rounded-md bg-neon-green px-3 py-2 text-sm font-bold text-black disabled:opacity-50"
            >
              Gonder
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full bg-neon-green px-5 py-4 font-hud text-xs font-bold uppercase tracking-wider text-black shadow-neon transition hover:scale-105"
        aria-label="VSS Amcaya Sor"
      >
        💬 VSS AMCAYA SOR
      </button>
    </div>
  );
}
