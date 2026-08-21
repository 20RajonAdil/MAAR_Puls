'use client';

import { Trash2 } from 'lucide-react';
import { useLocalVideoList } from '@/hooks/use-local-video-list';
import { VideoCard } from '@/components/video/video-card';
import { EmptyState } from '@/components/ui/state-views';
import { Button } from '@/components/ui/button';

export default function HistoryPage() {
  const { items, ready, clear } = useLocalVideoList('maar-pulse:history');

  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Watch history</h1>
          <p className="mt-1 text-xs text-muted">Stored on this device. Sign in to sync across devices.</p>
        </div>
        {items.length > 0 && (
          <Button variant="outline" size="sm" onClick={clear} className="gap-1.5">
            <Trash2 className="h-4 w-4" /> Clear all
          </Button>
        )}
      </div>

      {!ready ? null : items.length === 0 ? (
        <EmptyState title="No watch history yet" body="Videos you watch on MAAR Pulse will show up here." />
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
