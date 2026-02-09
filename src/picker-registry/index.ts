/**
 * Picker detection and strategy-mapping layer.
 *
 * Exposes a registry that:
 * - detect(): finds which date picker is present (document, shadow roots, iframes)
 * - open(): opens the picker using the mapped strategy
 * - setDate(): sets date (and optional end date for range)
 * - confirm(): confirms selection (e.g. Apply button)
 * - validate(): checks picker state
 *
 * Detection is resilient to portals, shadow DOM, and iframe embedding.
 * No hardcoded delays; picker-specific logic is isolated in picker-configs.
 */

import { createPickerRegistry } from './registry'
import { PICKER_CONFIGS } from './picker-configs'

export { createPickerRegistry, type PickerRegistry } from './registry'
export { PICKER_CONFIGS } from './picker-configs'
export { getStrategyMapping, supportsBaseScenario } from './strategy-mapping'
export { getSearchableRoots, querySelectorInRoot, querySelectorAllInRoot } from './dom-scope'

/** Default registry instance with all supported picker configs. */
export const pickerRegistry = createPickerRegistry(PICKER_CONFIGS)
export type {
  PickerType,
  BaseScenarioId,
  PickerRoot,
  DetectionResult,
  PickerConfig,
  DetectionHeuristics,
  OpenStrategy,
  SetDateStrategy,
  ConfirmStrategy,
  ValidateStrategy,
  FallbackStrategies,
  ValidationResult,
  PickerRegistryInterface,
} from './types'
