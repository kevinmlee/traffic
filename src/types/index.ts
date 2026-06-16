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

/**
 * Facets reflect data every provider actually populates, so toggling one
 * narrows results instead of returning blank. (The old `categories` —
 * accidents/congestion/weather/construction — were guessed from keywords and
 * mostly absent, since these are static location feeds, not incident feeds.)
 */
export type CameraFacet = 'inService' | 'hasVideo' | 'hasSnapshots';

export interface FilterState {
  facets: Set<CameraFacet>;
}

export const FILTER_LABELS: Record<CameraFacet, string> = {
  inService: 'In Service',
  hasVideo: 'Live Video',
  hasSnapshots: 'Snapshots',
};

export const ALL_FACETS: CameraFacet[] = ['inService', 'hasVideo', 'hasSnapshots'];

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
  hasMore: boolean;
  offset: number;
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
