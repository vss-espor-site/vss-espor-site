"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";

export default function RegisterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mode, setMode] = useState<"choose" | "email">("choose");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    pubgId: "",
    community: "instagram",
    socialHandle: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<"google" | "email" | null>(null);
  const [loading, setLoading] = useState(false);

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleGoogleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, email: session?.user?.email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Bir hata olustu.");
        return;
      }
      setSuccess("google");
      setTimeout(() => router.push("/players"), 1500);
    } catch {
      setError("Baglanti hatasi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Bir hata olustu.");
        return;
      }
      setSuccess("email");
    } catch {
      setError("Baglanti hatasi.");
    } finally {
      setLoading(false);
    }
  }

  if (success === "google") {
    return (
      <div className="mx-auto max-w-md hud-panel p-8 text-center">
        <h2 className="font-display text-2xl font-bold text-neon-green">Kayit Basarili!</h2>
        <p className="mt-2 text-neutral-400">Oyuncular sayfasina yonlendiriliyorsun...</p>
      </div>
    );
  }

  if (success === "email") {
    return (
      <div className="mx-auto max-w-md hud-panel p-8 text-center">
        <h2 className="font-display text-2xl font-bold text-neon-green">Neredeyse Tamam!</h2>
        <p className="mt-3 text-neutral-400">
          <strong>{form.email}</strong> adresine bir dogrulama e-postasi gonderdik. Gelen kutunu
          (ve spam klasorunu) kontrol edip hesabini dogrula, sonra giris yapabilirsin.
        </p>
        <a href="/login" className="mt-6 inline-block rounded-sm bg-neon-green px-5 py-2 font-hud text-sm font-bold uppercase tracking-wider text-black">
          Giris Sayfasina Git
        </a>
      </div>
    );
  }

  // Google akisinda, giris yapilmis ama henuz VSS profili tamamlanmamissa form goster
  if (session && mode !== "email") {
    return (
      <div className="mx-auto max-w-lg">
        <h1 className="mb-2 font-display text-3xl font-bold">
          <span className="neon-text">Kayit</span> Ol
        </h1>
        <div className="mb-6 flex items-center justify-between rounded-sm border border-bg-border bg-bg-soft px-4 py-2 text-sm text-neutral-400">
          <span>
            Giris yapildi: <span className="text-neon-green">{session.user?.email}</span>
          </span>
          <button onClick={() => signOut()} className="text-xs underline hover:text-neon-yellow">
            Cikis yap
          </button>
        </div>
        <RegistrationForm form={form} update={update} error={error} loading={loading} onSubmit={handleGoogleSubmit} />
      </div>
    );
  }

  if (mode === "email") {
    return (
      <div className="mx-auto max-w-lg">
        <h1 className="mb-2 font-display text-3xl font-bold">
          <span className="neon-text">Kayit</span> Ol
        </h1>
        <p className="mb-6 text-neutral-400">E-posta ve sifre olustur.</p>
        <RegistrationForm
          form={form}
          update={update}
          error={error}
          loading={loading}
          onSubmit={handleEmailSubmit}
          showEmailPassword
        />
        <button onClick={() => setMode("choose")} className="mt-3 text-xs text-neutral-500 underline">
          &larr; Geri don
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md hud-panel p-8 text-center">
      <h1 className="mb-3 font-display text-2xl font-bold">
        <span className="neon-text">Kayit</span> Ol
      </h1>
      <p className="mb-6 text-neutral-400">
        Kimsenin senin adina baskasi gibi davranamamasi icin bir giris yontemi sec.
      </p>
      <div className="space-y-3">
        <button
          onClick={() => signIn("google")}
          className="w-full rounded-sm bg-white py-3 font-semibold text-black shadow transition hover:scale-[1.02]"
        >
          Google ile Kayit Ol
        </button>
        <button
          onClick={() => setMode("email")}
          className="w-full rounded-sm border border-neon-green py-3 font-hud text-sm font-bold uppercase tracking-wider text-neon-green transition hover:scale-[1.02]"
        >
          E-posta ile Kayit Ol
        </button>
      </div>
      <p className="mt-4 text-xs text-neutral-500">
        Zaten hesabin var mi? <a href="/login" className="text-neon-green underline">Giris Yap</a>
      </p>
    </div>
  );
}

function RegistrationForm({
  form,
  update,
  error,
  loading,
  onSubmit,
  showEmailPassword,
}: {
  form: any;
  update: (k: string, v: string) => void;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  showEmailPassword?: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-bg-border bg-bg-card p-6">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Ad">
          <input required value={form.firstName} onChange={(e) => update("firstName", e.target.value)} className="input" />
        </Field>
        <Field label="Soyad">
          <input required value={form.lastName} onChange={(e) => update("lastName", e.target.value)} className="input" />
        </Field>
      </div>

      <Field label="Yas">
        <input required type="number" min={10} max={99} value={form.age} onChange={(e) => update("age", e.target.value)} className="input" />
      </Field>

      <Field label="PUBG ID">
        <input required value={form.pubgId} onChange={(e) => update("pubgId", e.target.value)} className="input" />
      </Field>

      <Field label="Topluluk">
        <select value={form.community} onChange={(e) => update("community", e.target.value)} className="input">
          <option value="instagram">Instagram</option>
          <option value="tiktok">TikTok</option>
          <option value="both">Instagram + TikTok</option>
          <option value="none">Hicbiri</option>
        </select>
      </Field>

      <Field label="Kullanici Adi (Instagram/TikTok) - opsiyonel">
        <input value={form.socialHandle} onChange={(e) => update("socialHandle", e.target.value)} className="input" placeholder="@kullaniciadi" />
      </Field>

      {showEmailPassword && (
        <>
          <Field label="E-posta">
            <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="input" />
          </Field>
          <Field label="Sifre">
            <input required type="password" minLength={6} value={form.password} onChange={(e) => update("password", e.target.value)} className="input" />
          </Field>
        </>
      )}

      {error && <p className="rounded-md bg-neon-orange/10 px-3 py-2 text-sm text-neon-orange">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-neon-green py-3 font-display font-bold text-black shadow-neon transition hover:scale-[1.02] disabled:opacity-50"
      >
        {loading ? "Gonderiliyor..." : "KAYIT OL"}
      </button>

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
    </form>
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
