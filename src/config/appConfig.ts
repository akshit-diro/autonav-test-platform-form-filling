/**
 * Centralized frontend runtime config. All values read from .env (VITE_*) with safe defaults.
 * Resolved config is logged once at app startup.
 */

function envNumber(key: string, defaultValue: number): number {
  const raw = import.meta.env[key]
  if (raw === undefined || raw === '') return defaultValue
  const n = Number(raw)
  return Number.isFinite(n) ? n : defaultValue
}

function envBoolean(key: string, defaultValue: boolean): boolean {
  const raw = import.meta.env[key]
  if (raw === undefined || raw === '') return defaultValue
  const s = String(raw).toLowerCase()
  return s === 'true' || s === '1' || s === 'yes'
}

function envBankTheme(key: string, defaultValue: 'bank_a' | 'bank_b'): 'bank_a' | 'bank_b' {
  const raw = import.meta.env[key]
  if (raw === undefined || raw === '') return defaultValue
  const s = String(raw).toLowerCase().trim()
  return s === 'bank_b' ? 'bank_b' : 'bank_a'
}

export type DomNoiseLevel = 'none' | 'low' | 'medium' | 'high'

function envDomNoiseLevel(key: string, defaultValue: DomNoiseLevel): DomNoiseLevel {
  const raw = import.meta.env[key]
  if (raw === undefined || raw === '') return defaultValue
  const s = String(raw).toLowerCase().trim()
  if (s === 'low' || s === 'medium' || s === 'high') return s
  return defaultValue
}

export type DateFormatId = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
export type LocaleId = 'en-IN' | 'en-US' | 'en-GB'
export type WeekStartId = 'Sunday' | 'Monday'

function envDateFormat(key: string, defaultValue: DateFormatId): DateFormatId {
  const raw = import.meta.env[key]
  if (raw === undefined || raw === '') return defaultValue
  const s = String(raw).toUpperCase().trim()
  if (s === 'DD/MM/YYYY' || s === 'MM/DD/YYYY' || s === 'YYYY-MM-DD') return s
  return defaultValue
}

function envLocale(key: string, defaultValue: LocaleId): LocaleId {
  const raw = import.meta.env[key]
  if (raw === undefined || raw === '') return defaultValue
  const s = String(raw).toLowerCase().trim()
  if (s === 'en-in' || s === 'en-us' || s === 'en-gb') return s === 'en-in' ? 'en-IN' : s === 'en-us' ? 'en-US' : 'en-GB'
  return defaultValue
}

function envWeekStart(key: string, defaultValue: WeekStartId): WeekStartId {
  const raw = import.meta.env[key]
  if (raw === undefined || raw === '') return defaultValue
  const s = String(raw).toLowerCase().trim()
  if (s === 'sunday' || s === 'monday') return s === 'sunday' ? 'Sunday' : 'Monday'
  return defaultValue
}

export type AuthFlowVariantId = 'simple' | 'otp-simulated' | 'reauth-on-sensitive-action'

function envAuthFlowVariant(
  key: string,
  defaultValue: AuthFlowVariantId
): AuthFlowVariantId {
  const raw = import.meta.env[key]
  if (raw === undefined || raw === '') return defaultValue
  const s = String(raw).toLowerCase().trim()
  if (s === 'otp-simulated' || s === 'reauth-on-sensitive-action') return s
  return 'simple'
}

export interface AppConfig {
  /** Stress / automation: artificial delay (ms) after UI actions. Use 0 to disable. */
  uiDelayMs: number
  /** Stress: after date selection, some dates become disabled. */
  disabledDatesChangeAfterSelection: boolean
  /** Stress: show loading spinner before Download becomes enabled. */
  loadingSpinnerBeforeDownload: boolean
  /** Stress: duration (ms) for the pre-download spinner. */
  loadingSpinnerDurationMs: number
  /** Session idle timeout (ms). Used by sessionConfig when set. */
  sessionIdleTimeoutMs: number
  /** Session warning before logout (ms). Used by sessionConfig when set. */
  sessionWarningMs: number
  /** Auth flow: simple (login only) | otp-simulated (OTP step blocks until verified) | reauth-on-sensitive-action (reauth required before e.g. PDF download). */
  authFlowVariant: 'simple' | 'otp-simulated' | 'reauth-on-sensitive-action'
  /** UX: disable download button for this long (ms) after date selection changes. */
  disableDownloadAfterSelectionMs: number
  /** UX: show spinner for this long (ms) before starting PDF generation. */
  spinnerBeforePdfMs: number
  /** UX: delay (ms) before navigating after successful login. */
  delayBeforeNavigateAfterLoginMs: number
  /** Bank theme: bank_a (top-nav, default) or bank_b (sidebar). */
  bankTheme: 'bank_a' | 'bank_b'
  /** DOM noise level to simulate real bank pages: none | low | medium | high. */
  domNoiseLevel: DomNoiseLevel
  /** When true, date picker renders inside a shadow root (selected scenarios only). */
  useShadowDom: boolean
  /** When true, date picker renders inside an iframe (selected scenarios only). If both useShadowDom and useIframePicker are true, iframe wins. */
  useIframePicker: boolean
  /** When true, Tab cycles inside modal/popover (focus trap); Enter may close or trigger unexpected focus. Does not fully block keyboard users (Escape still closes). */
  enableKeyboardTraps: boolean
  /** When true, focus jumps back to first field when validation error appears (e.g. invalid date range). */
  focusResetOnError: boolean
  /** Date display/input format. */
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
  /** Locale for date formatting (month/day names). */
  locale: 'en-IN' | 'en-US' | 'en-GB'
  /** First day of week for calendars. */
  weekStart: 'Sunday' | 'Monday'
  /** When true, enable bank-style UX anti-patterns: validation only after blur, errors dismiss after 3s, no tooltip on disabled buttons, required fields not marked clearly. */
  enableAntiPatterns: boolean
  /** When true, cross-scenario state leakage: last date range, calendar month, and last-used account remembered; resettable via logout. */
  enableStateLeakage: boolean
  /** Chaos level 0–3: randomize mount order, reorder DOM siblings, vary timing, equivalent UI paths. Deterministic per session; never blocks completion. 0 = off. */
  chaosLevel: 0 | 1 | 2 | 3
}

const DEFAULTS: AppConfig = {
  uiDelayMs: 0,
  disabledDatesChangeAfterSelection: false,
  loadingSpinnerBeforeDownload: false,
  loadingSpinnerDurationMs: 1500,
  sessionIdleTimeoutMs: 2 * 60 * 1000,
  sessionWarningMs: 15 * 1000,
  authFlowVariant: 'simple',
  disableDownloadAfterSelectionMs: 400,
  spinnerBeforePdfMs: 600,
  delayBeforeNavigateAfterLoginMs: 300,
  bankTheme: 'bank_a',
  domNoiseLevel: 'none',
  useShadowDom: false,
  useIframePicker: false,
  enableKeyboardTraps: false,
  focusResetOnError: false,
  dateFormat: 'YYYY-MM-DD',
  locale: 'en-GB',
  weekStart: 'Monday',
  enableAntiPatterns: false,
  enableStateLeakage: false,
  chaosLevel: 0,
}

function loadAppConfig(): AppConfig {
  return {
    uiDelayMs: envNumber('VITE_UI_DELAY_MS', DEFAULTS.uiDelayMs),
    disabledDatesChangeAfterSelection: envBoolean(
      'VITE_DISABLED_DATES_CHANGE_AFTER_SELECTION',
      DEFAULTS.disabledDatesChangeAfterSelection
    ),
    loadingSpinnerBeforeDownload: envBoolean(
      'VITE_LOADING_SPINNER_BEFORE_DOWNLOAD',
      DEFAULTS.loadingSpinnerBeforeDownload
    ),
    loadingSpinnerDurationMs: envNumber(
      'VITE_LOADING_SPINNER_DURATION_MS',
      DEFAULTS.loadingSpinnerDurationMs
    ),
    sessionIdleTimeoutMs: envNumber(
      'VITE_SESSION_IDLE_TIMEOUT_MS',
      DEFAULTS.sessionIdleTimeoutMs
    ),
    sessionWarningMs: envNumber(
      'VITE_SESSION_WARNING_MS',
      DEFAULTS.sessionWarningMs
    ),
    authFlowVariant: envAuthFlowVariant(
      'VITE_AUTH_FLOW_VARIANT',
      DEFAULTS.authFlowVariant
    ),
    disableDownloadAfterSelectionMs: envNumber(
      'VITE_DISABLE_DOWNLOAD_AFTER_SELECTION_MS',
      DEFAULTS.disableDownloadAfterSelectionMs
    ),
    spinnerBeforePdfMs: envNumber(
      'VITE_SPINNER_BEFORE_PDF_MS',
      DEFAULTS.spinnerBeforePdfMs
    ),
    delayBeforeNavigateAfterLoginMs: envNumber(
      'VITE_DELAY_BEFORE_NAVIGATE_AFTER_LOGIN_MS',
      DEFAULTS.delayBeforeNavigateAfterLoginMs
    ),
    bankTheme: envBankTheme('VITE_BANK_THEME', DEFAULTS.bankTheme),
    domNoiseLevel: envDomNoiseLevel('VITE_DOM_NOISE_LEVEL', DEFAULTS.domNoiseLevel),
    useShadowDom: envBoolean('VITE_USE_SHADOW_DOM', DEFAULTS.useShadowDom),
    useIframePicker: envBoolean('VITE_USE_IFRAME_PICKER', DEFAULTS.useIframePicker),
    enableKeyboardTraps: envBoolean('VITE_ENABLE_KEYBOARD_TRAPS', DEFAULTS.enableKeyboardTraps),
    focusResetOnError: envBoolean('VITE_FOCUS_RESET_ON_ERROR', DEFAULTS.focusResetOnError),
    dateFormat: envDateFormat('VITE_DATE_FORMAT', DEFAULTS.dateFormat),
    locale: envLocale('VITE_LOCALE', DEFAULTS.locale),
    weekStart: envWeekStart('VITE_WEEK_START', DEFAULTS.weekStart),
    enableAntiPatterns: envBoolean('VITE_ENABLE_ANTI_PATTERNS', DEFAULTS.enableAntiPatterns),
    enableStateLeakage: envBoolean('VITE_ENABLE_STATE_LEAKAGE', DEFAULTS.enableStateLeakage),
    chaosLevel: (() => {
      const raw = import.meta.env.VITE_CHAOS_LEVEL
      if (raw === undefined || raw === '') return DEFAULTS.chaosLevel
      const n = Number(raw)
      if (Number.isFinite(n) && n >= 0 && n <= 3) return (n as 0 | 1 | 2 | 3)
      return DEFAULTS.chaosLevel
    })(),
  }
}

const appConfig = loadAppConfig()

/** Log resolved config once at app startup (console only). */
if (typeof console !== 'undefined' && console.info) {
  console.info('[AppConfig] Resolved config:', appConfig)
}

export { appConfig }
