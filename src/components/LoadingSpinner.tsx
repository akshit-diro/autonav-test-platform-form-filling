export interface LoadingSpinnerProps {
  /** When true, spinner is visible. */
  visible: boolean
}

/**
 * Simple loading indicator. Deterministic (no animation timing for tests).
 */
export function LoadingSpinner({ visible }: LoadingSpinnerProps) {
  if (!visible) return null
  return (
    <span
      data-testid="download-loading-spinner"
      role="status"
      aria-live="polite"
      aria-label="Loading"
      style={{ display: 'inline-block', marginLeft: '0.5rem' }}
    >
      Loading…
    </span>
  )
}
