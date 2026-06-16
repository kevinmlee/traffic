import type { Camera, CameraProvider, CameraQueryOptions, BoundingBox } from '@/types';

// Transport for NSW (Australia) Live Traffic Cameras — no API key required.
// Public GeoJSON feed, refreshed ~every 30s upstream.
// https://opendata.transport.nsw.gov.au/dataset/live-traffic-cameras
const BASE_URL = 'https://data.livetraffic.com/cameras/traffic-cam.json';

// Rough bounding box for the state of New South Wales (covers Sydney + regional).
const NSW_BOUNDS: BoundingBox = {
  north: -28.15,
  south: -37.51,
  west: 140.99,
  east: 153.64,
};

interface NswFeature {
  type: 'Feature';
  id: string;
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    region: string;
    title: string;
    view: string;
    direction: string;
    href: string;
  };
}

interface NswFeatureCollection {
  type: 'FeatureCollection';
  features: NswFeature[];
}

function normalizeCamera(feature: NswFeature): Camera {
  const [longitude, latitude] = feature.geometry.coordinates;
  const p = feature.properties;
  return {
    id: `nswtraffic-${feature.id}`,
    provider: 'nswtraffic',
    name: p.title,
    nearbyPlace: p.region?.replace(/_/g, ' ') ?? '',
    county: '',
    route: '',
    direction: p.direction ?? '',
    district: 0,
    latitude,
    longitude,
    elevation: null,
    inService: true,
    imageUrl: p.href || null,
    imageUpdateFrequencyMinutes: 1,
    imageDescription: p.view ?? p.title,
    streamingVideoUrl: null,
    referenceImages: [],
    recordedAt: new Date().toISOString(),
    categories: [],
  };
}

function bboxesOverlap(a: BoundingBox, b: BoundingBox): boolean {
  return a.west < b.east && a.east > b.west && a.south < b.north && a.north > b.south;
}

export const nswTrafficProvider: CameraProvider = {
  slug: 'nswtraffic',
  displayName: 'Transport for NSW',

  async fetchCameras(options?: CameraQueryOptions): Promise<Camera[]> {
    const { bbox } = options ?? {};

    if (bbox && !bboxesOverlap(bbox, NSW_BOUNDS)) return [];

    const res = await fetch(BASE_URL, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 120 },
    });

    if (!res.ok) {
      console.warn(`NSW Traffic fetch failed: ${res.status}`);
      return [];
    }

    const data = await res.json() as NswFeatureCollection;
    const cameras = (data.features ?? [])
      .filter(f => f.geometry?.coordinates?.length === 2)
      .map(normalizeCamera)
      .filter(c => c.latitude !== 0 && c.longitude !== 0);

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
