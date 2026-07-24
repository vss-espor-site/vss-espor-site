import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const MAP_LABELS: Record<string, string> = {
  erangel: "Erangel",
  miramar: "Miramar",
  sanhok: "Sanhok",
};

const TR_MONTHS = [
  "Ocak", "Subat", "Mart", "Nisan", "Mayis", "Haziran",
  "Temmuz", "Agustos", "Eylul", "Ekim", "Kasim", "Aralik",
];

function monthLabel(key: string) {
  const [y, m] = key.split("-");
  return `${TR_MONTHS[parseInt(m, 10) - 1]} ${y}`;
}

async function getChampionBadges(pubgId: string) {
  const myRecords = await prisma.killRecord.findMany({
    where: { pubgId },
    select: { mapName: true, month: true },
    distinct: ["mapName", "month"],
  });

  const badges: { mapName: string; month: string; killCount: number }[] = [];

  for (const { mapName, month } of myRecords) {
    const all = await prisma.killRecord.findMany({
      where: { mapName, month },
      orderBy: { killCount: "desc" },
    });
    const seen = new Set<string>();
    const deduped = [];
    for (const r of all) {
      if (!seen.has(r.pubgId)) {
        seen.add(r.pubgId);
        deduped.push(r);
      }
    }
    if (deduped[0]?.pubgId === pubgId) {
      badges.push({ mapName, month, killCount: deduped[0].killCount });
    }
  }

  return badges.sort((a, b) => (a.month < b.month ? 1 : -1));
}

export default async function PlayerProfilePage({ params }: { params: { id: string } }) {
  const player = await prisma.player.findUnique({
    where: { id: params.id },
    include: { participants: { include: { tournament: true } } },
  });

  if (!player) notFound();

  const badges = await getChampionBadges(player.pubgId);

  return (
    <div className="mx-auto max-w-xl">
      <div className="hud-panel p-8 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-bg-soft font-display text-2xl font-bold text-neon-green">
          {player.firstName[0]}
          {player.lastName[0]}
        </div>
        <h1 className="font-display text-2xl font-bold">
          {player.firstName} {player.lastName}
        </h1>
        <p className="mt-1 text-neutral-400">PUBG ID: {player.pubgId}</p>
        <div className="mt-4 flex justify-center gap-2 text-xs">
          <span className="rounded-full bg-bg-soft px-3 py-1 text-neon-yellow">{player.ageGroup}</span>
          <span className="rounded-full bg-bg-soft px-3 py-1 capitalize text-neutral-300">{player.community}</span>
        </div>
        {player.socialHandle && (
          <p className="mt-3 text-sm text-neutral-400">{player.socialHandle}</p>
        )}
      </div>

      {badges.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 font-display text-xl font-bold">
            Şampiyonluk <span className="gold-text">Rozetleri</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            {badges.map((b, i) => (
              <div
                key={i}
                className="hud-panel hud-panel-gold flex items-center gap-2 px-4 py-2"
              >
                <span className="text-lg">🏆</span>
                <div className="text-left">
                  <p className="font-hud text-[11px] uppercase tracking-wider gold-text">
                    {MAP_LABELS[b.mapName] ?? b.mapName} Şampiyonu
                  </p>
                  <p className="text-xs text-neutral-400">
                    {monthLabel(b.month)} · {b.killCount} kill
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="mb-4 font-display text-xl font-bold">Katıldığı Turnuvalar</h2>
        {player.participants.length === 0 ? (
          <p className="text-neutral-500">Henüz bir turnuvaya katılmamış.</p>
        ) : (
          <ul className="space-y-2">
            {player.participants.map((tp) => (
              <li key={tp.id} className="rounded-md border border-bg-border bg-bg-card px-4 py-3">
                <span className="font-medium">{tp.tournament.title}</span>{" "}
                <span className="text-xs text-neutral-500">({tp.tournament.status})</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
