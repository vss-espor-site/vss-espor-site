import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/login?error=gecersiz_token`);
  }

  const player = await prisma.player.findUnique({ where: { verifyToken: token } });

  if (!player || !player.verifyExpires || player.verifyExpires < new Date()) {
    return NextResponse.redirect(`${baseUrl}/login?error=suresi_dolmus_token`);
  }

  await prisma.player.update({
    where: { id: player.id },
    data: { emailVerified: true, verifyToken: null, verifyExpires: null },
  });

  return NextResponse.redirect(`${baseUrl}/login?verified=1`);
}
