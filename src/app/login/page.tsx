"use client";

import { Suspense, useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("verified") === "1") {
      setInfo("E-postan dogrulandi! Simdi giris yapabilirsin.");
    }
    if (searchParams.get("error") === "suresi_dolmus_token") {
      setError("Dogrulama linkinin suresi dolmus veya gecersiz.");
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("player-credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error === "EMAIL_NOT_VERIFIED" || res?.error?.includes("EMAIL_NOT_VERIFIED")) {
      setError("E-postani henuz dogrulamadin. Gelen kutunu kontrol et.");
      return;
    }
    if (res?.error) {
      setError("E-posta veya sifre hatali.");
      return;
    }
    router.push("/players");
    router.refresh();
  }

  return (
    <div className="mx-auto mt-10 max-w-sm">
      <div className="hud-panel p-8">
        <h1 className="mb-6 text-center font-display text-2xl font-bold">
          <span className="neon-text">Giris</span> Yap
        </h1>

        <button
          onClick={() => signIn("google", { callbackUrl: "/players" })}
          className="mb-4 w-full rounded-sm bg-white py-2.5 font-semibold text-black shadow transition hover:scale-[1.02]"
        >
          Google ile Giris Yap
        </button>

        <div className="my-4 flex items-center gap-3 text-xs text-neutral-500">
          <div className="h-px flex-1 bg-bg-border" />
          veya e-posta ile
          <div className="h-px flex-1 bg-bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            type="email"
            placeholder="E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-sm border border-bg-border bg-bg-soft px-3 py-2 outline-none focus:border-neon-green"
          />
          <input
            required
            type="password"
            placeholder="Sifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-sm border border-bg-border bg-bg-soft px-3 py-2 outline-none focus:border-neon-green"
          />
          {info && <p className="text-sm text-neon-green">{info}</p>}
          {error && <p className="text-sm text-neon-orange">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-sm bg-neon-green py-2.5 font-display font-bold text-black shadow-neon disabled:opacity-50"
          >
            {loading ? "Giris yapiliyor..." : "GIRIS YAP"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-neutral-500">
          Hesabin yok mu?{" "}
          <a href="/register" className="text-neon-green underline">
            Kayit Ol
          </a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-center text-neutral-500">Yukleniyor...</p>}>
      <LoginForm />
    </Suspense>
  );
}
