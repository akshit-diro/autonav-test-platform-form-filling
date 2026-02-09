/**
 * Machine-readable error codes for date range validation.
 * Use in data attributes and for conditional UI (e.g. disable buttons).
 */
export const DATE_RANGE_ERROR_CODES = {
  INVALID_START: 'INVALID_START',
  INVALID_END: 'INVALID_END',
  START_AFTER_END: 'START_AFTER_END',
  END_IN_FUTURE: 'END_IN_FUTURE',
  RANGE_EXCEEDS_MAX: 'RANGE_EXCEEDS_MAX',
} as const

export type DateRangeErrorCode = (typeof DATE_RANGE_ERROR_CODES)[keyof typeof DATE_RANGE_ERROR_CODES]

export interface DateRangeValidationError {
  code: DateRangeErrorCode
  message: string
}

export interface NormalizedRange {
  start: Date
  end: Date
}

/** Options for validateRange(); used to isolate scenario-specific rules (e.g. Month/Year and Year-only: no max-range check). */
export interface ValidateRangeOptions {
  /** When true, do not apply MAX_RANGE_DAYS validation. Used by Month & Year and Year-only scenarios. */
  skipMaxRange?: boolean
}

/**
 * Result of validateRange(). UI can use:
 * - valid: disable submit when false (e.g. <button disabled={!result.valid}>)
 * - errors: show error messages (e.g. result.errors.map(e => e.message))
 * - errorCodes: machine-readable for DOM — set data-validation-errors={result.errorCodes}
 *   so automation can assert on validation state (e.g. data-validation-errors="START_AFTER_END").
 */
export interface DateRangeValidationResult {
  valid: boolean
  errors: DateRangeValidationError[]
  /** Space-separated error codes for data-validation-errors attribute. */
  errorCodes: string
  /** Normalized start/end when inputs were parseable; otherwise undefined. */
  range?: NormalizedRange
}
