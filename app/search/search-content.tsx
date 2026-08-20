'use client';

import { useSearchParams } from 'next/navigation';
import { useVideos } from '@/hooks/use-videos';
import { VideoGrid } from '@/components/video/video-grid';

export default function SearchContent() {
  const params = useSearchParams();
  const q = params.get('q') ?? '';
  const url = q ? `/api/youtube/search?q=${encodeURIComponent(q)}` : null;
  const { items, loading, error, hasMore, loadMore } = useVideos(url);

  return (
    <div className="container py-6">
      <h1 className="mb-6 font-display text-xl font-semibold text-ink">
        {q ? (
          <>
            Results for <span className="text-signal">&ldquo;{q}&rdquo;</span>
          </>
        ) : (
          'Search MAAR Pulse'
        )}
      </h1>
      {q ? (
        <VideoGrid
          items={items}
          loading={loading}
          error={error}
          hasMore={hasMore}
          onLoadMore={loadMore}
          emptyTitle="No results"
          emptyBody={`Nothing matched "${q}". Try different keywords.`}
        />
      ) : (
        <p className="text-sm text-muted">Use the search bar above to find videos and channels.</p>
      )}
    </div>
  );
}
