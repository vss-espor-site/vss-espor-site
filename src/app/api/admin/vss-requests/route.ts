import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.role === "admin";
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Yetkin yok" }, { status: 403 });
  }
  const players = await prisma.player.findMany({
    where: { vssStatus: { in: ["pending", "approved"] } },
    orderBy: { vssStatus: "asc" },
    select: { id: true, firstName: true, lastName: true, pubgId: true, email: true, vssStatus: true },
  });
  return NextResponse.json({ players });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Yetkin yok" }, { status: 403 });
  }
  const { playerId, action } = await req.json();
  if (!playerId || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Gecersiz istek" }, { status: 400 });
  }
  const newStatus = action === "approve" ? "approved" : "none";
  const player = await prisma.player.update({
    where: { id: playerId },
    data: { vssStatus: newStatus },
  });
  return NextResponse.json({ player });
}
