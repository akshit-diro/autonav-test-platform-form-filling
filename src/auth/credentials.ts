/**
 * Hard-coded credentials for frontend-only auth (automation testing).
 * No hashing, no persistence beyond memory.
 * Each user maps to exactly one date-picker scenario (defaultScenario); post-login redirect is /statements/<scenario>.
 */

import type { DatePickerScenarioId } from './routing'

export interface CredentialEntry {
  password: string
  /** Scenario ids this user may access. Must include defaultScenario. */
  allowedScenarios: string[]
  /** The single date-picker scenario this user lands on after login. */
  defaultScenario: DatePickerScenarioId
}

export type CredentialsMap = Record<string, CredentialEntry>

export const credentials: CredentialsMap = {
  admin: {
    password: 'admin123',
    allowedScenarios: ['admin', 'presets'],
    defaultScenario: 'presets',
  },
  viewer: {
    password: 'viewer123',
    allowedScenarios: ['from-to'],
    defaultScenario: 'from-to',
  },
  tester: {
    password: 'tester123',
    allowedScenarios: ['dual-calendar'],
    defaultScenario: 'dual-calendar',
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
