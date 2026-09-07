'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { VideoSummary } from '@/types/youtube';

type ListName = 'history' | 'saved';

function storageKeyFor(list: ListName) {
  return `maar-pulse:${list}`;
}

function readLocal(list: ListName): VideoSummary[] {
  try {
    const raw = window.localStorage.getItem(storageKeyFor(list));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocal(list: ListName, items: VideoSummary[]) {
  try {
    window.localStorage.setItem(storageKeyFor(list), JSON.stringify(items));
  } catch {
    /* ignore (private browsing, quota, etc.) */
  }
}

function mergeById(a: VideoSummary[], b: VideoSummary[]): VideoSummary[] {
  const byId = new Map<string, VideoSummary>();
  for (const v of [...a, ...b]) byId.set(v.id, v);
  return Array.from(byId.values());
}

/**
 * Watch history / saved (watch later) lists.
 *
 * Same two-layer pattern as hooks/use-subscriptions.ts:
 *  - localStorage: always used, instant, works offline/signed-out.
 *  - Firestore (via /api/video-lists): only used when signed in with
 *    Google. On sign-in, local and cloud lists are merged (union by
 *    video id) once, then every add/remove/clear writes to both — so
 *    the same "who they subscribe to and what they've watched" follows
 *    the user to a new device once they sign in with the same account.
 */
export function useLocalVideoList(list: ListName) {
  const { data: session, status } = useSession();
  const signedIn = status === 'authenticated' && Boolean(session?.user?.id);

  const [items, setItems] = useState<VideoSummary[]>([]);
  const [ready, setReady] = useState(false);
  const syncedForUser = useRef<string | null>(null);

  useEffect(() => {
    setItems(readLocal(list));
    setReady(true);
  }, [list]);

  useEffect(() => {
    if (!signedIn || !session?.user?.id) return;
    const syncKey = `${list}:${session.user.id}`;
    if (syncedForUser.current === syncKey) return;
    syncedForUser.current = syncKey;

    (async () => {
      try {
        const res = await fetch(`/api/video-lists?list=${list}`);
        if (!res.ok) return;
        const { items: remote } = (await res.json()) as { items: VideoSummary[] };

        const local = readLocal(list);
        const merged = mergeById(remote, local).slice(0, 200);

        setItems(merged);
        writeLocal(list, merged);

        const remoteIds = new Set(remote.map((v) => v.id));
        const toPush = local.filter((v) => !remoteIds.has(v.id));
        await Promise.all(
          toPush.map((video) =>
            fetch('/api/video-lists', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ list, video }),
            }).catch(() => {})
          )
        );
      } catch {
        /* offline or cloud sync not configured — local copy still works */
      }
    })();
  }, [signedIn, session?.user?.id, list]);

  const add = useCallback(
    (video: VideoSummary) => {
      setItems((prev) => {
        const next = [video, ...prev.filter((v) => v.id !== video.id)].slice(0, 200);
        writeLocal(list, next);
        return next;
      });
      if (signedIn) {
        fetch('/api/video-lists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ list, video }),
        }).catch(() => {
          /* stays saved locally even if the cloud write fails */
        });
      }
    },
    [list, signedIn]
  );

  const remove = useCallback(
    (id: string) => {
      setItems((prev) => {
        const next = prev.filter((v) => v.id !== id);
        writeLocal(list, next);
        return next;
      });
      if (signedIn) {
        fetch(`/api/video-lists?list=${list}&videoId=${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {
          /* stays removed locally even if the cloud write fails */
        });
      }
    },
    [list, signedIn]
  );

  const clear = useCallback(() => {
    setItems([]);
    writeLocal(list, []);
    if (signedIn) {
      fetch(`/api/video-lists?list=${list}`, { method: 'DELETE' }).catch(() => {
        /* stays cleared locally even if the cloud write fails */
      });
    }
  }, [list, signedIn]);

  return { items, ready, add, remove, clear };
}
