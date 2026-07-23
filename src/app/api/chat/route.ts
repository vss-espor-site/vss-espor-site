import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SYSTEM_PROMPT = `Sen bir PUBG Mobile e-spor toplulugu/takiminin resmi web sitesindeki
AI destekli sohbet asistanisin. Gorevlerin:
- Siteye gelen ziyaretcilere kayit sureci (Ad, Soyad, Yas, PUBG ID, Instagram/TikTok toplulugu)
  hakkinda rehberlik etmek.
- Aktif ve yaklasan turnuvalar, kurallar ve katilim sartlari hakkinda soru cevaplamak.
- Genel PUBG Mobile ve topluluk ile ilgili sohbetlere samimi, enerjik ama saygili bir dille katilmak.
- Kisa, net ve dostane cevaplar ver. Asiri resmi olma ama kufur/hakaret icermeyen bir dil kullan.
- Eger bir soru site yonetimi (sifre, admin islemleri, veritabani vb.) ile ilgiliyse,
  bunun sadece site admini tarafindan yapilabilecegini belirt.
- Bilmedigin ozel/guncel bir bilgiyi (ornegin gercek turnuva sonuclari) uydurma; genel yonlendirme yap.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Mesaj bulunamadi" }, { status: 400 });
    }

    // Sohbete guncel duyuru ve turnuva bilgisini baglam olarak ekle
    const [announcements, tournaments] = await Promise.all([
      prisma.announcement.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.tournament.findMany({ orderBy: { startDate: "asc" }, take: 5 }),
    ]);

    const context = `
Guncel duyurular:
${announcements.map((a) => `- ${a.title}: ${a.content}`).join("\n") || "(duyuru yok)"}

Yaklasan/aktif turnuvalar:
${
  tournaments
    .map((t) => `- ${t.title} (${t.status}) - baslangic: ${t.startDate.toISOString()}`)
    .join("\n") || "(turnuva yok)"
}
`;

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "AI asistan henuz yapilandirilmadi (ANTHROPIC_API_KEY eksik)." },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 500,
        system: SYSTEM_PROMPT + "\n\n" + context,
        messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API hatasi:", errText);
      return NextResponse.json({ error: "AI asistan su an yanit veremiyor." }, { status: 502 });
    }

    const data = await response.json();
    const text = data.content
      ?.map((block: any) => (block.type === "text" ? block.text : ""))
      .join("\n")
      .trim();

    return NextResponse.json({ reply: text || "Uzgunum, bir seyler ters gitti." });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatasi" }, { status: 500 });
  }
}
