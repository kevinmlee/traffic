import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'TrafficEye/1.0 (https://trafficam.netlify.app)';

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address');

  if (!address || address.trim().length < 2) {
    return NextResponse.json({ error: 'address param required' }, { status: 400 });
  }

  const params = new URLSearchParams({
    q: address.trim(),
    format: 'json',
    limit: '1',
    countrycodes: 'us',
    'accept-language': 'en',
  });

  try {
    const res = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
      next: { revalidate: 86400 },
    });

    if (!res.ok) return NextResponse.json({ error: 'Geocoding service unavailable' }, { status: 502 });

    const results: NominatimResult[] = await res.json() as NominatimResult[];

    if (!results.length) {
      return NextResponse.json({ error: 'No results found' }, { status: 404 });
    }

    const r = results[0];
    return NextResponse.json({
      displayName: r.display_name,
      latitude: parseFloat(r.lat),
      longitude: parseFloat(r.lon),
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400' },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to geocode address' }, { status: 500 });
  }
}
