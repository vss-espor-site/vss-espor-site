import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const pubgId = req.nextUrl.searchParams.get("pubgId");
  if (!pubgId) {
    return NextResponse.json({ error: "pubgId gerekli" }, { status: 400 });
  }
  const player = await prisma.player.findUnique({
    where: { pubgId },
    select: { firstName: true, lastName: true, pubgId: true },
  });
  if (!player) {
    return NextResponse.json({ error: "Oyuncu bulunamadi" }, { status: 404 });
  }
  return NextResponse.json({ player });
}
