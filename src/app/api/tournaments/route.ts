import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const tournaments = await prisma.tournament.findMany({
    orderBy: { startDate: "asc" },
    include: { participants: true },
  });
  return NextResponse.json({ tournaments });
}

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
  startDate: z.string(),
  maxParticipants: z.coerce.number().int().positive().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const tournament = await prisma.tournament.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      startDate: new Date(parsed.data.startDate),
      maxParticipants: parsed.data.maxParticipants,
    },
  });

  return NextResponse.json({ tournament }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await req.json();
  await prisma.tournament.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id, status } = await req.json();
  const tournament = await prisma.tournament.update({ where: { id }, data: { status } });
  return NextResponse.json({ tournament });
}
