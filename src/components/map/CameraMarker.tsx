'use client';

import { useEffect, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import type { DivIcon } from 'leaflet';
import type { Camera } from '@/types';

interface CameraMarkerProps {
  camera: Camera;
  onSelect: (camera: Camera) => void;
}

// Build a crisp SVG pin as a Leaflet DivIcon — no external URLs, works in any env
function buildIcon(active = false): DivIcon | null {
  if (typeof window === 'undefined') return null;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const L = require('leaflet') as typeof import('leaflet');

  const fill   = active ? '#ea6c0a' : '#f97316';
  const ring   = active ? '#fff7ed' : 'rgba(249,115,22,0.18)';
  const size   = 32;
  const anchor = 16;

  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer glow ring -->
      <circle cx="16" cy="16" r="14" fill="${ring}" />
      <!-- Filled circle -->
      <circle cx="16" cy="16" r="10" fill="${fill}" />
      <!-- Camera body cutout (white) -->
      <rect x="10" y="12" width="12" height="9" rx="2" fill="white" opacity="0.92"/>
      <!-- Lens -->
      <circle cx="16" cy="16.5" r="2.8" fill="${fill}"/>
      <circle cx="16" cy="16.5" r="1.4" fill="white" opacity="0.75"/>
      <!-- Viewfinder notch -->
      <path d="M19 13.5h1.5a.5.5 0 0 1 .5.5v1" stroke="${fill}" stroke-width="1" stroke-linecap="round"/>
    </svg>`;

  return L.divIcon({
    html: svg,
    className: '',
    iconSize:   [size, size],
    iconAnchor: [anchor, anchor],
    popupAnchor:[0, -anchor - 4],
  });
}

export function CameraMarker({ camera, onSelect }: CameraMarkerProps) {
  const [icon, setIcon] = useState<DivIcon | null>(null);

  useEffect(() => {
    setIcon(buildIcon());
  }, []);

  const subtitle = [camera.route, camera.direction].filter(Boolean).join(' · ');

  if (!icon) return null;

  return (
    <Marker
      position={[camera.latitude, camera.longitude]}
      icon={icon}
      title={camera.name}
      alt={`Traffic camera at ${camera.name}`}
      eventHandlers={{ click: () => onSelect(camera) }}
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
