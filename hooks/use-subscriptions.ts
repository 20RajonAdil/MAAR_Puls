'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { ChannelSummary } from '@/types/youtube';

const STORAGE_KEY = 'maar-pulse:subscriptions';

function readLocal(): ChannelSummary[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocal(channels: ChannelSummary[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(channels));
  } catch {
    /* ignore (private browsing, quota, etc.) */
  }
}

function mergeById(a: ChannelSummary[], b: ChannelSummary[]): ChannelSummary[] {
  const byId = new Map<string, ChannelSummary>();
  for (const c of [...a, ...b]) byId.set(c.id, c);
  return Array.from(byId.values());
}

/**
 * MAAR Pulse-native subscriptions (separate from real YouTube subscriptions,
 * which need a further YouTube OAuth grant — see Settings).
 *
 * Two layers:
 *  - localStorage: always used, instant, works signed-out and offline.
 *  - Firestore (via /api/subscriptions): only used when signed in with
 *    Google. On sign-in, the local and cloud lists are merged (union by
 *    channel id) so nothing already-subscribed gets lost either way, then
 *    the merged list is pushed back to both stores. After that, every
 *    subscribe/unsubscribe writes to both.
 */
export function useSubscriptions() {
  const { data: session, status } = useSession();
  const signedIn = status === 'authenticated' && Boolean(session?.user?.id);

  const [channels, setChannels] = useState<ChannelSummary[]>([]);
  const [ready, setReady] = useState(false);
  const syncedForUser = useRef<string | null>(null);

  // Load the local copy immediately so the UI has something to show right away.
  useEffect(() => {
    setChannels(readLocal());
    setReady(true);
  }, []);

  // Once signed in, merge with the cloud copy (once per session/user).
  useEffect(() => {
    if (!signedIn || !session?.user?.id) return;
    if (syncedForUser.current === session.user.id) return;
    syncedForUser.current = session.user.id;

    (async () => {
      try {
        const res = await fetch('/api/subscriptions');
        if (!res.ok) return;
        const { channels: remote } = (await res.json()) as { channels: ChannelSummary[] };

        const local = readLocal();
        const merged = mergeById(remote, local);

        setChannels(merged);
        writeLocal(merged);

        // Push up anything that was only local (e.g. subscribed while signed out).
        const remoteIds = new Set(remote.map((c) => c.id));
        const toPush = local.filter((c) => !remoteIds.has(c.id));
        await Promise.all(
          toPush.map((channel) =>
            fetch('/api/subscriptions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ channel }),
            }).catch(() => {})
          )
        );
      } catch {
        /* offline or cloud sync not configured — local copy still works */
      }
    })();
  }, [signedIn, session?.user?.id]);

  const isSubscribed = useCallback((channelId: string) => channels.some((c) => c.id === channelId), [channels]);

  const subscribe = useCallback(
    (channel: ChannelSummary) => {
      setChannels((prev) => {
        const next = [channel, ...prev.filter((c) => c.id !== channel.id)];
        writeLocal(next);
        return next;
      });
      if (signedIn) {
        fetch('/api/subscriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel }),
        }).catch(() => {
          /* stays subscribed locally even if the cloud write fails */
        });
      }
    },
    [signedIn]
  );

  const unsubscribe = useCallback(
    (channelId: string) => {
      setChannels((prev) => {
        const next = prev.filter((c) => c.id !== channelId);
        writeLocal(next);
        return next;
      });
      if (signedIn) {
        fetch(`/api/subscriptions?channelId=${encodeURIComponent(channelId)}`, { method: 'DELETE' }).catch(() => {
          /* stays unsubscribed locally even if the cloud write fails */
        });
      }
    },
    [signedIn]
  );

  const toggle = useCallback(
    (channel: ChannelSummary) => {
      if (isSubscribed(channel.id)) unsubscribe(channel.id);
      else subscribe(channel);
    },
    [isSubscribed, subscribe, unsubscribe]
  );

  return { channels, ready, isSubscribed, subscribe, unsubscribe, toggle };
}
