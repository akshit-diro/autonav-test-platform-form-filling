/**
 * Session and security timeouts. Deterministic values for testability.
 * Frontend-only; no backend.
 */
export const SESSION_CONFIG = {
  /** Logout after this many ms of no activity (e.g. 2 minutes). */
  INACTIVITY_TIMEOUT_MS: 2 * 60 * 1000,
  /** Show warning this many ms before logout (e.g. 15 seconds). */
  WARNING_BEFORE_LOGOUT_MS: 15 * 1000,
} as const

/** Time after which we show the warning: inactivity timeout minus warning duration. */
export function getWarningTriggerMs(): number {
  return SESSION_CONFIG.INACTIVITY_TIMEOUT_MS - SESSION_CONFIG.WARNING_BEFORE_LOGOUT_MS
}
