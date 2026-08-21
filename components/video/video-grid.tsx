'use client';

import { VideoCard } from './video-card';
import { VideoGridSkeleton } from '@/components/ui/skeleton';
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
  emptyTitle?: string;
  emptyBody?: string;
}

export function VideoGrid({
  items,
  loading,
  error,
  onRetry,
  hasMore,
  onLoadMore,
  emptyTitle = 'No videos found',
  emptyBody = 'Try a different search term or explore another category.',
}: Props) {
  if (error) return <ApiErrorState error={error} onRetry={onRetry} />;
  if (loading && items.length === 0) return <VideoGridSkeleton />;
  if (!loading && items.length === 0) return <EmptyState title={emptyTitle} body={emptyBody} />;

  return (
    <div>
      <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((video, i) => (
          <VideoCard key={video.id} video={video} index={i} />
        ))}
      </div>
      {loading && items.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <VideoGridSkeleton count={4} />
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
