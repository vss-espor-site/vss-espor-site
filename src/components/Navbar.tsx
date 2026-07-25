import Link from "next/link";
import Image from "next/image";

const links = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/players", label: "Oyuncular" },
  { href: "/tournaments", label: "Turnuvalar" },
  { href: "/harita", label: "Haritalar" },
  { href: "/soru-cevap", label: "Soru Cevap" },
  { href: "/enler", label: "Enler" },
  { href: "/sohbet", label: "Sohbet" },
  { href: "/announcements", label: "Duyurular" },
  { href: "/register", label: "Kayıt Ol" },
];

export default function Navbar() {
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
        <ul className="hidden gap-5 font-hud text-[11px] uppercase tracking-[0.13em] text-neutral-400 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="transition hover:text-neon-green">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/register"
          className="rounded-sm bg-neon-green px-4 py-2 font-hud text-xs font-bold uppercase tracking-wider text-black shadow-neon transition hover:scale-105 lg:hidden"
        >
          Kayıt
        </Link>
      </nav>
      {/* mobil menu */}
      <div className="flex gap-4 overflow-x-auto border-t border-bg-border px-4 py-2 font-hud text-[10px] uppercase tracking-wider text-neutral-500 lg:hidden">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="whitespace-nowrap hover:text-neon-green">
            {l.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
