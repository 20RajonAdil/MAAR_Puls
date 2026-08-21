import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getChannelsByIds, YouTubeApiError } from '@/lib/youtube/service';
import { SubscribeButton } from '@/components/video/subscribe-button';
import { ChannelTabs } from '@/components/channel/channel-tabs';
import { ApiErrorState } from '@/components/ui/state-views';
import { formatCompactNumber } from '@/lib/utils';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const [channel] = await getChannelsByIds(params.id);
    if (!channel) return { title: 'Channel unavailable' };
    return { title: channel.title, description: channel.description.slice(0, 160) };
  } catch {
    return { title: 'Channel unavailable' };
  }
}

export default async function ChannelPage({ params }: Props) {
  let channel;
  try {
    [channel] = await getChannelsByIds(params.id);
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

  if (!channel) notFound();

  return (
    <div>
      <div className="relative h-32 w-full bg-gradient-to-r from-signal-soft to-pulse-soft md:h-52">
        {channel.bannerUrl && <Image src={channel.bannerUrl} alt="" fill className="object-cover" priority />}
      </div>

      <div className="container -mt-10 flex flex-col items-center gap-4 pb-2 text-center md:-mt-12 md:flex-row md:items-end md:text-left">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-overlay ring-4 ring-base md:h-32 md:w-32">
          {channel.thumbnails.high && (
            <Image src={channel.thumbnails.high.url} alt={channel.title} width={128} height={128} className="h-full w-full object-cover" />
          )}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-semibold text-ink md:text-3xl">{channel.title}</h1>
          <p className="mt-1 font-mono text-sm text-muted">
            {channel.subscriberCount && !channel.hiddenSubscriberCount && `${formatCompactNumber(channel.subscriberCount)} subscribers`}
            {channel.videoCount && ` \u00b7 ${channel.videoCount} videos`}
          </p>
        </div>
        <SubscribeButton
          channelId={channel.id}
          channelTitle={channel.title}
          channelThumbnail={channel.thumbnails.default?.url}
        />
      </div>

      <div className="mt-6">
        <ChannelTabs channel={channel} />
      </div>
    </div>
  );
}
