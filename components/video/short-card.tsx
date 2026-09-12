'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play, Zap } from 'lucide-react';
import { formatCompactNumber } from '@/lib/utils';
import type { VideoSummary } from '@/types/youtube';

export function ShortCard({ video, index = 0 }: { video: VideoSummary; index?: number }) {
  const thumb = video.thumbnails.maxres ?? video.thumbnails.standard ?? video.thumbnails.high ?? video.thumbnails.medium ?? video.thumbnails.default;
  if (!thumb) return null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: Math.min(index, 10) * 0.03, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col gap-2"
    >
      <Link href={`/shorts/${video.id}`} className="block outline-none">
        <div className="rounded-2xl bg-raised/60 p-1 ring-1 ring-border transition-colors duration-500 group-hover:ring-signal/30">
          <div className="relative aspect-[9/16] overflow-hidden rounded-[calc(1rem-4px)] bg-overlay shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
            <Image
              src={thumb.url}
              alt={video.title}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 15vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/10" />

            <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white ring-1 ring-white/10">
              <Zap className="h-3 w-3 fill-current text-signal" />
              Short
            </span>

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-signal/90 text-black shadow-glow">
                <Play className="h-4 w-4 fill-current" />
              </div>
            </div>

            <p className="absolute inset-x-0 bottom-0 line-clamp-2 p-2.5 text-xs font-medium leading-snug text-white">
              {video.title}
            </p>
          </div>
        </div>
      </Link>
      {video.viewCount && (
        <p className="px-1 font-mono text-[11px] text-faint">{formatCompactNumber(video.viewCount)} views</p>
      )}
    </motion.article>
  );
}
