'use client';

import { useRef, useState, useCallback } from 'react';
import { CameraImage, CameraImagePlaceholder } from './CameraImage';
import { CardLiveFeed } from './CardLiveFeed';
import type { Camera } from '@/types';

interface CameraCardProps {
  camera: Camera;
  onSelect: (camera: Camera) => void;
}

export function CameraCard({ camera, onSelect }: CameraCardProps) {
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showStream, setShowStream] = useState(false);
  const [streamFailed, setStreamFailed] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(camera);
    }
  };

  const handleMouseEnter = useCallback(() => {
    if (!camera.streamingVideoUrl || streamFailed) return;
    hoverTimerRef.current = setTimeout(() => setShowStream(true), 300);
  }, [camera.streamingVideoUrl, streamFailed]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setShowStream(false);
  }, []);

  const handleStreamError = useCallback(() => {
    setShowStream(false);
    setStreamFailed(true);
  }, []);

  const subtitle = [camera.route, camera.direction, camera.nearbyPlace]
    .filter(Boolean)
    .join(' · ');

  const hasStream = Boolean(camera.streamingVideoUrl) && !streamFailed;

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Camera: ${camera.name}${subtitle ? `, ${subtitle}` : ''}`}
      onClick={() => onSelect(camera)}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        borderRadius: '0.75rem',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-surface)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, transform 0.2s, border-color 0.2s',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseMove={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card-hover)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-strong)';
      }}
      onFocus={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card-hover)';
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-strong)';
      }}
      onBlur={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
      }}
    >
      {/* Image / stream area */}
      <div style={{ position: 'relative', aspectRatio: '16/9', backgroundColor: 'var(--color-bg-elevated)', overflow: 'hidden' }}>

        {/* Snapshot (always rendered underneath) */}
        {camera.imageUrl ? (
          <CameraImage
            imageUrl={camera.imageUrl}
            alt={`Traffic camera at ${camera.name}`}
            updateFrequencyMinutes={camera.imageUpdateFrequencyMinutes}
            fill
          />
        ) : (
          <CameraImagePlaceholder />
        )}

        {/* Live stream overlay (mounted on hover) */}
        {showStream && camera.streamingVideoUrl && (
          <CardLiveFeed
            streamUrl={camera.streamingVideoUrl}
            onError={handleStreamError}
          />
        )}

        {/* Offline badge */}
        {!camera.inService && (
          <div
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              zIndex: 2,
              padding: '0.2rem 0.5rem',
              borderRadius: '999px',
              backgroundColor: 'rgba(0,0,0,0.6)',
              color: '#fbbf24',
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
            aria-label="Camera out of service"
          >
            Offline
          </div>
        )}

        {/* Live badge (bottom-left, only when stream available) */}
        {hasStream && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              bottom: '0.5rem',
              left: '0.5rem',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.2rem 0.5rem',
              borderRadius: '999px',
              backgroundColor: 'rgba(0,0,0,0.55)',
              color: showStream ? '#22c55e' : 'rgba(255,255,255,0.75)',
              fontSize: '0.625rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              transition: 'color 0.2s',
            }}
          >
            <span
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                backgroundColor: showStream ? '#22c55e' : 'rgba(255,255,255,0.6)',
                flexShrink: 0,
                transition: 'background-color 0.2s',
              }}
            />
            Live
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '0.75rem 0.875rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <h3
          title={camera.name}
          style={{
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            margin: 0,
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {camera.name}
        </h3>
        {subtitle && (
          <p
            title={subtitle}
            style={{
              fontSize: '0.8125rem',
              color: 'var(--color-text-secondary)',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {subtitle}
          </p>
        )}
        <p
          title={`${camera.county} County · District ${camera.district}`}
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)',
            margin: 0,
            marginTop: '0.125rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {camera.county} County · District {camera.district}
        </p>
      </div>
    </article>
  );
}
