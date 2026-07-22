import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PlayerProfilePage({ params }: { params: { id: string } }) {
  const player = await prisma.player.findUnique({
    where: { id: params.id },
    include: { participants: { include: { tournament: true } } },
  });

  if (!player) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-lg border border-neon-green bg-bg-card p-8 text-center shadow-neon">
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

      <div className="mt-8">
        <h2 className="mb-4 font-display text-xl font-bold">Katildigi Turnuvalar</h2>
        {player.participants.length === 0 ? (
          <p className="text-neutral-500">Henuz bir turnuvaya katilmamis.</p>
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
