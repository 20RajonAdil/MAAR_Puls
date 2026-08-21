import { NextRequest, NextResponse } from 'next/server';
import { searchVideos, searchChannels } from '@/lib/youtube/service';
import { toErrorResponse } from '@/lib/youtube/api-response';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  const type = searchParams.get('type') ?? 'video';
  const pageToken = searchParams.get('pageToken') ?? undefined;
  const categoryId = searchParams.get('categoryId') ?? undefined;
  const order = (searchParams.get('order') as any) ?? 'relevance';

  if (!q) {
    return NextResponse.json({ error: true, code: 'INVALID_REQUEST', message: 'Missing required query param "q".' }, { status: 400 });
  }

  try {
    const result =
      type === 'channel'
        ? await searchChannels(q, pageToken)
        : await searchVideos({ query: q, pageToken, categoryId, order });
    return NextResponse.json(result);
  } catch (err) {
    return toErrorResponse(err);
  }
}
