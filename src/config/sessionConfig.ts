/**
 * Session and security timeouts. Backed by centralized appConfig (env with safe defaults).
 * Uses VITE_SESSION_IDLE_TIMEOUT_MS and VITE_SESSION_WARNING_MS when set.
 * Frontend-only; no backend.
 */
import { appConfig } from './appConfig'

export const SESSION_CONFIG = {
  get INACTIVITY_TIMEOUT_MS() {
    return appConfig.sessionIdleTimeoutMs
  },
  get WARNING_BEFORE_LOGOUT_MS() {
    return appConfig.sessionWarningMs
  },
} as const

/** Time after which we show the warning: inactivity timeout minus warning duration. */
export function getWarningTriggerMs(): number {
  return appConfig.sessionIdleTimeoutMs - appConfig.sessionWarningMs
}
