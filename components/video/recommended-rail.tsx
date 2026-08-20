'use client';

import { useVideos } from '@/hooks/use-videos';
import { VideoCard } from './video-card';
import { VideoCardSkeleton } from '@/components/ui/skeleton';
import { ApiErrorState } from '@/components/ui/state-views';

export function RecommendedRail({ seedTitle, excludeId }: { seedTitle: string; excludeId: string }) {
  const url = `/api/youtube/videos?relatedToTitle=${encodeURIComponent(seedTitle)}&excludeId=${excludeId}`;
  const { items, loading, error } = useVideos(url);

  if (error) return <ApiErrorState error={error} />;

  return (
    <div className="flex flex-col gap-4">
      {loading && items.length === 0
        ? Array.from({ length: 6 }).map((_, i) => <VideoCardSkeleton key={i} />)
        : items.map((video, i) => <VideoCard key={video.id} video={video} index={i} />)}
    </div>
  );
}
