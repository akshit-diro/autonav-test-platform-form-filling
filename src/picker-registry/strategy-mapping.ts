/**
 * Strategy selection mapping: picker type (and optional base scenario) to
 * preferred and fallback strategies. Used by automation or tooling to choose
 * how to open/setDate/confirm/validate without hardcoding per library.
 */

import type { PickerType, BaseScenarioId, PickerConfig } from './types'
import { PICKER_CONFIGS } from './picker-configs'

const CONFIGS_BY_TYPE = new Map<PickerType, PickerConfig>(
  PICKER_CONFIGS.map((c) => [c.pickerType, c])
)

/**
 * Returns the full config for a picker type (preferred + fallback strategies,
 * detection heuristics, supported base scenarios, documentation).
 */
export function getStrategyMapping(pickerType: PickerType): PickerConfig | undefined {
  return CONFIGS_BY_TYPE.get(pickerType)
}

/**
 * Returns whether the picker type supports the given base scenario (DS1–DS6).
 */
export function supportsBaseScenario(pickerType: PickerType, baseScenario: BaseScenarioId): boolean {
  const config = CONFIGS_BY_TYPE.get(pickerType)
  return config?.supportedBaseScenarios.includes(baseScenario) ?? false
}
