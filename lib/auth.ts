import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

/**
 * Central NextAuth config, shared by the /api/auth/[...nextauth] route
 * handler and any server component that needs `getServerSession`.
 *
 * Sign-in flow matches how Google sign-in works on real sites (YouTube
 * included): clicking "Sign in with Google" sends the browser to Google's
 * own accounts.google.com consent screen, the user picks/confirms their
 * account there, and Google redirects back to this app with a session.
 * MAAR Pulse never sees the user's Google password.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          // Always show the Google account chooser, like youtube.com does,
          // instead of silently reusing whatever Google session is active.
          prompt: 'select_account',
          access_type: 'online',
          response_type: 'code',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, profile }) {
      // On initial sign-in, `account`/`profile` are populated. Stash the
      // Google profile picture on the token so refreshes keep it.
      if (account && profile) {
        const googleProfile = profile as { picture?: string; sub?: string };
        if (googleProfile.picture) token.picture = googleProfile.picture;
        if (googleProfile.sub) token.sub = googleProfile.sub;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? '';
        if (typeof token.picture === 'string') {
          session.user.image = token.picture;
        }
      }
      return session;
    },
  },
  pages: {
    // Fall back to NextAuth's built-in /api/auth/signin and /api/auth/error
    // pages — no custom page needed for a single-provider (Google) setup.
  },
};
