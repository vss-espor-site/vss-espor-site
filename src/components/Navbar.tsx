import Link from "next/link";

const links = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/players", label: "Oyuncular" },
  { href: "/tournaments", label: "Turnuvalar" },
  { href: "/harita", label: "Haritalar" },
  { href: "/soru-cevap", label: "Soru Cevap" },
  { href: "/enler", label: "Enler" },
  { href: "/announcements", label: "Duyurular" },
  { href: "/register", label: "Kayıt Ol" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-bg-border bg-bg/95 backdrop-blur">
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-neon-green to-transparent opacity-60" />
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-widest">
          <span className="neon-text">VSS</span>
          <span className="gold-text">E-Sports</span>
        </Link>
        <ul className="hidden gap-6 font-hud text-[11px] uppercase tracking-[0.15em] text-neutral-400 md:flex">
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
          className="rounded-sm bg-neon-green px-4 py-2 font-hud text-xs font-bold uppercase tracking-wider text-black shadow-neon transition hover:scale-105 md:hidden"
        >
          Kayıt
        </Link>
      </nav>
      {/* mobil menu */}
      <div className="flex gap-4 overflow-x-auto border-t border-bg-border px-4 py-2 font-hud text-[10px] uppercase tracking-wider text-neutral-500 md:hidden">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="whitespace-nowrap hover:text-neon-green">
            {l.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
