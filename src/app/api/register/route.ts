import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { computeAgeGroup } from "@/lib/ageGroup";

const schema = z.object({
  firstName: z.string().min(2, "Ad en az 2 karakter olmali").max(50),
  lastName: z.string().min(2, "Soyad en az 2 karakter olmali").max(50),
  age: z.coerce.number().int().min(10, "Gecerli bir yas gir").max(99),
  pubgId: z.string().min(3, "PUBG ID en az 3 karakter olmali").max(30),
  community: z.enum(["instagram", "tiktok", "both", "none"]),
  socialHandle: z.string().max(50).optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Gecersiz veri" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const ageGroup = computeAgeGroup(data.age);

    const existing = await prisma.player.findUnique({ where: { pubgId: data.pubgId } });
    if (existing) {
      return NextResponse.json(
        { error: "Bu PUBG ID ile zaten bir kayit mevcut." },
        { status: 409 }
      );
    }

    const player = await prisma.player.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        ageGroup,
        pubgId: data.pubgId,
        community: data.community,
        socialHandle: data.socialHandle || null,
      },
    });

    return NextResponse.json({ success: true, player }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatasi" }, { status: 500 });
  }
}
