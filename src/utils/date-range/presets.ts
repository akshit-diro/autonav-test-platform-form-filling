import {
  startOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
} from 'date-fns'

export interface PresetRange {
  start: Date
  end: Date
}

function today(): Date {
  return startOfDay(new Date())
}

/** Last 7 days (inclusive): end = today, start = today - 6. */
export function last7Days(): PresetRange {
  const end = today()
  return { start: subDays(end, 6), end }
}

/** Last 30 days (inclusive): end = today, start = today - 29. */
export function last30Days(): PresetRange {
  const end = today()
  return { start: subDays(end, 29), end }
}

/** This month: start = first day of month, end = today. */
export function thisMonth(): PresetRange {
  const end = today()
  return { start: startOfMonth(end), end }
}

/** Last month: first day to last day of previous month. */
export function lastMonth(): PresetRange {
  const prev = subMonths(today(), 1)
  return { start: startOfMonth(prev), end: endOfMonth(prev) }
}

/** Year to date: start = Jan 1, end = today. */
export function ytd(): PresetRange {
  const end = today()
  return { start: startOfYear(end), end }
}

export const presetFns = {
  'last-7': last7Days,
  'last-30': last30Days,
  'this-month': thisMonth,
  'last-month': lastMonth,
  ytd,
} as const

export type PresetId = keyof typeof presetFns
