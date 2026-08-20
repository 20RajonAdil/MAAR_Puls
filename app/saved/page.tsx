'use client';

import { useLocalVideoList } from '@/hooks/use-local-video-list';
import { VideoCard } from '@/components/video/video-card';
import { EmptyState } from '@/components/ui/state-views';

export default function SavedPage() {
  const { items, ready } = useLocalVideoList('maar-pulse:saved');

  return (
    <div className="container py-6">
      <h1 className="mb-1 font-display text-xl font-semibold text-ink">Watch later</h1>
      <p className="mb-6 text-xs text-muted">Stored on this device. Sign in to sync across devices.</p>

      {!ready ? null : items.length === 0 ? (
        <EmptyState title="Nothing saved yet" body="Tap Save on any video to add it to your watch-later list." />
      ) : (
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((video, i) => (
            <VideoCard key={video.id} video={video} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
