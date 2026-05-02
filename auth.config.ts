import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

const authConfig = {
  providers: [Google],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    authorized({ auth }) {
      return !!auth;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
