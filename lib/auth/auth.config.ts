import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { UserRole } from "@/types";

/**
 * NextAuth Configuration
 *
 * This is a simplified configuration for demonstration.
 * In production, you would:
 * 1. Use a real database (PostgreSQL, MySQL, etc.) via Prisma or similar
 * 2. Properly hash passwords with bcrypt
 * 3. Store OAuth credentials securely
 * 4. Implement proper user management
 */

// Mock user database (replace with real database in production)
const mockUsers = [
  {
    id: "1",
    email: "admin@example.com",
    password: "admin123", // In production, this should be hashed
    name: "Admin User",
    role: UserRole.ADMIN,
    teams: ["Platform", "Mobile"],
  },
  {
    id: "2",
    email: "manager@example.com",
    password: "manager123",
    name: "Manager User",
    role: UserRole.MANAGER,
    teams: ["Platform"],
  },
  {
    id: "3",
    email: "member@example.com",
    password: "member123",
    name: "Member User",
    role: UserRole.MEMBER,
    teams: ["Mobile"],
  },
  {
    id: "4",
    email: "viewer@example.com",
    password: "viewer123",
    name: "Viewer User",
    role: UserRole.VIEWER,
    teams: [],
  },
];

export const authConfig: NextAuthConfig = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = mockUsers.find(
          (u) =>
            u.email === credentials.email &&
            u.password === credentials.password
        );

        if (!user) {
          return null;
        }

        // Return user object (password excluded)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          teams: user.teams,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || UserRole.VIEWER;
        token.teams = (user as any).teams || [];
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).teams = token.teams;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
};
