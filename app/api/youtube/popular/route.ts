import { NextRequest, NextResponse } from 'next/server';
import { getPopularVideos } from '@/lib/youtube/service';
import { toErrorResponse } from '@/lib/youtube/api-response';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get('categoryId') ?? undefined;
  const regionCode = searchParams.get('region') ?? undefined;
  const pageToken = searchParams.get('pageToken') ?? undefined;

  try {
    const result = await getPopularVideos({ categoryId, regionCode, pageToken });
    return NextResponse.json(result);
  } catch (err) {
    return toErrorResponse(err);
  }
}
