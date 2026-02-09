/**
 * Scenario execution engine: picker-agnostic core, behavior from metadata.baseScenario.
 * Executes detect → open → setDate → confirm → validate with structured logs and failure classification.
 */

export { runPickerScenario } from './executor'
export { getBaseScenarioKind, getDefaultDatesForBaseScenario, isRangeScenario } from './behavior-map'
export { validateAfterFlow } from './validation'
export type {
  ExecutionResult,
  StepLog,
  FailureReason,
  RunOptions,
  BaseScenarioKind,
} from './types'
