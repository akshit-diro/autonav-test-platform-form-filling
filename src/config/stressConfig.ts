/**
 * Optional automation stress features. All are deterministic and toggleable.
 * Backed by centralized appConfig (env with safe defaults).
 */
import { appConfig } from './appConfig'

export interface StressConfig {
  uiDelayMs: number
  disabledDatesChangeAfterSelection: boolean
  loadingSpinnerBeforeDownload: boolean
  loadingSpinnerDurationMs: number
}

export const stressConfig: StressConfig = {
  get uiDelayMs() {
    return appConfig.uiDelayMs
  },
  get disabledDatesChangeAfterSelection() {
    return appConfig.disabledDatesChangeAfterSelection
  },
  get loadingSpinnerBeforeDownload() {
    return appConfig.loadingSpinnerBeforeDownload
  },
  get loadingSpinnerDurationMs() {
    return appConfig.loadingSpinnerDurationMs
  },
}
