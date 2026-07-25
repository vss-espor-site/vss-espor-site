import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { sendVssRequestNotification } from "@/lib/sendAdminNotification";

const prisma = new PrismaClient();

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Giris yapilmamis" }, { status: 401 });
  }

  const player = await prisma.player.findUnique({ where: { email: session.user.email } });
  if (!player) {
    return NextResponse.json({ error: "Once kayit ol" }, { status: 404 });
  }

  if (player.vssStatus === "approved") {
    return NextResponse.json({ status: "approved" });
  }
  if (player.vssStatus === "pending") {
    return NextResponse.json({ status: "pending" });
  }

  await prisma.player.update({
    where: { id: player.id },
    data: { vssStatus: "pending" },
  });

  try {
    await sendVssRequestNotification(
      `${player.firstName} ${player.lastName}`,
      player.pubgId,
      player.email!
    );
  } catch (e) {
    console.error("Admin bildirimi gonderilemedi:", e);
  }

  return NextResponse.json({ status: "pending" });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Giris yapilmamis" }, { status: 401 });
  }
  const player = await prisma.player.findUnique({ where: { email: session.user.email } });
  if (!player) {
    return NextResponse.json({ error: "Once kayit ol" }, { status: 404 });
  }
  return NextResponse.json({ status: player.vssStatus });
}
