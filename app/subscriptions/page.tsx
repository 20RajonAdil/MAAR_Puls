'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { SignedOutGate } from '@/components/ui/signed-out-gate';
import { useSubscriptions } from '@/hooks/use-subscriptions';
import { VideoCard } from '@/components/video/video-card';
import { VideoGridSkeleton } from '@/components/ui/skeleton';
import type { VideoSummary } from '@/types/youtube';

export default function SubscriptionsPage() {
  const { status } = useSession();
  const { channels, ready } = useSubscriptions();
  const [feed, setFeed] = useState<VideoSummary[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);

  useEffect(() => {
    if (!ready || channels.length === 0) {
      setFeed([]);
      return;
    }
    let cancelled = false;
    setFeedLoading(true);
    Promise.all(
      channels.map((c) =>
        fetch(`/api/youtube/channel?id=${encodeURIComponent(c.id)}&uploads=1`)
          .then((r) => (r.ok ? r.json() : { items: [] }))
          .then((data) => (data.items as VideoSummary[]) ?? [])
          .catch(() => [] as VideoSummary[])
      )
    ).then((results) => {
      if (cancelled) return;
      const merged = results
        .flat()
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      setFeed(merged);
      setFeedLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [ready, channels]);

  if (status === 'loading') {
    return (
      <div className="container py-6">
        <h1 className="mb-6 font-display text-xl font-semibold text-ink">Subscriptions</h1>
        <VideoGridSkeleton count={8} />
      </div>
    );
  }

  if (status !== 'authenticated') {
    return (
      <div className="container py-6">
        <h1 className="mb-6 font-display text-xl font-semibold text-ink">Subscriptions</h1>
        <SignedOutGate
          title="Sign in to see your subscriptions"
          body="MAAR Pulse subscriptions are stored on your account. Importing your real YouTube subscriptions requires a separate YouTube permission grant after sign-in — see Settings for details."
        />
      </div>
    );
  }

  if (ready && channels.length === 0) {
    return (
      <div className="container py-6">
        <h1 className="mb-6 font-display text-xl font-semibold text-ink">Subscriptions</h1>
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border px-6 py-20 text-center">
          <h2 className="font-display text-lg font-medium text-ink">No subscriptions yet</h2>
          <p className="max-w-sm text-sm text-muted">
            Hit Subscribe on any channel page and it'll show up here, along with their latest uploads.
          </p>
          <Link href="/explore" className="mt-2 text-sm font-medium text-signal hover:underline">
            Explore channels
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <h1 className="mb-6 font-display text-xl font-semibold text-ink">Subscriptions</h1>

      <div className="mb-8 flex gap-4 overflow-x-auto pb-2">
        {channels.map((c) => {
          const thumb = c.thumbnails.high ?? c.thumbnails.medium ?? c.thumbnails.default;
          return (
            <Link key={c.id} href={`/channel/${c.id}`} className="flex w-20 shrink-0 flex-col items-center gap-1.5 text-center">
              <div className="h-14 w-14 overflow-hidden rounded-full bg-raised">
                {thumb && <Image src={thumb.url} alt={c.title} width={56} height={56} className="h-full w-full object-cover" />}
              </div>
              <p className="line-clamp-2 text-xs text-muted">{c.title}</p>
            </Link>
          );
        })}
      </div>

      <h2 className="mb-4 font-display text-base font-medium text-ink">Latest uploads</h2>
      {feedLoading ? (
        <VideoGridSkeleton count={8} />
      ) : feed.length === 0 ? (
        <p className="text-sm text-muted">No recent uploads found for your subscribed channels.</p>
      ) : (
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {feed.slice(0, 24).map((video, i) => (
            <VideoCard key={video.id} video={video} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
