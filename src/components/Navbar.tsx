import Link from "next/link";

const links = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/players", label: "Oyuncular" },
  { href: "/tournaments", label: "Turnuvalar" },
  { href: "/harita", label: "Haritalar" },
  { href: "/soru-cevap", label: "Soru Cevap" },
  { href: "/enler", label: "Enler" },
  { href: "/announcements", label: "Duyurular" },
  { href: "/register", label: "Kayit Ol" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-bg-border bg-bg/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-display text-xl font-bold tracking-widest">
          <span className="neon-text">PUBG</span>
          <span className="text-neon-yellow">.ESPOR</span>
        </Link>
        <ul className="hidden gap-6 text-sm font-medium text-neutral-300 md:flex">
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
          className="rounded-md bg-neon-green px-4 py-2 text-sm font-bold text-black shadow-neon transition hover:bg-neon-greenDark md:hidden"
        >
          Kayit
        </Link>
      </nav>
      {/* mobil menu */}
      <div className="flex gap-4 overflow-x-auto border-t border-bg-border px-4 py-2 text-xs text-neutral-400 md:hidden">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="whitespace-nowrap hover:text-neon-green">
            {l.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
