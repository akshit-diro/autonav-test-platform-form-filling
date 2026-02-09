/**
 * Bank-style UX delays. Backed by centralized appConfig (env with safe defaults).
 * All deterministic (fixed ms).
 */
import { appConfig } from './appConfig'

export const UX_DELAYS = {
  get DISABLE_DOWNLOAD_AFTER_SELECTION_MS() {
    return appConfig.disableDownloadAfterSelectionMs
  },
  get SPINNER_BEFORE_PDF_MS() {
    return appConfig.spinnerBeforePdfMs
  },
  get DELAY_BEFORE_NAVIGATE_AFTER_LOGIN_MS() {
    return appConfig.delayBeforeNavigateAfterLoginMs
  },
} as const
