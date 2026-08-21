'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import type { VideoSummary } from '@/types/youtube';
import { formatCompactNumber } from '@/lib/utils';

export function ShortCard({ video, index = 0 }: { video: VideoSummary; index?: number }) {
  const thumb = video.thumbnails.high ?? video.thumbnails.medium ?? video.thumbnails.default;
  if (!thumb) return null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.04, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/watch/${video.id}`} className="group block outline-none">
        <div className="relative aspect-[9/16] overflow-hidden rounded-lg bg-raised">
          <motion.img
            whileHover={{ scale: 1.04 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            src={thumb.url}
            alt={video.title}
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
          <div className="absolute bottom-2 left-2 right-2">
            <p className="line-clamp-2 text-xs font-medium text-white">{video.title}</p>
            {video.viewCount && (
              <p className="mt-1 font-mono text-[10px] text-white/70">{formatCompactNumber(video.viewCount)} views</p>
            )}
          </div>
          <div className="pointer-events-none absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <Play className="h-3.5 w-3.5 fill-white text-white" />
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
