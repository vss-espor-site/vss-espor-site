import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const plays = await prisma.bestPlay.findMany({
    orderBy: { createdAt: "desc" },
    take: 60,
  });
  return NextResponse.json({ plays });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Giris yapilmamis" }, { status: 401 });
  }

  const player = await prisma.player.findUnique({ where: { email: session.user.email } });
  if (!player) {
    return NextResponse.json({ error: "Once kayit ol" }, { status: 404 });
  }

  const body = await req.json();
  const { videoUrl, caption } = body;

  if (!videoUrl || typeof videoUrl !== "string") {
    return NextResponse.json({ error: "Video URL eksik" }, { status: 400 });
  }
  if (caption && caption.length > 200) {
    return NextResponse.json({ error: "Aciklama cok uzun" }, { status: 400 });
  }

  const play = await prisma.bestPlay.create({
    data: {
      pubgId: player.pubgId,
      displayName: `${player.firstName} ${player.lastName}`,
      videoUrl,
      caption: caption || null,
    },
  });

  return NextResponse.json({ play });
}
