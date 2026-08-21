import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import './globals.css';

const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const body = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${display.variable} ${body.variable} ${mono.variable} font-body antialiased`}>
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
      </body>
    </html>
  );
}
