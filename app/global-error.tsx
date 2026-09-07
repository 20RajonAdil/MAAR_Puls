'use client';

import { useEffect } from 'react';

/**
 * Next.js's per-page `error.tsx` boundaries cannot catch errors thrown
 * inside the root `app/layout.tsx` itself (a misconfigured env var, a
 * bad NextAuth session lookup, etc.) — without this file, that kind of
 * error falls through to Next.js's bare, unstyled "Application error"
 * page on every route. This file catches it and renders MAAR Pulse's
 * own look, including <html>/<body> since the real root layout didn't
 * get a chance to render.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root layout crashed:', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#08090b', color: '#fafaf9' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '0.75rem', color: '#2dd4bf', fontFamily: 'monospace' }}>500</p>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>MAAR Pulse hit a snag</h1>
          <p style={{ maxWidth: '28rem', fontSize: '0.875rem', color: '#a1a1aa' }}>
            Something went wrong loading the app itself — this usually means a required environment variable
            (like <code>NEXTAUTH_SECRET</code>, <code>GOOGLE_CLIENT_ID</code> or <code>GOOGLE_CLIENT_SECRET</code>)
            is missing or misconfigured on the server.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem 1.25rem',
              borderRadius: '0.375rem',
              background: '#2dd4bf',
              color: '#000',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
