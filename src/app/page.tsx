import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [playerCount, activeTournaments, latestAnnouncement] = await Promise.all([
    prisma.player.count().catch(() => 0),
    prisma.tournament.findMany({ where: { status: { in: ["upcoming", "active"] } }, take: 3, orderBy: { startDate: "asc" } }).catch(() => []),
    prisma.announcement.findFirst({ orderBy: { createdAt: "desc" } }).catch(() => null),
  ]);

  return (
    <div className="space-y-16">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-xl border border-bg-border bg-bg-card bg-grid bg-grid px-6 py-20 text-center">
        <p className="mb-3 font-display text-sm uppercase tracking-[0.3em] text-neon-yellow">
          Sahaya cik. Kazan. Efsane ol.
        </p>
        <h1 className="font-display text-4xl font-bold sm:text-6xl">
          <span className="neon-text">PUBG MOBILE</span> E-SPOR TOPLULUGU
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-neutral-400">
          Turnuvalara katil, toplulugumuza uye ol, oyuncu profilini olustur ve
          rekabetin tam ortasinda yerini al.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className="rounded-md bg-neon-green px-6 py-3 font-display font-bold text-black shadow-neon transition hover:scale-105"
          >
            HEMEN KAYIT OL
          </Link>
          <Link
            href="/tournaments"
            className="rounded-md border border-neon-yellow px-6 py-3 font-display font-bold text-neon-yellow shadow-neonYellow transition hover:scale-105"
          >
            TURNUVALARI GOR
          </Link>
        </div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard label="Kayitli Oyuncu" value={playerCount} />
        <StatCard label="Aktif/Yaklasan Turnuva" value={activeTournaments.length} />
        <StatCard label="Topluluk" value="Instagram + TikTok" />
      </section>

      {/* LATEST ANNOUNCEMENT */}
      {latestAnnouncement && (
        <section className="rounded-lg border border-bg-border bg-bg-card p-6">
          <p className="mb-1 text-xs uppercase tracking-widest text-neon-yellow">Son Duyuru</p>
          <h3 className="font-display text-xl font-bold">{latestAnnouncement.title}</h3>
          <p className="mt-2 text-neutral-400">{latestAnnouncement.content}</p>
          <Link href="/announcements" className="mt-3 inline-block text-sm text-neon-green hover:underline">
            Tum duyurulari gor &rarr;
          </Link>
        </section>
      )}

      {/* UPCOMING TOURNAMENTS */}
      {activeTournaments.length > 0 && (
        <section>
          <h2 className="mb-6 font-display text-2xl font-bold">
            Yaklasan <span className="neon-text">Turnuvalar</span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {activeTournaments.map((t) => (
              <div key={t.id} className="rounded-lg border border-bg-border bg-bg-card p-5">
                <span className="text-xs uppercase text-neon-yellow">{t.status}</span>
                <h3 className="mt-1 font-display text-lg font-bold">{t.title}</h3>
                <p className="mt-1 text-sm text-neutral-400">
                  {new Date(t.startDate).toLocaleDateString("tr-TR")}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-bg-border bg-bg-card p-6 text-center">
      <p className="font-display text-3xl font-bold text-neon-green">{value}</p>
      <p className="mt-1 text-sm text-neutral-400">{label}</p>
    </div>
  );
}
