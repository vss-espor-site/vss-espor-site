import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { pubgId, score } = body;

  if (!pubgId || typeof score !== "number") {
    return NextResponse.json({ error: "Gecersiz veri" }, { status: 400 });
  }

  const player = await prisma.player.findUnique({ where: { pubgId } });
  if (!player) {
    return NextResponse.json({ error: "Oyuncu bulunamadi" }, { status: 404 });
  }

  const saved = await prisma.quizScore.create({
    data: {
      pubgId: player.pubgId,
      firstName: player.firstName,
      lastName: player.lastName,
      score,
    },
  });

  return NextResponse.json({ saved });
}
