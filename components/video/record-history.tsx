'use client';

import { useEffect } from 'react';
import { useLocalVideoList } from '@/hooks/use-local-video-list';
import type { VideoSummary } from '@/types/youtube';

export function RecordHistory({ video }: { video: VideoSummary }) {
  const { add } = useLocalVideoList('maar-pulse:history');

  useEffect(() => {
    add(video);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video.id]);

  return null;
}
