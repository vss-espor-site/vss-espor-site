import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  pubgId: z.string().min(3),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Gecerli bir PUBG ID gir" }, { status: 400 });
  }

  const player = await prisma.player.findUnique({ where: { pubgId: parsed.data.pubgId } });
  if (!player) {
    return NextResponse.json(
      { error: "Bu PUBG ID ile kayitli oyuncu bulunamadi. Once kayit ol." },
      { status: 404 }
    );
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: params.id },
    include: { participants: true },
  });
  if (!tournament) return NextResponse.json({ error: "Turnuva bulunamadi" }, { status: 404 });

  if (tournament.maxParticipants && tournament.participants.length >= tournament.maxParticipants) {
    return NextResponse.json({ error: "Turnuva kontenjani dolu" }, { status: 409 });
  }

  const already = await prisma.tournamentParticipant.findUnique({
    where: { tournamentId_playerId: { tournamentId: params.id, playerId: player.id } },
  });
  if (already) {
    return NextResponse.json({ error: "Bu turnuvaya zaten katildin" }, { status: 409 });
  }

  await prisma.tournamentParticipant.create({
    data: { tournamentId: params.id, playerId: player.id },
  });

  return NextResponse.json({ success: true });
}
