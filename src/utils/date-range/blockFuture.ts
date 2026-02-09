/**
 * Future-date rule: endDate must be <= today.
 * No silent correction — validation fails if date is in the future.
 * Comparisons use calendar day (local time), not time-of-day.
 */

function startOfDay(d: Date): Date {
  const out = new Date(d)
  out.setHours(0, 0, 0, 0)
  return out
}

/**
 * Returns true if the given date is after today (ignoring time).
 * "Today" is interpreted in local time at day granularity.
 */
export function isFutureDate(date: Date): boolean {
  const todayStart = startOfDay(new Date())
  const dateStart = startOfDay(date)
  return dateStart > todayStart
}

/**
 * Returns the end of today (23:59:59.999) in local time.
 * Useful as an upper bound for date inputs.
 */
export function getTodayEnd(): Date {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d
}

/**
 * Returns true if the given date is on or before today (valid for endDate rule).
 */
export function isOnOrBeforeToday(date: Date): boolean {
  return !isFutureDate(date)
}
