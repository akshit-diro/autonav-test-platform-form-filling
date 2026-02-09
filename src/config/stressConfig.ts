/**
 * Optional automation stress features. All are deterministic and toggleable.
 * Set to 0/false to disable.
 */
export interface StressConfig {
  /** Artificial delay (ms) applied after UI actions (preset click, calendar select). Use 0 to disable. */
  uiDelayMs: number
  /** When true, after user selects a date, some dates become disabled (deterministic rule). */
  disabledDatesChangeAfterSelection: boolean
  /** When true, show a loading spinner and keep Download disabled until loadingSpinnerDurationMs after range becomes valid. */
  loadingSpinnerBeforeDownload: boolean
  /** Fixed duration (ms) for the loading spinner. Deterministic. */
  loadingSpinnerDurationMs: number
}

export const stressConfig: StressConfig = {
  uiDelayMs: 0,
  disabledDatesChangeAfterSelection: false,
  loadingSpinnerBeforeDownload: false,
  loadingSpinnerDurationMs: 1500,
}
