import { NextResponse } from 'next/server';
import { fetchCameraById } from '@/lib/providers';
import type { ApiErrorResponse } from '@/types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;

  if (!id) {
    return NextResponse.json<ApiErrorResponse>(
      { error: 'Missing camera ID', code: 'MISSING_ID' },
      { status: 400 }
    );
  }

  try {
    const camera = await fetchCameraById(id);

    if (!camera) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Camera not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({ camera });
  } catch (err) {
    console.error(`Error fetching camera ${id}:`, err);
    return NextResponse.json<ApiErrorResponse>(
      { error: 'Failed to fetch camera data', code: 'FETCH_ERROR' },
      { status: 500 }
    );
  }
}
