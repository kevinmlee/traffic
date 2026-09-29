'use client';

import dynamic from 'next/dynamic';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import type { Camera } from '@/types';
import type { BoundingBox } from '@/types';

// CRITICAL: ssr: false is mandatory — Leaflet accesses window/document at import time.
// This must be the only entry point that imports MapInner / LocationMapInner.
const MapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => (
    <LoadingSkeleton
      style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
    />
  ),
});

const LocationMapInner = dynamic(() => import('./LocationMapInner'), {
  ssr: false,
  loading: () => (
    <LoadingSkeleton style={{ height: '100%', width: '100%' }} />
  ),
});

interface MapViewProps {
  cameras: Camera[];
  onCameraSelect: (camera: Camera) => void;
  bbox?: BoundingBox;
}

export function MapView({ cameras, onCameraSelect, bbox }: MapViewProps) {
  return (
    <div
      style={{ height: '600px', width: '100%', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid var(--color-border)', isolation: 'isolate' }}
      aria-label="Interactive traffic cameras map"
    >
      <MapInner cameras={cameras} onCameraSelect={onCameraSelect} bbox={bbox} />
    </div>
  );
}

interface CameraLocationMapProps {
  latitude: number;
  longitude: number;
  label: string;
  /** Compass bearing (0 = north) the camera faces; null hides the direction cone */
  bearing: number | null;
}

// Small single-pin map used in the camera detail modal
export function CameraLocationMap({ latitude, longitude, label, bearing }: CameraLocationMapProps) {
  return (
    <div style={{ height: '100%', width: '100%', isolation: 'isolate' }}>
      <LocationMapInner latitude={latitude} longitude={longitude} label={label} bearing={bearing} />
    </div>
  );
}
