import type { Camera, CameraCategory, CameraProvider, CameraQueryOptions, BoundingBox } from '@/types';

// WSDOT Traffic Camera API — no API key required
// https://wsdot.wa.gov/traffic/api/
const BASE_URL = 'https://wsdot.wa.gov/Traffic/api/v2/TravelMonitoringCamera/GetCamerasAsJson';

const WSDOT_BOUNDS: BoundingBox = {
  north: 49.05,
  south: 45.54,
  west: -124.85,
  east: -116.91,
};

interface WsdotCamera {
  CameraID: number;
  Title: string;
  Description: string;
  CameraLocation: {
    Latitude: number;
    Longitude: number;
    Description: string;
    RoadName: string;
    Direction: string;
    MilePost: number;
    County: string;
  };
  ImageURL: string;
  IsActive: boolean;
  SortOrder: number;
  Region: string;
  DisplayLatitude: number;
  DisplayLongitude: number;
  OwnershipTypeID: number;
}

function inferCategories(cam: WsdotCamera): CameraCategory[] {
  const text = (cam.Title + ' ' + cam.Description + ' ' + cam.CameraLocation.Description).toLowerCase();
  const cats: CameraCategory[] = [];
  if (text.includes('weather') || text.includes('snow') || text.includes('fog') || text.includes('pass')) {
    cats.push('weather');
  }
  if (text.includes('construction') || text.includes('work zone')) {
    cats.push('construction');
  }
  return cats;
}

function normalizeCamera(cam: WsdotCamera): Camera {
  return {
    id: `wsdot-${cam.CameraID}`,
    provider: 'wsdot',
    name: cam.Title,
    nearbyPlace: cam.CameraLocation.Description,
    county: cam.CameraLocation.County ?? '',
    route: cam.CameraLocation.RoadName ?? '',
    direction: cam.CameraLocation.Direction ?? '',
    district: 0,
    latitude: cam.CameraLocation.Latitude,
    longitude: cam.CameraLocation.Longitude,
    elevation: null,
    inService: cam.IsActive,
    imageUrl: cam.ImageURL || null,
    imageUpdateFrequencyMinutes: 2,
    imageDescription: cam.Description ?? '',
    streamingVideoUrl: null,
    referenceImages: [],
    recordedAt: new Date().toISOString(),
    categories: inferCategories(cam),
  };
}

function bboxesOverlap(a: BoundingBox, b: BoundingBox): boolean {
  return a.west < b.east && a.east > b.west && a.south < b.north && a.north > b.south;
}

export const wsdotProvider: CameraProvider = {
  slug: 'wsdot',
  displayName: 'WSDOT',

  async fetchCameras(options?: CameraQueryOptions): Promise<Camera[]> {
    const { bbox } = options ?? {};

    if (bbox && !bboxesOverlap(bbox, WSDOT_BOUNDS)) return [];

    const res = await fetch(BASE_URL, { next: { revalidate: 120 } });
    if (!res.ok) {
      console.warn(`WSDOT fetch failed: ${res.status}`);
      return [];
    }

    const data = await res.json() as WsdotCamera[];
    const cameras = data.map(normalizeCamera).filter(c => c.latitude !== 0 && c.longitude !== 0);

    if (!bbox) return cameras;
    return cameras.filter(
      c => c.latitude >= bbox.south && c.latitude <= bbox.north &&
           c.longitude >= bbox.west && c.longitude <= bbox.east
    );
  },

  async fetchCameraById(id: string): Promise<Camera | null> {
    const cameraId = id.replace('wsdot-', '');
    const res = await fetch(
      `https://wsdot.wa.gov/Traffic/api/v2/TravelMonitoringCamera/GetCameraAsJson?CameraID=${cameraId}`,
      { next: { revalidate: 120 } }
    );
    if (!res.ok) return null;
    const cam = await res.json() as WsdotCamera;
    return cam ? normalizeCamera(cam) : null;
  },
};
