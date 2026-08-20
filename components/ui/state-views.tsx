'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, SearchX, WifiOff, Clock, Inbox } from 'lucide-react';
import type { ApiErrorShape } from '@/types/youtube';
import { Button } from './button';

const ICONS = {
  QUOTA_EXCEEDED: Clock,
  NOT_FOUND: SearchX,
  INVALID_REQUEST: AlertTriangle,
  UPSTREAM_ERROR: WifiOff,
  NO_API_KEY: AlertTriangle,
};

const MESSAGES: Record<ApiErrorShape['code'], { title: string; body: string }> = {
  QUOTA_EXCEEDED: {
    title: "We've hit today's request limit",
    body: 'MAAR Pulse shares a daily YouTube API quota. New results will resume once it resets — try again shortly.',
  },
  NOT_FOUND: {
    title: 'Nothing here',
    body: 'This video or channel may have been removed, made private, or never existed.',
  },
  INVALID_REQUEST: {
    title: "That request didn't go through",
    body: 'Something about this search was invalid. Try adjusting it and searching again.',
  },
  UPSTREAM_ERROR: {
    title: 'Connection trouble',
    body: "We couldn't reach YouTube just now. Check your connection and try again.",
  },
  NO_API_KEY: {
    title: 'YouTube API key missing',
    body: 'Add YOUTUBE_API_KEY to your environment to enable live content.',
  },
};

export function ApiErrorState({ error, onRetry }: { error: ApiErrorShape; onRetry?: () => void }) {
  const Icon = ICONS[error.code] ?? AlertTriangle;
  const copy = MESSAGES[error.code];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-raised px-6 py-16 text-center"
    >
      <Icon className="h-8 w-8 text-muted" strokeWidth={1.5} />
      <h3 className="font-display text-lg font-medium text-ink">{copy.title}</h3>
      <p className="max-w-sm text-sm text-muted">{copy.body}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-2">
          Try again
        </Button>
      )}
    </motion.div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-6 py-20 text-center"
    >
      <Inbox className="h-8 w-8 text-faint" strokeWidth={1.5} />
      <h3 className="font-display text-lg font-medium text-ink">{title}</h3>
      <p className="max-w-sm text-sm text-muted">{body}</p>
    </motion.div>
  );
}
