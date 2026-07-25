"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";

const links = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/players", label: "Oyuncular" },
  { href: "/tournaments", label: "Turnuvalar" },
  { href: "/harita", label: "Haritalar" },
  { href: "/soru-cevap", label: "Soru Cevap" },
  { href: "/enler", label: "Enler" },
  { href: "/sohbet", label: "Sohbet" },
  { href: "/announcements", label: "Duyurular" },
];

export default function Navbar() {
  const { data: session, status } = useSession();

  const authLinks = session
    ? [{ href: "#", label: "Çıkış Yap", action: () => signOut({ callbackUrl: "/" }) }]
    : [
        { href: "/login", label: "Giriş Yap" },
        { href: "/register", label: "Kayıt Ol" },
      ];

  return (
    <header className="sticky top-0 z-40 border-b border-bg-border bg-bg/95 backdrop-blur">
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-neon-green to-transparent opacity-60" />
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-3 font-display text-xl font-bold tracking-widest">
          <Image src="/logo.png" alt="VSS E-Sports" width={40} height={40} priority />
          <span>
            <span className="neon-text">VSS</span> <span className="gold-text">E-Sports</span>
          </span>
        </Link>
        <ul className="hidden gap-4 font-hud text-[11px] uppercase tracking-[0.1em] text-neutral-400 xl:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="transition hover:text-neon-green">
                {l.label}
              </Link>
            </li>
          ))}
          {status !== "loading" &&
            authLinks.map((l: any) =>
              l.action ? (
                <li key={l.label}>
                  <button onClick={l.action} className="transition hover:text-neon-orange">
                    {l.label}
                  </button>
                </li>
              ) : (
                <li key={l.href}>
                  <Link href={l.href} className="transition hover:text-neon-green">
                    {l.label}
                  </Link>
                </li>
              )
            )}
        </ul>
        {!session && (
          <Link
            href="/register"
            className="rounded-sm bg-neon-green px-4 py-2 font-hud text-xs font-bold uppercase tracking-wider text-black shadow-neon transition hover:scale-105 xl:hidden"
          >
            Kayıt
          </Link>
        )}
        {session && (
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-sm border border-neon-orange px-4 py-2 font-hud text-xs font-bold uppercase tracking-wider text-neon-orange xl:hidden"
          >
            Çıkış
          </button>
        )}
      </nav>
      {/* mobil menu */}
      <div className="flex gap-4 overflow-x-auto border-t border-bg-border px-4 py-2 font-hud text-[10px] uppercase tracking-wider text-neutral-500 xl:hidden">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="whitespace-nowrap hover:text-neon-green">
            {l.label}
          </Link>
        ))}
        {status !== "loading" &&
          authLinks.map((l: any) =>
            l.action ? (
              <button key={l.label} onClick={l.action} className="whitespace-nowrap text-neon-orange">
                {l.label}
              </button>
            ) : (
              <Link key={l.href} href={l.href} className="whitespace-nowrap hover:text-neon-green">
                {l.label}
              </Link>
            )
          )}
      </div>
    </header>
  );
}
