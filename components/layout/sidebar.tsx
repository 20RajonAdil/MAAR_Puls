'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Bookmark, History, Users, Settings, Clapperboard } from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/shorts', label: 'Shorts', icon: Clapperboard },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/subscriptions', label: 'Subscriptions', icon: Users },
  { href: '/saved', label: 'Watch later', icon: Bookmark },
  { href: '/history', label: 'History', icon: History },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 flex-col justify-between overflow-y-auto border-r border-border px-3 py-5 md:flex">
      <nav className="flex flex-col gap-1">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                active ? 'bg-raised text-signal' : 'text-muted hover:bg-raised hover:text-ink'
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.4 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/settings"
        className={cn(
          'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
          pathname === '/settings' ? 'bg-raised text-signal' : 'text-muted hover:bg-raised hover:text-ink'
        )}
      >
        <Settings className="h-[18px] w-[18px]" />
        Settings
      </Link>
    </aside>
  );
}
