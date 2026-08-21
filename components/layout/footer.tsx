import Link from 'next/link';
import { Logo } from './logo';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mb-[64px] border-t border-border md:mb-0">
      <div className="container flex flex-col gap-4 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <div>
          <Logo />
          <p className="mt-3 max-w-md text-xs leading-relaxed text-faint">
            MAAR Pulse displays content from YouTube via the official YouTube Data API v3 and embedded player.
            Video ownership and rights belong to their respective creators and YouTube.
          </p>
        </div>

        <div className="flex flex-col gap-1 text-xs md:items-end">
          <p>
            &copy; {year} MAAR Pulse. All rights reserved.
          </p>
          <p>
            Owned and operated by <span className="font-medium text-ink">Md Adil Rajon</span>.
          </p>
          <div className="mt-1 flex gap-3">
            <Link href="/settings" className="hover:text-ink">Settings</Link>
            <Link href="/explore" className="hover:text-ink">Explore</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
