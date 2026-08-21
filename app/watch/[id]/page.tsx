import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getVideoById, getChannelsByIds, YouTubeApiError } from '@/lib/youtube/service';
import { Player } from '@/components/video/player';
import { SubscribeButton } from '@/components/video/subscribe-button';
import { VideoActions } from '@/components/video/video-actions';
import { DescriptionPanel } from '@/components/video/description-panel';
import { RecommendedRail } from '@/components/video/recommended-rail';
import { RecordHistory } from '@/components/video/record-history';
import { ApiErrorState } from '@/components/ui/state-views';
import { formatCompactNumber } from '@/lib/utils';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const video = await getVideoById(params.id);
    if (!video) return { title: 'Video unavailable' };
    return {
      title: video.title,
      description: video.description.slice(0, 160),
      openGraph: {
        title: video.title,
        description: video.description.slice(0, 160),
        images: video.thumbnails.high ? [video.thumbnails.high.url] : undefined,
        type: 'video.other',
      },
    };
  } catch {
    return { title: 'Video unavailable' };
  }
}

export default async function WatchPage({ params }: Props) {
  let video;
  try {
    video = await getVideoById(params.id);
  } catch (err) {
    if (err instanceof YouTubeApiError) {
      return (
        <div className="container py-10">
          <ApiErrorState error={{ error: true, code: err.code, message: err.message }} />
        </div>
      );
    }
    throw err;
  }

  if (!video) notFound();

  const [channel] = await getChannelsByIds(video.channelId).catch(() => [null]);

  return (
    <div className="container flex flex-col gap-8 py-6 lg:flex-row">
      <RecordHistory video={video} />
      <div className="min-w-0 flex-1">
        <Player videoId={video.id} title={video.title} />

        <h1 className="mt-4 text-balance font-display text-xl font-semibold leading-snug text-ink md:text-2xl">
          {video.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Link href={`/channel/${video.channelId}`} className="flex items-center gap-3">
            <div className="h-11 w-11 overflow-hidden rounded-full bg-overlay ring-1 ring-border">
              {channel?.thumbnails.default && (
                <Image src={channel.thumbnails.default.url} alt={channel.title} width={44} height={44} className="h-full w-full object-cover" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-ink">{video.channelTitle}</p>
              {channel?.subscriberCount && !channel.hiddenSubscriberCount && (
                <p className="font-mono text-xs text-muted">{formatCompactNumber(channel.subscriberCount)} subscribers</p>
              )}
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <SubscribeButton channelTitle={video.channelTitle} />
            <VideoActions video={video} />
          </div>
        </div>

        <div className="mt-5">
          <DescriptionPanel description={video.description} viewCount={video.viewCount} publishedAt={video.publishedAt} />
        </div>
      </div>

      <aside className="w-full shrink-0 lg:w-[380px]">
        <h2 className="mb-4 font-display text-base font-semibold text-ink">Recommended</h2>
        <RecommendedRail seedTitle={video.title} excludeId={video.id} />
      </aside>
    </div>
  );
}
