import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  pages: {
    signIn:  "/login",
    error:   "/login",
    newUser: "/dashboard",
  },
  providers: [
    // ── Google OAuth (optional — set credentials in .env) ──────────────────
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          GoogleProvider({
            clientId:     process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            profile(profile) {
              return {
                id:       profile.sub,
                email:    profile.email,
                name:     profile.name,
                image:    profile.picture,
                username: profile.email.split("@")[0].replace(/[^a-zA-Z0-9_-]/g, ""),
                role:     "USER",
              };
            },
          }),
        ]
      : []),

    // ── Credentials (email + password) ────────────────────────────────────
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });
        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return {
          id:       user.id,
          email:    user.email,
          username: user.username,
          role:     user.role,
        };
      },
    }),
  ],

  callbacks: {
    // Persist extra fields into the JWT
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id       = (user as any).id;
        token.username = (user as any).username;
        token.role     = (user as any).role ?? "USER";
      }
      // Allow client-side session update (e.g. after changing username)
      if (trigger === "update" && session) {
        token.username = session.username ?? token.username;
      }
      return token;
    },
    // Expose those fields to useSession / getServerSession
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id       = token.id as string;
        (session.user as any).username = token.username as string;
        (session.user as any).role     = token.role as string;
      }
      return session;
    },
    // Allow all sign-ins; redirect new Google users to dashboard so a profile is created
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        // Auto-create a profile row on first OAuth sign-in
        const existing = await prisma.user.findUnique({
          where: { email: (user as any).email },
          include: { profile: true },
        });
        if (existing && !existing.profile) {
          await prisma.profile.create({
            data: {
              userId:      existing.id,
              displayName: user.name ?? "",
              avatarUrl:   user.image ?? null,
            },
          });
        }
      }
      return true;
    },
  },
};

// ─── Session type augmentation ────────────────────────────────────────────────
declare module "next-auth" {
  interface Session {
    user: {
      id:       string;
      email:    string;
      username: string;
      role:     string;
      name?:    string | null;
      image?:   string | null;
    };
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id:       string;
    username: string;
    role:     string;
  }
}
