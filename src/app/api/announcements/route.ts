import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const announcements = await prisma.announcement.findMany({
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ announcements });
}

const schema = z.object({
  title: z.string().min(3),
  content: z.string().min(3),
  pinned: z.boolean().optional(),
});

// Duyuru mailini tum e-postali oyunculara gonderir.
// Hata olsa bile duyuru kaydini etkilemez (try/catch ile sarili cagriliyor).
async function sendAnnouncementEmails(title: string, content: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const players = await prisma.player.findMany({
    where: { email: { not: null } },
    select: { email: true },
  });

  const emails = players
    .map((p) => p.email)
    .filter((e): e is string => !!e);

  if (emails.length === 0) return;

  const html = `
    <div style="background:#0B1220;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:560px;margin:0 auto;background:#101B33;border:1px solid #D4AF37;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(90deg,#0B1220,#1F4FD6,#0B1220);padding:20px;text-align:center;">
          <span style="color:#29D3FF;font-size:22px;font-weight:bold;">VSS</span>
          <span style="color:#F2D16B;font-size:22px;font-weight:bold;"> E-SPOR</span>
        </div>
        <div style="padding:28px 24px;">
          <p style="color:#F2D16B;font-size:12px;letter-spacing:2px;margin:0 0 8px;">YENI DUYURU</p>
          <h1 style="color:#ffffff;font-size:20px;margin:0 0 16px;">${escapeHtml(title)}</h1>
          <p style="color:#c7d2e8;font-size:14px;line-height:1.7;white-space:pre-line;margin:0 0 24px;">${escapeHtml(content)}</p>
          <a href="https://www.vssespor.com/announcements"
             style="display:inline-block;background:linear-gradient(90deg,#D4AF37,#F2D16B);color:#050608;font-weight:bold;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;">
            Sitede Görüntüle
          </a>
        </div>
        <div style="padding:16px 24px;border-top:1px solid #1F2A44;">
          <p style="color:#5b6b8c;font-size:11px;margin:0;">
            Bu e-postayı www.vssespor.com üyesi olduğunuz için aldınız.
          </p>
        </div>
      </div>
    </div>
  `;

  // Resend batch API: tek istekte en fazla 100 mail.
  // Uyeleri 100'luk gruplara bolup gonderiyoruz.
  for (let i = 0; i < emails.length; i += 100) {
    const batch = emails.slice(i, i + 100).map((to) => ({
      from: "VSS E-Spor <duyuru@vssespor.com>",
      to: [to],
      subject: `📢 ${title}`,
      html,
    }));

    await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(batch),
    });
  }
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const announcement = await prisma.announcement.create({ data: parsed.data });

  // Mail gonderimi: hata verirse bile duyuru kaydi bozulmasin
  try {
    await sendAnnouncementEmails(parsed.data.title, parsed.data.content);
  } catch (e) {
    console.error("Duyuru maili gonderilemedi:", e);
  }

  return NextResponse.json({ announcement }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await req.json();
  await prisma.announcement.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
