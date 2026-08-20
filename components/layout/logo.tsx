'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

const BAR_HEIGHTS = [0.5, 1, 0.65, 0.85, 0.4];

export function Logo({ className }: { className?: string }) {
  const reduced = useReducedMotion();

  return (
    <Link href="/" className={`group flex items-center gap-2.5 ${className ?? ''}`} aria-label="MAAR Pulse home">
      <span className="flex h-6 items-end gap-[3px]" aria-hidden>
        {BAR_HEIGHTS.map((h, i) => (
          <motion.span
            key={i}
            className="w-[3px] rounded-full bg-gradient-to-t from-signal to-pulse"
            style={{ height: `${h * 100}%` }}
            animate={reduced ? undefined : { scaleY: [0.4, 1, h] }}
            transition={{
              duration: 1.1,
              repeat: Infinity,
              repeatType: 'mirror',
              delay: i * 0.12,
              ease: 'easeInOut',
            }}
          />
        ))}
      </span>
      <span className="font-display text-lg font-semibold tracking-tight text-ink">
        MAAR<span className="text-signal">Pulse</span>
      </span>
    </Link>
  );
}
