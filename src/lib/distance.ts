import type { BoundingBox } from '@/types';

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function bboxFromCenter(
  latitude: number,
  longitude: number,
  radiusKm: number
): BoundingBox {
  const latDelta = (radiusKm / EARTH_RADIUS_KM) * (180 / Math.PI);
  const lonDelta =
    (radiusKm / EARTH_RADIUS_KM) *
    (180 / Math.PI) /
    Math.cos(toRad(latitude));

  return {
    north: latitude + latDelta,
    south: latitude - latDelta,
    east: longitude + lonDelta,
    west: longitude - lonDelta,
  };
}
