'use client';

import { useRef, useState, useCallback } from 'react';
import { CameraImage, CameraImagePlaceholder } from './CameraImage';
import { CardLiveFeed } from './CardLiveFeed';
import type { Camera } from '@/types';

interface CameraCardProps {
  camera: Camera;
  onSelect: (camera: Camera) => void;
  /** Position within the current page, for staggered entrance animation */
  index?: number;
}

export function CameraCard({ camera, onSelect, index = 0 }: CameraCardProps) {
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

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setShowStream(false);
    const el = e.currentTarget;
    el.style.boxShadow = '0 2px 8px -2px rgba(0,0,0,0.18), 0 1px 3px -1px rgba(0,0,0,0.12)';
    el.style.borderColor = 'var(--color-border)';
    el.style.transform = 'translateY(0) scale(1)';
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
      className="card-rise"
      role="button"
      tabIndex={0}
      aria-label={`Camera: ${camera.name}${subtitle ? `, ${subtitle}` : ''}`}
      title={[camera.name, subtitle, camera.nearbyPlace, camera.county ? `${camera.county} County` : ''].filter(Boolean).join(' · ')}
      onClick={() => onSelect(camera)}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        borderRadius: '1rem',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        aspectRatio: '16/10',
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 2px 8px -2px rgba(0,0,0,0.18), 0 1px 3px -1px rgba(0,0,0,0.12)',
        transition: 'transform 0.22s cubic-bezier(0.22,1,0.36,1), box-shadow 0.22s ease, border-color 0.22s ease',
        display: 'block',
        animationDelay: `${Math.min(index * 35, 350)}ms`,
      }}
      onMouseMove={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-glow)';
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-signal-500)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px) scale(1.012)';
      }}
      onFocus={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-glow)';
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-signal-500)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
      }}
      onBlur={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px -2px rgba(0,0,0,0.18), 0 1px 3px -1px rgba(0,0,0,0.12)';
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
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
          className="font-mono"
          style={{
            position: 'absolute',
            top: '0.6rem',
            right: '0.6rem',
            zIndex: 3,
            padding: '0.22rem 0.5rem',
            borderRadius: '0.4rem',
            backgroundColor: 'rgba(10,11,13,0.72)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#fcd34d',
            fontSize: '0.625rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
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
          className="font-mono"
          style={{
            position: 'absolute',
            top: '0.6rem',
            left: '0.6rem',
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.22rem 0.55rem',
            borderRadius: '0.4rem',
            backgroundColor: showStream ? 'rgba(34,197,94,0.92)' : 'rgba(10,11,13,0.68)',
            backdropFilter: 'blur(8px)',
            border: showStream ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.12)',
            color: '#ffffff',
            fontSize: '0.625rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            transition: 'background-color 0.25s, border-color 0.25s',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: showStream ? '#ffffff' : 'var(--color-live-500)',
              flexShrink: 0,
              transition: 'background-color 0.25s',
              animation: showStream ? 'none' : 'live-pulse 2s ease-in-out infinite',
            }}
          />
          Live
        </div>
      )}
    </article>
  );
}
