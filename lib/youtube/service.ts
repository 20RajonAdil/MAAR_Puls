import 'server-only';
import type { VideoSummary, ChannelSummary, CategoryItem, PageResult, Thumbnail, PlaylistSummary } from '@/types/youtube';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// How long Next.js's fetch cache should keep each endpoint's response, in
// seconds. Kept generous because quota is precious — see README for detail.
const REVALIDATE = {
  search: 60 * 15,        // 15 min
  videos: 60 * 30,        // 30 min
  channels: 60 * 60,      // 1 hour
  popular: 60 * 30,       // 30 min
  categories: 60 * 60 * 24, // 24 hours — categories almost never change
  playlists: 60 * 60,     // 1 hour — same cadence as channel data
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
    // Only present when the `status` part was requested; absent (undefined)
    // is treated as "unknown, assume playable" by isEmbeddable() below.
    embeddable: item.status ? item.status.embeddable !== false : undefined,
  };
}

/** true unless a detail lookup explicitly told us the owner disabled
 * playback on other sites — undefined (no status data) is kept, not
 * dropped, since we'd rather show a video than wrongly hide one. */
function isEmbeddable(video: VideoSummary): boolean {
  return video.embeddable !== false;
}

/** Internal — fetches full video details without filtering, so callers
 * that merge these into a search-result list can decide what to drop. */
async function fetchVideoDetails(ids: string): Promise<VideoSummary[]> {
  const data = await ytFetch(
    '/videos',
    { part: 'snippet,contentDetails,statistics,status', id: ids },
    REVALIDATE.videos
  );
  return data.items.map(mapVideoItem);
}

/** Full-text search across videos. Mirrors YouTube's `search.list`. */
export async function searchVideos(opts: {
  query: string;
  pageToken?: string;
  categoryId?: string;
  order?: 'relevance' | 'date' | 'viewCount' | 'rating';
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
      safeSearch: 'moderate',
    },
    REVALIDATE.search
  );

  const ids = data.items.map((i: any) => i.id.videoId).filter(Boolean).join(',');
  const enriched = ids ? await fetchVideoDetails(ids) : [];
  const byId = new Map(enriched.map((v) => [v.id, v]));

  const items = data.items
    .map((i: any) => byId.get(i.id.videoId) ?? mapVideoItem(i))
    .filter(isEmbeddable);

  return {
    items,
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

/** Full video detail lookup — snippet + contentDetails (duration) +
 * statistics + status. Drops videos the owner has disabled embedding for,
 * so nothing that would fail to play ever reaches the UI. */
export async function getVideosByIds(ids: string): Promise<VideoSummary[]> {
  const items = await fetchVideoDetails(ids);
  return items.filter(isEmbeddable);
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
  const enriched = ids ? await fetchVideoDetails(ids) : [];
  const byId = new Map(enriched.map((v) => [v.id, v]));
  const items = data.items
    .map((i: any) => byId.get(i.id.videoId) ?? mapVideoItem(i))
    .filter(isEmbeddable);
  return {
    items,
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
      part: 'snippet,contentDetails,statistics,status',
      chart: 'mostPopular',
      regionCode: opts.regionCode ?? 'US',
      videoCategoryId: opts.categoryId,
      maxResults: 24,
      pageToken: opts.pageToken,
    },
    REVALIDATE.popular
  );
  return { items: data.items.map(mapVideoItem).filter(isEmbeddable), nextPageToken: data.nextPageToken };
}

function mapPlaylistItem(item: any): PlaylistSummary {
  const snippet = item.snippet ?? {};
  return {
    id: item.id,
    title: snippet.title ?? '',
    description: snippet.description ?? '',
    channelId: snippet.channelId ?? '',
    channelTitle: snippet.channelTitle ?? '',
    thumbnails: {
      default: snippet.thumbnails?.default,
      medium: snippet.thumbnails?.medium,
      high: snippet.thumbnails?.high,
    },
    itemCount: item.contentDetails?.itemCount,
    publishedAt: snippet.publishedAt ?? '',
  };
}

/** Public playlists owned by a channel — the `playlists.list` endpoint
 * referenced in the README as the follow-up to the scaffold's Playlists
 * tab. Only surfaces playlists YouTube itself reports as public. */
export async function getChannelPlaylists(channelId: string, pageToken?: string): Promise<PageResult<PlaylistSummary>> {
  const data = await ytFetch(
    '/playlists',
    { part: 'snippet,contentDetails', channelId, maxResults: 24, pageToken },
    REVALIDATE.playlists
  );
  return {
    items: (data.items ?? []).map(mapPlaylistItem),
    nextPageToken: data.nextPageToken,
  };
}

export async function getPlaylistById(id: string): Promise<PlaylistSummary | null> {
  const data = await ytFetch(
    '/playlists',
    { part: 'snippet,contentDetails', id, maxResults: 1 },
    REVALIDATE.playlists
  );
  const [item] = data.items ?? [];
  return item ? mapPlaylistItem(item) : null;
}

/** Videos inside a playlist, in playlist order. Uses `playlistItems.list`
 * for ordering/membership, then enriches with `videos.list` (duration,
 * stats, embeddable status) the same way search results are enriched —
 * so playlist videos filter out non-embeddable items and get real
 * durations/view counts, not just the bare snippet. */
export async function getPlaylistItems(playlistId: string, pageToken?: string): Promise<PageResult<VideoSummary>> {
  const data = await ytFetch(
    '/playlistItems',
    { part: 'snippet', playlistId, maxResults: 24, pageToken },
    REVALIDATE.playlists
  );
  const items = (data.items ?? []) as any[];
  const ids = items
    .map((i) => i.snippet?.resourceId?.videoId)
    .filter(Boolean)
    .join(',');
  const enriched = ids ? await fetchVideoDetails(ids) : [];
  const byId = new Map(enriched.map((v) => [v.id, v]));

  const mapped = items
    .map((i) => {
      const videoId = i.snippet?.resourceId?.videoId;
      return byId.get(videoId);
    })
    // Deleted/private videos still occupy a playlist slot but come back
    // with no matching detail record — drop them rather than show a blank card.
    .filter((v): v is VideoSummary => Boolean(v))
    .filter(isEmbeddable);

  return { items: mapped, nextPageToken: data.nextPageToken };
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
