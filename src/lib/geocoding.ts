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

export async function geocodeAddress(address: string): Promise<GeocodedLocation | null> {
  try {
    const res = await fetch(`/api/geocode?address=${encodeURIComponent(address.trim())}`);
    if (!res.ok) return null;
    return await res.json() as GeocodedLocation;
  } catch {
    return null;
  }
}
