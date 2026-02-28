import type {
  Camera,
  CameraCategory,
  CameraProvider,
  CameraQueryOptions,
  BoundingBox,
  CaltransRawResponse,
  CaltransRawCctv,
  CaltransRawImageStatic,
} from '@/types';

// Approximate bounding boxes for each Caltrans district
const DISTRICT_BOUNDS: Record<number, BoundingBox> = {
  1:  { north: 42.01, south: 39.00, west: -124.50, east: -122.50 }, // Eureka
  2:  { north: 42.01, south: 39.80, west: -122.80, east: -119.90 }, // Redding
  3:  { north: 40.00, south: 38.00, west: -123.00, east: -120.00 }, // Marysville
  4:  { north: 38.90, south: 36.90, west: -123.60, east: -121.20 }, // Bay Area
  5:  { north: 36.90, south: 34.40, west: -122.00, east: -119.30 }, // San Luis Obispo
  6:  { north: 38.00, south: 35.00, west: -121.00, east: -117.60 }, // Fresno
  7:  { north: 34.80, south: 33.40, west: -119.00, east: -117.60 }, // Los Angeles
  8:  { north: 34.80, south: 33.40, west: -117.70, east: -114.40 }, // San Bernardino
  9:  { north: 38.00, south: 35.50, west: -118.50, east: -115.80 }, // Bishop
  10: { north: 38.60, south: 36.80, west: -122.00, east: -119.50 }, // Stockton
  11: { north: 33.50, south: 32.50, west: -117.40, east: -116.10 }, // San Diego
  12: { north: 33.90, south: 33.40, west: -118.00, east: -117.40 }, // Orange County
};

function bboxesOverlap(a: BoundingBox, b: BoundingBox): boolean {
  return (
    a.west < b.east &&
    a.east > b.west &&
    a.south < b.north &&
    a.north > b.south
  );
}

function isNotReported(value: string): boolean {
  return value === 'Not Reported' || value === '' || value === 'N/A';
}

function getReferenceImages(staticData: CaltransRawImageStatic): string[] {
  const keys: (keyof CaltransRawImageStatic)[] = [
    'referenceImage1UpdateAgoURL',
    'referenceImage2UpdatesAgoURL',
    'referenceImage3UpdatesAgoURL',
    'referenceImage4UpdatesAgoURL',
    'referenceImage5UpdatesAgoURL',
    'referenceImage6UpdatesAgoURL',
    'referenceImage7UpdatesAgoURL',
    'referenceImage8UpdatesAgoURL',
    'referenceImage9UpdatesAgoURL',
    'referenceImage10UpdatesAgoURL',
    'referenceImage11UpdatesAgoURL',
    'referenceImage12UpdatesAgoURL',
  ];
  return keys
    .map(k => staticData[k])
    .filter(url => !isNotReported(url));
}

// Mountain pass names that indicate weather cameras
const PASS_KEYWORDS = ['pass', 'summit', 'grade', 'ridge', 'peak', 'canyon', 'mt ', 'mtn', 'sierra', 'tahoe', 'donner', 'cajon', 'tejon', 'grapevine', 'pacheco', 'altamont', 'gaviota', 'cuesta'];

function inferCategories(raw: CaltransRawCctv): CameraCategory[] {
  const categories: CameraCategory[] = [];
  const text = (
    raw.imageData.imageDescription + ' ' +
    raw.location.locationName + ' ' +
    raw.location.nearbyPlace + ' ' +
    raw.location.county
  ).toLowerCase();

  const isWeather = PASS_KEYWORDS.some(kw => text.includes(kw)) ||
    text.includes('weather') || text.includes('snow') || text.includes('fog') ||
    text.includes('wind') || text.includes('chain') || text.includes('ice') ||
    text.includes('frost') || text.includes('elevation');

  const isConstruction = text.includes('construction') || text.includes('work zone') ||
    text.includes('roadwork') || text.includes('project');

  if (isWeather) categories.push('weather');
  if (isConstruction) categories.push('construction');
  return categories;
}

function normalizeCaltransCamera(raw: CaltransRawCctv, district: number): Camera {
  const staticData = raw.imageData.static;

  return {
    id: `caltrans-d${district}-${raw.index}`,
    provider: 'caltrans',
    name: raw.location.locationName,
    nearbyPlace: raw.location.nearbyPlace,
    county: raw.location.county,
    route: raw.location.route,
    direction: raw.location.direction,
    district,
    latitude: parseFloat(raw.location.latitude),
    longitude: parseFloat(raw.location.longitude),
    elevation: isNotReported(raw.location.elevation)
      ? null
      : parseInt(raw.location.elevation, 10),
    inService: raw.inService === 'true',
    imageUrl: isNotReported(staticData.currentImageURL)
      ? null
      : staticData.currentImageURL,
    imageUpdateFrequencyMinutes: isNotReported(staticData.currentImageUpdateFrequency)
      ? null
      : parseInt(staticData.currentImageUpdateFrequency, 10),
    imageDescription: raw.imageData.imageDescription,
    streamingVideoUrl: isNotReported(raw.imageData.streamingVideoURL)
      ? null
      : raw.imageData.streamingVideoURL,
    referenceImages: getReferenceImages(staticData),
    recordedAt: `${raw.recordTimestamp.recordDate}T${raw.recordTimestamp.recordTime}`,
    categories: inferCategories(raw),
  };
}

// In-process TTL cache — avoids Next.js 2MB fetch cache limit for large district files
const districtCache = new Map<number, { data: CaltransRawCctv[]; expiresAt: number }>();
const CACHE_TTL_MS = 60_000;

async function fetchDistrictData(district: number): Promise<CaltransRawCctv[]> {
  const cached = districtCache.get(district);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const paddedDistrict = String(district).padStart(2, '0');
  const url = `https://cwwp2.dot.ca.gov/data/d${district}/cctv/cctvStatusD${paddedDistrict}.json`;

  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) {
    console.warn(`Caltrans district ${district} fetch failed: ${res.status}`);
    return [];
  }

  const data: CaltransRawResponse = await res.json() as CaltransRawResponse;
  const entries = data.data?.map(entry => entry.cctv) ?? [];

  districtCache.set(district, { data: entries, expiresAt: Date.now() + CACHE_TTL_MS });
  return entries;
}

function getDistrictsForBbox(bbox: BoundingBox): number[] {
  return Object.entries(DISTRICT_BOUNDS)
    .filter(([, districtBbox]) => bboxesOverlap(bbox, districtBbox))
    .map(([districtNum]) => parseInt(districtNum, 10));
}

export const caltransProvider: CameraProvider = {
  slug: 'caltrans',
  displayName: 'Caltrans CWWP2',

  async fetchCameras(options?: CameraQueryOptions): Promise<Camera[]> {
    const { bbox } = options ?? {};

    const districts = bbox
      ? getDistrictsForBbox(bbox)
      : Object.keys(DISTRICT_BOUNDS).map(Number);

    if (districts.length === 0) {
      return [];
    }

    const districtData = await Promise.all(
      districts.map(async (district) => {
        const rawCameras = await fetchDistrictData(district);
        return rawCameras.map(raw => normalizeCaltransCamera(raw, district));
      })
    );

    const allCameras = districtData.flat();

    if (!bbox) {
      return allCameras;
    }

    // Filter cameras to those within the bbox
    return allCameras.filter(
      camera =>
        camera.latitude >= bbox.south &&
        camera.latitude <= bbox.north &&
        camera.longitude >= bbox.west &&
        camera.longitude <= bbox.east
    );
  },

  async fetchCameraById(id: string): Promise<Camera | null> {
    // id format: "caltrans-d{district}-{index}"
    const match = id.match(/^caltrans-d(\d+)-(.+)$/);
    if (!match) return null;

    const district = parseInt(match[1], 10);
    const rawCameras = await fetchDistrictData(district);
    const raw = rawCameras.find(c => c.index === match[2]);

    return raw ? normalizeCaltransCamera(raw, district) : null;
  },
};
