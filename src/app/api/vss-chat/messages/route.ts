import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { containsProfanity } from "@/lib/profanityFilter";

const prisma = new PrismaClient();
const RATE_LIMIT_MS = 5000;
const VSS_ROOM = "VSS_AILESI";

async function requireApprovedPlayer() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const player = await prisma.player.findUnique({ where: { email: session.user.email } });
  if (!player || player.vssStatus !== "approved") return null;
  return player;
}

export async function GET() {
  const player = await requireApprovedPlayer();
  if (!player) {
    return NextResponse.json({ error: "Yetkin yok" }, { status: 403 });
  }
  const messages = await prisma.chatMessage.findMany({
    where: { ageGroup: VSS_ROOM },
    orderBy: { createdAt: "asc" },
    take: 200,
  });
  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const player = await requireApprovedPlayer();
  if (!player) {
    return NextResponse.json({ error: "Yetkin yok" }, { status: 403 });
  }

  const body = await req.json();
  const { content } = body;

  if (!content || typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "Eksik veri" }, { status: 400 });
  }
  if (content.length > 300) {
    return NextResponse.json({ error: "Mesaj cok uzun (max 300 karakter)" }, { status: 400 });
  }
  if (containsProfanity(content)) {
    return NextResponse.json({ error: "Mesajinda uygunsuz kelime tespit edildi." }, { status: 400 });
  }

  const lastMessage = await prisma.chatMessage.findFirst({
    where: { pubgId: player.pubgId, ageGroup: VSS_ROOM },
    orderBy: { createdAt: "desc" },
  });
  if (lastMessage) {
    const elapsed = Date.now() - lastMessage.createdAt.getTime();
    if (elapsed < RATE_LIMIT_MS) {
      return NextResponse.json(
        { error: "Cok hizli yaziyorsun, biraz bekle.", waitMs: RATE_LIMIT_MS - elapsed },
        { status: 429 }
      );
    }
  }

  const message = await prisma.chatMessage.create({
    data: {
      ageGroup: VSS_ROOM,
      pubgId: player.pubgId,
      displayName: `${player.firstName} ${player.lastName}`,
      content: content.trim(),
    },
  });

  return NextResponse.json({ message });
}
