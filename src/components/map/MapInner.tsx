'use client';

import { useEffect } from 'react';
import { MapContainer, ZoomControl } from 'react-leaflet';
import { TileLayerThemed } from './TileLayerThemed';
import { CameraMarker } from './CameraMarker';
import type { Camera } from '@/types';
import type { BoundingBox } from '@/types';

interface MapInnerProps {
  cameras: Camera[];
  onCameraSelect: (camera: Camera) => void;
  bbox?: BoundingBox;
}

// Default center: California
const DEFAULT_CENTER: [number, number] = [37.5, -119.5];
const DEFAULT_ZOOM = 7;

export default function MapInner({ cameras, onCameraSelect, bbox }: MapInnerProps) {
  // Fix Leaflet's default marker icon paths broken by bundlers
  useEffect(() => {
    import('leaflet').then((L) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    }).catch(console.error);
  }, []);

  // Compute center from bbox if provided, else from cameras
  let center: [number, number] = DEFAULT_CENTER;
  let zoom = DEFAULT_ZOOM;

  if (bbox) {
    center = [(bbox.north + bbox.south) / 2, (bbox.east + bbox.west) / 2];
    zoom = 10;
  } else if (cameras.length > 0) {
    const lats = cameras.map(c => c.latitude);
    const lons = cameras.map(c => c.longitude);
    center = [
      (Math.min(...lats) + Math.max(...lats)) / 2,
      (Math.min(...lons) + Math.max(...lons)) / 2,
    ];
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
      aria-label="Traffic cameras map"
    >
      <TileLayerThemed />
      <ZoomControl position="bottomright" />
      {cameras.map(camera => (
        <CameraMarker
          key={camera.id}
          camera={camera}
          onSelect={onCameraSelect}
        />
      ))}
    </MapContainer>
  );
}
