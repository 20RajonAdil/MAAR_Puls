'use client';

import { useWatchInterests, type WatchInterest } from '@/hooks/use-watch-interests';
import { useVideos } from '@/hooks/use-videos';
import { VideoCard } from './video-card';
import { VideoGridSkeleton } from '@/components/ui/skeleton';

function InterestRail({ interest }: { interest: WatchInterest }) {
  const url =
    interest.type === 'channel'
      ? `/api/youtube/channel?id=${interest.channelId}&uploads=1`
      : `/api/youtube/search?q=${encodeURIComponent(interest.query)}&order=relevance`;
  const { items, loading, error } = useVideos(url);

  if (error) return null;
  if (!loading && items.length === 0) return null;

  const title = interest.type === 'channel' ? `More from ${interest.label}` : `Because you're into "${interest.label}"`;
  const subtitle =
    interest.type === 'channel'
      ? "Based on what you've watched on this device."
      : "Based on what you've watched and searched on this device.";

  return (
    <section className="py-8 first:pt-6">
      <div className="mb-5">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">{title}</h2>
        <p className="mt-1 text-xs text-muted">{subtitle}</p>
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

/**
 * Home-feed rails that mimic YouTube's "because you watched/searched" and
 * "more from channel" personalization — built entirely from signals
 * already on this device (watch history + search history in
 * localStorage), so it works for guests too and needs no account or
 * server-side profile. Renders up to 3 independent rails rather than one
 * blended one, since that's what makes YouTube's own home feed feel varied
 * instead of repetitive.
 */
export function PersonalizedRail() {
  const { interests, ready } = useWatchInterests();

  if (!ready || interests.length === 0) return null;

  return (
    <>
      {interests.map((interest) => (
        <InterestRail key={interest.type === 'channel' ? `channel:${interest.channelId}` : `topic:${interest.query}`} interest={interest} />
      ))}
    </>
  );
}
