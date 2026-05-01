import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  session: { strategy: "database" },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    authorized({ auth }) {
      return !!auth;
    },
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
