import { ShortCard } from './short-card';
import { ApiErrorState } from '@/components/ui/state-views';
import { getShortClips, YouTubeApiError } from '@/lib/youtube/service';
import type { VideoSummary, ApiErrorShape } from '@/types/youtube';

function toErrorShape(err: unknown): ApiErrorShape {
  if (err instanceof YouTubeApiError) return { error: true, code: err.code, message: err.message };
  return { error: true, code: 'UPSTREAM_ERROR', message: 'Something went wrong loading Shorts.' };
}

export async function ShortsRail() {
  let items: VideoSummary[] = [];
  let error: ApiErrorShape | null = null;

  try {
    const result = await getShortClips();
    items = result.items.slice(0, 6);
  } catch (err) {
    error = toErrorShape(err);
  }

  if (error) return <ApiErrorState error={error} />;
  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {items.map((video, i) => (
        <ShortCard key={video.id} video={video} index={i} />
      ))}
    </div>
  );
}
