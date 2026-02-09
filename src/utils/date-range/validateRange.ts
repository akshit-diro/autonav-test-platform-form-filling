import { isFutureDate } from './blockFuture'
import { MAX_RANGE_DAYS } from './maxRange'
import { normalizeRange, canNormalize } from './normalizeRange'
import {
  DATE_RANGE_ERROR_CODES,
  type DateRangeValidationResult,
  type DateRangeValidationError,
} from './types'

type DateInput = Date | string | number

function daysBetween(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime()
  return Math.floor(ms / (24 * 60 * 60 * 1000))
}

/**
 * Validates a date range. No silent correction — all violations are returned as errors.
 * Rules: startDate <= endDate, endDate <= today, (endDate - startDate) <= 30 days.
 *
 * @returns Result with valid, errors (with code + message), errorCodes (for DOM), and range when parseable.
 */
export function validateRange(start: DateInput, end: DateInput): DateRangeValidationResult {
  const errors: DateRangeValidationError[] = []

  if (!canNormalize(start, end)) {
    const startDate = new Date(start as string)
    const endDate = new Date(end as string)
    if (Number.isNaN(startDate.getTime())) {
      errors.push({
        code: DATE_RANGE_ERROR_CODES.INVALID_START,
        message: 'Start date is invalid.',
      })
    }
    if (Number.isNaN(endDate.getTime())) {
      errors.push({
        code: DATE_RANGE_ERROR_CODES.INVALID_END,
        message: 'End date is invalid.',
      })
    }
    return {
      valid: false,
      errors,
      errorCodes: errors.map((e) => e.code).join(' '),
    }
  }

  const range = normalizeRange(start, end)
  const { start: startDate, end: endDate } = range

  if (startDate.getTime() > endDate.getTime()) {
    errors.push({
      code: DATE_RANGE_ERROR_CODES.START_AFTER_END,
      message: 'Start date must be on or before end date.',
    })
  }

  if (isFutureDate(endDate)) {
    errors.push({
      code: DATE_RANGE_ERROR_CODES.END_IN_FUTURE,
      message: 'End date cannot be in the future.',
    })
  }

  const days = daysBetween(startDate, endDate)
  if (days > MAX_RANGE_DAYS) {
    errors.push({
      code: DATE_RANGE_ERROR_CODES.RANGE_EXCEEDS_MAX,
      message: `Date range cannot exceed ${MAX_RANGE_DAYS} days.`,
    })
  }

  return {
    valid: errors.length === 0,
    errors,
    errorCodes: errors.map((e) => e.code).join(' '),
    range,
  }
}
