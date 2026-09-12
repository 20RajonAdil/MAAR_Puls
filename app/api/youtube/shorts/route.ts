import { NextRequest, NextResponse } from 'next/server';
import { getShortsFeed } from '@/lib/youtube/service';
import { toErrorResponse } from '@/lib/youtube/api-response';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') ?? undefined;
  const pageToken = searchParams.get('pageToken') ?? undefined;

  try {
    const result = await getShortsFeed({ query, pageToken });
    return NextResponse.json(result);
  } catch (err) {
    return toErrorResponse(err);
  }
}
