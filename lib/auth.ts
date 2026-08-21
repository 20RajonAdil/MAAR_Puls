import 'server-only';
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

/**
 * IMPORTANT — this Google Sign-In grants a MAAR Pulse account only. It does
 * NOT grant access to the user's real YouTube subscriptions/data; that
 * would require the `https://www.googleapis.com/auth/youtube.readonly`
 * scope requested separately and explicitly (a Phase-3 feature — see
 * README). The scope below is intentionally limited to basic profile info.
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      authorization: {
        params: {
          scope: 'openid email profile',
          prompt: 'select_account',
        },
      },
    }),
  ],
  session: { strategy: 'database' },
  pages: {
    // Falls back to NextAuth's built-in page if not overridden; MAAR Pulse
    // triggers sign-in via signIn() from the account menu instead of a
    // dedicated route, so no custom page is required.
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id;
      }
      return session;
    },
  },
};
