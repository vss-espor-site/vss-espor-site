import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Uc giris yontemi var:
// 1) Admin: sadece .env'deki ADMIN_EMAIL + ADMIN_PASSWORD_HASH ile eslesen kisi.
// 2) Google: kayitli oyuncularin Gmail ile giris yapip kendi profiline baglanmasi.
// 3) Oyuncu e-posta+sifre: kendi e-postasi ile kayit olan oyuncular (dogrulama su an kapali).
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Girisi",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Sifre", type: "password" },
      },
      async authorize(credentials) {
        const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
        const adminHash = process.env.ADMIN_PASSWORD_HASH;

        // ---- GECICI DEBUG LOGLARI (sorun cozulunce silinecek) ----
        console.log("[ADMIN-DEBUG] authorize cagrildi");
        console.log("[ADMIN-DEBUG] env email var mi:", !!adminEmail, "| uzunluk:", adminEmail?.length);
        console.log("[ADMIN-DEBUG] env hash var mi:", !!adminHash, "| uzunluk:", adminHash?.length, "| ilk 7 karakter:", adminHash?.slice(0, 7));
        console.log("[ADMIN-DEBUG] girilen email uzunluk:", credentials?.email?.length, "| sifre uzunluk:", credentials?.password?.length);
        // ----------------------------------------------------------

        if (!credentials?.email || !credentials?.password) {
          console.log("[ADMIN-DEBUG] SONUC: email veya sifre bos geldi");
          return null;
        }
        if (!adminEmail || !adminHash) {
          console.log("[ADMIN-DEBUG] SONUC: env degiskenleri eksik/bos");
          return null;
        }

        if (credentials.email.toLowerCase().trim() !== adminEmail) {
          console.log("[ADMIN-DEBUG] SONUC: email eslesmedi. Girilen(normalize):", credentials.email.toLowerCase().trim(), "| Beklenen uzunluk:", adminEmail.length, "Girilen uzunluk:", credentials.email.toLowerCase().trim().length);
          return null;
        }

        const valid = await bcrypt.compare(credentials.password, adminHash);
        if (!valid) {
          console.log("[ADMIN-DEBUG] SONUC: bcrypt eslesmedi (email dogruydu)");
          return null;
        }

        console.log("[ADMIN-DEBUG] SONUC: GIRIS BASARILI");
        return { id: "admin", email: adminEmail, name: "Admin" };
      },
    }),
    CredentialsProvider({
      id: "player-credentials",
      name: "Oyuncu Girisi",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Sifre", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const player = await prisma.player.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });
        if (!player || !player.passwordHash) return null;

        const valid = await bcrypt.compare(credentials.password, player.passwordHash);
        if (!valid) return null;

        return { id: player.id, email: player.email!, name: `${player.firstName} ${player.lastName}` };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account?.provider === "admin-credentials") {
        token.role = "admin";
      }
      if (user && (account?.provider === "player-credentials" || account?.provider === "google")) {
        token.role = "player";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
