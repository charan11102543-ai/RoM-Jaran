import "server-only";
import bcrypt from "bcryptjs";
import type { NextAuthOptions, Session } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email ?? undefined;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.email = token.email ?? session.user.email ?? "";
      }

      return session;
    },
  },
};

export async function getAdminSession() {
  return getServerSession(authOptions);
}

export async function requireAdminPageSession() {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return session;
}

export async function requireAdminApiSession() {
  const session = await getAdminSession();
  return session?.user?.id ? session : null;
}

export function assertAdminSession(session: Session | null): session is Session {
  return Boolean(session?.user?.id);
}
