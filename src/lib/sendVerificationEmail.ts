import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(to: string, firstName: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/api/verify-email?token=${token}`;

  await resend.emails.send({
    from: "VSS E-Sports <onboarding@resend.dev>",
    to,
    subject: "VSS E-Sports - Hesabini Dogrula",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; background:#0a0d10; color:#e5e9ec; padding: 32px; border-radius: 12px;">
        <h2 style="color:#29d3ff;">VSS E-Sports</h2>
        <p>Merhaba ${firstName},</p>
        <p>Hesabini dogrulamak icin asagidaki butona tikla:</p>
        <a href="${verifyUrl}" style="display:inline-block; margin-top:16px; padding: 12px 24px; background:#29d3ff; color:#000; text-decoration:none; font-weight:bold; border-radius: 6px;">
          Hesabimi Dogrula
        </a>
        <p style="margin-top:24px; font-size:12px; color:#888;">
          Eger bu kaydi sen olusturmadiysan bu e-postayi yok sayabilirsin.
        </p>
      </div>
    `,
  });
}
