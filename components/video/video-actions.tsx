'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Share2, ThumbsUp, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalVideoList } from '@/hooks/use-local-video-list';
import type { VideoSummary } from '@/types/youtube';

export function VideoActions({ video }: { video: VideoSummary }) {
  const { items: saved_items, add, remove } = useLocalVideoList('maar-pulse:saved');
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const saved = saved_items.some((v) => v.id === video.id);

  const toggleSave = () => (saved ? remove(video.id) : add(video));

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — silently ignore */
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="secondary" size="sm" onClick={() => setLiked((l) => !l)} aria-pressed={liked} className="gap-1.5">
        <ThumbsUp className={liked ? 'h-4 w-4 fill-signal text-signal' : 'h-4 w-4'} />
        Like
      </Button>
      <Button variant="secondary" size="sm" onClick={toggleSave} aria-pressed={saved} className="gap-1.5">
        <Bookmark className={saved ? 'h-4 w-4 fill-signal text-signal' : 'h-4 w-4'} />
        {saved ? 'Saved' : 'Save'}
      </Button>
      <Button variant="secondary" size="sm" onClick={share} className="gap-1.5">
        <motion.span initial={false} animate={{ rotate: copied ? 360 : 0 }} className="flex">
          {copied ? <Check className="h-4 w-4 text-signal" /> : <Share2 className="h-4 w-4" />}
        </motion.span>
        {copied ? 'Copied' : 'Share'}
      </Button>
    </div>
  );
}
