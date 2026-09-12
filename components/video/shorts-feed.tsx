'use client';

import { useMemo } from 'react';
import { useVideos } from '@/hooks/use-videos';
import { useWatchInterests, primaryInterestQuery } from '@/hooks/use-watch-interests';
import { ShortsGrid } from './shorts-grid';

/**
 * Uses the exact same interest signal as the "Because you're into X"
 * video rails on the home page (device watch history + search history via
 * useWatchInterests), so someone whose regular-video activity leans
 * Islamic content sees Islamic Shorts too, instead of the Shorts feed
 * running on an unrelated generic query.
 */
export function ShortsFeed() {
  const { interests, ready } = useWatchInterests();
  const query = useMemo(() => primaryInterestQuery(interests), [interests]);
  const url = ready ? `/api/youtube/shorts${query ? `?q=${encodeURIComponent(query)}` : ''}` : null;
  const { items, loading, error, hasMore, loadMore } = useVideos(url);

  return <ShortsGrid items={items} loading={loading || !ready} error={error} hasMore={hasMore} onLoadMore={loadMore} />;
}
