import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  upcoming: "Yaklasan",
  active: "Aktif",
  completed: "Tamamlandi",
};

export default async function TournamentsPage() {
  const tournaments = await prisma.tournament.findMany({
    orderBy: { startDate: "asc" },
    include: { participants: true },
  });

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl font-bold">
        <span className="neon-text">Turnuva</span> Sistemi
      </h1>
      <p className="mb-8 text-neutral-400">Aktif ve yaklasan tum turnuvalar burada.</p>

      {tournaments.length === 0 ? (
        <p className="text-neutral-500">Henuz bir turnuva olusturulmadi.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {tournaments.map((t) => (
            <Link
              key={t.id}
              href={`/tournaments/${t.id}`}
              className="rounded-lg border border-bg-border bg-bg-card p-6 transition hover:border-neon-green hover:shadow-neon"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-bg-soft px-3 py-1 text-xs text-neon-yellow">
                  {statusLabel[t.status] ?? t.status}
                </span>
                <span className="text-xs text-neutral-500">
                  {new Date(t.startDate).toLocaleDateString("tr-TR")}
                </span>
              </div>
              <h3 className="mt-3 font-display text-xl font-bold">{t.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-neutral-400">{t.description}</p>
              <p className="mt-3 text-xs text-neutral-500">
                {t.participants.length}
                {t.maxParticipants ? ` / ${t.maxParticipants}` : ""} katilimci
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
