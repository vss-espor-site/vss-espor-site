import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVssRequestNotification(
  playerName: string,
  pubgId: string,
  playerEmail: string
) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  await resend.emails.send({
    from: "VSS E-Sports <onboarding@resend.dev>",
    to: adminEmail,
    subject: `VSS Ailesi katilim istegi: ${playerName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; background:#0a0d10; color:#e5e9ec; padding: 32px; border-radius: 12px;">
        <h2 style="color:#29d3ff;">Yeni VSS Ailesi Istegi</h2>
        <p><strong>${playerName}</strong> (PUBG ID: ${pubgId}, e-posta: ${playerEmail}) VSS Ailesi sohbetine katilmak istiyor.</p>
        <a href="${baseUrl}/admin/vss-requests" style="display:inline-block; margin-top:16px; padding: 12px 24px; background:#29d3ff; color:#000; text-decoration:none; font-weight:bold; border-radius: 6px;">
          Istekleri Incele
        </a>
      </div>
    `,
  });
}
