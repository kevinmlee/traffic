import type { Camera, CameraProvider, CameraQueryOptions, BoundingBox } from '@/types';

// WSDOT (Washington State DOT) Traffic Cameras — no API key required.
// Served from WSDOT's public ArcGIS REST feature service.
// https://www.wsdot.wa.gov/arcgis/rest/services/Production/WSDOTTrafficCameras/MapServer/0
const BASE_URL =
  'https://www.wsdot.wa.gov/arcgis/rest/services/Production/WSDOTTrafficCameras/MapServer/0/query';

const WSDOT_BOUNDS: BoundingBox = {
  north: 49.05,
  south: 45.54,
  west: -124.85,
  east: -116.91,
};

interface WsdotAttributes {
  CameraID: number;
  CameraTitl: string;
  StateRoute: string;
  CompassDir: string;
  Latitude: number;
  Longitude: number;
  ImageURL: string;
  CameraOwne: string;
}

interface WsdotFeature {
  attributes: WsdotAttributes;
}

interface WsdotResponse {
  features?: WsdotFeature[];
}

// ArcGIS uses the literal string "NULL" for missing text values.
function clean(value: string | null | undefined): string {
  if (!value || value === 'NULL') return '';
  return value;
}

function normalizeCamera(attrs: WsdotAttributes): Camera {
  return {
    id: `wsdot-${attrs.CameraID}`,
    provider: 'wsdot',
    name: clean(attrs.CameraTitl),
    nearbyPlace: '',
    county: '',
    route: clean(attrs.StateRoute),
    direction: clean(attrs.CompassDir),
    district: 0,
    latitude: attrs.Latitude,
    longitude: attrs.Longitude,
    elevation: null,
    inService: true,
    imageUrl: clean(attrs.ImageURL) || null,
    imageUpdateFrequencyMinutes: 2,
    imageDescription: clean(attrs.CameraTitl),
    streamingVideoUrl: null,
    referenceImages: [],
    recordedAt: new Date().toISOString(),
    categories: [],
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

    const params = new URLSearchParams({
      where: '1=1',
      outFields: 'CameraID,CameraTitl,StateRoute,CompassDir,Latitude,Longitude,ImageURL,CameraOwne',
      f: 'json',
      returnGeometry: 'false',
    });

    const res = await fetch(`${BASE_URL}?${params}`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 120 },
    });

    if (!res.ok) {
      console.warn(`WSDOT fetch failed: ${res.status}`);
      return [];
    }

    const data = await res.json() as WsdotResponse;
    const cameras = (data.features ?? [])
      .map(f => normalizeCamera(f.attributes))
      .filter(c => c.latitude !== 0 && c.longitude !== 0 && c.imageUrl);

    if (!bbox) return cameras;
    return cameras.filter(
      c => c.latitude >= bbox.south && c.latitude <= bbox.north &&
           c.longitude >= bbox.west && c.longitude <= bbox.east
    );
  },

  async fetchCameraById(id: string): Promise<Camera | null> {
    const cameraId = id.replace('wsdot-', '');
    const params = new URLSearchParams({
      where: `CameraID=${cameraId}`,
      outFields: 'CameraID,CameraTitl,StateRoute,CompassDir,Latitude,Longitude,ImageURL,CameraOwne',
      f: 'json',
      returnGeometry: 'false',
    });

    const res = await fetch(`${BASE_URL}?${params}`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 120 },
    });
    if (!res.ok) return null;

    const data = await res.json() as WsdotResponse;
    const feature = data.features?.[0];
    return feature ? normalizeCamera(feature.attributes) : null;
  },
};
