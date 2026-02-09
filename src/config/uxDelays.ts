/**
 * Central config for bank-style UX delays. All deterministic (fixed ms).
 * Simulates real-world latency without flakiness.
 */
export const UX_DELAYS = {
  /** Disable download button for this long (ms) after date selection changes. */
  DISABLE_DOWNLOAD_AFTER_SELECTION_MS: 400,
  /** Show loading spinner for this long (ms) before starting PDF generation on Download click. */
  SPINNER_BEFORE_PDF_MS: 600,
  /** Delay (ms) before navigating after successful login. */
  DELAY_BEFORE_NAVIGATE_AFTER_LOGIN_MS: 300,
} as const
