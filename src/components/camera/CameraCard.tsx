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

  const subtitle = [camera.route, camera.direction]
    .filter(Boolean)
    .join(' · ');

  const hasStream = Boolean(camera.streamingVideoUrl) && !streamFailed;

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Camera: ${camera.name}${subtitle ? `, ${subtitle}` : ''}`}
      title={[camera.name, subtitle, camera.nearbyPlace, camera.county ? `${camera.county} County` : ''].filter(Boolean).join(' · ')}
      onClick={() => onSelect(camera)}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        borderRadius: '0.875rem',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        aspectRatio: '16/10',
        backgroundColor: 'var(--color-bg-elevated)',
        boxShadow: '0 2px 8px -2px rgba(0,0,0,0.18), 0 1px 3px -1px rgba(0,0,0,0.12)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        display: 'block',
      }}
      onMouseMove={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 28px -6px rgba(0,0,0,0.32), 0 4px 10px -3px rgba(0,0,0,0.18)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px) scale(1.01)';
      }}
      onFocus={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 2px var(--color-brand-500), 0 8px 20px -4px rgba(0,0,0,0.25)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
      }}
      onBlur={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px -2px rgba(0,0,0,0.18), 0 1px 3px -1px rgba(0,0,0,0.12)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)';
      }}
    >
      {/* Full-bleed image */}
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

      {/* Live stream overlay */}
      {showStream && camera.streamingVideoUrl && (
        <CardLiveFeed
          streamUrl={camera.streamingVideoUrl}
          onError={handleStreamError}
        />
      )}

      {/* Bottom gradient + text overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.48) 38%, transparent 65%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Text content overlaid on gradient */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '0.875rem 0.875rem 0.75rem',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      >
        <h3
          title={camera.name}
          style={{
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: '#ffffff',
            margin: 0,
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textShadow: '0 1px 4px rgba(0,0,0,0.5)',
          }}
        >
          {camera.name}
        </h3>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            marginTop: '0.2rem',
          }}
        >
          {subtitle && (
            <span
              title={subtitle}
              style={{
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.8)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                flex: 1,
                minWidth: 0,
              }}
            >
              {subtitle}
            </span>
          )}
          {camera.nearbyPlace && (
            <span
              title={camera.nearbyPlace}
              style={{
                fontSize: '0.6875rem',
                color: 'rgba(255,255,255,0.55)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                flexShrink: 0,
              }}
            >
              {camera.nearbyPlace}
            </span>
          )}
        </div>
      </div>

      {/* Offline badge — top right */}
      {!camera.inService && (
        <div
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            zIndex: 3,
            padding: '0.2rem 0.5rem',
            borderRadius: '999px',
            backgroundColor: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(6px)',
            color: '#fcd34d',
            fontSize: '0.625rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
          aria-label="Camera out of service"
        >
          Offline
        </div>
      )}

      {/* Live badge — top left */}
      {hasStream && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '0.5rem',
            left: '0.5rem',
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.2rem 0.5rem',
            borderRadius: '999px',
            backgroundColor: showStream ? 'rgba(34,197,94,0.9)' : 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(6px)',
            color: '#ffffff',
            fontSize: '0.625rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            transition: 'background-color 0.25s',
          }}
        >
          <span
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: showStream ? '#ffffff' : 'rgba(34,197,94,0.9)',
              flexShrink: 0,
              transition: 'background-color 0.25s',
              boxShadow: showStream ? '0 0 0 2px rgba(255,255,255,0.3)' : 'none',
            }}
          />
          Live
        </div>
      )}
    </article>
  );
}
