import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Prisma singleton (Vercel'de coklu baglanti sorununu onler)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ===== AYARLAR (istedigin zaman degistirebilirsin) =====
const DAILY_LIMIT = 3;          // gunluk cevirme hakki
const MONTHLY_UC_STOCK = 5;     // bu ay en fazla kac kisi 60 UC kazanabilir
const UC_ODDS = 1000;           // 60 UC cikma ihtimali: 1 / 1000
// ========================================================

const SLICES = [
  "60 UC",   // index 0 - odullu dilim
  "M416",
  "AWM",
  "AKM",
  "Kar98K",
  "Groza",
  "M24",
  "SCAR-L",
  "UZI",
  "Vector",
  "DP-28",
  "Mini14",
];

function todayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function monthStart() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

async function getEmail() {
  const session = await getServerSession(authOptions);
  return session?.user?.email ?? null;
}

// GET -> kalan hak sayisi
export async function GET() {
  try {
    const email = await getEmail();
    if (!email) {
      return NextResponse.json({ error: "Giris yapmalisin" }, { status: 401 });
    }

    const usedToday = await prisma.wheelSpin.count({
      where: { email, createdAt: { gte: todayStart() } },
    });

    return NextResponse.json({
      remaining: Math.max(0, DAILY_LIMIT - usedToday),
      dailyLimit: DAILY_LIMIT,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Sunucu hatasi" }, { status: 500 });
  }
}

// POST -> carki cevir
export async function POST() {
  try {
    const email = await getEmail();
    if (!email) {
      return NextResponse.json({ error: "Giris yapmalisin" }, { status: 401 });
    }

    // Gunluk hak kontrolu
    const usedToday = await prisma.wheelSpin.count({
      where: { email, createdAt: { gte: todayStart() } },
    });
    if (usedToday >= DAILY_LIMIT) {
      return NextResponse.json(
        { error: "Bugunluk hakkin bitti, yarin tekrar gel!" },
        { status: 429 }
      );
    }

    // Aylik UC stogu kontrolu
    const ucWonThisMonth = await prisma.wheelSpin.count({
      where: { wonUc: true, createdAt: { gte: monthStart() } },
    });
    const stockLeft = ucWonThisMonth < MONTHLY_UC_STOCK;

    // ===== IHTIMAL HESABI (sunucu tarafinda, kimse goremez/degistiremez) =====
    let index: number;
    if (stockLeft && Math.floor(Math.random() * UC_ODDS) === 0) {
      index = 0; // 60 UC!
    } else {
      index = 1 + Math.floor(Math.random() * (SLICES.length - 1)); // silahlardan biri
    }

    const prize = SLICES[index];
    const wonUc = index === 0;

    await prisma.wheelSpin.create({
      data: { email, prize, wonUc },
    });

    return NextResponse.json({
      index,
      prize,
      wonUc,
      remaining: Math.max(0, DAILY_LIMIT - usedToday - 1),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Sunucu hatasi" }, { status: 500 });
  }
}
