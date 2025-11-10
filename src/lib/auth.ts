import "server-only";
import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export const authOptions: NextAuthConfig = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const { db } = await import("@/src/db/client");
        const email = String((creds as any)?.email || "").toLowerCase().trim();
        const password = String((creds as any)?.password || "");
        if (!email || !password) return null;
        const [user] = await db
          .select({
            id: users.id,
            email: users.email,
            passwordHash: users.passwordHash,
            isAdmin: users.isAdmin,
          })
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: String(user.id),
          email: user.email,
          is_admin: user.isAdmin,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        (token as any).is_admin = Boolean((user as any).is_admin);
      }
      return token;
    },
    async session({ session, token }: any) {
      (session as any).user = (session as any).user || {};
      (session as any).user.is_admin = Boolean((token as any)?.is_admin);
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const nextAuth = NextAuth(authOptions);
export const auth = nextAuth.auth;
export const { GET, POST } = nextAuth.handlers;
