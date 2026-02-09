/**
 * Auth-based routing: single place for post-login landing and statements navigation.
 * - Post-login: all users land on Accounts (/).
 * - Statements: scenario-bound users go to /statements/<scenario>; scenario-agnostic go to /statements (picker).
 */

import { getScenario } from '../config/scenarioMatrix'
import { credentials } from './credentials'

/** Date-picker scenario ids. Must match scenarioMatrix and route structure. */
export const DATE_PICKER_SCENARIO_IDS = [
  'presets',
  'from-to',
  'dual-calendar',
  'month-year',
  'year-only',
  'inline-calendar',
] as const

export type DatePickerScenarioId = (typeof DATE_PICKER_SCENARIO_IDS)[number]

/** Path prefix for statement/scenario pages. */
export const STATEMENTS_PATH_PREFIX = '/statements'

/** All users land here after successful login. */
export const POST_LOGIN_LANDING_PATH = '/' as const

/** Returns the path to use after successful login (always Accounts). */
export function getPostLoginLandingPath(): typeof POST_LOGIN_LANDING_PATH {
  return POST_LOGIN_LANDING_PATH
}

/** Returns the default scenario id for a user, or undefined if not found. */
export function getDefaultScenarioForUser(username: string | null): string | undefined {
  if (!username?.trim()) return undefined
  const entry = credentials[username.trim()]
  return entry?.defaultScenario
}

/** True if user is tied to one scenario (Statements link goes direct to that scenario). */
export function isScenarioBoundUser(username: string | null): boolean {
  if (!username?.trim()) return false
  const entry = credentials[username.trim()]
  return !!entry && !entry.scenarioAgnostic
}

/**
 * Returns where to navigate when user clicks Statements / Download statements.
 * Scenario-bound → /statements/<defaultScenario>. Scenario-agnostic → /statements (picker).
 */
export function getStatementsNavigationPath(username: string | null): string {
  if (!username?.trim()) return STATEMENTS_PATH_PREFIX
  const entry = credentials[username.trim()]
  if (!entry) return STATEMENTS_PATH_PREFIX
  if (entry.scenarioAgnostic) return STATEMENTS_PATH_PREFIX
  return `${STATEMENTS_PATH_PREFIX}/${entry.defaultScenario}`
}

/** Builds the statements path for a scenario id (base or variant). Uses scenario route when defined. */
export function getStatementsPathForScenario(scenarioId: string): string {
  const scenario = getScenario(scenarioId)
  return scenario?.route ?? `${STATEMENTS_PATH_PREFIX}/${scenarioId}`
}

/** @deprecated Use getStatementsNavigationPath for Statements link. Post-login uses getPostLoginLandingPath(). */
export function getDefaultRedirectForUser(username: string | null): string {
  return getStatementsNavigationPath(username)
}
