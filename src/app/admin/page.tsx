import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [playerCount, tournamentCount, announcementCount] = await Promise.all([
    prisma.player.count(),
    prisma.tournament.count(),
    prisma.announcement.count(),
  ]);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold">
        <span className="neon-text">Admin</span> Paneli
      </h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card label="Toplam Oyuncu" value={playerCount} />
        <Card label="Toplam Turnuva" value={tournamentCount} />
        <Card label="Toplam Duyuru" value={announcementCount} />
      </div>
      <p className="mt-8 text-sm text-neutral-500">
        Yukaridaki sekmelerden oyuncu, turnuva ve duyuru yonetimi yapabilirsin.
        Bu panele sadece senin admin mailin ile giris yapilabilir.
      </p>
    </div>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-bg-border bg-bg-card p-6 text-center">
      <p className="font-display text-3xl font-bold text-neon-green">{value}</p>
      <p className="mt-1 text-sm text-neutral-400">{label}</p>
    </div>
  );
}
