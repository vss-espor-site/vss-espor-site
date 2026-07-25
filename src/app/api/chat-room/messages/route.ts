import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { containsProfanity } from "@/lib/profanityFilter";

const prisma = new PrismaClient();

const RATE_LIMIT_MS = 5000;

export async function GET(req: NextRequest) {
  const ageGroup = req.nextUrl.searchParams.get("ageGroup");
  if (!ageGroup) {
    return NextResponse.json({ error: "ageGroup gerekli" }, { status: 400 });
  }
  const messages = await prisma.chatMessage.findMany({
    where: { ageGroup },
    orderBy: { createdAt: "asc" },
    take: 100,
  });
  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { pubgId, content } = body;

  if (!pubgId || !content || typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "Eksik veri" }, { status: 400 });
  }
  if (content.length > 300) {
    return NextResponse.json({ error: "Mesaj cok uzun (max 300 karakter)" }, { status: 400 });
  }
  if (containsProfanity(content)) {
    return NextResponse.json({ error: "Mesajinda uygunsuz kelime tespit edildi, duzenleyip tekrar dene." }, { status: 400 });
  }

  const player = await prisma.player.findUnique({ where: { pubgId } });
  if (!player) {
    return NextResponse.json({ error: "Oyuncu bulunamadi" }, { status: 404 });
  }

  // hiz siniri: bu kullanicinin son mesajindan bu yana en az 5 saniye gecmis mi?
  const lastMessage = await prisma.chatMessage.findFirst({
    where: { pubgId },
    orderBy: { createdAt: "desc" },
  });
  if (lastMessage) {
    const elapsed = Date.now() - lastMessage.createdAt.getTime();
    if (elapsed < RATE_LIMIT_MS) {
      const waitMs = RATE_LIMIT_MS - elapsed;
      return NextResponse.json(
        { error: "Cok hizli yaziyorsun, biraz bekle.", waitMs },
        { status: 429 }
      );
    }
  }

  const message = await prisma.chatMessage.create({
    data: {
      ageGroup: player.ageGroup,
      pubgId: player.pubgId,
      displayName: `${player.firstName} ${player.lastName}`,
      content: content.trim(),
    },
  });

  return NextResponse.json({ message });
}
