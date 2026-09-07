import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { VideoSummary } from '@/types/youtube';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Parses an ISO 8601 duration (YouTube's PT#M#S format) into total seconds.
 * Returns undefined when there's no duration to parse (detail lookup wasn't
 * performed for this item, or the string doesn't match). */
export function parseDurationSeconds(iso?: string): number | undefined {
  if (!iso) return undefined;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return undefined;
  const h = parseInt(match[1] || '0', 10);
  const m = parseInt(match[2] || '0', 10);
  const s = parseInt(match[3] || '0', 10);
  return h * 3600 + m * 60 + s;
}

/** Formats an ISO 8601 duration (YouTube's PT#M#S format) into "12:34" */
export function formatDuration(iso?: string): string {
  const total = parseDurationSeconds(iso);
  if (total === undefined) return '';
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${m}:${pad(s)}`;
}

/** Formats a raw view/subscriber count into "1.2M" style shorthand */
export function formatCompactNumber(value?: string | number): string {
  if (value === undefined || value === null) return '';
  const num = typeof value === 'string' ? parseInt(value, 10) : value;
  if (Number.isNaN(num)) return '';
  return new Intl.NumberFormat('en', { notation: 'compact' }).format(num);
}

/** Formats an ISO publish date into relative time, e.g. "3 days ago" */
export function formatRelativeTime(iso?: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4.345, 'week'],
    [12, 'month'],
    [Number.POSITIVE_INFINITY, 'year'],
  ];
  let unitValue = seconds;
  let unitName: Intl.RelativeTimeFormatUnit = 'second';
  let divisor = 1;
  for (const [amount, name] of units) {
    if (unitValue < amount) {
      unitName = name;
      break;
    }
    unitValue = Math.floor(unitValue / amount);
    divisor *= amount;
  }
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  return rtf.format(-unitValue, unitName);
}

/** Duration threshold below which a video is eligible to be a Short. */
const SHORT_MAX_SECONDS = 120;

/** A thumbnail is "not widescreen" when it's square (1:1) or narrower
 * (portrait, i.e. true vertical Shorts) rather than the standard 16:9
 * landscape crop. width/height <= 1.05 covers exact 1:1 plus the vertical
 * aspect ratios YouTube actually serves Shorts thumbnails at. */
const SHORT_MAX_ASPECT_RATIO = 1.05;

/** YouTube Data API v3 has no official "is this a Short" flag, so this is
 * a heuristic: duration under 2 minutes AND a square-or-taller thumbnail
 * (not the standard 16:9 landscape crop). Undefined duration or thumbnail
 * dimensions (detail lookup wasn't performed) means "unknown" -> not a Short,
 * so nothing is mis-filed without evidence. */
export function isLikelyShort(video: Pick<VideoSummary, 'duration' | 'thumbnails'>): boolean {
  const seconds = parseDurationSeconds(video.duration);
  if (seconds === undefined || seconds <= 0 || seconds >= SHORT_MAX_SECONDS) return false;

  const thumb = video.thumbnails.maxres ?? video.thumbnails.standard ?? video.thumbnails.high ?? video.thumbnails.medium ?? video.thumbnails.default;
  if (!thumb || !thumb.width || !thumb.height) return false;

  return thumb.width / thumb.height <= SHORT_MAX_ASPECT_RATIO;
}
