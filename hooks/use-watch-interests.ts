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

export type WatchInterest =
  | { type: 'channel'; label: string; channelId: string }
  | { type: 'topic'; label: string; query: string };

/** The single strongest interest signal, as a plain search term — used to
 * keep the Shorts feed aligned with the exact same "because you watched/
 * searched X" reasoning that drives the home page's personalized video
 * rails, rather than running on an unrelated generic term. */
export function primaryInterestQuery(interests: WatchInterest[]): string | undefined {
  const topic = interests.find((i) => i.type === 'topic');
  if (topic && topic.type === 'topic') return topic.query;
  const channel = interests.find((i) => i.type === 'channel');
  if (channel && channel.type === 'channel') return channel.label;
  return undefined;
}

/**
 * Reads device-local watch history (`maar-pulse:history`) and search
 * history (`maar-pulse:searches`) and scores the words and channels that
 * show up most (recent + explicit searches weighted higher). Rather than
 * collapsing everything into one blended query — which produced a single
 * generic rail — this returns up to 3 distinct interests, mirroring how
 * YouTube's real home feed runs several independent "because you watched/
 * searched X" and "more from channel Y" rows side by side instead of one
 * merged row. Falls back to an empty array when there isn't enough signal
 * yet (e.g. a brand new visitor), so the caller can just show trending videos.
 */
export function useWatchInterests() {
  const [interests, setInterests] = useState<WatchInterest[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const historyRaw = window.localStorage.getItem('maar-pulse:history');
      const history: VideoSummary[] = historyRaw ? JSON.parse(historyRaw) : [];
      const searches = readSearchHistory();

      if (history.length === 0 && searches.length === 0) {
        setInterests([]);
        setReady(true);
        return;
      }

      const wordScore = new Map<string, number>();
      // Keyed by channelId (not title) so it can drive a real uploads lookup,
      // with title carried alongside for the rail heading.
      const channelScore = new Map<string, { title: string; score: number }>();

      history.slice(0, 30).forEach((video, i) => {
        const weight = Math.max(1, 10 - i * 0.3);
        extractWords(video.title).forEach((w) => {
          wordScore.set(w, (wordScore.get(w) ?? 0) + weight);
        });
        if (video.channelId) {
          const existing = channelScore.get(video.channelId);
          channelScore.set(video.channelId, {
            title: video.channelTitle || existing?.title || '',
            score: (existing?.score ?? 0) + weight,
          });
        }
      });

      searches.slice(0, 20).forEach((q, i) => {
        const weight = Math.max(1, 8 - i * 0.3) * 1.5; // explicit searches are a stronger signal
        extractWords(q).forEach((w) => {
          wordScore.set(w, (wordScore.get(w) ?? 0) + weight);
        });
      });

      const derived: WatchInterest[] = [];

      // Strongest single channel becomes its own "More from X" rail —
      // real YouTube does this whenever one channel dominates recent activity.
      const rankedChannels = [...channelScore.entries()].sort((a, b) => b[1].score - a[1].score);
      const totalChannelScore = rankedChannels.reduce((sum, [, v]) => sum + v.score, 0);
      const [topChannelId, topChannel] = rankedChannels[0] ?? [];
      if (topChannelId && topChannel && totalChannelScore > 0 && topChannel.score / totalChannelScore > 0.3) {
        derived.push({ type: 'channel', label: topChannel.title, channelId: topChannelId });
      }

      // Remaining budget goes to up to 2 topic rails, built from
      // *non-overlapping* word groups so each rail actually looks different
      // instead of two searches for the same blended phrase.
      const rankedWords = [...wordScore.entries()].sort((a, b) => b[1] - a[1]).map(([w]) => w);
      const topicSlots = derived.length > 0 ? 2 : 3;
      let cursor = 0;
      while (derived.length < 1 + topicSlots && cursor < rankedWords.length) {
        const group = rankedWords.slice(cursor, cursor + 2);
        cursor += 2;
        if (group.length === 0) break;
        derived.push({ type: 'topic', label: group.join(' '), query: group.join(' ') });
      }

      setInterests(derived.slice(0, 3));
    } catch {
      setInterests([]);
    } finally {
      setReady(true);
    }
  }, []);

  return { interests, ready };
}
