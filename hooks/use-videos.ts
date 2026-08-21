'use client';

import { useEffect, useState, useCallback } from 'react';
import type { VideoSummary, ApiErrorShape } from '@/types/youtube';

interface State {
  items: VideoSummary[];
  loading: boolean;
  error: ApiErrorShape | null;
  nextPageToken?: string;
}

/**
 * Fetches from a MAAR Pulse /api/youtube/* endpoint that returns
 * { items, nextPageToken }. Centralizes loading/error handling so every
 * page (home, search, explore, channel) shares one predictable data shape.
 */
export function useVideos(url: string | null) {
  const [state, setState] = useState<State>({ items: [], loading: !!url, error: null });

  const load = useCallback(async (fetchUrl: string, append: boolean) => {
    setState((s) => ({ ...s, loading: true, error: append ? s.error : null }));
    try {
      const res = await fetch(fetchUrl);
      const data = await res.json();
      if (!res.ok || data.error) {
        setState((s) => ({ ...s, loading: false, error: data as ApiErrorShape }));
        return;
      }
      setState((s) => ({
        items: append ? [...s.items, ...data.items] : data.items,
        loading: false,
        error: null,
        nextPageToken: data.nextPageToken,
      }));
    } catch {
      setState((s) => ({
        ...s,
        loading: false,
        error: { error: true, code: 'UPSTREAM_ERROR', message: 'Network error — check your connection and try again.' },
      }));
    }
  }, []);

  useEffect(() => {
    if (!url) {
      setState({ items: [], loading: false, error: null });
      return;
    }
    load(url, false);
  }, [url, load]);

  const loadMore = useCallback(() => {
    if (!url || !state.nextPageToken) return;
    const withToken = `${url}${url.includes('?') ? '&' : '?'}pageToken=${state.nextPageToken}`;
    load(withToken, true);
  }, [url, state.nextPageToken, load]);

  return { ...state, loadMore, hasMore: !!state.nextPageToken };
}
