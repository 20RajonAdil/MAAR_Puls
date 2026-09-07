'use client';

import { useVideos } from '@/hooks/use-videos';
import { VideoGrid } from '@/components/video/video-grid';

export function PlaylistVideoList({ playlistId }: { playlistId: string }) {
  const url = `/api/youtube/playlist-items?playlistId=${playlistId}`;
  const { items, loading, error, hasMore, loadMore } = useVideos(url);

  return (
    <VideoGrid
      items={items}
      loading={loading}
      error={error}
      hasMore={hasMore}
      onLoadMore={loadMore}
      emptyTitle="No videos in this playlist"
      emptyBody="This playlist is empty, or its videos have all been removed or made private."
    />
  );
}
