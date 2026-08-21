'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export interface SubscriptionRecord {
  id: string;
  channelId: string;
  channelTitle: string;
  channelThumbnail?: string | null;
}

/**
 * Subscriptions synced to the signed-in MAAR Pulse account via
 * /api/subscriptions (Prisma-backed) — the same list appears on every
 * device once signed in with the same Google account. Falls back to an
 * empty, read-only list while signed out.
 */
export function useSubscriptions() {
  const { status } = useSession();
  const [items, setItems] = useState<SubscriptionRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (status !== 'authenticated') {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/subscriptions');
      const data = await res.json();
      if (res.ok) setItems(data.items);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isSubscribed = useCallback((channelId: string) => items.some((s) => s.channelId === channelId), [items]);

  const subscribe = useCallback(
    async (channelId: string, channelTitle: string, channelThumbnail?: string) => {
      if (status !== 'authenticated') return false;
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId, channelTitle, channelThumbnail }),
      });
      if (res.ok) await refresh();
      return res.ok;
    },
    [status, refresh]
  );

  const unsubscribe = useCallback(
    async (channelId: string) => {
      if (status !== 'authenticated') return false;
      const res = await fetch(`/api/subscriptions?channelId=${encodeURIComponent(channelId)}`, { method: 'DELETE' });
      if (res.ok) await refresh();
      return res.ok;
    },
    [status, refresh]
  );

  return { items, loading, isSignedIn: status === 'authenticated', isSubscribed, subscribe, unsubscribe, refresh };
}
