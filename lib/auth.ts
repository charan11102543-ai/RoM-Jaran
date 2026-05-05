import "server-only";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        return validateAdminCredentials(credentials.email, credentials.password) as any;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email ?? session.user.email;
      }
      return session;
    },
  },
};

export async function getCurrentSession() {
  return getServerSession(authOptions);
}

export async function requireAdminSession() {
  const session = await getCurrentSession();
  if (!session?.user?.email) {
    redirect("/login");
  }
  return session;
}

export const requireAdminPageSession = requireAdminSession;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

export async function createAdminUser(email: string, password: string) {
  const passwordHash = await hashPassword(password);
  try {
    return await prisma.user.create({ data: { email, passwordHash } });
  } catch (error) {
    throw new Error(`Failed to create admin user: ${error}`);
  }
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function validateAdminCredentials(email: string, password: string) {
  const user = await getUserByEmail(email);
  if (!user) return null;
  const isValid = await comparePassword(password, user.passwordHash);
  return isValid ? user : null;
}
