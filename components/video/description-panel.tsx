'use client';

import { useState } from 'react';
import { formatCompactNumber, formatRelativeTime } from '@/lib/utils';

export function DescriptionPanel({
  description,
  viewCount,
  publishedAt,
}: {
  description: string;
  viewCount?: string;
  publishedAt: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <button
      onClick={() => setExpanded((e) => !e)}
      className="w-full rounded-md bg-raised px-4 py-3 text-left transition-colors hover:bg-overlay"
    >
      <p className="font-mono text-xs text-muted">
        {viewCount && `${formatCompactNumber(viewCount)} views`}
        {viewCount && ' \u00b7 '}
        {formatRelativeTime(publishedAt)}
      </p>
      <p className={`mt-2 whitespace-pre-line text-sm text-ink ${expanded ? '' : 'line-clamp-3'}`}>{description || 'No description provided.'}</p>
      <span className="mt-2 inline-block text-xs font-medium text-muted">{expanded ? 'Show less' : 'Show more'}</span>
    </button>
  );
}
