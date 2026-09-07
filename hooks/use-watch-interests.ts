'use client';

import { useEffect, useState } from 'react';
import type { VideoSummary } from '@/types/youtube';
import { readSearchHistory } from './use-search-history';

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'is', 'are',
  'was', 'were', 'be', 'this', 'that', 'it', 'its', 'your', 'you', 'how', 'what', 'why', 'when',
  'who', 'vs', 'new', 'best', 'top', 'full', 'part', 'ep', 'episode', 'official', 'video', 'ft',
  'feat', 'live', 'shorts', 'short', 'and', 'de', 'la', 'el', 'and', 'my', 'we', 'our',
]);

function extractWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w) && !/^\d+$/.test(w));
}

/**
 * Reads device-local watch history (`maar-pulse:history`) and search
 * history (`maar-pulse:searches`), scores the words and channels that show
 * up most (recent + explicit searches weighted higher), and derives a
 * single query MAAR Pulse can feed back into YouTube search — the same
 * "watched/searched X a lot, so show more like it" idea behind YouTube's
 * own home feed. Falls back to `null` when there isn't enough signal yet
 * (e.g. a brand new visitor), so the caller can just show trending videos.
 */
export function useWatchInterests() {
  const [query, setQuery] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const historyRaw = window.localStorage.getItem('maar-pulse:history');
      const history: VideoSummary[] = historyRaw ? JSON.parse(historyRaw) : [];
      const searches = readSearchHistory();

      if (history.length === 0 && searches.length === 0) {
        setQuery(null);
        setReady(true);
        return;
      }

      const wordScore = new Map<string, number>();
      const channelScore = new Map<string, number>();

      history.slice(0, 30).forEach((video, i) => {
        const weight = Math.max(1, 10 - i * 0.3);
        extractWords(video.title).forEach((w) => {
          wordScore.set(w, (wordScore.get(w) ?? 0) + weight);
        });
        if (video.channelTitle) {
          channelScore.set(video.channelTitle, (channelScore.get(video.channelTitle) ?? 0) + weight);
        }
      });

      searches.slice(0, 20).forEach((q, i) => {
        const weight = Math.max(1, 8 - i * 0.3) * 1.5; // explicit searches are a stronger signal
        extractWords(q).forEach((w) => {
          wordScore.set(w, (wordScore.get(w) ?? 0) + weight);
        });
      });

      // If one channel clearly dominates recent activity, lean into that
      // channel directly rather than generic keywords.
      const rankedChannels = [...channelScore.entries()].sort((a, b) => b[1] - a[1]);
      const totalChannelScore = rankedChannels.reduce((sum, [, v]) => sum + v, 0);
      const topChannel = rankedChannels[0];

      const topWords = [...wordScore.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([w]) => w);

      let derived: string | null = null;
      if (topChannel && totalChannelScore > 0 && topChannel[1] / totalChannelScore > 0.4) {
        derived = topChannel[0];
      } else if (topWords.length > 0) {
        derived = topWords.join(' ');
      }

      setQuery(derived);
    } catch {
      setQuery(null);
    } finally {
      setReady(true);
    }
  }, []);

  return { query, ready };
}
