/**
 * Per-scenario enable/disable flags from env.
 * Each of the 86 scenarios has a flag: VITE_SCENARIO_<KEY>_ENABLED (default true when unset).
 * Key = scenario id in UPPER_SNAKE_CASE (e.g. from-to → FROM_TO, DS1-FLATPICKR → DS1_FLATPICKR).
 * Variants exist only for DS1, DS2, DS3, DS6 (month-year and year-only have no picker variants).
 */

import { scenarioIds, allScenarioIds } from './scenarioMatrix'

const ENV_PREFIX = 'VITE_SCENARIO_'
const ENV_SUFFIX = '_ENABLED'

/** Convert scenario id to env var key part: "from-to" → "FROM_TO", "DS1-FLATPICKR" → "DS1_FLATPICKR". */
export function scenarioIdToEnvKey(scenarioId: string): string {
  return scenarioId.replace(/-/g, '_').toUpperCase()
}

/** Env var name for a scenario's enable flag. */
export function getScenarioEnabledEnvKey(scenarioId: string): string {
  return `${ENV_PREFIX}${scenarioIdToEnvKey(scenarioId)}${ENV_SUFFIX}`
}

function envBoolean(key: string, defaultValue: boolean): boolean {
  const raw = import.meta.env[key]
  if (raw === undefined || raw === '') return defaultValue
  const s = String(raw).toLowerCase().trim()
  return s !== 'false' && s !== '0' && s !== 'no' && s !== 'off'
}

/** Cached set of disabled scenario ids (computed once at load). */
let disabledSet: Set<string> | null = null

function getDisabledSet(): Set<string> {
  if (disabledSet === null) {
    disabledSet = new Set<string>()
    for (const id of allScenarioIds) {
      const enabled = envBoolean(getScenarioEnabledEnvKey(id), true)
      if (!enabled) disabledSet.add(id)
    }
  }
  return disabledSet
}

/** True if the scenario is enabled via its env flag (default true when unset). */
export function isScenarioEnabled(scenarioId: string): boolean {
  return !getDisabledSet().has(scenarioId)
}

/** Base scenario ids (DS1–DS6) that are enabled. */
export const enabledBaseScenarioIds: string[] = (() => {
  const set = getDisabledSet()
  return scenarioIds.filter((id) => !set.has(id))
})()

/** All scenario ids (base + variants) that are enabled. */
export const enabledAllScenarioIds: string[] = (() => {
  const set = getDisabledSet()
  return allScenarioIds.filter((id) => !set.has(id))
})()
