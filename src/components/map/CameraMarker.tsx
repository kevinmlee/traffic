'use client';

import { useEffect, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import type { DivIcon, DivIconOptions } from 'leaflet';
import type { Camera } from '@/types';

type LeafletLike = { divIcon: (opts: DivIconOptions) => DivIcon };

interface CameraMarkerProps {
  camera: Camera;
  onSelect: (camera: Camera) => void;
}

// Build a crisp SVG pin as a Leaflet DivIcon — no external URLs, works in any env
function buildIcon(): DivIcon | null {
  if (typeof window === 'undefined') return null;

  const L = require('leaflet') as LeafletLike;

  const fill = '#f97316';
  const ring = 'rgba(249,115,22,0.18)';
  const size = 32;
  const anchor = 16;

  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="${ring}" />
      <circle cx="16" cy="16" r="10" fill="${fill}" />
      <rect x="10" y="12" width="12" height="9" rx="2" fill="white" opacity="0.92"/>
      <circle cx="16" cy="16.5" r="2.8" fill="${fill}"/>
      <circle cx="16" cy="16.5" r="1.4" fill="white" opacity="0.75"/>
      <path d="M19 13.5h1.5a.5.5 0 0 1 .5.5v1" stroke="${fill}" stroke-width="1" stroke-linecap="round"/>
    </svg>`;

  return L.divIcon({
    html: svg,
    className: '',
    iconSize:   [size, size],
    iconAnchor: [anchor, anchor],
    popupAnchor:[0, -anchor - 8],
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
    >
      <Popup minWidth={220} maxWidth={260}>
        <div style={{ fontFamily: 'var(--font-sans)', padding: '0.125rem 0' }}>
          {/* Image preview */}
          {camera.imageUrl && (
            <div
              style={{
                width: '100%',
                aspectRatio: '16/9',
                borderRadius: '0.375rem',
                overflow: 'hidden',
                backgroundColor: 'rgba(0,0,0,0.08)',
                marginBottom: '0.625rem',
                position: 'relative',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${camera.imageUrl}?t=${Math.floor(Date.now() / 60000)}`}
                alt={`Live view at ${camera.name}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                loading="lazy"
              />
              {!camera.inService && (
                <div
                  style={{
                    position: 'absolute',
                    top: '0.375rem',
                    right: '0.375rem',
                    padding: '0.125rem 0.375rem',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    color: '#fbbf24',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  Offline
                </div>
              )}
            </div>
          )}

          {/* Name + subtitle */}
          <strong
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              display: 'block',
              color: 'var(--color-text-primary)',
              lineHeight: 1.3,
              marginBottom: '0.2rem',
            }}
          >
            {camera.name}
          </strong>
          {subtitle && (
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-secondary)',
                display: 'block',
                marginBottom: '0.125rem',
              }}
            >
              {subtitle}
            </span>
          )}
          <span
            style={{
              fontSize: '0.6875rem',
              color: 'var(--color-text-muted)',
              display: 'block',
              marginBottom: '0.625rem',
            }}
          >
            {camera.county} County
          </span>

          {/* Details button */}
          <button
            onClick={() => onSelect(camera)}
            aria-label={`View full details for ${camera.name}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem',
              width: '100%',
              padding: '0.4375rem 0.75rem',
              borderRadius: '0.375rem',
              backgroundColor: '#f97316',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 600,
              letterSpacing: '0.01em',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 3h6v6M10 14L21 3M21 13v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7"/>
            </svg>
            More Details
          </button>
        </div>
      </Popup>
    </Marker>
  );
}
