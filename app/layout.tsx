import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AuthProvider } from '@/components/providers/session-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import './globals.css';

const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const body = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  try {
    // Validates the value is actually a well-formed absolute URL before
    // it's used anywhere — an env var typo (missing "https://", stray
    // space, trailing garbage) would otherwise throw here and take down
    // every page on the site, since this runs in the root layout.
    return new URL(raw).toString();
  } catch {
    return 'http://localhost:3000';
  }
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: 'MAAR Pulse — Video, tuned to a calmer rhythm', template: '%s · MAAR Pulse' },
  description: 'Discover and watch real YouTube video on MAAR Pulse — search, subscribe, and build watch history in a premium, distraction-free feed.',
  openGraph: {
    type: 'website',
    siteName: 'MAAR Pulse',
    title: 'MAAR Pulse — Video, tuned to a calmer rhythm',
    description: 'Discover and watch real YouTube video on MAAR Pulse.',
  },
  twitter: { card: 'summary_large_image' },
  manifest: '/manifest.webmanifest',
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#08090b' },
    { media: '(prefers-color-scheme: light)', color: '#fafaf9' },
  ],
  width: 'device-width',
  initialScale: 1,
};

async function safeGetServerSession(): Promise<Session | null> {
  try {
    return await getServerSession(authOptions);
  } catch (err) {
    // Next.js throws a DYNAMIC_SERVER_USAGE error (by design) when this
    // route is being tried as static and getServerSession()'s use of
    // headers() means it can't be. That's not a real error — it's Next's
    // own signal to itself to mark the route dynamic instead. Swallowing
    // it here would hide that signal and risk the route getting built as
    // static with a permanently signed-out session baked in, so let it
    // propagate unchanged.
    if (err && typeof err === 'object' && 'digest' in err && err.digest === 'DYNAMIC_SERVER_USAGE') {
      throw err;
    }

    // Anything else here really is unexpected — most commonly a
    // misconfigured/missing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET or
    // NEXTAUTH_SECRET env var. This file is the root layout, so an
    // uncaught error here takes down every single page on the site
    // (Next.js's per-page error.tsx doesn't catch root-layout errors).
    // Falling back to a signed-out session keeps the rest of the site
    // working — the header will just show "Sign in" until the env vars
    // are fixed, instead of the whole app going blank.
    console.error('getServerSession failed — check GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET/NEXTAUTH_SECRET env vars:', err);
    return null;
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await safeGetServerSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${display.variable} ${body.variable} ${mono.variable} font-body antialiased`}>
        <AuthProvider session={session}>
          <ThemeProvider>
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-signal focus:px-4 focus:py-2 focus:text-black">
              Skip to content
            </a>
            <Header />
            <div className="flex">
              <Sidebar />
              <main id="main-content" className="min-w-0 flex-1 pb-20 md:pb-0">
                {children}
              </main>
            </div>
            <MobileNav />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
