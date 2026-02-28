import type { Camera, CameraCategory, CameraProvider, CameraQueryOptions, BoundingBox } from '@/types';

// 511 NY Traffic Camera API — no API key required
// https://511ny.org/developers
const BASE_URL = 'https://511ny.org/api/getitems?datatype=cameras&format=json';

const NY511_BOUNDS: BoundingBox = {
  north: 45.02,
  south: 40.50,
  west: -79.76,
  east: -71.78,
};

interface Ny511Camera {
  ID: string;
  Name: string;
  Url: string;
  VideoUrl: string | null;
  Latitude: number;
  Longitude: number;
  DirectionOfTravel: string;
  RoadwayName: string;
  Disabled: boolean;
  Blocked: boolean;
}

function inferCategories(cam: Ny511Camera): CameraCategory[] {
  const text = (cam.Name + ' ' + cam.RoadwayName).toLowerCase();
  const cats: CameraCategory[] = [];
  if (text.includes('weather') || text.includes('snow') || text.includes('fog')) cats.push('weather');
  if (text.includes('construction') || text.includes('work zone')) cats.push('construction');
  return cats;
}

function normalizeCamera(cam: Ny511Camera): Camera {
  return {
    id: `ny511-${cam.ID}`,
    provider: 'ny511',
    name: cam.Name,
    nearbyPlace: '',
    county: '',
    route: cam.RoadwayName ?? '',
    direction: cam.DirectionOfTravel ?? '',
    district: 0,
    latitude: cam.Latitude,
    longitude: cam.Longitude,
    elevation: null,
    inService: !cam.Disabled && !cam.Blocked,
    imageUrl: cam.Url || null,
    imageUpdateFrequencyMinutes: 2,
    imageDescription: cam.Name,
    streamingVideoUrl: cam.VideoUrl || null,
    referenceImages: [],
    recordedAt: new Date().toISOString(),
    categories: inferCategories(cam),
  };
}

function bboxesOverlap(a: BoundingBox, b: BoundingBox): boolean {
  return a.west < b.east && a.east > b.west && a.south < b.north && a.north > b.south;
}

export const ny511Provider: CameraProvider = {
  slug: 'ny511',
  displayName: '511 NY',

  async fetchCameras(options?: CameraQueryOptions): Promise<Camera[]> {
    const { bbox } = options ?? {};

    if (bbox && !bboxesOverlap(bbox, NY511_BOUNDS)) return [];

    const res = await fetch(BASE_URL, { next: { revalidate: 120 } });
    if (!res.ok) {
      console.warn(`511 NY fetch failed: ${res.status}`);
      return [];
    }

    const data = await res.json() as Ny511Camera[];
    const cameras = data
      .filter(c => c.Latitude && c.Longitude)
      .map(normalizeCamera);

    if (!bbox) return cameras;
    return cameras.filter(
      c => c.latitude >= bbox.south && c.latitude <= bbox.north &&
           c.longitude >= bbox.west && c.longitude <= bbox.east
    );
  },

  async fetchCameraById(id: string): Promise<Camera | null> {
    const cameras = await this.fetchCameras();
    return cameras.find(c => c.id === id) ?? null;
  },
};
