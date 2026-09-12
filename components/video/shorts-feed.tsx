'use client';

import { useVideos } from '@/hooks/use-videos';
import { ShortsGrid } from './shorts-grid';

export function ShortsFeed() {
  const { items, loading, error, hasMore, loadMore } = useVideos('/api/youtube/shorts');

  return <ShortsGrid items={items} loading={loading} error={error} hasMore={hasMore} onLoadMore={loadMore} />;
}
