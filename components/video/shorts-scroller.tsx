'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { useVideos } from '@/hooks/use-videos';
import { useWatchInterests, primaryInterestQuery } from '@/hooks/use-watch-interests';
import type { VideoSummary } from '@/types/youtube';

/**
 * TikTok/YouTube-Shorts-style full-screen vertical scroll feed: one Short
 * fills the viewport at a time, snapping cleanly as the person scrolls,
 * and more load in automatically as they near the end — instead of
 * bouncing back out to a grid after every single video. Opened whenever a
 * ShortCard is tapped, seeded with that video so playback starts
 * instantly, then backed by the same personalized /shorts feed (same
 * interest term as the grid and the home page's video rails) for
 * everything after it.
 */
export function ShortsScroller({ seedVideo }: { seedVideo: VideoSummary }) {
  const router = useRouter();
  const { interests, ready } = useWatchInterests();
  const query = useMemo(() => primaryInterestQuery(interests), [interests]);
  const feedUrl = ready ? `/api/youtube/shorts${query ? `?q=${encodeURIComponent(query)}` : ''}` : null;
  const { items, hasMore, loading, loadMore } = useVideos(feedUrl);

  const videos = useMemo(() => {
    const seen = new Set<string>();
    const merged: VideoSummary[] = [];
    for (const v of [seedVideo, ...items]) {
      if (!seen.has(v.id)) {
        seen.add(v.id);
        merged.push(v);
      }
    }
    return merged;
  }, [seedVideo, items]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Tracks which Short is actually on screen, so only the active (+/-1
  // neighbor) iframe is mounted at a time — mounting all of them would
  // mean dozens of simultaneous embedded players loading at once.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            if (!Number.isNaN(idx)) setActiveIndex(idx);
          }
        });
      },
      { threshold: 0.6 }
    );
    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [videos.length]);

  // Loads the next page of the feed once the person scrolls within reach
  // of the end, so the list never just runs out mid-scroll.
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loading) loadMore();
      },
      { rootMargin: '400% 0px' }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <button
        type="button"
        onClick={() => router.push('/shorts')}
        aria-label="Back to Shorts"
        className="absolute left-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white ring-1 ring-white/10 transition-colors hover:bg-black/80"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? 'Unmute' : 'Mute'}
        className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white ring-1 ring-white/10 transition-colors hover:bg-black/80"
      >
        {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>

      <div className="h-[100dvh] w-full snap-y snap-mandatory overflow-y-scroll scroll-smooth">
        {videos.map((video, i) => {
          const mounted = Math.abs(i - activeIndex) <= 1;
          const thumb = video.thumbnails.high ?? video.thumbnails.medium ?? video.thumbnails.default;
          return (
            <div
              key={video.id}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              data-index={i}
              className="flex h-[100dvh] w-full snap-start snap-always items-center justify-center"
            >
              <div className="relative h-full w-full max-w-[min(100vw,calc(100dvh*9/16))]">
                {mounted ? (
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=${i === activeIndex ? 1 : 0}&mute=${muted ? 1 : 0}&loop=1&playlist=${video.id}&modestbranding=1&rel=0`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  thumb && <Image src={thumb.url} alt={video.title} fill sizes="100vw" className="object-cover" />
                )}

                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent p-4 pb-8">
                  <p className="line-clamp-2 text-sm font-medium text-white">{video.title}</p>
                  <p className="mt-1 text-xs text-white/70">{video.channelTitle}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={sentinelRef} aria-hidden className="h-px w-full" />
      </div>
    </div>
  );
}
