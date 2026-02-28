import { NextResponse } from 'next/server';
import { providers } from '@/lib/providers';
import type { BoundingBox, ApiErrorResponse } from '@/types';

export async function GET(request: Request): Promise<Response | NextResponse<ApiErrorResponse>> {
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

  // Stream NDJSON — each line is one of:
  //   { type: 'cameras', provider: string, cameras: Camera[] }
  //   { type: 'done', total: number }
  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      let total = 0;

      await Promise.all(
        providers.map(async (provider) => {
          try {
            const cameras = await provider.fetchCameras({ bbox });
            if (cameras.length === 0) return;
            total += cameras.length;
            controller.enqueue(
              enc.encode(JSON.stringify({ type: 'cameras', provider: provider.slug, cameras }) + '\n')
            );
          } catch (err) {
            console.warn(`Provider ${provider.slug} failed:`, err);
          }
        })
      );

      controller.enqueue(enc.encode(JSON.stringify({ type: 'done', total }) + '\n'));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
