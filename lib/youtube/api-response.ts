import { NextResponse } from 'next/server';
import { YouTubeApiError } from './service';

const STATUS_BY_CODE: Record<string, number> = {
  QUOTA_EXCEEDED: 429,
  NOT_FOUND: 404,
  INVALID_REQUEST: 400,
  UPSTREAM_ERROR: 502,
  NO_API_KEY: 500,
};

/** Normalizes any thrown error into the ApiErrorShape contract every route shares. */
export function toErrorResponse(err: unknown) {
  if (err instanceof YouTubeApiError) {
    return NextResponse.json(
      { error: true, code: err.code, message: err.message },
      { status: STATUS_BY_CODE[err.code] ?? 500 }
    );
  }
  console.error('Unexpected YouTube API route error:', err);
  return NextResponse.json(
    { error: true, code: 'UPSTREAM_ERROR', message: 'Something went wrong talking to YouTube.' },
    { status: 500 }
  );
}
