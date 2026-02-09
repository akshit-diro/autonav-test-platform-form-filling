/**
 * Maximum allowed span for a date range (in days).
 * No silent correction — validation fails if range exceeds this.
 */
export const MAX_RANGE_DAYS = 30

export function getMaxRangeDays(): number {
  return MAX_RANGE_DAYS
}

/**
 * Returns true if (end - start) in days is within MAX_RANGE_DAYS (inclusive).
 * Uses calendar-day difference; does not validate start <= end or future.
 */
export function isWithinMaxRange(start: Date, end: Date): boolean {
  const ms = end.getTime() - start.getTime()
  const days = Math.floor(ms / (24 * 60 * 60 * 1000))
  return days >= 0 && days <= MAX_RANGE_DAYS
}
