"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("E-posta veya sifre hatali.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto mt-10 max-w-sm">
      <h1 className="mb-6 text-center font-display text-2xl font-bold">
        <span className="neon-text">Admin</span> Girisi
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-bg-border bg-bg-card p-6">
        <input
          required
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-bg-border bg-bg-soft px-3 py-2 outline-none focus:border-neon-green"
        />
        <input
          required
          type="password"
          placeholder="Sifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-bg-border bg-bg-soft px-3 py-2 outline-none focus:border-neon-green"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-neon-green py-2.5 font-display font-bold text-black shadow-neon disabled:opacity-50"
        >
          {loading ? "Giris yapiliyor..." : "GIRIS YAP"}
        </button>
      </form>
      <p className="mt-4 text-center text-xs text-neutral-600">
        Bu panel sadece site yoneticisi icin ayrilmistir.
      </p>
    </div>
  );
}
