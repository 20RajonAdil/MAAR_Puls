'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signIn, signOut } from 'next-auth/react';
import { LogIn, Settings, History, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AccountMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (status === 'loading') {
    return <div className="h-9 w-9 animate-pulse rounded-full bg-raised" aria-hidden="true" />;
  }

  if (status !== 'authenticated' || !session?.user) {
    return (
      <Button
        size="sm"
        variant="secondary"
        className="gap-1.5"
        onClick={() => signIn('google')}
      >
        <LogIn className="h-4 w-4" />
        <span className="hidden sm:inline">Sign in</span>
      </Button>
    );
  }

  const { name, email, image } = session.user;
  const initial = (name ?? email ?? '?').charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-signal to-pulse ring-2 ring-transparent hover:ring-border"
        aria-label="Account menu"
        aria-expanded={open}
      >
        {image ? (
          <Image
            src={image}
            alt={name ?? 'Account'}
            fill
            sizes="36px"
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-black">
            {initial}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="glass absolute right-0 top-12 w-64 overflow-hidden rounded-md border border-border shadow-soft"
          >
            <div className="flex items-center gap-3 border-b border-border px-3.5 py-3">
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-signal to-pulse">
                {image ? (
                  <Image src={image} alt={name ?? 'Account'} fill sizes="36px" className="object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-black">{initial}</span>
                )}
              </div>
              <div className="min-w-0">
                {name && <p className="truncate text-sm font-medium text-ink">{name}</p>}
                {email && <p className="truncate text-xs text-muted">{email}</p>}
              </div>
            </div>
            <Link href="/history" className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink hover:bg-raised">
              <History className="h-4 w-4" /> Watch history
            </Link>
            <Link href="/settings" className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink hover:bg-raised">
              <Settings className="h-4 w-4" /> Settings
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-danger hover:bg-raised"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
