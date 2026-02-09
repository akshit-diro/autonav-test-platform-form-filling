/**
 * Scenario execution engine types.
 * Core engine is picker-agnostic; behavior is driven by metadata.baseScenario.
 */

import type { PickerType } from '../picker-registry'
import type { DetectionResult } from '../picker-registry'

/** Failure classification for execution results. */
export type FailureReason =
  | 'detection_failed'
  | 'interaction_failed'
  | 'validation_failed'
  | 'silent_failure'

/** Base scenario id (DS1–DS6) → behavior type. */
export type BaseScenarioKind =
  | 'presets'
  | 'from-to'
  | 'dual-calendar'
  | 'month-year'
  | 'year-only'
  | 'inline-calendar'

/** Single step in the picker flow: scenario → picker → strategy → outcome. */
export interface StepLog {
  /** Scenario id (e.g. DS1-FLATPICKR). */
  scenario: string
  /** Picker type (e.g. FLATPICKR). */
  picker: PickerType | string
  /** Strategy step name. */
  strategy: 'detect' | 'open' | 'setDate' | 'confirm' | 'validate'
  /** Outcome: success or failure reason. */
  outcome: 'success' | FailureReason
  /** Optional detail (e.g. expected vs actual value). */
  detail?: string
  /** Timestamp for ordering. */
  at: number
}

/** Result of running a picker-specific scenario. */
export interface ExecutionResult {
  /** Scenario id that was run. */
  scenarioId: string
  /** Picker type from scenario metadata. */
  pickerType: PickerType | string
  /** Base scenario (DS1–DS6) that drove behavior. */
  baseScenario: string
  /** Whether the full flow succeeded. */
  success: boolean
  /** Set when success is false. */
  failureReason?: FailureReason
  /** Ordered step logs: scenario → picker → strategy → outcome. */
  logs: StepLog[]
  /** Detection result when detect step succeeded (for validation/callers). */
  detection?: DetectionResult
  /** Validation details when validate step ran. */
  validation?: {
    inputValueUpdated: boolean
    modelUpdated: boolean
    payloadCorrect: boolean
    message?: string
  }
}

/** Options for running a picker scenario. */
export interface RunOptions {
  /** Scope to run in (document or element). Defaults to document. */
  scope?: Document | Element
  /** Explicit start date (deterministic). If omitted, uses default for base scenario. */
  startDate?: Date
  /** Explicit end date for range scenarios. If omitted, derived from startDate or default. */
  endDate?: Date
  /** Callback for each step log (e.g. console, test reporter). */
  onStep?: (log: StepLog) => void
}
