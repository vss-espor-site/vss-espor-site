import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Tek admin hesabi: sadece .env'deki ADMIN_EMAIL + ADMIN_PASSWORD_HASH ile
// eslesen kisi giris yapabilir. Baska hicbir hesap/kayit yolu yoktur.
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    CredentialsProvider({
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

        const valid = await bcrypt.compare(credentials.password, adminHash);
        if (!valid) return null;

        return { id: "admin", email: adminEmail, name: "Admin" };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = "admin";
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
