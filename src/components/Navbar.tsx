"use client";

import { useState } from "react";
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

const SUPPORT_EMAIL = "vssespor00@gmail.com";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSupportEmail, setShowSupportEmail] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
    setShowSupportEmail(false);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-bg-border bg-bg/95 backdrop-blur">
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-neon-green to-transparent opacity-60" />
        <nav className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Menu"
            className="flex flex-col gap-1.5 rounded-sm p-2 hover:bg-bg-soft"
          >
            <span className="block h-0.5 w-6 bg-neon-green" />
            <span className="block h-0.5 w-6 bg-neon-green" />
            <span className="block h-0.5 w-6 bg-neon-green" />
          </button>

          <Link href="/" className="flex items-center gap-3 font-display text-xl font-bold tracking-widest">
            <Image src="/logo.png" alt="VSS E-Sports" width={40} height={40} priority />
            <span>
              <span className="neon-text">VSS</span> <span className="gold-text">E-Sports</span>
            </span>
          </Link>
        </nav>
      </header>

      {/* Overlay */}
      {menuOpen && (
        <div
          onClick={closeMenu}
          className="fixed inset-0 z-50 bg-black/60"
        />
      )}

      {/* Sol cekmece (drawer) */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-bg-border bg-bg transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-bg-border p-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="VSS E-Sports" width={32} height={32} />
            <span className="font-display font-bold">
              <span className="neon-text">VSS</span> <span className="gold-text">E-Sports</span>
            </span>
          </div>
          <button onClick={closeMenu} className="text-neutral-400 hover:text-neon-orange" aria-label="Kapat">
            ✕
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={closeMenu}
                  className="block rounded-sm px-3 py-2.5 font-hud text-sm uppercase tracking-wider text-neutral-300 transition hover:bg-bg-soft hover:text-neon-green"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="my-4 h-px bg-bg-border" />

          {status !== "loading" && (
            <>
              {session ? (
                <button
                  onClick={() => {
                    signOut({ callbackUrl: "/" });
                    closeMenu();
                  }}
                  className="block w-full rounded-sm px-3 py-2.5 text-left font-hud text-sm uppercase tracking-wider text-neon-orange transition hover:bg-bg-soft"
                >
                  Çıkış Yap
                </button>
              ) : (
                <div className="space-y-1">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="block rounded-sm px-3 py-2.5 font-hud text-sm uppercase tracking-wider text-neutral-300 transition hover:bg-bg-soft hover:text-neon-green"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMenu}
                    className="block rounded-sm bg-neon-green px-3 py-2.5 text-center font-hud text-sm font-bold uppercase tracking-wider text-black"
                  >
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </>
          )}
        </nav>

        {/* Destek butonu - en altta sabit */}
        <div className="border-t border-bg-border p-4">
          <button
            onClick={() => setShowSupportEmail((v) => !v)}
            className="w-full rounded-sm border border-neon-yellow px-3 py-2.5 font-hud text-sm font-bold uppercase tracking-wider gold-text transition hover:bg-neon-yellow hover:text-black"
          >
            Destek
          </button>
          {showSupportEmail && (
            <p className="mt-2 break-all text-center text-xs text-neutral-400">
              {SUPPORT_EMAIL}
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
