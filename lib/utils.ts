import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats an ISO 8601 duration (YouTube's PT#M#S format) into "12:34" */
export function formatDuration(iso?: string): string {
  if (!iso) return '';
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';
  const h = parseInt(match[1] || '0', 10);
  const m = parseInt(match[2] || '0', 10);
  const s = parseInt(match[3] || '0', 10);
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
