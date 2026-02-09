/**
 * Scenario id → route, display name, description.
 * Single source of truth for scenario-based routes.
 */

export interface ScenarioEntry {
  scenarioId: string
  route: string
  displayName: string
  description: string
}

export const scenarioMatrix: Record<string, Omit<ScenarioEntry, 'scenarioId'>> = {
  presets: {
    route: '/scenario/presets',
    displayName: 'Presets',
    description: 'Date picker with preset ranges (e.g. Last 7 days, This month).',
  },
  'from-to': {
    route: '/scenario/from-to',
    displayName: 'From–To',
    description: 'Start and end date selection with linked validation.',
  },
  'dual-calendar': {
    route: '/scenario/dual-calendar',
    displayName: 'Dual calendar',
    description: 'Two calendars side by side for range selection.',
  },
  'month-year': {
    route: '/scenario/month-year',
    displayName: 'Month & year',
    description: 'Month and year dropdowns only (no day picker).',
  },
  'year-only': {
    route: '/scenario/year-only',
    displayName: 'Year only',
    description: 'Single year selector.',
  },
  'mobile-wheel': {
    route: '/scenario/mobile-wheel',
    displayName: 'Mobile wheel',
    description: 'Wheel-style picker for touch devices.',
  },
  'inline-calendar': {
    route: '/scenario/inline-calendar',
    displayName: 'Inline calendar',
    description: 'Calendar always visible inline (no popover).',
  },
}

/** All scenario ids in matrix order. */
export const scenarioIds = Object.keys(scenarioMatrix) as string[]

/** Get full scenario entry by id, or undefined if invalid. */
export function getScenario(scenarioId: string): ScenarioEntry | undefined {
  const entry = scenarioMatrix[scenarioId]
  if (!entry) return undefined
  return { scenarioId, ...entry }
}
