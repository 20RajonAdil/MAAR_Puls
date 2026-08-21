import 'server-only';
import type { VideoSummary, ChannelSummary, CategoryItem, PageResult, Thumbnail } from '@/types/youtube';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// How long Next.js's fetch cache should keep each endpoint's response, in
// seconds. Kept generous because quota is precious — see README for detail.
const REVALIDATE = {
  search: 60 * 15,        // 15 min
  videos: 60 * 30,        // 30 min
  channels: 60 * 60,      // 1 hour
  popular: 60 * 30,       // 30 min
  categories: 60 * 60 * 24, // 24 hours — categories almost never change
} as const;

export class YouTubeApiError extends Error {
  code: 'QUOTA_EXCEEDED' | 'NOT_FOUND' | 'INVALID_REQUEST' | 'UPSTREAM_ERROR' | 'NO_API_KEY';
  constructor(code: YouTubeApiError['code'], message: string) {
    super(message);
    this.code = code;
  }
}

function getApiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    throw new YouTubeApiError(
      'NO_API_KEY',
      'YOUTUBE_API_KEY is not configured on the server. Add it to .env.local (dev) or your Vercel project environment variables (production).'
    );
  }
  return key;
}

async function ytFetch<T = any>(
  path: string,
  params: Record<string, string | number | undefined>,
  revalidate: number
): Promise<T> {
  const key = getApiKey();
  const search = new URLSearchParams({ key });
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) search.set(k, String(v));
  }

  const res = await fetch(`${BASE_URL}${path}?${search.toString()}`, {
    next: { revalidate },
  });

  if (!res.ok) {
    let payload: any = null;
    try {
      payload = await res.json();
    } catch {
      /* ignore parse failure */
    }
    const reason = payload?.error?.errors?.[0]?.reason;
    if (res.status === 403 && (reason === 'quotaExceeded' || reason === 'dailyLimitExceeded')) {
      throw new YouTubeApiError('QUOTA_EXCEEDED', 'The YouTube API daily quota has been exhausted. Please try again later.');
    }
    if (res.status === 404) {
      throw new YouTubeApiError('NOT_FOUND', 'The requested resource was not found.');
    }
    if (res.status === 400) {
      throw new YouTubeApiError('INVALID_REQUEST', payload?.error?.message ?? 'Invalid request sent to the YouTube API.');
    }
    throw new YouTubeApiError('UPSTREAM_ERROR', payload?.error?.message ?? `YouTube API responded with ${res.status}.`);
  }

  return res.json();
}

function pickThumbs(raw: any): VideoSummary['thumbnails'] {
  return {
    default: raw?.default,
    medium: raw?.medium,
    high: raw?.high,
    standard: raw?.standard,
    maxres: raw?.maxres,
  };
}

function mapVideoItem(item: any): VideoSummary {
  const snippet = item.snippet ?? {};
  return {
    id: typeof item.id === 'string' ? item.id : item.id?.videoId,
    title: snippet.title ?? '',
    description: snippet.description ?? '',
    channelId: snippet.channelId ?? '',
    channelTitle: snippet.channelTitle ?? '',
    publishedAt: snippet.publishedAt ?? '',
    thumbnails: pickThumbs(snippet.thumbnails),
    duration: item.contentDetails?.duration,
    viewCount: item.statistics?.viewCount,
    likeCount: item.statistics?.likeCount,
  };
}

/** Full-text search across videos. Mirrors YouTube's `search.list`. */
export async function searchVideos(opts: {
  query: string;
  pageToken?: string;
  categoryId?: string;
  order?: 'relevance' | 'date' | 'viewCount' | 'rating';
  /** 'short' = under 4 minutes. The public API has no true Shorts flag, so
   * this is the closest legitimate proxy — see getShortClips() below. */
  videoDuration?: 'short' | 'medium' | 'long';
}): Promise<PageResult<VideoSummary>> {
  const data = await ytFetch(
    '/search',
    {
      part: 'snippet',
      type: 'video',
      maxResults: 24,
      q: opts.query,
      pageToken: opts.pageToken,
      videoCategoryId: opts.categoryId,
      order: opts.order ?? 'relevance',
      videoDuration: opts.videoDuration,
      safeSearch: 'strict',
    },
    REVALIDATE.search
  );

  const ids = data.items.map((i: any) => i.id.videoId).filter(Boolean).join(',');
  const enriched = ids ? await getVideosByIds(ids) : [];
  const byId = new Map(enriched.map((v) => [v.id, v]));

  return {
    items: data.items.map((i: any) => byId.get(i.id.videoId) ?? mapVideoItem(i)),
    nextPageToken: data.nextPageToken,
    prevPageToken: data.prevPageToken,
  };
}

/** Search channels by name. */
export async function searchChannels(query: string, pageToken?: string): Promise<PageResult<ChannelSummary>> {
  const data = await ytFetch(
    '/search',
    { part: 'snippet', type: 'channel', maxResults: 16, q: query, pageToken },
    REVALIDATE.search
  );
  const ids = data.items.map((i: any) => i.id.channelId).filter(Boolean).join(',');
  return ids ? { items: await getChannelsByIds(ids), nextPageToken: data.nextPageToken } : { items: [] };
}

/** Full video detail lookup — snippet + contentDetails (duration) + statistics. */
export async function getVideosByIds(ids: string): Promise<VideoSummary[]> {
  const data = await ytFetch(
    '/videos',
    { part: 'snippet,contentDetails,statistics', id: ids },
    REVALIDATE.videos
  );
  return data.items.map(mapVideoItem);
}

export async function getVideoById(id: string): Promise<VideoSummary | null> {
  const [video] = await getVideosByIds(id);
  return video ?? null;
}

/** Related videos are no longer exposed by the public API; this uses the
 * closest legitimate substitute — a topical search seeded by the source
 * video's own title, excluding the video itself. */
export async function getRelatedVideos(seedTitle: string, excludeId: string): Promise<VideoSummary[]> {
  const result = await searchVideos({ query: seedTitle, order: 'relevance' });
  return result.items.filter((v) => v.id !== excludeId).slice(0, 20);
}

export async function getChannelsByIds(ids: string): Promise<ChannelSummary[]> {
  const data = await ytFetch(
    '/channels',
    { part: 'snippet,statistics,brandingSettings', id: ids },
    REVALIDATE.channels
  );
  return data.items.map((item: any) => ({
    id: item.id,
    title: item.snippet?.title ?? '',
    description: item.snippet?.description ?? '',
    thumbnails: {
      default: item.snippet?.thumbnails?.default,
      medium: item.snippet?.thumbnails?.medium,
      high: item.snippet?.thumbnails?.high,
    },
    bannerUrl: item.brandingSettings?.image?.bannerExternalUrl,
    subscriberCount: item.statistics?.subscriberCount,
    videoCount: item.statistics?.videoCount,
    hiddenSubscriberCount: item.statistics?.hiddenSubscriberCount,
  }));
}

export async function getChannelUploads(channelId: string, pageToken?: string): Promise<PageResult<VideoSummary>> {
  const data = await ytFetch(
    '/search',
    {
      part: 'snippet',
      channelId,
      type: 'video',
      order: 'date',
      maxResults: 24,
      pageToken,
    },
    REVALIDATE.search
  );
  const ids = data.items.map((i: any) => i.id.videoId).filter(Boolean).join(',');
  const enriched = ids ? await getVideosByIds(ids) : [];
  const byId = new Map(enriched.map((v) => [v.id, v]));
  return {
    items: data.items.map((i: any) => byId.get(i.id.videoId) ?? mapVideoItem(i)),
    nextPageToken: data.nextPageToken,
  };
}

export async function getPopularVideos(opts: {
  regionCode?: string;
  categoryId?: string;
  pageToken?: string;
}): Promise<PageResult<VideoSummary>> {
  const data = await ytFetch(
    '/videos',
    {
      part: 'snippet,contentDetails,statistics',
      chart: 'mostPopular',
      regionCode: opts.regionCode ?? 'US',
      videoCategoryId: opts.categoryId,
      maxResults: 24,
      pageToken: opts.pageToken,
    },
    REVALIDATE.popular
  );
  return { items: data.items.map(mapVideoItem), nextPageToken: data.nextPageToken };
}

/**
 * "Short clips" surface. YouTube Data API v3 has no field marking a video
 * as a Short, so this uses the closest legitimate substitute: a topical
 * search constrained to videos under 4 minutes (`videoDuration=short`),
 * sorted by recency. True Shorts (<60s, vertical) are a subset of this —
 * see README for the full explanation shown to users on the Shorts page.
 */
export async function getShortClips(query = 'shorts', pageToken?: string): Promise<PageResult<VideoSummary>> {
  return searchVideos({ query, pageToken, order: 'date', videoDuration: 'short' });
}

export async function getVideoCategories(regionCode = 'US'): Promise<CategoryItem[]> {
  const data = await ytFetch(
    '/videoCategories',
    { part: 'snippet', regionCode },
    REVALIDATE.categories
  );
  return data.items
    .filter((i: any) => i.snippet?.assignable)
    .map((i: any) => ({ id: i.id, title: i.snippet.title }));
}
