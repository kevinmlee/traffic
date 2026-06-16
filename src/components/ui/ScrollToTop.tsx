'use client';

import { useState, useEffect, useCallback } from 'react';

/** Floating button that appears after scrolling down and returns to the top. */
export function ScrollToTop({ showAfter = 600 }: { showAfter?: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > showAfter);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [showAfter]);

  const scrollUp = useCallback(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }, []);

  return (
    <button
      type="button"
      onClick={scrollUp}
      aria-label="Scroll to top"
      tabIndex={visible ? 0 : -1}
      style={{
        position: 'fixed',
        right: 'clamp(1rem, 4vw, 2rem)',
        bottom: 'clamp(1rem, 4vw, 2rem)',
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '2.75rem',
        height: '2.75rem',
        borderRadius: '50%',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-surface)',
        color: 'var(--color-text-primary)',
        boxShadow: 'var(--shadow-card-hover)',
        cursor: 'pointer',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(0.75rem) scale(0.9)',
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.2s ease, transform 0.2s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
    </button>
  );
}
