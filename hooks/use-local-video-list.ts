'use client';

import { useCallback, useEffect, useState } from 'react';
import type { VideoSummary } from '@/types/youtube';

/**
 * Device-scoped persistence for watch history / saved videos. This is a
 * legitimate MAAR Pulse-native feature (not a YouTube API capability), so
 * it works fully today without any YouTube OAuth. Once account auth ships,
 * swap the storage backend for a per-user database table and this hook's
 * call sites don't need to change.
 */
export function useLocalVideoList(storageKey: string) {
  const [items, setItems] = useState<VideoSummary[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      setItems(raw ? JSON.parse(raw) : []);
    } catch {
      setItems([]);
    }
    setReady(true);
  }, [storageKey]);

  const persist = useCallback(
    (next: VideoSummary[]) => {
      setItems(next);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* storage unavailable (private mode, quota) — state still updates in-memory */
      }
    },
    [storageKey]
  );

  const add = useCallback(
    (video: VideoSummary) => {
      persist([video, ...items.filter((v) => v.id !== video.id)].slice(0, 200));
    },
    [items, persist]
  );

  const remove = useCallback(
    (id: string) => {
      persist(items.filter((v) => v.id !== id));
    },
    [items, persist]
  );

  const clear = useCallback(() => persist([]), [persist]);

  return { items, ready, add, remove, clear };
}
