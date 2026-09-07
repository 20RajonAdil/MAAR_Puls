'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ListVideo } from 'lucide-react';
import type { PlaylistSummary } from '@/types/youtube';

export function PlaylistCard({ playlist, index = 0 }: { playlist: PlaylistSummary; index?: number }) {
  const thumb = playlist.thumbnails.high ?? playlist.thumbnails.medium ?? playlist.thumbnails.default;
  if (!thumb) return null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col gap-3"
    >
      <Link href={`/playlist/${playlist.id}`} className="block outline-none">
        <div className="relative aspect-video overflow-hidden rounded-lg bg-raised">
          <Image
            src={thumb.url}
            alt={playlist.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          {/* Stacked-cards affordance so a playlist reads differently from a single video */}
          <div className="pointer-events-none absolute inset-x-1.5 bottom-1.5 top-1.5 -z-10 rounded-md border border-white/10 bg-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />
          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded bg-black/80 px-1.5 py-0.5 font-mono text-[11px] font-medium text-white">
            <ListVideo className="h-3 w-3" />
            {playlist.itemCount ?? '—'}
          </div>
        </div>
      </Link>

      <div className="min-w-0 flex-1">
        <Link href={`/playlist/${playlist.id}`}>
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-ink transition-colors group-hover:text-signal">
            {playlist.title}
          </h3>
        </Link>
        <Link href={`/channel/${playlist.channelId}`} className="mt-1 block text-xs text-muted transition-colors hover:text-ink">
          {playlist.channelTitle}
        </Link>
        <p className="font-mono text-xs text-faint">
          {playlist.itemCount !== undefined ? `${playlist.itemCount} video${playlist.itemCount === 1 ? '' : 's'}` : 'Playlist'}
        </p>
      </div>
    </motion.article>
  );
}
