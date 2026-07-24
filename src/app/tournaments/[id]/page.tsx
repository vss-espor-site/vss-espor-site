import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import JoinTournamentForm from "./JoinTournamentForm";
import MatchResultForm from "./MatchResultForm";

export const dynamic = "force-dynamic";

const PLACEMENT_POINTS: Record<number, number> = {
  1: 10, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1, 8: 1,
};

function pointsFor(placement: number, killCount: number) {
  const placementPts = PLACEMENT_POINTS[placement] ?? 0;
  return placementPts + killCount;
}

export default async function TournamentDetailPage({ params }: { params: { id: string } }) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: params.id },
    include: { participants: { include: { player: true } } },
  });

  if (!tournament) notFound();

  const full = tournament.maxParticipants
    ? tournament.participants.length >= tournament.maxParticipants
    : false;

  const matchResults = await prisma.matchResult.findMany({
    where: { tournamentId: params.id },
    orderBy: { createdAt: "asc" },
  });

  const standingsMap = new Map<
    string,
    { teamName: string; matches: number; totalPlacementPts: number; totalKills: number; totalPts: number }
  >();

  for (const r of matchResults) {
    const placementPts = PLACEMENT_POINTS[r.placement] ?? 0;
    const existing = standingsMap.get(r.teamName);
    if (existing) {
      existing.matches += 1;
      existing.totalPlacementPts += placementPts;
      existing.totalKills += r.killCount;
      existing.totalPts += placementPts + r.killCount;
    } else {
      standingsMap.set(r.teamName, {
        teamName: r.teamName,
        matches: 1,
        totalPlacementPts: placementPts,
        totalKills: r.killCount,
        totalPts: placementPts + r.killCount,
      });
    }
  }

  const standings = Array.from(standingsMap.values()).sort((a, b) => b.totalPts - a.totalPts);

  return (
    <div className="mx-auto max-w-2xl">
      <span className="rounded-full bg-bg-soft px-3 py-1 font-hud text-xs uppercase tracking-wider text-neon-yellow">
        {tournament.status}
      </span>
      <h1 className="mt-3 font-display text-3xl font-bold">{tournament.title}</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Başlangıç: {new Date(tournament.startDate).toLocaleString("tr-TR")}
      </p>
      <p className="mt-4 text-neutral-300">{tournament.description}</p>

      <div className="mt-8 hud-panel p-6">
        <h2 className="mb-4 font-display text-lg font-bold">
          Katılımcılar ({tournament.participants.length}
          {tournament.maxParticipants ? `/${tournament.maxParticipants}` : ""})
        </h2>
        {tournament.participants.length === 0 ? (
          <p className="text-sm text-neutral-500">Henüz katılımcı yok.</p>
        ) : (
          <ul className="space-y-1 text-sm text-neutral-300">
            {tournament.participants.map((tp) => (
              <li key={tp.id}>
                {tp.player.firstName} {tp.player.lastName} — {tp.player.pubgId}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6">
        <JoinTournamentForm tournamentId={tournament.id} full={full} />
      </div>

      {/* PUAN TABLOSU */}
      {standings.length > 0 && (
        <div className="mt-10 hud-panel hud-panel-gold overflow-hidden p-0">
          <div className="p-6 pb-3">
            <h2 className="font-display text-xl font-bold">
              Puan <span className="gold-text">Tablosu</span>
            </h2>
            <p className="hud-label mt-1">Sıralama Puanı + Kill = Toplam Puan</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-bg-border font-hud text-[10px] uppercase tracking-wider text-neutral-500">
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Takım</th>
                <th className="px-4 py-2 text-center">Maç</th>
                <th className="px-4 py-2 text-center">Kill</th>
                <th className="px-4 py-2 text-right">Puan</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, i) => (
                <tr key={s.teamName} className="border-b border-bg-border/50">
                  <td className="px-4 py-3 font-hud">
                    {i === 0 ? <span className="gold-text">🥇</span> : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </td>
                  <td className="px-4 py-3 font-medium">{s.teamName}</td>
                  <td className="px-4 py-3 text-center text-neutral-400">{s.matches}</td>
                  <td className="px-4 py-3 text-center text-neutral-400">{s.totalKills}</td>
                  <td className="px-4 py-3 text-right font-hud font-bold text-neon-green">{s.totalPts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6">
        <MatchResultForm tournamentId={tournament.id} />
      </div>
    </div>
  );
}
