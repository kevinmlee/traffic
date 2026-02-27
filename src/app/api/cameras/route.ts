import { NextResponse } from 'next/server';
import { fetchAllCameras } from '@/lib/providers';
import type { BoundingBox, ApiCamerasResponse, ApiErrorResponse } from '@/types';

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
  } else {
    // Individual params fallback
    const north = searchParams.get('north');
    const south = searchParams.get('south');
    const east = searchParams.get('east');
    const west = searchParams.get('west');

    if (north && south && east && west) {
      bbox = {
        north: parseFloat(north),
        south: parseFloat(south),
        east: parseFloat(east),
        west: parseFloat(west),
      };
    }
  }

  try {
    const cameras = await fetchAllCameras({ bbox });

    return NextResponse.json({
      cameras,
      total: cameras.length,
      sources: Array.from(new Set(cameras.map(c => c.provider))),
    });
  } catch (err) {
    console.error('Error fetching cameras:', err);
    return NextResponse.json(
      { error: 'Failed to fetch camera data', code: 'FETCH_ERROR' },
      { status: 500 }
    );
  }
}
