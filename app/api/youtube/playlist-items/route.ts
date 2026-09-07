import { NextRequest, NextResponse } from 'next/server';
import { getPlaylistItems } from '@/lib/youtube/service';
import { toErrorResponse } from '@/lib/youtube/api-response';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const playlistId = searchParams.get('playlistId');
  const pageToken = searchParams.get('pageToken') ?? undefined;

  if (!playlistId) {
    return NextResponse.json(
      { error: true, code: 'INVALID_REQUEST', message: 'Missing required query param "playlistId".' },
      { status: 400 }
    );
  }

  try {
    const result = await getPlaylistItems(playlistId, pageToken);
    return NextResponse.json(result);
  } catch (err) {
    return toErrorResponse(err);
  }
}
