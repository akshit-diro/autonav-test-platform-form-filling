import { parseDate } from '../../config/dateLocale'
import type { NormalizedRange } from './types'

type DateInput = Date | string | number

function toDate(input: DateInput): Date {
  if (input instanceof Date) return input
  if (typeof input === 'string') return parseDate(input)
  const d = new Date(input)
  return d
}

function isValidDate(d: Date): boolean {
  return !Number.isNaN(d.getTime())
}

/**
 * Normalizes start and end to Date instances.
 * Does not swap or correct order — use validateRange() to get explicit errors.
 */
export function normalizeRange(start: DateInput, end: DateInput): NormalizedRange {
  const startDate = toDate(start)
  const endDate = toDate(end)
  return { start: startDate, end: endDate }
}

/**
 * Returns true if both inputs can be normalized to valid Date instances.
 */
export function canNormalize(start: DateInput, end: DateInput): boolean {
  const startDate = toDate(start)
  const endDate = toDate(end)
  return isValidDate(startDate) && isValidDate(endDate)
}
