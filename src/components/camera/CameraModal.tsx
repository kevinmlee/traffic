'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { CameraImage, CameraImagePlaceholder } from './CameraImage';
import { LiveFeedPlayer } from './LiveFeedPlayer';
import type { Camera } from '@/types';

interface CameraModalProps {
  camera: Camera;
  onClose: () => void;
}

export function CameraModal({ camera, onClose }: CameraModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const hasStream = Boolean(camera.streamingVideoUrl);
  const [activeTab, setActiveTab] = useState<'feed' | 'snapshot'>(hasStream ? 'feed' : 'snapshot');

  // Focus close button on mount
  useEffect(() => {
    closeBtnRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Trap focus within modal
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;

    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    el.addEventListener('keydown', handleTab);
    return () => el.removeEventListener('keydown', handleTab);
  }, []);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  const subtitle = [camera.route, camera.direction, camera.nearbyPlace]
    .filter(Boolean)
    .join(' · ');

  const formattedDate = camera.recordedAt
    ? new Date(camera.recordedAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div
      role="presentation"
      onClick={handleBackdropClick}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderRadius: '1rem',
          boxShadow: 'var(--shadow-modal)',
          width: '100%',
          maxWidth: '56rem',
          maxHeight: '90dvh',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div>
            <h2
              id="modal-title"
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {camera.name}
            </h2>
            {subtitle && (
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: '0.25rem 0 0' }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close camera detail"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2rem',
              height: '2rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--color-border)',
              backgroundColor: 'transparent',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab bar (only shown when stream is available) */}
        {hasStream && (
          <div
            role="tablist"
            aria-label="Camera view mode"
            style={{
              display: 'flex',
              gap: '0',
              borderBottom: '1px solid var(--color-border)',
              paddingLeft: '1.5rem',
              flexShrink: 0,
            }}
          >
            {(['feed', 'snapshot'] as const).map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                aria-controls={`modal-panel-${tab}`}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.625rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid var(--color-brand-500)' : '2px solid transparent',
                  backgroundColor: 'transparent',
                  color: activeTab === tab ? 'var(--color-brand-500)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  marginBottom: '-1px',
                  transition: 'color 0.15s',
                }}
              >
                {tab === 'feed' ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="2" /><path d="M12 2a10 10 0 0 1 7.38 16.82" /><path d="M12 2a10 10 0 0 0-7.38 16.82" />
                    </svg>
                    Live Feed
                    {activeTab === 'feed' && (
                      <span style={{ display: 'inline-flex', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e', flexShrink: 0 }} aria-hidden="true" />
                    )}
                  </span>
                ) : 'Snapshot'}
              </button>
            ))}
          </div>
        )}

        {/* Media panel */}
        <div
          id={`modal-panel-${activeTab}`}
          role="tabpanel"
          aria-label={activeTab === 'feed' ? 'Live camera feed' : 'Camera snapshot'}
          style={{
            position: 'relative',
            aspectRatio: '16/9',
            backgroundColor: 'var(--color-bg-elevated)',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          {activeTab === 'feed' && camera.streamingVideoUrl ? (
            <LiveFeedPlayer streamUrl={camera.streamingVideoUrl} title={camera.name} />
          ) : camera.imageUrl ? (
            <CameraImage
              imageUrl={camera.imageUrl}
              alt={`Live traffic camera view at ${camera.name}: ${camera.imageDescription}`}
              updateFrequencyMinutes={camera.imageUpdateFrequencyMinutes}
              fill
              priority
            />
          ) : (
            <CameraImagePlaceholder label={`No image available for ${camera.name}`} />
          )}
        </div>

        {/* Details */}
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {camera.imageDescription && (
            <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              {camera.imageDescription}
            </p>
          )}

          <dl
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '0.75rem',
              margin: 0,
            }}
          >
            <DetailItem label="County" value={camera.county} />
            <DetailItem label="Route" value={camera.route} />
            <DetailItem label="Direction" value={camera.direction} />
            <DetailItem label="District" value={`${camera.district}`} />
            {camera.elevation !== null && (
              <DetailItem label="Elevation" value={`${camera.elevation.toLocaleString()} ft`} />
            )}
            <DetailItem
              label="Status"
              value={camera.inService ? 'In Service' : 'Out of Service'}
            />
            {formattedDate && (
              <DetailItem label="Last Updated" value={formattedDate} />
            )}
            {camera.imageUpdateFrequencyMinutes !== null && (
              <DetailItem
                label="Update Frequency"
                value={`Every ${camera.imageUpdateFrequencyMinutes} min`}
              />
            )}
          </dl>

          {/* Reference images */}
          {camera.referenceImages.length > 0 && (
            <div>
              <h3
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                  margin: '0 0 0.625rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Recent Snapshots
              </h3>
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  overflowX: 'auto',
                  paddingBottom: '0.25rem',
                }}
                aria-label="Historical camera snapshots"
              >
                {camera.referenceImages.slice(0, 6).map((url, i) => (
                  <div
                    key={url}
                    style={{
                      flexShrink: 0,
                      width: '120px',
                      aspectRatio: '16/9',
                      borderRadius: '0.375rem',
                      overflow: 'hidden',
                      backgroundColor: 'var(--color-bg-elevated)',
                      position: 'relative',
                    }}
                  >
                    <CameraImage
                      imageUrl={url}
                      alt={`Historical snapshot ${i + 1} of ${camera.name}`}
                      updateFrequencyMinutes={null}
                      fill
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt
        style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          margin: 0,
        }}
      >
        {label}
      </dt>
      <dd
        style={{
          fontSize: '0.9375rem',
          color: 'var(--color-text-primary)',
          margin: '0.125rem 0 0',
          fontWeight: 500,
        }}
      >
        {value}
      </dd>
    </div>
  );
}
