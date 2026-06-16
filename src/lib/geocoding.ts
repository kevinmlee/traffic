import type { GeocodedLocation } from '@/types';

export interface GeocodeSuggestion {
  displayName: string;
  shortName: string;
  latitude: number;
  longitude: number;
}

export async function geocodeSuggest(query: string): Promise<GeocodeSuggestion[]> {
  if (query.trim().length < 2) return [];

  try {
    const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(query.trim())}`);
    if (!res.ok) return [];
    return await res.json() as GeocodeSuggestion[];
  } catch {
    return [];
  }
}

export interface IpLocation {
  latitude: number;
  longitude: number;
  label: string | null;
}

/**
 * Resolve the visitor's approximate location from their IP / edge geo headers,
 * used to scope the initial camera load to a nearby area. Returns null if the
 * location can't be determined (e.g. local dev), so the caller can fall back.
 */
export async function locateByIp(): Promise<IpLocation | null> {
  try {
    const res = await fetch('/api/geo');
    if (!res.ok) return null;
    const data = await res.json() as IpLocation;
    if (typeof data.latitude !== 'number' || typeof data.longitude !== 'number') return null;
    return data;
  } catch {
    return null;
  }
}

export async function geocodeAddress(address: string): Promise<GeocodedLocation | null> {
  try {
    const res = await fetch(`/api/geocode?address=${encodeURIComponent(address.trim())}`);
    if (!res.ok) return null;
    return await res.json() as GeocodedLocation;
  } catch {
    return null;
  }
}
