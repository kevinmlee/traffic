'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, ZoomControl } from 'react-leaflet';
import { divIcon, type DivIcon } from 'leaflet';
import { TileLayerThemed } from './TileLayerThemed';
import { buildCameraIcon } from './CameraMarker';

interface LocationMapInnerProps {
  latitude: number;
  longitude: number;
  label: string;
  bearing: number | null;
}

const LOCATION_ZOOM = 15;
const CONE_SIZE = 120;

// Wedge pointing north (70° wide) — rotated to the camera's bearing.
// Drawn in pixels so it stays the same size at every zoom level.
function buildConeIcon(bearing: number): DivIcon {
  const c = CONE_SIZE / 2;
  const svg = `
    <svg width="${CONE_SIZE}" height="${CONE_SIZE}" viewBox="0 0 ${CONE_SIZE} ${CONE_SIZE}"
      style="transform: rotate(${bearing}deg); overflow: visible" aria-hidden="true">
      <defs>
        <radialGradient id="cone-fade" cx="${c}" cy="${c}" r="${c - 4}" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#f97316" stop-opacity="0.55" />
          <stop offset="1" stop-color="#f97316" stop-opacity="0.08" />
        </radialGradient>
      </defs>
      <path d="M${c} ${c} L${c - 32.12} ${c - 45.87} A56 56 0 0 1 ${c + 32.12} ${c - 45.87} Z"
        fill="url(#cone-fade)" stroke="#f97316" stroke-opacity="0.6" stroke-width="1.5" />
    </svg>`;

  return divIcon({
    html: svg,
    className: '',
    iconSize: [CONE_SIZE, CONE_SIZE],
    iconAnchor: [c, c],
  });
}

export default function LocationMapInner({ latitude, longitude, label, bearing }: LocationMapInnerProps) {
  const [icon, setIcon] = useState<DivIcon | null>(null);
  const coneIcon = useMemo(() => (bearing !== null ? buildConeIcon(bearing) : null), [bearing]);

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
      {coneIcon && (
        <Marker
          position={[latitude, longitude]}
          icon={coneIcon}
          interactive={false}
          keyboard={false}
          zIndexOffset={-1000}
        />
      )}
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
