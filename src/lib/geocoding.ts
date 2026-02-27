import type { GeocodedLocation } from '@/types';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'TrafficCameraExplorer/1.0';

export interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

export async function geocodeAddress(address: string): Promise<GeocodedLocation | null> {
  const params = new URLSearchParams({
    q: address,
    format: 'json',
    limit: '1',
    countrycodes: 'us',
  });

  const res = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept-Language': 'en',
    },
  });

  if (!res.ok) {
    console.error(`Geocoding failed: ${res.status}`);
    return null;
  }

  const results: NominatimResult[] = await res.json() as NominatimResult[];

  if (!results.length) {
    return null;
  }

  const [first] = results;
  return {
    displayName: first.display_name,
    latitude: parseFloat(first.lat),
    longitude: parseFloat(first.lon),
  };
}
