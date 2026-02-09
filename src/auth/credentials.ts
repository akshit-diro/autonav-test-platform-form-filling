/**
 * Hard-coded credentials for frontend-only auth (automation testing).
 * No hashing, no persistence beyond memory.
 * Post-login landing is always Accounts (/). Statements navigation is role- and scenario-aware.
 */

import type { DatePickerScenarioId } from './routing'

export interface CredentialEntry {
  password: string
  /** Scenario ids this user may access. Must include defaultScenario. */
  allowedScenarios: string[]
  /** Default date-picker scenario (used when user is scenario-bound for Statements link). */
  defaultScenario: DatePickerScenarioId
  /**
   * When true: user is scenario-agnostic (admin, viewer, tester). Statements → picker page.
   * When false/omitted: user is scenario-bound. Statements → direct to defaultScenario.
   */
  scenarioAgnostic?: boolean
}

export type CredentialsMap = Record<string, CredentialEntry>

export const credentials: CredentialsMap = {
  admin: {
    password: 'admin123',
    allowedScenarios: [
      'admin',
      'presets',
      'from-to',
      'dual-calendar',
      'month-year',
      'year-only',
      'mobile-wheel',
      'inline-calendar',
    ],
    defaultScenario: 'presets',
    scenarioAgnostic: true,
  },
  viewer: {
    password: 'viewer123',
    allowedScenarios: [
      'presets',
      'from-to',
      'dual-calendar',
      'month-year',
      'year-only',
      'mobile-wheel',
      'inline-calendar',
    ],
    defaultScenario: 'from-to',
    scenarioAgnostic: true,
  },
  tester: {
    password: 'tester123',
    allowedScenarios: [
      'presets',
      'from-to',
      'dual-calendar',
      'month-year',
      'year-only',
      'mobile-wheel',
      'inline-calendar',
    ],
    defaultScenario: 'dual-calendar',
    scenarioAgnostic: true,
  },
  presets: {
    password: 'presets123',
    allowedScenarios: ['presets'],
    defaultScenario: 'presets',
  },
  'from-to': {
    password: 'fromto123',
    allowedScenarios: ['from-to'],
    defaultScenario: 'from-to',
  },
  'dual-calendar': {
    password: 'dual123',
    allowedScenarios: ['dual-calendar'],
    defaultScenario: 'dual-calendar',
  },
  'month-year': {
    password: 'monthyear123',
    allowedScenarios: ['month-year'],
    defaultScenario: 'month-year',
  },
  'year-only': {
    password: 'yearonly123',
    allowedScenarios: ['year-only'],
    defaultScenario: 'year-only',
  },
  'mobile-wheel': {
    password: 'wheel123',
    allowedScenarios: ['mobile-wheel'],
    defaultScenario: 'mobile-wheel',
  },
}
