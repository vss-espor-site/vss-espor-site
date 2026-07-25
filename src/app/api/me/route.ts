import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Giris yapilmamis" }, { status: 401 });
  }
  const player = await prisma.player.findUnique({
    where: { email: session.user.email },
    select: { firstName: true, lastName: true, pubgId: true, ageGroup: true },
  });
  if (!player) {
    return NextResponse.json({ error: "Bu Google hesabiyla eslesen kayitli oyuncu yok. Once kayit ol." }, { status: 404 });
  }
  return NextResponse.json({ player });
}
