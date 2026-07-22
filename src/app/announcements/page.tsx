import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 font-display text-3xl font-bold">
        <span className="neon-text">Duyuru</span>lar
      </h1>
      <p className="mb-8 text-neutral-400">Takim ve turnuvalarla ilgili tum guncellemeler.</p>

      {announcements.length === 0 ? (
        <p className="text-neutral-500">Henuz bir duyuru yok.</p>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div
              key={a.id}
              className={`rounded-lg border bg-bg-card p-5 ${
                a.pinned ? "border-neon-yellow shadow-neonYellow" : "border-bg-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">{a.title}</h3>
                {a.pinned && <span className="text-xs text-neon-yellow">📌 SABIT</span>}
              </div>
              <p className="mt-2 text-sm text-neutral-400">{a.content}</p>
              <p className="mt-3 text-xs text-neutral-600">
                {new Date(a.createdAt).toLocaleString("tr-TR")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
