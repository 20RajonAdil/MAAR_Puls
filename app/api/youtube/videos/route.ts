import { NextRequest, NextResponse } from 'next/server';
import { getVideosByIds, getRelatedVideos } from '@/lib/youtube/service';
import { toErrorResponse } from '@/lib/youtube/api-response';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ids = searchParams.get('ids');
  const relatedTo = searchParams.get('relatedToTitle');
  const excludeId = searchParams.get('excludeId') ?? '';

  try {
    if (relatedTo) {
      const items = await getRelatedVideos(relatedTo, excludeId);
      return NextResponse.json({ items });
    }
    if (!ids) {
      return NextResponse.json({ error: true, code: 'INVALID_REQUEST', message: 'Missing required query param "ids".' }, { status: 400 });
    }
    const items = await getVideosByIds(ids);
    return NextResponse.json({ items });
  } catch (err) {
    return toErrorResponse(err);
  }
}
