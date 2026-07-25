import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DISCORD_INVITE = "https://discord.gg/rSMqjUGeza";

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default async function HomePage() {
  const month = currentMonthKey();
  const [playerCount, activeTournaments, latestAnnouncement, killsThisMonth, quizPlaysThisMonth] =
    await Promise.all([
      prisma.player.count().catch(() => 0),
      prisma.tournament.findMany({ where: { status: { in: ["upcoming", "active"] } }, take: 3, orderBy: { startDate: "asc" } }).catch(() => []),
      prisma.announcement.findFirst({ orderBy: { createdAt: "desc" } }).catch(() => null),
      prisma.killRecord.count({ where: { month } }).catch(() => 0),
      prisma.quizScore.count().catch(() => 0),
    ]);

  return (
    <div className="space-y-20">
      {/* HERO */}
      <section className="relative overflow-hidden px-6 py-16 text-center">
        <p className="mb-4 font-hud text-[11px] uppercase tracking-[0.35em] text-neon-orange">
          Bölge daralıyor // saha aktif
        </p>
        <h1 className="font-display text-4xl font-bold sm:text-6xl">
          <span className="neon-text">VSS</span>{" "}
          <span className="gold-text">E-SPORTS</span> TOPLULUĞU
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-neutral-400">
          Turnuvalara katıl, topluluğumuza üye ol, oyuncu profilini oluştur ve
          rekabetin tam ortasında yerini al.
        </p>

        {/* VITRIN GORSELI */}
        <div className="showcase-frame mx-auto mt-10 max-w-4xl">
          <div>
            <Image
              src="/hero-showcase.jpg"
              alt="VSS E-Sports"
              width={1510}
              height={1042}
              className="h-auto w-full"
              priority
            />
          </div>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className="rounded-sm bg-neon-green px-7 py-3 font-hud text-sm font-bold uppercase tracking-wider text-black shadow-neon transition hover:scale-105"
          >
            Hemen Kayıt Ol
          </Link>
          <Link
            href="/tournaments"
            className="rounded-sm border border-neon-yellow px-7 py-3 font-hud text-sm font-bold uppercase tracking-wider gold-text shadow-neonYellow transition hover:scale-105"
          >
            Turnuvaları Gör
          </Link>
        </div>
      </section>

      {/* CANLI AKTIVITE CUBUGU */}
      <section className="hud-panel flex flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6 py-4 font-hud text-xs uppercase tracking-wider text-neutral-400">
        <span className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-green opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-green" />
          </span>
          Canlı Aktivite
        </span>
        <span>
          Bu ay <span className="text-neon-green">{killsThisMonth}</span> kill kaydı yüklendi
        </span>
        <span>
          Toplam <span className="gold-text">{quizPlaysThisMonth}</span> soru-cevap denemesi yapıldı
        </span>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard label="Kayıtlı Oyuncu" value={playerCount} />
        <StatCard label="Aktif / Yaklaşan Turnuva" value={activeTournaments.length} />
        <StatCard label="Topluluk" value="Discord + Instagram" />
      </section>

      {/* LATEST ANNOUNCEMENT */}
      {latestAnnouncement && (
        <section className="hud-panel p-6">
          <p className="hud-label mb-2 text-neon-orange">Son Duyuru</p>
          <h3 className="font-display text-xl font-bold">{latestAnnouncement.title}</h3>
          <p className="mt-2 text-neutral-400">{latestAnnouncement.content}</p>
          <Link href="/announcements" className="mt-3 inline-block font-hud text-xs uppercase tracking-wider text-neon-green hover:underline">
            Tüm duyuruları gör &rarr;
          </Link>
        </section>
      )}

      {/* UPCOMING TOURNAMENTS */}
      {activeTournaments.length > 0 && (
        <section>
          <h2 className="mb-6 font-display text-2xl font-bold">
            Yaklaşan <span className="neon-text">Turnuvalar</span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {activeTournaments.map((t) => (
              <div key={t.id} className="hud-panel p-5">
                <span className="hud-label text-neon-orange">{t.status}</span>
                <h3 className="mt-2 font-display text-lg font-bold">{t.title}</h3>
                <p className="mt-1 text-sm text-neutral-400">
                  {new Date(t.startDate).toLocaleDateString("tr-TR")}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SOSYAL MEDYA */}
      <section className="hud-panel p-8 text-center">
        <p className="hud-label mb-3">Bizi Takip Et</p>
        <h3 className="mb-6 font-display text-2xl font-bold">
          Topluluğun <span className="neon-text">Nabzını</span> Tut
        </h3>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm border border-[#5865F2] px-6 py-3 font-hud text-sm font-bold uppercase tracking-wider text-[#5865F2] transition hover:scale-105 hover:bg-[#5865F2] hover:text-white"
          >
            💬 Discord
          </a>
          <a
            href="https://www.instagram.com/vssespor"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm border border-neon-yellow px-6 py-3 font-hud text-sm font-bold uppercase tracking-wider gold-text transition hover:scale-105"
          >
            📸 Instagram
          </a>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="hud-panel p-6 text-center">
      <p className="font-hud text-3xl font-bold text-neon-green">{value}</p>
      <p className="hud-label mt-2">{label}</p>
    </div>
  );
}
