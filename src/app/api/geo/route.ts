import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Resolve the visitor's approximate location so the initial page load can show
// nearby cameras instead of fetching the entire (multi-thousand) global feed.
//
// Resolution order:
//   1. Netlify edge geo header (`x-nf-geo`) — free, no external request, set in prod.
//   2. Generic `x-vercel-ip-*` style headers if present.
//   3. A keyless IP geolocation lookup using the client's forwarded IP.
//
// Returns { latitude, longitude, label, source }. Never throws — on total
// failure the client falls back to its own default.

interface GeoResult {
  latitude: number;
  longitude: number;
  label: string | null;
  source: 'netlify' | 'header' | 'ip-lookup';
}

function clientIp(request: NextRequest): string | null {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip');
}

function fromNetlifyHeader(request: NextRequest): GeoResult | null {
  const raw = request.headers.get('x-nf-geo');
  if (!raw) return null;
  try {
    const geo = JSON.parse(raw) as {
      latitude?: number;
      longitude?: number;
      city?: string;
      subdivision?: { name?: string };
    };
    if (typeof geo.latitude === 'number' && typeof geo.longitude === 'number') {
      const label = [geo.city, geo.subdivision?.name].filter(Boolean).join(', ') || null;
      return { latitude: geo.latitude, longitude: geo.longitude, label, source: 'netlify' };
    }
  } catch {
    // malformed header — fall through
  }
  return null;
}

function fromVercelHeaders(request: NextRequest): GeoResult | null {
  const lat = request.headers.get('x-vercel-ip-latitude');
  const lon = request.headers.get('x-vercel-ip-longitude');
  if (lat && lon) {
    const city = request.headers.get('x-vercel-ip-city');
    return {
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
      label: city ? decodeURIComponent(city) : null,
      source: 'header',
    };
  }
  return null;
}

async function fromIpLookup(ip: string | null): Promise<GeoResult | null> {
  // Skip private / loopback addresses (local dev) — the lookup would resolve the
  // server's own IP, which is misleading. Let the client use its default instead.
  if (!ip || ip === '::1' || ip.startsWith('127.') || ip.startsWith('10.') ||
      ip.startsWith('192.168.') || ip.startsWith('172.')) {
    return null;
  }

  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,lat,lon,city,regionName`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json() as {
      status: string;
      lat?: number;
      lon?: number;
      city?: string;
      regionName?: string;
    };
    if (data.status === 'success' && typeof data.lat === 'number' && typeof data.lon === 'number') {
      const label = [data.city, data.regionName].filter(Boolean).join(', ') || null;
      return { latitude: data.lat, longitude: data.lon, label, source: 'ip-lookup' };
    }
  } catch {
    // network failure — fall through
  }
  return null;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const result =
    fromNetlifyHeader(request) ??
    fromVercelHeaders(request) ??
    (await fromIpLookup(clientIp(request)));

  if (!result) {
    return NextResponse.json({ error: 'Location unavailable' }, { status: 404 });
  }

  return NextResponse.json(result, {
    // Vary by IP/geo — short cache so a shared CDN node doesn't pin one user's location.
    headers: { 'Cache-Control': 'private, max-age=300' },
  });
}
