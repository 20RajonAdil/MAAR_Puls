import { NextRequest, NextResponse } from 'next/server';
import { getChannelPlaylists } from '@/lib/youtube/service';
import { toErrorResponse } from '@/lib/youtube/api-response';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const channelId = searchParams.get('channelId');
  const pageToken = searchParams.get('pageToken') ?? undefined;

  if (!channelId) {
    return NextResponse.json(
      { error: true, code: 'INVALID_REQUEST', message: 'Missing required query param "channelId".' },
      { status: 400 }
    );
  }

  try {
    const result = await getChannelPlaylists(channelId, pageToken);
    return NextResponse.json(result);
  } catch (err) {
    return toErrorResponse(err);
  }
}
