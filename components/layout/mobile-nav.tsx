'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Compass, Bookmark, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/saved', label: 'Saved', icon: Bookmark },
  { href: '/settings', label: 'Account', icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="glass fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-border pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Primary"
    >
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href} className="relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px]">
            <Icon className={cn('h-5 w-5', active ? 'text-signal' : 'text-muted')} strokeWidth={active ? 2.4 : 2} />
            <span className={cn(active ? 'text-signal' : 'text-muted')}>{label}</span>
            {active && (
              <motion.span
                layoutId="mobile-nav-indicator"
                className="absolute top-0 h-0.5 w-8 rounded-full bg-signal"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
