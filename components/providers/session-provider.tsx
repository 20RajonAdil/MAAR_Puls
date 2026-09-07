'use client';

import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';

/**
 * Thin client wrapper so the server component `app/layout.tsx` can render
 * a provider without itself becoming a client component. Pass the session
 * fetched on the server (if any) as `session` to avoid a flash of the
 * signed-out state on first paint.
 */
export function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
