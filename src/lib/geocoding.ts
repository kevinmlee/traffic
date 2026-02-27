import type { GeocodedLocation } from '@/types';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'TrafficCameraExplorer/1.0';

export interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  class: string;
}

export interface GeocodeSuggestion {
  displayName: string;
  shortName: string;
  latitude: number;
  longitude: number;
}

function toShortName(displayName: string): string {
  // "San Francisco, San Francisco County, California, United States"
  // → "San Francisco, California"
  const parts = displayName.split(', ');
  if (parts.length >= 3) {
    return `${parts[0]}, ${parts[parts.length - 2]}`;
  }
  return parts.slice(0, 2).join(', ');
}

export async function geocodeSuggest(query: string): Promise<GeocodeSuggestion[]> {
  if (query.trim().length < 2) return [];

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '6',
    countrycodes: 'us',
    addressdetails: '0',
  });

  const res = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept-Language': 'en',
    },
  });

  if (!res.ok) return [];

  const results: NominatimResult[] = await res.json() as NominatimResult[];
  return results.map(r => ({
    displayName: r.display_name,
    shortName: toShortName(r.display_name),
    latitude: parseFloat(r.lat),
    longitude: parseFloat(r.lon),
  }));
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
