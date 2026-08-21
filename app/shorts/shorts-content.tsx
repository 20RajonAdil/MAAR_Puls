'use client';

import { Info } from 'lucide-react';
import { useVideos } from '@/hooks/use-videos';
import { ShortCard } from '@/components/video/short-card';
import { VideoGridSkeleton } from '@/components/ui/skeleton';
import { ApiErrorState, EmptyState } from '@/components/ui/state-views';
import { Button } from '@/components/ui/button';

export default function ShortsContent() {
  const { items, loading, error, hasMore, loadMore } = useVideos('/api/youtube/shorts?q=shorts');

  return (
    <div className="container py-6">
      <h1 className="mb-2 font-display text-xl font-semibold text-ink">Short clips</h1>
      <div className="mb-6 flex items-start gap-2 rounded-md border border-border bg-raised p-3 text-xs text-muted">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          YouTube's public API doesn't flag videos as Shorts directly, so this feed shows recent videos under four
          minutes as the closest legitimate match — most will be Shorts, some may be short-form clips instead.
        </p>
      </div>

      {error ? (
        <ApiErrorState error={error} />
      ) : loading && items.length === 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          <VideoGridSkeleton count={12} />
        </div>
      ) : items.length === 0 ? (
        <EmptyState title="No short clips found" body="Try again in a moment." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {items.map((video, i) => (
              <ShortCard key={video.id} video={video} index={i} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-10 flex justify-center">
              <Button variant="secondary" onClick={loadMore} disabled={loading}>
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
