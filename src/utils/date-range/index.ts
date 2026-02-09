/**
 * Shared date-range validation. No silent correction — errors are explicit.
 * UI can use: result.valid (disable buttons), result.errors (messages),
 * result.errorCodes / data-validation-errors (machine-readable DOM).
 */

export { MAX_RANGE_DAYS, getMaxRangeDays, isWithinMaxRange } from './maxRange'
export {
  isFutureDate,
  getTodayEnd,
  isOnOrBeforeToday,
} from './blockFuture'
export { normalizeRange, canNormalize } from './normalizeRange'
export { validateRange } from './validateRange'
export {
  DATE_RANGE_ERROR_CODES,
  type DateRangeErrorCode,
  type DateRangeValidationError,
  type DateRangeValidationResult,
  type NormalizedRange,
  type ValidateRangeOptions,
} from './types'
export {
  last7Days,
  last30Days,
  thisMonth,
  lastMonth,
  ytd,
  presetFns,
  type PresetRange,
  type PresetId,
} from './presets'
