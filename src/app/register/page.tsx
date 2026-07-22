"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    pubgId: "",
    community: "instagram",
    socialHandle: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Bir hata olustu.");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/players"), 1500);
    } catch {
      setError("Baglanti hatasi.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-neon-green bg-bg-card p-8 text-center shadow-neon">
        <h2 className="font-display text-2xl font-bold text-neon-green">Kayit Basarili!</h2>
        <p className="mt-2 text-neutral-400">Oyuncular sayfasina yonlendiriliyorsun...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-2 font-display text-3xl font-bold">
        <span className="neon-text">Kayit</span> Ol
      </h1>
      <p className="mb-8 text-neutral-400">Toplulugumuza katilmak icin bilgilerini gir.</p>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-bg-border bg-bg-card p-6">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Ad">
            <input
              required
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Soyad">
            <input
              required
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              className="input"
            />
          </Field>
        </div>

        <Field label="Yas">
          <input
            required
            type="number"
            min={10}
            max={99}
            value={form.age}
            onChange={(e) => update("age", e.target.value)}
            className="input"
          />
          <p className="mt-1 text-xs text-neutral-500">
            Yasin girildikten sonra sistem seni otomatik olarak dogru yas grubuna ekler.
          </p>
        </Field>

        <Field label="PUBG ID">
          <input
            required
            value={form.pubgId}
            onChange={(e) => update("pubgId", e.target.value)}
            className="input"
            placeholder="ornek: 512xxxxxxx"
          />
        </Field>

        <Field label="Topluluk">
          <select
            value={form.community}
            onChange={(e) => update("community", e.target.value)}
            className="input"
          >
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="both">Instagram + TikTok</option>
            <option value="none">Hicbiri</option>
          </select>
        </Field>

        <Field label="Kullanici Adi (Instagram/TikTok) - opsiyonel">
          <input
            value={form.socialHandle}
            onChange={(e) => update("socialHandle", e.target.value)}
            className="input"
            placeholder="@kullaniciadi"
          />
        </Field>

        {error && <p className="rounded-md bg-red-950 px-3 py-2 text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-neon-green py-3 font-display font-bold text-black shadow-neon transition hover:scale-[1.02] disabled:opacity-50"
        >
          {loading ? "Gonderiliyor..." : "KAYIT OL"}
        </button>
      </form>

      <style jsx global>{`
        .input {
          width: 100%;
          background: #121212;
          border: 1px solid #262626;
          border-radius: 0.375rem;
          padding: 0.6rem 0.75rem;
          color: #e5e5e5;
          outline: none;
        }
        .input:focus {
          border-color: #39ff14;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-neutral-300">{label}</span>
      {children}
    </label>
  );
}
