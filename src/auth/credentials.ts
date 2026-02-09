/**
 * Hard-coded credentials for frontend-only auth (automation testing).
 * No hashing, no persistence beyond memory.
 */

export interface CredentialEntry {
  password: string
  allowedScenarios: string[]
  defaultRedirect: string
}

export type CredentialsMap = Record<string, CredentialEntry>

import { scenarioIds } from '../config/scenarioMatrix'

export const credentials: CredentialsMap = {
  admin: {
    password: 'admin123',
    allowedScenarios: ['admin', 'viewer', ...scenarioIds],
    defaultRedirect: '/',
  },
  viewer: {
    password: 'viewer123',
    allowedScenarios: ['viewer', 'presets', 'from-to', 'inline-calendar'],
    defaultRedirect: '/',
  },
  tester: {
    password: 'tester123',
    allowedScenarios: ['e2e', 'forms', 'dual-calendar', 'month-year', 'year-only', 'mobile-wheel'],
    defaultRedirect: '/',
  },
}
