// ─── Camera Types ─────────────────────────────────────────────────────────────

export type CameraCategory = 'accidents' | 'congestion' | 'construction' | 'weather';

export interface Camera {
  id: string;
  provider: string;
  name: string;
  nearbyPlace: string;
  county: string;
  route: string;
  direction: string;
  district: number;
  latitude: number;
  longitude: number;
  elevation: number | null;
  inService: boolean;
  imageUrl: string | null;
  imageUpdateFrequencyMinutes: number | null;
  imageDescription: string;
  streamingVideoUrl: string | null;
  referenceImages: string[];
  recordedAt: string;
  categories: CameraCategory[];
}

// ─── Provider Interface ────────────────────────────────────────────────────────

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface CameraQueryOptions {
  bbox?: BoundingBox;
  limit?: number;
}

export interface CameraProvider {
  readonly slug: string;
  readonly displayName: string;
  fetchCameras(options?: CameraQueryOptions): Promise<Camera[]>;
  fetchCameraById(id: string): Promise<Camera | null>;
}

// ─── Filter Types ──────────────────────────────────────────────────────────────

export interface FilterState {
  categories: Set<CameraCategory>;
  inServiceOnly: boolean;
}

export const FILTER_LABELS: Record<CameraCategory, string> = {
  accidents: 'Accidents',
  congestion: 'Congestion',
  construction: 'Construction',
  weather: 'Weather Cams',
};

export const ALL_CATEGORIES: CameraCategory[] = [
  'accidents',
  'congestion',
  'construction',
  'weather',
];

// ─── Search / Geocode Types ────────────────────────────────────────────────────

export interface GeocodedLocation {
  displayName: string;
  latitude: number;
  longitude: number;
}

// ─── API Response Types ────────────────────────────────────────────────────────

export interface ApiCamerasResponse {
  cameras: Camera[];
  total: number;
  sources: string[];
}

export interface ApiErrorResponse {
  error: string;
  code: string;
}

// ─── Raw Caltrans API Types ────────────────────────────────────────────────────

export interface CaltransRawResponse {
  data: CaltransRawEntry[];
}

export interface CaltransRawEntry {
  cctv: CaltransRawCctv;
}

export interface CaltransRawImageStatic {
  currentImageUpdateFrequency: string;
  currentImageURL: string;
  referenceImageUpdateFrequency: string;
  referenceImage1UpdateAgoURL: string;
  referenceImage2UpdatesAgoURL: string;
  referenceImage3UpdatesAgoURL: string;
  referenceImage4UpdatesAgoURL: string;
  referenceImage5UpdatesAgoURL: string;
  referenceImage6UpdatesAgoURL: string;
  referenceImage7UpdatesAgoURL: string;
  referenceImage8UpdatesAgoURL: string;
  referenceImage9UpdatesAgoURL: string;
  referenceImage10UpdatesAgoURL: string;
  referenceImage11UpdatesAgoURL: string;
  referenceImage12UpdatesAgoURL: string;
}

export interface CaltransRawCctv {
  index: string;
  inService: string;
  recordTimestamp: {
    recordDate: string;
    recordTime: string;
  };
  location: {
    district: string;
    locationName: string;
    nearbyPlace: string;
    longitude: string;
    latitude: string;
    elevation: string;
    direction: string;
    county: string;
    route: string;
    routeSuffix: string;
    postmilePrefix: string;
    postmile: string;
    alignment: string;
    milepost: string;
  };
  imageData: {
    imageDescription: string;
    streamingVideoURL: string;
    static: CaltransRawImageStatic;
  };
}
