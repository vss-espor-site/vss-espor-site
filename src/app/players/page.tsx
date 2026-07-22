import { prisma } from "@/lib/prisma";
import { AGE_GROUPS } from "@/lib/ageGroup";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: { ageGroup?: string };
}) {
  const players = await prisma.player.findMany({
    where: searchParams.ageGroup ? { ageGroup: searchParams.ageGroup } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl font-bold">
        <span className="neon-text">Oyuncu</span> Profilleri
      </h1>
      <p className="mb-6 text-neutral-400">Toplulugumuza kayitli tum oyuncular.</p>

      <div className="mb-8 flex flex-wrap gap-2">
        <FilterChip label="Tumu" href="/players" active={!searchParams.ageGroup} />
        {AGE_GROUPS.map((g) => (
          <FilterChip key={g} label={g} href={`/players?ageGroup=${encodeURIComponent(g)}`} active={searchParams.ageGroup === g} />
        ))}
      </div>

      {players.length === 0 ? (
        <p className="text-neutral-500">Bu grupta henuz kayitli oyuncu yok.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((p) => (
            <Link
              key={p.id}
              href={`/players/${p.id}`}
              className="rounded-lg border border-bg-border bg-bg-card p-5 transition hover:border-neon-green hover:shadow-neon"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">
                  {p.firstName} {p.lastName}
                </h3>
                <span className="rounded bg-bg-soft px-2 py-1 text-xs text-neon-yellow">{p.ageGroup}</span>
              </div>
              <p className="mt-2 text-sm text-neutral-400">PUBG ID: {p.pubgId}</p>
              <p className="mt-1 text-xs text-neutral-500 capitalize">{p.community}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
        active
          ? "border-neon-green bg-neon-green text-black"
          : "border-bg-border text-neutral-400 hover:border-neon-green hover:text-neon-green"
      }`}
    >
      {label}
    </Link>
  );
}
