'use client';

import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SearchBar({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [mobileOpen, setMobileOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    setMobileOpen(false);
  };

  if (variant === 'mobile') {
    return (
      <>
        <button
          aria-label="Search"
          onClick={() => {
            setMobileOpen(true);
            requestAnimationFrame(() => inputRef.current?.focus());
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-raised"
        >
          <Search className="h-5 w-5" />
        </button>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18 }}
              className="glass fixed inset-x-0 top-0 z-50 flex items-center gap-2 border-b border-border px-3 py-3"
            >
              <form onSubmit={submit} className="flex flex-1 items-center gap-2">
                <Search className="h-4 w-4 shrink-0 text-muted" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search MAAR Pulse"
                  className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-faint"
                />
              </form>
              <button aria-label="Close search" onClick={() => setMobileOpen(false)} className="rounded-full p-1.5 hover:bg-raised">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <form onSubmit={submit} className="relative mx-auto hidden w-full max-w-xl md:flex">
      <div className={cn('flex w-full items-center gap-2 rounded-full border border-border bg-raised px-4 py-2 transition-shadow focus-within:ring-2 focus-within:ring-signal/50')}>
        <Search className="h-4 w-4 shrink-0 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search videos, channels..."
          aria-label="Search MAAR Pulse"
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
        />
        {query && (
          <button type="button" aria-label="Clear search" onClick={() => setQuery('')} className="text-faint hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}
