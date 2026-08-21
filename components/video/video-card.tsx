'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MoreVertical, Play } from 'lucide-react';
import type { VideoSummary } from '@/types/youtube';
import { formatDuration, formatCompactNumber, formatRelativeTime, cn } from '@/lib/utils';

export function VideoCard({ video, index = 0 }: { video: VideoSummary; index?: number }) {
  const thumb = video.thumbnails.high ?? video.thumbnails.medium ?? video.thumbnails.default;
  if (!thumb) return null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col gap-3"
    >
      <Link href={`/watch/${video.id}`} className="block outline-none">
        <motion.div
          whileHover="hover"
          initial="rest"
          className="relative aspect-video overflow-hidden rounded-lg bg-raised [perspective:800px]"
        >
          <motion.div
            variants={{
              rest: { scale: 1, rotateX: 0, y: 0 },
              hover: { scale: 1.045, rotateX: -2, y: -2 },
            }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="relative h-full w-full"
          >
            <Image
              src={thumb.url}
              alt={video.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
              className="object-cover"
            />
          </motion.div>

          {/* Hover scrim + play glyph */}
          <motion.div
            variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30"
          >
            <motion.div
              variants={{ rest: { scale: 0.7, opacity: 0 }, hover: { scale: 1, opacity: 1 } }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-signal/90 text-black shadow-glow"
            >
              <Play className="h-5 w-5 fill-current" />
            </motion.div>
          </motion.div>

          {video.duration && (
            <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 font-mono text-[11px] font-medium text-white">
              {formatDuration(video.duration)}
            </span>
          )}
        </motion.div>
      </Link>

      <div className="flex gap-3">
        <Link href={`/channel/${video.channelId}`} className="mt-0.5 shrink-0">
          <div className="h-9 w-9 overflow-hidden rounded-full bg-overlay ring-1 ring-border">
            {video.channelThumbnail && (
              <Image src={video.channelThumbnail} alt={video.channelTitle} width={36} height={36} className="h-full w-full object-cover" />
            )}
          </div>
        </Link>

        <div className="min-w-0 flex-1">
          <Link href={`/watch/${video.id}`}>
            <h3 className="line-clamp-2 text-sm font-medium leading-snug text-ink group-hover:text-signal transition-colors">
              {video.title}
            </h3>
          </Link>
          <Link href={`/channel/${video.channelId}`} className="mt-1 block text-xs text-muted hover:text-ink transition-colors">
            {video.channelTitle}
          </Link>
          <p className="font-mono text-xs text-faint">
            {video.viewCount && `${formatCompactNumber(video.viewCount)} views`}
            {video.viewCount && video.publishedAt && ' \u00b7 '}
            {formatRelativeTime(video.publishedAt)}
          </p>
        </div>

        <button
          aria-label="More options"
          className={cn(
            'h-7 w-7 shrink-0 self-start rounded-full text-faint opacity-0 transition-opacity',
            'hover:bg-raised hover:text-ink group-hover:opacity-100 focus-visible:opacity-100'
          )}
        >
          <MoreVertical className="mx-auto h-4 w-4" />
        </button>
      </div>
    </motion.article>
  );
}
