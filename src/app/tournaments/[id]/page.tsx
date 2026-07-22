import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import JoinTournamentForm from "./JoinTournamentForm";

export const dynamic = "force-dynamic";

export default async function TournamentDetailPage({ params }: { params: { id: string } }) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: params.id },
    include: { participants: { include: { player: true } } },
  });

  if (!tournament) notFound();

  const full = tournament.maxParticipants
    ? tournament.participants.length >= tournament.maxParticipants
    : false;

  return (
    <div className="mx-auto max-w-2xl">
      <span className="rounded-full bg-bg-soft px-3 py-1 text-xs text-neon-yellow">{tournament.status}</span>
      <h1 className="mt-3 font-display text-3xl font-bold">{tournament.title}</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Baslangic: {new Date(tournament.startDate).toLocaleString("tr-TR")}
      </p>
      <p className="mt-4 text-neutral-300">{tournament.description}</p>

      <div className="mt-8 rounded-lg border border-bg-border bg-bg-card p-6">
        <h2 className="mb-4 font-display text-lg font-bold">Katilimcilar ({tournament.participants.length}{tournament.maxParticipants ? `/${tournament.maxParticipants}` : ""})</h2>
        {tournament.participants.length === 0 ? (
          <p className="text-sm text-neutral-500">Henuz katilimci yok.</p>
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
    </div>
  );
}
