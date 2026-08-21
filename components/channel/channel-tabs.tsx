'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useVideos } from '@/hooks/use-videos';
import { VideoGrid } from '@/components/video/video-grid';
import { EmptyState } from '@/components/ui/state-views';
import type { ChannelSummary } from '@/types/youtube';

const TABS = ['Home', 'Videos', 'Shorts', 'Playlists', 'About'] as const;
type Tab = (typeof TABS)[number];

export function ChannelTabs({ channel }: { channel: ChannelSummary }) {
  const [tab, setTab] = useState<Tab>('Home');
  const uploadsUrl = `/api/youtube/channel?id=${channel.id}&uploads=1`;
  const { items, loading, error, hasMore, loadMore } = useVideos(
    tab === 'Home' || tab === 'Videos' ? uploadsUrl : null
  );

  return (
    <div>
      <div className="scrollbar-none flex gap-1 overflow-x-auto border-b border-border px-4 md:px-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'relative shrink-0 px-4 py-3 text-sm font-medium transition-colors',
              tab === t ? 'text-ink' : 'text-muted hover:text-ink'
            )}
          >
            {t}
            {tab === t && (
              <motion.span layoutId="channel-tab-indicator" className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-signal" />
            )}
          </button>
        ))}
      </div>

      <div className="px-4 py-6 md:px-6">
        {tab === 'Home' && (
          <>
            <h3 className="mb-4 font-display text-base font-semibold text-ink">Recent uploads</h3>
            <VideoGrid items={items.slice(0, 8)} loading={loading} error={error} />
          </>
        )}

        {tab === 'Videos' && (
          <VideoGrid items={items} loading={loading} error={error} hasMore={hasMore} onLoadMore={loadMore} />
        )}

        {tab === 'Shorts' && (
          <EmptyState
            title="Shorts aren't distinguishable via the public API"
            body="YouTube Data API v3 doesn't currently flag videos as Shorts, so MAAR Pulse can't reliably separate them from regular uploads yet — this is a platform limitation, not a bug."
          />
        )}

        {tab === 'Playlists' && (
          <EmptyState
            title="Playlists coming soon"
            body="Public playlists can be fetched via the playlists.list endpoint; this scaffold ships the core video experience first — see the README for the follow-up."
          />
        )}

        {tab === 'About' && (
          <div className="max-w-2xl space-y-4">
            <p className="whitespace-pre-line text-sm text-ink">{channel.description || 'This channel has no description.'}</p>
            {channel.videoCount && <p className="text-xs text-muted">{channel.videoCount} videos</p>}
          </div>
        )}
      </div>
    </div>
  );
}
