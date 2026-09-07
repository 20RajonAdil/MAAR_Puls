'use client';

import { useWatchInterests } from '@/hooks/use-watch-interests';
import { useVideos } from '@/hooks/use-videos';
import { VideoCard } from './video-card';
import { VideoGridSkeleton } from '@/components/ui/skeleton';

/**
 * Home-feed rail that mimics YouTube's "because you watched/searched"
 * personalization — but built entirely from signals already on this
 * device (watch history + search history in localStorage), so it works
 * for guests too and needs no account or server-side profile.
 */
export function PersonalizedRail() {
  const { query, ready } = useWatchInterests();
  const url = query ? `/api/youtube/search?q=${encodeURIComponent(query)}&order=relevance` : null;
  const { items, loading, error } = useVideos(url);

  if (!ready || !query || error) return null;
  if (!loading && items.length === 0) return null;

  return (
    <section className="py-8 first:pt-6">
      <div className="mb-5">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">Picked for you</h2>
        <p className="mt-1 text-xs text-muted">Based on what you've watched and searched on this device.</p>
      </div>
      {loading ? (
        <VideoGridSkeleton count={8} />
      ) : (
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.slice(0, 8).map((video, i) => (
            <VideoCard key={video.id} video={video} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
