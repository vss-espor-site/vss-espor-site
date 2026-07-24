import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const VALID_MAPS = ["erangel", "miramar", "sanhok"];

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { mapName, pubgId, instagram, killCount, screenshot, month } = body;

  if (!VALID_MAPS.includes(mapName)) {
    return NextResponse.json({ error: "Gecersiz harita" }, { status: 400 });
  }
  if (!pubgId || !instagram || typeof killCount !== "number" || !screenshot || !month) {
    return NextResponse.json({ error: "Eksik veri" }, { status: 400 });
  }
  if (killCount < 0 || killCount > 200) {
    return NextResponse.json({ error: "Gecersiz kill sayisi" }, { status: 400 });
  }

  const record = await prisma.killRecord.create({
    data: {
      mapName,
      pubgId: pubgId.trim(),
      instagram: instagram.trim(),
      killCount,
      screenshot,
      month,
    },
  });

  return NextResponse.json({ record: { id: record.id } });
}

export async function GET(req: NextRequest) {
  const mapName = req.nextUrl.searchParams.get("map");
  const month = req.nextUrl.searchParams.get("month");

  if (!mapName || !VALID_MAPS.includes(mapName) || !month) {
    return NextResponse.json({ error: "Gecersiz parametre" }, { status: 400 });
  }

  const records = await prisma.killRecord.findMany({
    where: { mapName, month },
    orderBy: { killCount: "desc" },
  });

  // her pubgId icin sadece en yuksek kill kaydini tut
  const seen = new Set<string>();
  const deduped: typeof records = [];
  for (const r of records) {
    if (!seen.has(r.pubgId)) {
      seen.add(r.pubgId);
      deduped.push(r);
    }
  }

  const top3 = deduped.slice(0, 3).map((r) => ({
    id: r.id,
    pubgId: r.pubgId,
    instagram: r.instagram,
    killCount: r.killCount,
    screenshot: r.screenshot,
  }));

  return NextResponse.json({ top3, champion: top3[0] || null });
}
