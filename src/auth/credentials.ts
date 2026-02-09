/**
 * Hard-coded credentials for frontend-only auth (automation testing).
 * No hashing, no persistence beyond memory.
 * Post-login landing is always Accounts (/). Statements navigation is role- and scenario-aware.
 *
 * Each active base and variant scenario has a dedicated credential: username = password = test scenario ID (DS<base>.<variant_id>).
 */

import type { DatePickerScenarioId } from './routing'
import { enabledAllScenarioIds } from '../config/scenarioFlags'
import { getTestScenarioId, scenarioMatrix, scenarioIds } from '../config/scenarioMatrix'

export interface CredentialEntry {
  password: string
  /** Scenario ids this user may access. Must include defaultScenario. */
  allowedScenarios: string[]
  /** Default date-picker scenario (used when user is scenario-bound for Statements link). */
  defaultScenario: DatePickerScenarioId
  /**
   * When true: user is scenario-agnostic (admin). Statements → picker page.
   * When false/omitted: user is scenario-bound. Statements → direct to defaultScenario.
   */
  scenarioAgnostic?: boolean
}

export type CredentialsMap = Record<string, CredentialEntry>

/** DS id (DS1–DS6) to base scenario slug for defaultScenario. */
const DS_TO_BASE_SLUG: Record<string, DatePickerScenarioId> = Object.fromEntries(
  scenarioIds.map((slug, i) => [`DS${i + 1}`, slug as DatePickerScenarioId])
)

function defaultScenarioForScenarioId(scenarioId: string): DatePickerScenarioId {
  const baseEntry = scenarioMatrix[scenarioId]
  if (baseEntry) return scenarioId as DatePickerScenarioId
  const match = scenarioId.match(/^DS(\d+)-/)
  if (match) {
    const baseSlug = DS_TO_BASE_SLUG[`DS${match[1]}`]
    if (baseSlug) return baseSlug
  }
  return 'presets'
}

/** One credential per enabled scenario: key and password = test scenario ID (DS<base>.<variant_id>). */
const scenarioCredentials: CredentialsMap = Object.fromEntries(
  enabledAllScenarioIds.map((scenarioId) => {
    const testScenarioId = getTestScenarioId(scenarioId)
    return [
      testScenarioId,
      {
        password: testScenarioId,
        allowedScenarios: [scenarioId],
        defaultScenario: defaultScenarioForScenarioId(scenarioId),
      },
    ]
  })
)

export const credentials: CredentialsMap = {
  admin: {
    password: 'admin123',
    allowedScenarios: ['admin', ...enabledAllScenarioIds],
    defaultScenario: 'presets',
    scenarioAgnostic: true,
  },
  ...scenarioCredentials,
}
