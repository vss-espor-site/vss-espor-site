import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const top = await prisma.quizScore.findMany({
    orderBy: { score: "desc" },
    take: 3,
  });
  return NextResponse.json({ top });
}
