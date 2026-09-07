export interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

export interface VideoSummary {
  id: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  channelThumbnail?: string;
  publishedAt: string;
  thumbnails: Record<'default' | 'medium' | 'high' | 'standard' | 'maxres', Thumbnail | undefined>;
  duration?: string; // ISO 8601, populated when detail lookup was performed
  viewCount?: string;
  likeCount?: string;
  /** false when the uploader has disabled playback on sites other than
   * YouTube — MAAR Pulse filters these out everywhere rather than showing
   * a video that would just fail to play. Undefined = unknown (detail
   * lookup wasn't performed for this item), treated as playable. */
  embeddable?: boolean;
}

export interface ChannelSummary {
  id: string;
  title: string;
  description: string;
  thumbnails: Record<'default' | 'medium' | 'high', Thumbnail | undefined>;
  bannerUrl?: string;
  subscriberCount?: string;
  videoCount?: string;
  hiddenSubscriberCount?: boolean;
}

export interface PlaylistSummary {
  id: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  thumbnails: Record<'default' | 'medium' | 'high', Thumbnail | undefined>;
  itemCount?: number;
  publishedAt: string;
}

export interface CategoryItem {
  id: string;
  title: string;
}

export interface PageResult<T> {
  items: T[];
  nextPageToken?: string;
  prevPageToken?: string;
}

/** Normalized error shape returned by every /api/youtube/* route */
export interface ApiErrorShape {
  error: true;
  code: 'QUOTA_EXCEEDED' | 'NOT_FOUND' | 'INVALID_REQUEST' | 'UPSTREAM_ERROR' | 'NO_API_KEY';
  message: string;
}
