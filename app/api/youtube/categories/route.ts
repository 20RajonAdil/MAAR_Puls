import { NextRequest, NextResponse } from 'next/server';
import { getVideoCategories } from '@/lib/youtube/service';
import { toErrorResponse } from '@/lib/youtube/api-response';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get('region') ?? undefined;

  try {
    const items = await getVideoCategories(region);
    return NextResponse.json({ items });
  } catch (err) {
    return toErrorResponse(err);
  }
}
