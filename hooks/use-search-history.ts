/**
 * Device-scoped log of search queries, kept alongside watch history so
 * `useWatchInterests` can build a personalized feed from both what the
 * person watches AND what they explicitly search for — the same two
 * signals YouTube's own "Because you watched / searched" rails use.
 */
const SEARCH_KEY = 'maar-pulse:searches';
const MAX_ENTRIES = 50;

export function recordSearch(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return;
  try {
    const raw = window.localStorage.getItem(SEARCH_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    const next = [trimmed, ...list.filter((q) => q.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_ENTRIES);
    window.localStorage.setItem(SEARCH_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable (private mode, quota) — safe to no-op */
  }
}

export function readSearchHistory(): string[] {
  try {
    const raw = window.localStorage.getItem(SEARCH_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
