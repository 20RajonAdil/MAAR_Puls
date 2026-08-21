import { NextRequest, NextResponse } from 'next/server';
import { getChannelsByIds, getChannelUploads } from '@/lib/youtube/service';
import { toErrorResponse } from '@/lib/youtube/api-response';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const uploads = searchParams.get('uploads');
  const pageToken = searchParams.get('pageToken') ?? undefined;

  if (!id) {
    return NextResponse.json({ error: true, code: 'INVALID_REQUEST', message: 'Missing required query param "id".' }, { status: 400 });
  }

  try {
    if (uploads === '1') {
      const result = await getChannelUploads(id, pageToken);
      return NextResponse.json(result);
    }
    const [channel] = await getChannelsByIds(id);
    if (!channel) {
      return NextResponse.json({ error: true, code: 'NOT_FOUND', message: 'Channel not found.' }, { status: 404 });
    }
    return NextResponse.json(channel);
  } catch (err) {
    return toErrorResponse(err);
  }
}
