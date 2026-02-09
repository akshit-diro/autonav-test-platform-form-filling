/**
 * Maps metadata.baseScenario (DS1–DS6) to behavior and default dates.
 * Core engine uses this to stay picker-agnostic.
 */

import type { BaseScenarioKind } from './types'

const DS_TO_KIND: Record<string, BaseScenarioKind> = {
  DS1: 'presets',
  DS2: 'from-to',
  DS3: 'dual-calendar',
  DS4: 'month-year',
  DS5: 'year-only',
  DS6: 'inline-calendar',
}

/** Default dates for deterministic runs. Last 7 days ending today. */
function defaultRange(): { start: Date; end: Date } {
  const end = new Date()
  end.setHours(0, 0, 0, 0)
  const start = new Date(end)
  start.setDate(start.getDate() - 6)
  return { start, end }
}

/** First and last day of current month. */
function currentMonthRange(): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

/** Fiscal year April–March. */
function currentFiscalYearRange(): { start: Date; end: Date } {
  const y = new Date().getFullYear()
  const month = new Date().getMonth()
  const startYear = month >= 3 ? y : y - 1
  const start = new Date(startYear, 3, 1)
  const end = new Date(startYear + 1, 2, 31)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

/**
 * Returns the behavior kind for a base scenario id (DS1–DS6).
 */
export function getBaseScenarioKind(baseScenarioId: string): BaseScenarioKind | undefined {
  return DS_TO_KIND[baseScenarioId]
}

/**
 * Returns default start/end dates for the given base scenario.
 * Used when RunOptions do not provide explicit dates.
 */
export function getDefaultDatesForBaseScenario(baseScenarioId: string): { start: Date; end: Date } {
  const kind = DS_TO_KIND[baseScenarioId]
  if (kind === 'month-year') return currentMonthRange()
  if (kind === 'year-only') return currentFiscalYearRange()
  return defaultRange()
}

/**
 * Whether the base scenario uses a single date (then start === end) or range.
 */
export function isRangeScenario(baseScenarioId: string): boolean {
  const kind = DS_TO_KIND[baseScenarioId]
  return kind === 'from-to' || kind === 'dual-calendar' || kind === 'inline-calendar' || kind === 'presets'
}
