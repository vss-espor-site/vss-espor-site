import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { teamName, placement, killCount, screenshot } = body;

  if (!teamName || typeof placement !== "number" || typeof killCount !== "number" || !screenshot) {
    return NextResponse.json({ error: "Eksik veya gecersiz veri" }, { status: 400 });
  }
  if (placement < 1 || placement > 32 || killCount < 0 || killCount > 100) {
    return NextResponse.json({ error: "Gecersiz siralama veya kill sayisi" }, { status: 400 });
  }

  const tournament = await prisma.tournament.findUnique({ where: { id: params.id } });
  if (!tournament) {
    return NextResponse.json({ error: "Turnuva bulunamadi" }, { status: 404 });
  }

  const record = await prisma.matchResult.create({
    data: {
      tournamentId: params.id,
      teamName: teamName.trim(),
      placement,
      killCount,
      screenshot,
    },
  });

  return NextResponse.json({ id: record.id });
}
