'use client';

import { Marker, Popup } from 'react-leaflet';
import type { Camera } from '@/types';

interface CameraMarkerProps {
  camera: Camera;
  onSelect: (camera: Camera) => void;
}

export function CameraMarker({ camera, onSelect }: CameraMarkerProps) {
  const subtitle = [camera.route, camera.direction].filter(Boolean).join(' · ');

  return (
    <Marker
      position={[camera.latitude, camera.longitude]}
      title={camera.name}
      alt={`Traffic camera at ${camera.name}`}
      eventHandlers={{
        click: () => onSelect(camera),
      }}
    >
      <Popup>
        <div style={{ minWidth: '180px' }}>
          <strong style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
            {camera.name}
          </strong>
          {subtitle && (
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', display: 'block' }}>
              {subtitle}
            </span>
          )}
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '0.125rem' }}>
            {camera.county} County
          </span>
          <button
            onClick={() => onSelect(camera)}
            aria-label={`View camera details for ${camera.name}`}
            style={{
              marginTop: '0.625rem',
              padding: '0.375rem 0.75rem',
              borderRadius: '0.375rem',
              backgroundColor: 'var(--color-bg-accent)',
              color: 'var(--color-text-on-accent)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 600,
              width: '100%',
            }}
          >
            View Camera
          </button>
        </div>
      </Popup>
    </Marker>
  );
}
