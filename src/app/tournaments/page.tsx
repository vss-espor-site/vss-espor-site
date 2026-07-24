import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  upcoming: "Yaklaşan",
  active: "Aktif",
  completed: "Tamamlandı",
};

const TR_MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];
const TR_DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function buildCalendarGrid(year: number, month: number) {
  // month: 0-11
  const firstDay = new Date(year, month, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7; // Pazartesi=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default async function TournamentsPage() {
  const tournaments = await prisma.tournament.findMany({
    orderBy: { startDate: "asc" },
    include: { participants: true },
  });

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const cells = buildCalendarGrid(year, month);

  const tournamentsByDay = new Map<number, typeof tournaments>();
  for (const t of tournaments) {
    const d = new Date(t.startDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!tournamentsByDay.has(day)) tournamentsByDay.set(day, []);
      tournamentsByDay.get(day)!.push(t);
    }
  }

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl font-bold">
        <span className="neon-text">Turnuva</span> Sistemi
      </h1>
      <p className="mb-8 text-neutral-400">Aktif ve yaklaşan tüm turnuvalar burada.</p>

      {/* TAKVIM */}
      <div className="hud-panel mb-10 p-6">
        <h2 className="mb-4 font-display text-xl font-bold">
          {TR_MONTHS[month]} {year}
        </h2>
        <div className="grid grid-cols-7 gap-1 font-hud text-[10px] uppercase tracking-wider text-neutral-500">
          {TR_DAYS.map((d) => (
            <div key={d} className="pb-2 text-center">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            const dayTournaments = day ? tournamentsByDay.get(day) : undefined;
            const isToday = day === now.getDate();
            return (
              <div
                key={i}
                className={`min-h-[64px] rounded-sm border p-1 text-xs ${
                  day
                    ? isToday
                      ? "border-neon-green bg-neon-green/5"
                      : "border-bg-border bg-bg-soft"
                    : "border-transparent"
                }`}
              >
                {day && (
                  <>
                    <div className={`font-hud ${isToday ? "text-neon-green" : "text-neutral-500"}`}>
                      {day}
                    </div>
                    {dayTournaments?.map((t) => (
                      <Link
                        key={t.id}
                        href={`/tournaments/${t.id}`}
                        className="mt-1 block truncate rounded-sm bg-neon-yellow/15 px-1 py-0.5 text-[10px] gold-text hover:bg-neon-yellow/25"
                        title={t.title}
                      >
                        {t.title}
                      </Link>
                    ))}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* LISTE */}
      {tournaments.length === 0 ? (
        <p className="text-neutral-500">Henüz bir turnuva oluşturulmadı.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {tournaments.map((t) => (
            <Link
              key={t.id}
              href={`/tournaments/${t.id}`}
              className="hud-panel p-6 transition hover:shadow-neon"
            >
              <div className="flex items-center justify-between">
                <span className="hud-label text-neon-orange">
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
                {t.maxParticipants ? ` / ${t.maxParticipants}` : ""} katılımcı
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
