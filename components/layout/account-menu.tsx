'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn, signOut, useSession } from 'next-auth/react';
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

  if (status !== 'authenticated') {
    return (
      <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => signIn('google')} disabled={status === 'loading'}>
        <LogIn className="h-4 w-4" />
        <span className="hidden sm:inline">Sign in</span>
      </Button>
    );
  }

  const user = session.user;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-signal to-pulse ring-2 ring-transparent hover:ring-border"
        aria-label="Account menu"
        aria-expanded={open}
      >
        {user?.image && <Image src={user.image} alt={user.name ?? 'Account'} width={36} height={36} className="h-full w-full object-cover" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="glass absolute right-0 top-12 w-56 overflow-hidden rounded-md border border-border shadow-soft"
          >
            <div className="border-b border-border px-3.5 py-2.5">
              <p className="truncate text-sm font-medium text-ink">{user?.name}</p>
              <p className="truncate text-xs text-muted">{user?.email}</p>
            </div>
            <Link href="/history" className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink hover:bg-raised">
              <History className="h-4 w-4" /> Watch history
            </Link>
            <Link href="/settings" className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink hover:bg-raised">
              <Settings className="h-4 w-4" /> Settings
            </Link>
            <button
              onClick={() => signOut()}
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
