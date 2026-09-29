'use client';

import { useEffect, useState } from 'react';
import { MapContainer, Marker, ZoomControl } from 'react-leaflet';
import type { DivIcon } from 'leaflet';
import { TileLayerThemed } from './TileLayerThemed';
import { buildCameraIcon } from './CameraMarker';

interface LocationMapInnerProps {
  latitude: number;
  longitude: number;
  label: string;
}

const LOCATION_ZOOM = 15;

export default function LocationMapInner({ latitude, longitude, label }: LocationMapInnerProps) {
  const [icon, setIcon] = useState<DivIcon | null>(null);

  useEffect(() => {
    setIcon(buildCameraIcon());
  }, []);

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={LOCATION_ZOOM}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
      // Don't hijack scrolling inside the modal
      scrollWheelZoom={false}
      aria-label={`Map showing the location of ${label}`}
    >
      <TileLayerThemed />
      <ZoomControl position="bottomright" />
      {icon && (
        <Marker
          position={[latitude, longitude]}
          icon={icon}
          title={label}
          alt={`Traffic camera at ${label}`}
          keyboard={false}
        />
      )}
    </MapContainer>
  );
}
