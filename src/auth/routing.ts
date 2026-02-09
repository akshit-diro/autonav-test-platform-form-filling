/**
 * Auth-based routing: single place for "which scenario does this user land on".
 * Each credential maps to exactly one date-picker scenario; post-login redirect is /statements/<scenario>.
 * Easy to extend: add a scenario id to DATE_PICKER_SCENARIO_IDS and add a credential with defaultScenario.
 */

import { credentials } from './credentials'

/** Date-picker scenario ids used for post-login redirect. Must match scenarioMatrix and route structure. */
export const DATE_PICKER_SCENARIO_IDS = [
  'presets',
  'from-to',
  'dual-calendar',
  'month-year',
  'year-only',
  'mobile-wheel',
] as const

export type DatePickerScenarioId = (typeof DATE_PICKER_SCENARIO_IDS)[number]

/** Path prefix for statement/scenario pages. */
export const STATEMENTS_PATH_PREFIX = '/statements'

/** Returns the default scenario id for a user, or undefined if not found. */
export function getDefaultScenarioForUser(username: string | null): string | undefined {
  if (!username?.trim()) return undefined
  const entry = credentials[username.trim()]
  return entry?.defaultScenario
}

/** Returns the post-login redirect path for a user: /statements/<scenario>. Falls back to /statements if no scenario. */
export function getDefaultRedirectForUser(username: string | null): string {
  const scenario = getDefaultScenarioForUser(username)
  if (!scenario) return STATEMENTS_PATH_PREFIX
  return `${STATEMENTS_PATH_PREFIX}/${scenario}`
}

/** Builds the statements path for a scenario id. */
export function getStatementsPathForScenario(scenarioId: string): string {
  return `${STATEMENTS_PATH_PREFIX}/${scenarioId}`
}
