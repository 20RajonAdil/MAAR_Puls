import { VideoCard } from './video-card';
import { ApiErrorState } from '@/components/ui/state-views';
import { getPopularVideos, searchVideos } from '@/lib/youtube/service';
import { YouTubeApiError } from '@/lib/youtube/service';
import type { VideoSummary, ApiErrorShape } from '@/types/youtube';

interface Props {
  source: { kind: 'popular'; categoryId?: string } | { kind: 'search'; query: string };
  limit?: number;
}

function toErrorShape(err: unknown): ApiErrorShape {
  if (err instanceof YouTubeApiError) return { error: true, code: err.code, message: err.message };
  return { error: true, code: 'UPSTREAM_ERROR', message: 'Something went wrong loading this section.' };
}

export async function VideoRail({ source, limit = 8 }: Props) {
  let items: VideoSummary[] = [];
  let error: ApiErrorShape | null = null;

  try {
    const result =
      source.kind === 'popular'
        ? await getPopularVideos({ categoryId: source.categoryId })
        : await searchVideos({ query: source.query });
    items = result.items.slice(0, limit);
  } catch (err) {
    error = toErrorShape(err);
  }

  if (error) return <ApiErrorState error={error} />;
  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((video, i) => (
        <VideoCard key={video.id} video={video} index={i} />
      ))}
    </div>
  );
}
