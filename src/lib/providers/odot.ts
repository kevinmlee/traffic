import type { Camera, CameraProvider, CameraQueryOptions, BoundingBox } from '@/types';

// ODOT (Oregon DOT) TripCheck Traffic Cameras — no API key required.
// Served from ODOT's public ArcGIS hosted feature service.
// https://www.arcgis.com/home/item.html?id=1e3fb7169cd74127b9c1707258a6e6e9
const BASE_URL =
  'https://services.arcgis.com/uUvqNMGPm7axC2dD/arcgis/rest/services/TripCheck_Cameras/FeatureServer/0/query';

const ODOT_BOUNDS: BoundingBox = {
  north: 46.30,
  south: 41.99,
  west: -124.70,
  east: -116.46,
};

// This hosted service flattens the original nested shape into prefixed columns,
// e.g. `attributes_title`, `attributes_latitude`. Field names are exact.
interface OdotAttributes {
  attributes_cameraId: number;
  attributes_title: string;
  attributes_route: string;
  attributes_latitude: number;
  attributes_longitude: number;
  attributes_filename: string;
}

interface OdotFeature {
  attributes: OdotAttributes;
}

interface OdotResponse {
  features?: OdotFeature[];
  exceededTransferLimit?: boolean;
}

function normalizeCamera(attrs: OdotAttributes): Camera {
  const title = attrs.attributes_title?.trim() ?? '';
  return {
    id: `odot-${attrs.attributes_cameraId}`,
    provider: 'odot',
    name: title,
    nearbyPlace: '',
    county: '',
    route: attrs.attributes_route?.trim() ?? '',
    direction: '',
    district: 0,
    latitude: attrs.attributes_latitude,
    longitude: attrs.attributes_longitude,
    elevation: null,
    inService: true,
    imageUrl: attrs.attributes_filename || null,
    imageUpdateFrequencyMinutes: 2,
    imageDescription: title,
    streamingVideoUrl: null,
    referenceImages: [],
    recordedAt: new Date().toISOString(),
    categories: [],
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

    // The service caps each page at maxRecordCount (1000) and there are ~1100+
    // cameras, so page through with resultOffset until the limit is no longer hit.
    const PAGE_SIZE = 1000;
    const features: OdotFeature[] = [];
    let offset = 0;

    while (true) {
      const params = new URLSearchParams({
        where: '1=1',
        outFields: '*',
        f: 'json',
        returnGeometry: 'false',
        resultOffset: String(offset),
        resultRecordCount: String(PAGE_SIZE),
      });

      const res = await fetch(`${BASE_URL}?${params}`, {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 120 },
      });

      if (!res.ok) {
        console.warn(`ODOT fetch failed: ${res.status}`);
        break;
      }

      const data = await res.json() as OdotResponse;
      const page = data.features ?? [];
      features.push(...page);

      if (page.length < PAGE_SIZE && !data.exceededTransferLimit) break;
      offset += PAGE_SIZE;
    }

    const cameras = features
      .map(f => normalizeCamera(f.attributes))
      .filter(c => c.latitude !== 0 && c.longitude !== 0 && c.imageUrl);

    if (!bbox) return cameras;
    return cameras.filter(
      c => c.latitude >= bbox.south && c.latitude <= bbox.north &&
           c.longitude >= bbox.west && c.longitude <= bbox.east
    );
  },

  async fetchCameraById(id: string): Promise<Camera | null> {
    const cameraId = id.replace('odot-', '');
    const params = new URLSearchParams({
      where: `attributes_cameraId=${cameraId}`,
      outFields: '*',
      f: 'json',
      returnGeometry: 'false',
    });

    const res = await fetch(`${BASE_URL}?${params}`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 120 },
    });
    if (!res.ok) return null;

    const data = await res.json() as OdotResponse;
    const feature = data.features?.[0];
    return feature ? normalizeCamera(feature.attributes) : null;
  },
};
