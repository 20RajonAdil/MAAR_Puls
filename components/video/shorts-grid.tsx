'use client';

import { ShortCard } from './short-card';
import { ShortsGridSkeleton } from '@/components/ui/skeleton';
import { ApiErrorState, EmptyState } from '@/components/ui/state-views';
import { Button } from '@/components/ui/button';
import type { VideoSummary, ApiErrorShape } from '@/types/youtube';

interface Props {
  items: VideoSummary[];
  loading: boolean;
  error: ApiErrorShape | null;
  onRetry?: () => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export function ShortsGrid({ items, loading, error, onRetry, hasMore, onLoadMore }: Props) {
  if (error) return <ApiErrorState error={error} onRetry={onRetry} />;
  if (loading && items.length === 0) return <ShortsGridSkeleton />;
  if (!loading && items.length === 0) {
    return <EmptyState title="No Shorts found" body="Try a different search, or check back later — the pool of matching videos refreshes regularly." />;
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((video, i) => (
          <ShortCard key={video.id} video={video} index={i} />
        ))}
      </div>
      {loading && items.length > 0 && (
        <div className="mt-6">
          <ShortsGridSkeleton count={6} />
        </div>
      )}
      {hasMore && !loading && (
        <div className="mt-10 flex justify-center">
          <Button variant="secondary" onClick={onLoadMore}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
