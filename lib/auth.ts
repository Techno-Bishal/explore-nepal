import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });
        if (!user || !user?.hashedPassword) {
          throw new Error("Invalid credentials");
        }

        // Check if user is blocked
        if (user.isBlocked) {
          throw new Error("Your account has been suspended. Contact support for assistance.");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );
        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        // Update last login time
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        }).catch(() => {}); // Non-blocking

        return {
          id: user?.id ?? "",
          email: user?.email ?? "",
          name: user?.name ?? "",
          role: user?.role ?? "user",
          image: user?.image ?? null,
          sessionVersion: user?.sessionVersion ?? 0,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user?.role ?? "user";
        token.id = user?.id ?? "";
        token.sessionVersion = user?.sessionVersion ?? 0;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session?.user) {
        (session.user as any).role = token?.role ?? "user";
        (session.user as any).id = token?.id ?? "";

        // Verify session version is still valid (for logout-all-devices)
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token?.id },
            select: { sessionVersion: true, isBlocked: true, role: true },
          });
          if (dbUser) {
            if (dbUser.isBlocked) {
              return { ...session, user: null, expires: new Date(0).toISOString() };
            }
            if (dbUser.sessionVersion !== token?.sessionVersion) {
              return { ...session, user: null, expires: new Date(0).toISOString() };
            }
            // Sync role from DB (in case admin changed it)
            (session.user as any).role = dbUser.role;
          }
        } catch {
          // If DB is unreachable, allow session to continue
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
