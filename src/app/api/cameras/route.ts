import { NextResponse } from 'next/server';
import { fetchAllCameras } from '@/lib/providers';
import type { BoundingBox, ApiCamerasResponse, ApiErrorResponse } from '@/types';

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

export async function GET(request: Request): Promise<NextResponse<ApiCamerasResponse | ApiErrorResponse>> {
  const { searchParams } = new URL(request.url);

  let bbox: BoundingBox | undefined;

  const bboxParam = searchParams.get('bbox');
  if (bboxParam) {
    const parts = bboxParam.split(',').map(Number);
    if (parts.length !== 4 || parts.some(isNaN)) {
      return NextResponse.json(
        { error: 'Invalid bbox parameter. Expected: north,south,east,west', code: 'INVALID_BBOX' },
        { status: 400 }
      );
    }
    const [north, south, east, west] = parts;
    bbox = { north, south, east, west };
  }

  const limitParam = parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10);
  const offsetParam = parseInt(searchParams.get('offset') ?? '0', 10);
  const limit = Math.min(isNaN(limitParam) ? DEFAULT_LIMIT : limitParam, MAX_LIMIT);
  const offset = isNaN(offsetParam) || offsetParam < 0 ? 0 : offsetParam;

  try {
    // Fetch all matching cameras (providers handle bbox filtering)
    const allCameras = await fetchAllCameras({ bbox });

    const page = allCameras.slice(offset, offset + limit);

    return NextResponse.json({
      cameras: page,
      total: allCameras.length,
      hasMore: offset + limit < allCameras.length,
      offset,
      sources: Array.from(new Set(allCameras.map(c => c.provider))),
    });
  } catch (err) {
    console.error('Error fetching cameras:', err);
    return NextResponse.json(
      { error: 'Failed to fetch camera data', code: 'FETCH_ERROR' },
      { status: 500 }
    );
  }
}
