import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getVideoById } from '@/lib/youtube/service';
import { ShortsScroller } from '@/components/video/shorts-scroller';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const video = await getVideoById(params.id);
  if (!video) return { title: 'Short unavailable' };
  return { title: `${video.title} — Shorts` };
}

export default async function ShortWatchPage({ params }: Props) {
  const video = await getVideoById(params.id);
  if (!video) notFound();

  return <ShortsScroller seedVideo={video} />;
}
