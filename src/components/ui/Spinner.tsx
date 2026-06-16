interface SpinnerProps {
  /** Diameter in pixels. */
  size?: number;
  /** Optional accessible label; omit for a purely decorative spinner. */
  label?: string;
}

/** A small ring spinner. Uses the shared `spin` keyframe in globals.css. */
export function Spinner({ size = 18, label }: SpinnerProps) {
  return (
    <span
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        border: `${Math.max(2, Math.round(size / 9))}px solid var(--color-border)`,
        borderTopColor: 'var(--color-signal-500)',
        animation: 'spin 0.7s linear infinite',
        flexShrink: 0,
      }}
    />
  );
}

/** Centered spinner with a message, for full-section loading states. */
export function LoadingState({ message = 'Loading cameras…' }: { message?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.85rem',
        padding: '3rem 1rem',
        color: 'var(--color-text-muted)',
      }}
    >
      <Spinner size={32} />
      <span style={{ fontSize: '0.875rem', letterSpacing: '0.01em' }}>{message}</span>
    </div>
  );
}
