import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'TrafficEye/1.0 (https://trafficam.netlify.app)';

interface NominatimAddress {
  house_number?: string;
  road?: string;
  neighbourhood?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state?: string;
  postcode?: string;
}

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: NominatimAddress;
}

function buildShortName(r: NominatimResult): string {
  const a = r.address;
  const street = a.house_number && a.road
    ? `${a.house_number} ${a.road}`
    : a.road ?? null;
  const city = a.city ?? a.town ?? a.village ?? a.neighbourhood ?? null;
  const state = a.state ?? null;

  const parts = [street, city, state].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : r.display_name.split(', ').slice(0, 3).join(', ');
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');

  if (!q || q.trim().length < 2) {
    return NextResponse.json([]);
  }

  const params = new URLSearchParams({
    q: q.trim(),
    format: 'jsonv2',
    limit: '10',
    // No countrycodes restriction — cameras now span the US and Australia, and
    // we never want to silently drop a real address just because of its country.
    addressdetails: '1',
    dedupe: '1',
    'accept-language': 'en',
  });

  try {
    const res = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
      next: { revalidate: 60 },
    });

    if (!res.ok) return NextResponse.json([]);

    const results: NominatimResult[] = await res.json() as NominatimResult[];

    // De-duplicate by the full display name (which is unique per place) rather
    // than the lossy short label — otherwise two distinct addresses that happen
    // to share a "street, city, state" summary would silently drop one of them.
    const seen = new Set<string>();
    const suggestions = results
      .map(r => ({
        shortName: buildShortName(r),
        displayName: r.display_name,
        latitude: parseFloat(r.lat),
        longitude: parseFloat(r.lon),
      }))
      .filter(s => {
        const key = s.displayName.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 8);

    return NextResponse.json(suggestions, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch {
    return NextResponse.json([]);
  }
}
