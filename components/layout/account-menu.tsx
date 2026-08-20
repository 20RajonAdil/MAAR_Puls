'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Settings, History, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Phase-2 note: this renders the signed-out state by default since Google
 * OAuth is not wired into this scaffold yet. Swap `isSignedIn` for a real
 * session check (e.g. `useSession()` from next-auth) once auth lands —
 * see README "Authentication" section for the required scopes.
 */
export function AccountMenu() {
  const isSignedIn = false;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (!isSignedIn) {
    return (
      <Button size="sm" variant="secondary" className="gap-1.5">
        <LogIn className="h-4 w-4" />
        <span className="hidden sm:inline">Sign in</span>
      </Button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-signal to-pulse ring-2 ring-transparent hover:ring-border"
        aria-label="Account menu"
        aria-expanded={open}
      />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="glass absolute right-0 top-12 w-52 overflow-hidden rounded-md border border-border shadow-soft"
          >
            <Link href="/history" className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink hover:bg-raised">
              <History className="h-4 w-4" /> Watch history
            </Link>
            <Link href="/settings" className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink hover:bg-raised">
              <Settings className="h-4 w-4" /> Settings
            </Link>
            <button className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-danger hover:bg-raised">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
