import type { Camera, CameraCategory, CameraProvider, CameraQueryOptions, BoundingBox } from '@/types';

// ODOT Oregon Traffic Camera API — no API key required
// https://www.tripcheck.com
const BASE_URL = 'https://api.tripcheck.com/api/1/cctv';

const ODOT_BOUNDS: BoundingBox = {
  north: 46.30,
  south: 41.99,
  west: -124.70,
  east: -116.46,
};

interface OdotCamera {
  cctvid: string;
  cctvname: string;
  location: {
    latitude: number;
    longitude: number;
    county: string;
    highway: string;
    direction: string;
    milepoint: number;
    city: string;
  };
  operational_status: string;
  views: Array<{
    view_id: string;
    url: string;
    description: string;
  }>;
}

function inferCategories(cam: OdotCamera): CameraCategory[] {
  const text = (cam.cctvname + ' ' + (cam.location.city ?? '')).toLowerCase();
  const cats: CameraCategory[] = [];
  if (text.includes('weather') || text.includes('snow') || text.includes('fog') || text.includes('pass')) {
    cats.push('weather');
  }
  if (text.includes('construction') || text.includes('work zone')) {
    cats.push('construction');
  }
  return cats;
}

function normalizeCamera(cam: OdotCamera): Camera {
  const primaryView = cam.views?.[0];
  return {
    id: `odot-${cam.cctvid}`,
    provider: 'odot',
    name: cam.cctvname,
    nearbyPlace: cam.location.city ?? '',
    county: cam.location.county ?? '',
    route: cam.location.highway ?? '',
    direction: cam.location.direction ?? '',
    district: 0,
    latitude: cam.location.latitude,
    longitude: cam.location.longitude,
    elevation: null,
    inService: cam.operational_status === 'active',
    imageUrl: primaryView?.url ?? null,
    imageUpdateFrequencyMinutes: 2,
    imageDescription: primaryView?.description ?? cam.cctvname,
    streamingVideoUrl: null,
    referenceImages: cam.views?.slice(1).map(v => v.url).filter(Boolean) ?? [],
    recordedAt: new Date().toISOString(),
    categories: inferCategories(cam),
  };
}

function bboxesOverlap(a: BoundingBox, b: BoundingBox): boolean {
  return a.west < b.east && a.east > b.west && a.south < b.north && a.north > b.south;
}

export const odotProvider: CameraProvider = {
  slug: 'odot',
  displayName: 'ODOT TripCheck',

  async fetchCameras(options?: CameraQueryOptions): Promise<Camera[]> {
    const { bbox } = options ?? {};

    if (bbox && !bboxesOverlap(bbox, ODOT_BOUNDS)) return [];

    const res = await fetch(BASE_URL, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 120 },
    });

    if (!res.ok) {
      console.warn(`ODOT fetch failed: ${res.status}`);
      return [];
    }

    const data = await res.json() as { data?: OdotCamera[] } | OdotCamera[];
    const raw: OdotCamera[] = Array.isArray(data) ? data : (data as { data?: OdotCamera[] }).data ?? [];

    const cameras = raw
      .filter(c => c.location?.latitude && c.location?.longitude)
      .map(normalizeCamera);

    if (!bbox) return cameras;
    return cameras.filter(
      c => c.latitude >= bbox.south && c.latitude <= bbox.north &&
           c.longitude >= bbox.west && c.longitude <= bbox.east
    );
  },

  async fetchCameraById(id: string): Promise<Camera | null> {
    const cctvId = id.replace('odot-', '');
    const res = await fetch(`${BASE_URL}/${cctvId}`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 120 },
    });
    if (!res.ok) return null;
    const cam = await res.json() as OdotCamera;
    return cam ? normalizeCamera(cam) : null;
  },
};
