import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { computeAgeGroup } from "@/lib/ageGroup";

const schema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  age: z.coerce.number().int().min(10).max(99),
  pubgId: z.string().min(3).max(30),
  community: z.enum(["instagram", "tiktok", "both", "none"]),
  socialHandle: z.string().max(50).optional().or(z.literal("")),
  email: z.string().email(),
  password: z.string().min(6, "Sifre en az 6 karakter olmali"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Gecersiz veri" }, { status: 400 });
    }
    const data = parsed.data;

    const existingEmail = await prisma.player.findUnique({ where: { email: data.email } });
    if (existingEmail) {
      return NextResponse.json({ error: "Bu e-posta ile zaten bir kayit mevcut." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const existingPubgId = await prisma.player.findUnique({ where: { pubgId: data.pubgId } });

    let player;

    if (existingPubgId) {
      if (existingPubgId.email) {
        return NextResponse.json(
          { error: "Bu PUBG ID zaten bir hesaba bagli. Eger bu senin ID'inse bizimle iletisime gec." },
          { status: 409 }
        );
      }
      player = await prisma.player.update({
        where: { id: existingPubgId.id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          age: data.age,
          ageGroup: computeAgeGroup(data.age),
          community: data.community,
          socialHandle: data.socialHandle || null,
          email: data.email,
          passwordHash,
          emailVerified: true,
        },
      });
    } else {
      player = await prisma.player.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          age: data.age,
          ageGroup: computeAgeGroup(data.age),
          pubgId: data.pubgId,
          community: data.community,
          socialHandle: data.socialHandle || null,
          email: data.email,
          passwordHash,
          emailVerified: true,
        },
      });
    }

    return NextResponse.json({ success: true, player: { id: player.id } }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatasi" }, { status: 500 });
  }
}
