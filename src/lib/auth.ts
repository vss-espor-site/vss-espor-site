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

        if (!credentials?.email || !credentials?.password) return null;
        if (!adminEmail || !adminHash) return null;

        if (credentials.email.toLowerCase().trim() !== adminEmail) {
          return null;
        }

        console.log("DEBUG adminEmail:", JSON.stringify(adminEmail));
        console.log("DEBUG credEmail:", JSON.stringify(credentials.email.toLowerCase().trim()));
        console.log("DEBUG adminHash:", JSON.stringify(adminHash));
        const valid = await bcrypt.compare(credentials.password, adminHash);
        console.log("DEBUG valid:", valid);
        if (!valid) return null;

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
